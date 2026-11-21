import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const getAccessTokenMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: { api: { getAccessToken: (...args: unknown[]) => getAccessTokenMock(...args) } },
}));

const lookupRedirectMock = vi.fn();
const spexAddressByIdMock = vi.fn();

vi.mock("@/lib/http/old-wiki", async () => ({
  ...(await vi.importActual<typeof import("@/lib/http/old-wiki")>("@/lib/http/old-wiki")),
  lookupRedirect: (...args: unknown[]) => lookupRedirectMock(...args),
  spexAddressById: (...args: unknown[]) => spexAddressByIdMock(...args),
}));

const ACCOUNT_COOKIE = "better-auth.account_data";

function request(path: string, { cookie = `${ACCOUNT_COOKIE}=abc`, headers = {} } = {}) {
  return new NextRequest(new URL(`http://localhost${path}`), {
    headers: { ...(cookie ? { cookie } : {}), ...headers },
  });
}

beforeEach(() => {
  getAccessTokenMock.mockReset();
  getAccessTokenMock.mockResolvedValue({ headers: new Headers({ "set-cookie": `${ACCOUNT_COOKIE}=refreshed; Path=/` }) });
  lookupRedirectMock.mockReset();
  lookupRedirectMock.mockResolvedValue(null);
  spexAddressByIdMock.mockReset();
  spexAddressByIdMock.mockResolvedValue(null);
});

describe("proxy", () => {
  it("forwards the refreshed cookie on an app request", async () => {
    const response = await proxy(request("/spex/1984-lasse-maja"));

    expect(getAccessTokenMock).toHaveBeenCalledWith(
      expect.objectContaining({ body: { useAccountCookie: true }, returnHeaders: true }),
    );
    expect(response.headers.getSetCookie()).toContain(`${ACCOUNT_COOKIE}=refreshed; Path=/`);
  });

  it("hands the rotated cookies to this request's own render", async () => {
    getAccessTokenMock.mockResolvedValue({
      headers: new Headers([
        ["set-cookie", `${ACCOUNT_COOKIE}.0=rotated; Path=/`],
        ["set-cookie", `${ACCOUNT_COOKIE}.1=; Max-Age=0; Path=/`],
      ]),
    });

    const response = await proxy(request("/spex/1984-lasse-maja", { cookie: `${ACCOUNT_COOKIE}.0=old; ${ACCOUNT_COOKIE}.1=stale; other=kept` }));
    const forwarded = response.headers.get("x-middleware-request-cookie") ?? "";

    expect(forwarded).toContain(`${ACCOUNT_COOKIE}.0=rotated`);
    expect(forwarded).not.toContain(`${ACCOUNT_COOKIE}.1=`);
    expect(forwarded).toContain("other=kept");
  });

  // Better Auth rewrites the session and account cookies on these routes itself; a second set of cookies on the same
  // response could undo a sign-out or pair a new session with the previous user's tokens
  it.each([
    "/api/auth/callback/keycloak",
    "/api/auth/sign-out",
    "/api/auth/get-session",
    "/api/auth/login",
  ])("leaves Better Auth's own route %s alone", async path => {
    const response = await proxy(request(path));

    expect(getAccessTokenMock).not.toHaveBeenCalled();
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it("skips speculative prefetches and anonymous requests", async () => {
    await proxy(request("/spex/1984-lasse-maja", { headers: { "next-router-prefetch": "1" } }));
    await proxy(request("/spex/1984-lasse-maja", { cookie: "" }));

    expect(getAccessTokenMock).not.toHaveBeenCalled();
  });

  it("never blocks the request when the refresh fails", async () => {
    getAccessTokenMock.mockRejectedValue(new Error("FAILED_TO_GET_ACCESS_TOKEN"));

    const response = await proxy(request("/spex/1984-lasse-maja"));

    expect(response.headers.getSetCookie()).toEqual([]);
    expect(response.status).toBe(200);
  });

  it("gives pages their Content Security Policy, signed in or not, and leaves the API routes to set their own", async () => {
    expect((await proxy(request("/spex/1984-lasse-maja"))).headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect((await proxy(request("/spex/1984-lasse-maja", { cookie: "" }))).headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect((await proxy(request("/api/anything"))).headers.get("Content-Security-Policy")).toBeNull();
  });

  it("sends an old wiki title on to the page that replaced it, for good", async () => {
    lookupRedirectMock.mockResolvedValue("/articles/spexets-traditioner");

    const response = await proxy(request("/Spexets_traditioner?action=history"));

    expect(lookupRedirectMock.mock.calls[0][0]).toBe("Spexets traditioner");
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/articles/spexets-traditioner");
    expect(getAccessTokenMock).not.toHaveBeenCalled();
  });

  it("sends an old wiki title nobody replaced to a search for it, for now", async () => {
    const response = await proxy(request("/Bortglömd_sida"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/search?q=Bortgl%C3%B6md+sida");
  });

  it("sends a spex addressed by its id to its page", async () => {
    spexAddressByIdMock.mockResolvedValue("/spex/1984-lasse-maja");

    const response = await proxy(request("/spex/0190aaaa-0000-7000-8000-000000000001"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost/spex/1984-lasse-maja");
  });

  it("looks nothing up for its own pages or for anything but GET", async () => {
    await proxy(request("/spex/1984-lasse-maja"));
    await proxy(new NextRequest(new URL("http://localhost/Spexets_traditioner"), { method: "POST" }));

    expect(lookupRedirectMock).not.toHaveBeenCalled();
  });
});
