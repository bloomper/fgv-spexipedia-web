import type { MetadataRoute } from "next";
import { getSitemap } from "@/lib/wiki/wiki.server";

/**
 * The public pages, as the server lists them for a visitor: published spex pages, public articles and categories.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.BETTER_AUTH_URL ?? "").replace(/\/$/, "");
  const entries = await getSitemap().catch(() => []);

  return [
    { url: `${base}/` },
    ...["/spex", "/articles"].map(path => ({ url: `${base}${path}` })),
    ...entries.map(entry => ({ url: `${base}${entry.path}`, lastModified: entry.lastModifiedAt ?? undefined })),
  ];
}
