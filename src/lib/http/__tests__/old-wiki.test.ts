import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupRedirect, oldWikiTitle, spexAddressById } from "@/lib/http/old-wiki";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("old MediaWiki addresses", () => {
  it("are told from Spexipedia's own", () => {
    const none = new URLSearchParams();

    expect(oldWikiTitle("/Spexets_traditioner", none)).toBe("Spexets traditioner");
    expect(oldWikiTitle("/Alexander_-_CEP_019", none)).toBe("Alexander - CEP 019");
    expect(oldWikiTitle("/index.php", new URLSearchParams("title=Lasse-Maja"))).toBe("Lasse-Maja");
    expect(oldWikiTitle("/index.php", none)).toBeNull();
    expect(oldWikiTitle("/", none)).toBeNull();
    expect(oldWikiTitle("/spex/1984-lasse-maja", none)).toBeNull();
    expect(oldWikiTitle("/_next/static/x.js", none)).toBeNull();
    expect(oldWikiTitle("/%E0%A4%A", none)).toBeNull();
  });

  it("leave out what scanners try, but not titles with dots", () => {
    const none = new URLSearchParams();

    expect(oldWikiTitle("/wp-login.php", none)).toBeNull();
    expect(oldWikiTitle("/.env", none)).toBeNull();
    expect(oldWikiTitle("/.git/config", none)).toBeNull();
    expect(oldWikiTitle("/backup.sql", none)).toBeNull();
    expect(oldWikiTitle("/H.C._Andersen", none)).toBe("H.C. Andersen");
    expect(oldWikiTitle("/index.php", new URLSearchParams("title=Fil:Affisch.jpg"))).toBe("Fil:Affisch.jpg");
  });

  it("are looked up as a visitor, accepting only paths in this site", async () => {
    const fetch = vi.fn().mockResolvedValue({ json: async () => ({ data: { redirect: "/spex/1984-lasse-maja" } }) });

    vi.stubGlobal("fetch", fetch);
    expect(await lookupRedirect("Lasse-Maja", "http://api/graphql")).toBe("/spex/1984-lasse-maja");
    expect(JSON.parse(fetch.mock.calls[0][1].body).variables).toEqual({ title: "Lasse-Maja" });
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty("Authorization");

    fetch.mockResolvedValue({ json: async () => ({ data: { redirect: "//evil.example" } }) });
    expect(await lookupRedirect("x", "http://api/graphql")).toBeNull();
    fetch.mockRejectedValue(new Error("down"));
    expect(await lookupRedirect("x", "http://api/graphql")).toBeNull();
    expect(await lookupRedirect("x", undefined)).toBeNull();
  });
});

describe("spex by id", () => {
  it("go to their slug", async () => {
    const fetch = vi.fn().mockResolvedValue({ json: async () => ({ data: { spex: { slug: "1984-lasse-maja" } } }) });

    vi.stubGlobal("fetch", fetch);
    expect(await spexAddressById("/spex/00000000-0000-7000-a000-000000000001", "http://api/graphql")).toBe(
      "/spex/1984-lasse-maja"
    );
    expect(await spexAddressById("/spex/1984-lasse-maja", "http://api/graphql")).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
    fetch.mockResolvedValue({ json: async () => ({ data: { spex: null } }) });
    expect(await spexAddressById("/spex/00000000-0000-7000-a000-000000000001", "http://api/graphql")).toBeNull();
  });
});
