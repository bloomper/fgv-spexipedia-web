import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const apiFetch = vi.hoisted(() => vi.fn());
const getSessionContext = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({ apiFetch }));
vi.mock("@/utils/auth.server", () => ({ getSessionContext }));

import { POST } from "@/app/api/packages/route";
import { GET } from "@/app/api/packages/template/route";
import { HEAD, PATCH } from "@/app/api/packages/[id]/zip/route";

const ID = "01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e";
const context = (id = ID) => ({ params: Promise.resolve({ id }) });
const request = (method: string, path: string, init: { headers?: Record<string, string>; body?: BodyInit } = {}) =>
  new NextRequest(`http://spexipedia.test${path}`, {
    method,
    headers: { host: "spexipedia.test", ...init.headers },
    body: init.body,
    ...(init.body ? { duplex: "half" } : {}),
  } as never);

describe("The spex package routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionContext.mockResolvedValue({ session: { user: {} } });
  });

  it("create a package by streaming the multipart form on, and answer as the server does", async () => {
    apiFetch.mockResolvedValue(
      new Response(JSON.stringify({ id: ID }), { status: 201, headers: { "content-type": "application/json" } })
    );

    const response = await POST(
      request("POST", "/api/packages", {
        headers: { "content-type": "multipart/form-data; boundary=x", "content-length": "5" },
        body: "hello",
      })
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: ID });
    const [path, init] = apiFetch.mock.calls[0];

    expect(path).toBe("/api/packages");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "multipart/form-data; boundary=x", "Content-Length": "5" });
    expect(typeof init.body.getReader).toBe("function");
    expect(init.duplex).toBe("half");
  });

  it("refuse other sites and visitors without a session", async () => {
    expect(
      (await POST(request("POST", "/api/packages", { headers: { origin: "https://evil.test" }, body: "x" }))).status
    ).toBe(403);
    getSessionContext.mockResolvedValue({ session: null });
    expect((await POST(request("POST", "/api/packages", { body: "x" }))).status).toBe(401);
    expect((await GET(request("GET", "/api/packages/template"))).status).toBe(401);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("pass the template on", async () => {
    apiFetch.mockResolvedValue(
      new Response("xlsx", {
        status: 200,
        headers: {
          "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "content-disposition": "attachment",
        },
      })
    );

    const response = await GET(request("GET", "/api/packages/template"));

    expect(apiFetch).toHaveBeenCalledWith("/api/packages/template.xlsx", expect.anything());
    expect(response.headers.get("content-disposition")).toBe("attachment");
    expect(await response.text()).toBe("xlsx");
  });

  it("tell how much of the zip has arrived", async () => {
    apiFetch.mockResolvedValue(new Response(null, { status: 200, headers: { "Upload-Offset": "1024" } }));

    const response = await HEAD(request("HEAD", `/api/packages/${ID}/zip`), context());

    expect(response.headers.get("Upload-Offset")).toBe("1024");
    expect(apiFetch).toHaveBeenCalledWith(`/api/packages/${ID}/zip`, expect.objectContaining({ method: "HEAD" }));
  });

  it("stream a part of the zip at its offset, and pass the new offset and refusals back", async () => {
    apiFetch.mockResolvedValueOnce(new Response(null, { status: 204, headers: { "Upload-Offset": "2048" } }));

    const response = await PATCH(
      request("PATCH", `/api/packages/${ID}/zip`, {
        headers: { "Upload-Offset": "1024", "content-length": "4" },
        body: "part",
      }),
      context()
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Upload-Offset")).toBe("2048");
    const [, init] = apiFetch.mock.calls[0];

    expect(init.headers).toEqual({
      "Upload-Offset": "1024",
      "Content-Type": "application/offset+octet-stream",
      "Content-Length": "4",
    });
    expect(typeof init.body.getReader).toBe("function");

    apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({ message: "Wrong offset" }), { status: 400 }));
    const wrong = await PATCH(
      request("PATCH", `/api/packages/${ID}/zip`, { headers: { "Upload-Offset": "0" }, body: "part" }),
      context()
    );

    expect(wrong.status).toBe(400);
    expect(await wrong.json()).toEqual({ message: "Wrong offset" });
  });

  it("refuse a part without a valid offset, and ids that are not ids", async () => {
    expect(
      (
        await PATCH(
          request("PATCH", `/api/packages/${ID}/zip`, { headers: { "Upload-Offset": "-1" }, body: "x" }),
          context()
        )
      ).status
    ).toBe(400);
    expect((await PATCH(request("PATCH", `/api/packages/${ID}/zip`, { body: "x" }), context())).status).toBe(400);
    expect((await HEAD(request("HEAD", "/api/packages/x/zip"), context("../x"))).status).toBe(400);
    expect(apiFetch).not.toHaveBeenCalled();
  });
});
