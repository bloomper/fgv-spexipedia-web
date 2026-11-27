import type { NextRequest } from "next/server";
import { refuse } from "@/lib/http/packages.server";
import { streamFromApi } from "@/lib/http/proxy.server";

/** The spreadsheet template, made by the server from the current kinds. */
export async function GET(request: NextRequest) {
  return (
    (await refuse(request)) ?? streamFromApi(request, "/api/packages/template.xlsx", { "Cache-Control": "no-store" })
  );
}
