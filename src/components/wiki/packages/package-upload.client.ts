"use client";

/*
 * Uploading a spex package (spec 5.14) through the web's /api/packages routes, which pass the files on with the user's
 * token. The zip goes in parts at the offset the server reports, so an upload that fails or is left continues where it
 * stopped: ask the server how much it has (HEAD), then send the rest.
 */

export const OFFSET = "Upload-Offset";
/** A part of the zip; well under what the server and the route handlers take at once. */
export const PART_BYTES = 32 * 1024 * 1024;
const RETRIES = 4;

export const SPREADSHEET_TYPES = ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const ZIP_TYPES = ".zip,application/zip,application/x-zip-compressed";

export class UploadError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

async function failure(response: Response): Promise<UploadError> {
  const body = await response.json().catch(() => null) as { message?: string; detail?: string } | null;

  return new UploadError(body?.detail ?? body?.message ?? `HTTP ${response.status}`, response.status);
}

/** Creates the package from the spreadsheet, announcing the zip that follows; answers with the package's id. */
export async function createPackage(spreadsheet: File, zip: File | null): Promise<string> {
  const body = new FormData();

  body.append("spreadsheet", spreadsheet);
  if (zip) {
    body.append("zipFileName", zip.name);
    body.append("zipSize", String(zip.size));
  }

  const response = await fetch("/api/packages", { method: "POST", body });

  if (!response.ok) {
    throw await failure(response);
  }
  return (await response.json() as { id: string }).id;
}

/** How many bytes of the package's zip the server has. */
export async function zipOffset(id: string, signal?: AbortSignal): Promise<number> {
  const response = await fetch(`/api/packages/${id}/zip`, { method: "HEAD", cache: "no-store", signal });

  if (!response.ok) {
    throw new UploadError(`HTTP ${response.status}`, response.status);
  }
  return Number(response.headers.get(OFFSET) ?? 0);
}

const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sends the zip from where the server is, part by part, telling `onProgress` the bytes it has. A part that fails is
 * tried again a few times after asking the server where it is (a part may have arrived though its answer did not);
 * a refusal the server means (403, 404, 409, 413) ends the upload at once. Aborting `signal` stops it.
 */
export async function uploadZip(id: string, zip: File, onProgress: (received: number) => void, signal?: AbortSignal, wait = pause): Promise<void> {
  let offset = await zipOffset(id, signal);
  let failures = 0;

  onProgress(offset);
  while (offset < zip.size) {
    signal?.throwIfAborted();
    try {
      const response = await fetch(`/api/packages/${id}/zip`, {
        method: "PATCH",
        headers: { [OFFSET]: String(offset), "Content-Type": "application/offset+octet-stream" },
        body: zip.slice(offset, Math.min(offset + PART_BYTES, zip.size)),
        signal,
      });

      if (!response.ok) {
        throw await failure(response);
      }
      offset = Number(response.headers.get(OFFSET) ?? offset);
      failures = 0;
      onProgress(offset);
    } catch (error) {
      if (signal?.aborted || (error instanceof UploadError && [401, 403, 404, 409, 413].includes(error.status ?? 0)) || ++failures > RETRIES) {
        throw error;
      }
      await wait(1000 * 2 ** failures);
      offset = await zipOffset(id, signal);
      onProgress(offset);
    }
  }
}
