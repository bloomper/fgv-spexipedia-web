"use client";

import type { WikiImageData } from "@/components/wiki/wiki-image";

export type UploadedImage = WikiImageData & { kind: string; originalFileName?: string | null };

/** What the server takes: JPEG, PNG, WebP, TIFF, HEIC, up to 50 MB. */
export const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif,.heic,.heif";
export const MAX_IMAGE_BYTES = 50 * 1024 * 1024;

/**
 * Uploads an image through the web's `/api/images`, which passes it on with the user's token. The server makes the
 * variants before it answers. Throws with the server's message when it refuses the file.
 */
export async function uploadImage(file: File, kind: string): Promise<UploadedImage> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("tooLarge");
  }
  const body = new FormData();

  body.append("file", file);

  const response = await fetch(`/api/images?kind=${encodeURIComponent(kind)}`, { method: "POST", body });

  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string; detail?: string } | null;

    throw new Error(error?.detail ?? error?.message ?? `HTTP ${response.status}`);
  }
  return await response.json() as UploadedImage;
}
