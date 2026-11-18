import type { NextRequest } from "next/server";
import { zipOffset, zipPart } from "@/lib/http/packages.server";

type Context = { params: Promise<{ id: string }> };

/** How much of the zip has arrived, to resume from. */
export async function HEAD(request: NextRequest, { params }: Context) {
  return zipOffset(request, (await params).id);
}

/** The next part of the zip, at Upload-Offset. */
export async function PATCH(request: NextRequest, { params }: Context) {
  return zipPart(request, (await params).id);
}
