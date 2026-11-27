import { type NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api.server";
import { crossSite, sameOrigin } from "@/lib/http/proxy.server";
import { getSessionContext } from "@/utils/auth.server";

const KINDS = new Set(["POSTER", "LOGO", "CHARACTER", "SECTION", "REBUS", "COVER", "ARTICLE", "OTHER"]);

/**
 * An image upload from the editing pages, passed on to the server's `POST /api/images` with the user's token: the
 * multipart body as it came, streamed. The server checks the role, the type and the size (50 MB) and makes the
 * variants; it answers with the image.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return crossSite();
  }
  if (!(await getSessionContext()).session) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Not authenticated" }, { status: 401 });
  }
  const kind = request.nextUrl.searchParams.get("kind") ?? "OTHER";

  if (!KINDS.has(kind)) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "Unknown kind" }, { status: 400 });
  }
  const upstream = await apiFetch(`/api/images?kind=${kind}`, {
    method: "POST",
    headers: { "Content-Type": request.headers.get("content-type") ?? "application/octet-stream" },
    body: request.body,
    // @ts-expect-error Node's fetch needs this to stream a request body; the DOM types do not know it
    duplex: "half",
    signal: request.signal,
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
