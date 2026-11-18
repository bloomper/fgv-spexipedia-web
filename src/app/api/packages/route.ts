import type { NextRequest } from "next/server";
import { createPackage } from "@/lib/http/packages.server";

/** A new spex package: the spreadsheet, and the name and size of the zip that follows in parts. */
export async function POST(request: NextRequest) {
  return createPackage(request);
}
