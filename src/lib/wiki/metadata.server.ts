import "server-only";

import type { Metadata } from "next";

const SITE = "Spexipedia";

/**
 * A page anyone may see: indexed, with a preview for sharing. The image is a JPEG, which every preview reads.
 */
export function publicMetadata(title: string, description?: string | null, image?: string | null): Metadata {
  const fullTitle = `${title} – ${SITE}`;
  const text = description?.replace(/\s+/g, " ").trim().slice(0, 200) || undefined;

  return {
    title: fullTitle,
    description: text,
    robots: { index: true, follow: true },
    openGraph: { title: fullTitle, description: text, siteName: SITE, type: "article", images: image ? [image] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary" },
  };
}

/**
 * A page for members or editors: not indexed, no preview.
 */
export function privateMetadata(title: string): Metadata {
  return { title: `${title} – ${SITE}`, robots: { index: false, follow: false } };
}
