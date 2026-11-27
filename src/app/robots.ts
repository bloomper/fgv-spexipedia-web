import type { MetadataRoute } from "next";

/**
 * Search engines may index the public pages, listed in the sitemap; pages for members and editors say noindex
 * themselves, and these are never crawled.
 */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.BETTER_AUTH_URL ?? "").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/manage/", "/admin/", "/stats/", "/articles/new", "/*/edit", "/*/history"],
      },
    ],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}
