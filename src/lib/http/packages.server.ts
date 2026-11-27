import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api.server";
import { crossSite, ID, invalid, sameOrigin } from "@/lib/http/proxy.server";
import { getSessionContext } from "@/utils/auth.server";

/*
 * Spex packages' files on their way to the server's /api/packages (spec 5.14), with the user's token, which the browser
 * never holds. Bodies are streamed as they arrive: a spreadsheet, and a zip of up to 20 GB in parts. The server checks
 * the role (EDITOR), the files and the offsets.
 */

export const OFFSET = "Upload-Offset";

const unauthorized = () => NextResponse.json({ code: "UNAUTHORIZED", message: "Not authenticated" }, { status: 401 });

/** Why the request may not go on, or null: another site, no session, or an id that is not one. */
export async function refuse(request: NextRequest, id?: string): Promise<Response | null> {
  if (id !== undefined && !ID.test(id)) {
    return invalid();
  }
  if (request.method !== "GET" && request.method !== "HEAD" && !sameOrigin(request)) {
    return crossSite();
  }
  if (!(await getSessionContext()).session) {
    return unauthorized();
  }
  return null;
}

/** A request body streamed on to the server, not read into memory first. */
export function streamed(request: NextRequest, headers: Record<string, string>): RequestInit {
  const length = request.headers.get("content-length");

  return {
    method: request.method,
    headers: { ...headers, ...(length ? { "Content-Length": length } : {}) },
    body: request.body,
    // @ts-expect-error Node's fetch needs this to stream a request body; the DOM types do not know it
    duplex: "half",
    signal: request.signal,
  };
}

/** The server's answer as it came, with its offset when it gives one. */
export function answer(upstream: Response): Response {
  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-store",
  });
  const offset = upstream.headers.get(OFFSET);

  if (offset) {
    headers.set(OFFSET, offset);
  }
  return new Response(upstream.status === 204 || upstream.status === 304 ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

/** A new package: the multipart form (spreadsheet, zipFileName, zipSize) as it came. */
export async function createPackage(request: NextRequest): Promise<Response> {
  return (
    (await refuse(request)) ??
    answer(
      await apiFetch(
        "/api/packages",
        streamed(request, { "Content-Type": request.headers.get("content-type") ?? "multipart/form-data" })
      )
    )
  );
}

/** How much of the package's zip the server has: Upload-Offset. */
export async function zipOffset(request: NextRequest, id: string): Promise<Response> {
  const refused = await refuse(request, id);

  if (refused) {
    return refused;
  }
  const upstream = await apiFetch(`/api/packages/${id}/zip`, { method: "HEAD", signal: request.signal });

  return new Response(null, {
    status: upstream.status,
    headers: { [OFFSET]: upstream.headers.get(OFFSET) ?? "0", "Cache-Control": "no-store" },
  });
}

/** The next part of the zip, at the offset the browser says. */
export async function zipPart(request: NextRequest, id: string): Promise<Response> {
  const refused = await refuse(request, id);
  const offset = request.headers.get(OFFSET);

  if (refused) {
    return refused;
  }
  if (!offset || !/^\d{1,15}$/.test(offset)) {
    return invalid();
  }
  return answer(
    await apiFetch(
      `/api/packages/${id}/zip`,
      streamed(request, { [OFFSET]: offset, "Content-Type": "application/offset+octet-stream" })
    )
  );
}
