import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPackage,
  PART_BYTES,
  uploadZip,
  UploadError,
  zipOffset,
} from "@/components/wiki/packages/package-upload.client";

const ID = "01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e";
const fetchMock = vi.fn();
const offset = (value: number, status = 200) =>
  new Response(null, { status, headers: { "Upload-Offset": String(value) } });
const noWait = () => Promise.resolve();
/** A file of the given size without allocating it. */
const bigFile = (size: number) =>
  ({ name: "spex.zip", size, slice: (start: number, end: number) => new Blob([`${start}-${end}`]) }) as unknown as File;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("Uploading a spex package", () => {
  it("creates the package with the spreadsheet and the zip's name and size", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: ID }), { status: 201 }));

    expect(await createPackage(new File(["x"], "spex.xlsx"), new File(["abc"], "spex.zip"))).toBe(ID);
    const [url, init] = fetchMock.mock.calls[0];
    const body = init.body as FormData;

    expect(url).toBe("/api/packages");
    expect((body.get("spreadsheet") as File).name).toBe("spex.xlsx");
    expect(body.get("zipFileName")).toBe("spex.zip");
    expect(body.get("zipSize")).toBe("3");
  });

  it("says why the server refused the spreadsheet", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Fel blad" }), { status: 400 }));

    await expect(createPackage(new File(["x"], "spex.xlsx"), null)).rejects.toThrow("Fel blad");
    expect((fetchMock.mock.calls[0][1].body as FormData).has("zipFileName")).toBe(false);
  });

  it("asks where the server is, and fails when it cannot say", async () => {
    fetchMock.mockResolvedValueOnce(offset(7)).mockResolvedValueOnce(new Response(null, { status: 404 }));

    expect(await zipOffset(ID)).toBe(7);
    await expect(zipOffset(ID)).rejects.toBeInstanceOf(UploadError);
  });

  it("sends the zip in parts from where the server is", async () => {
    const size = PART_BYTES * 2 + 10;
    const progress: number[] = [];

    fetchMock
      .mockResolvedValueOnce(offset(PART_BYTES))
      .mockResolvedValueOnce(offset(PART_BYTES * 2, 204))
      .mockResolvedValueOnce(offset(size, 204));

    await uploadZip(ID, bigFile(size), (received) => progress.push(received), undefined, noWait);

    expect(progress).toEqual([PART_BYTES, PART_BYTES * 2, size]);
    expect(fetchMock.mock.calls[1][1].headers["Upload-Offset"]).toBe(String(PART_BYTES));
    expect(await (fetchMock.mock.calls[1][1].body as Blob).text()).toBe(`${PART_BYTES}-${PART_BYTES * 2}`);
    expect(await (fetchMock.mock.calls[2][1].body as Blob).text()).toBe(`${PART_BYTES * 2}-${size}`);
  });

  it("asks again after a part fails and continues from there", async () => {
    fetchMock
      .mockResolvedValueOnce(offset(0))
      .mockRejectedValueOnce(new TypeError("network"))
      .mockResolvedValueOnce(offset(5))
      .mockResolvedValueOnce(offset(10, 204));

    await uploadZip(ID, bigFile(10), () => undefined, undefined, noWait);

    expect(fetchMock.mock.calls[3][1].headers["Upload-Offset"]).toBe("5");
  });

  it("stops at once when the server refuses, and after too many failures", async () => {
    fetchMock
      .mockResolvedValueOnce(offset(0))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Inte din" }), { status: 403 }));
    await expect(uploadZip(ID, bigFile(10), () => undefined, undefined, noWait)).rejects.toThrow("Inte din");

    fetchMock.mockReset();
    fetchMock.mockImplementation((_url, init) =>
      Promise.resolve(init?.method === "HEAD" ? offset(0) : new Response(null, { status: 500 }))
    );
    await expect(uploadZip(ID, bigFile(10), () => undefined, undefined, noWait)).rejects.toThrow("HTTP 500");
  });

  it("stops when aborted", async () => {
    const controller = new AbortController();

    fetchMock.mockResolvedValueOnce(offset(0));
    controller.abort();
    await expect(uploadZip(ID, bigFile(10), () => undefined, controller.signal, noWait)).rejects.toThrow();
  });
});
