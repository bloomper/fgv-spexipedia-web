import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { router, toast } from "@/test/manage-mocks";

const actions = vi.hoisted(() => ({} as Record<string, ReturnType<typeof vi.fn>>));
const upload = vi.hoisted(() => ({ createPackage: vi.fn(), uploadZip: vi.fn() }));

vi.mock("next/navigation", async () => {
  const mocks = await import("@/test/manage-mocks");

  return { useRouter: () => mocks.router, usePathname: () => "/manage/packages", useSearchParams: () => new URLSearchParams() };
});
vi.mock("sonner", async () => ({ toast: (await import("@/test/manage-mocks")).toast }));
vi.mock("@/app/(app)/manage/packages/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));
vi.mock("@/components/wiki/packages/package-upload.client", async importOriginal => ({
  ...await importOriginal<object>(), createPackage: upload.createPackage, uploadZip: upload.uploadZip,
}));

import { formatBytes, NewPackageForm, PackageActions, ProgressBar, ZipResume } from "@/components/wiki/packages/package-forms.client";
import { PackageReport } from "@/components/wiki/packages/package-report";
import { StateChip } from "@/components/wiki/packages/package-state";
import { DialogsProvider } from "@/components/dialogs.client";

const ID = "01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e";
const show = (node: React.ReactNode) => render(<DialogsProvider>{node}</DialogsProvider>);
const xlsx = new File(["x"], "spex.xlsx");
const zip = new File(["abcdef"], "spex.zip");

beforeEach(() => {
  Object.keys(actions).forEach(key => delete actions[key]);
  vi.clearAllMocks();
});

describe("A new spex package", () => {
  it("uploads the spreadsheet, then the zip with progress, and opens the package", async () => {
    upload.createPackage.mockResolvedValue(ID);
    upload.uploadZip.mockImplementation(async (_id, file: File, onProgress: (n: number) => void) => onProgress(file.size / 2));
    show(<NewPackageForm />);

    expect(screen.getByRole("button", { name: "upload" })).toBeDisabled();
    await userEvent.upload(screen.getByLabelText("spreadsheet"), xlsx);
    await userEvent.upload(screen.getByLabelText("zip"), zip);
    expect(screen.getByText(`zipChosen:{"size":"6 B"}`)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "upload" }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith(`/manage/packages/${ID}`));
    expect(upload.createPackage).toHaveBeenCalledWith(xlsx, zip);
    expect(upload.uploadZip).toHaveBeenCalledWith(ID, zip, expect.any(Function), expect.any(AbortSignal));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    expect(toast.success).toHaveBeenCalledWith("uploaded");
  });

  it("opens the package to continue when the zip did not get through, and stays when the spreadsheet was refused", async () => {
    upload.createPackage.mockResolvedValueOnce(ID).mockRejectedValueOnce(new Error("Fel blad"));
    upload.uploadZip.mockRejectedValue(new Error("network"));
    const { unmount } = show(<NewPackageForm />);

    await userEvent.upload(screen.getByLabelText("spreadsheet"), xlsx);
    await userEvent.upload(screen.getByLabelText("zip"), zip);
    await userEvent.click(screen.getByRole("button", { name: "upload" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(`zipFailed:{"message":"network"}`));
    expect(router.push).toHaveBeenCalledWith(`/manage/packages/${ID}`);
    unmount();

    vi.clearAllMocks();
    show(<NewPackageForm />);
    await userEvent.upload(screen.getByLabelText("spreadsheet"), xlsx);
    await userEvent.click(screen.getByRole("button", { name: "upload" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(`uploadFailed:{"message":"Fel blad"}`));
    expect(router.push).not.toHaveBeenCalled();
    expect(upload.uploadZip).not.toHaveBeenCalled();
  });

  it("continues a zip with the same file only", async () => {
    upload.uploadZip.mockImplementation(async (_id, file: File, onProgress: (n: number) => void) => onProgress(file.size));
    show(<ZipResume id={ID} zipFileName="spex.zip" zipSize={6} zipReceived={2} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "33");
    await userEvent.upload(screen.getByLabelText("pickSameZip"), new File(["other"], "annan.zip"));
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("notTheSameZip"));
    expect(upload.uploadZip).not.toHaveBeenCalled();

    await userEvent.upload(screen.getByLabelText("pickSameZip"), zip);
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
    expect(upload.uploadZip).toHaveBeenCalledWith(ID, zip, expect.any(Function), expect.any(AbortSignal));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("says when continuing fails", async () => {
    upload.uploadZip.mockRejectedValue(new Error("network"));
    show(<ZipResume id={ID} zipFileName={null} zipSize={6} zipReceived={0} />);

    await userEvent.upload(screen.getByLabelText("pickSameZip"), zip);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(`zipFailed:{"message":"network"}`));
  });
});

describe("A package's actions", () => {
  it("preview an uploaded package, not before its zip is all there", async () => {
    const { unmount } = show(<PackageActions id={ID} state="UPLOADED" zipComplete={false} />);

    expect(screen.getByRole("button", { name: "preview" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "apply" })).not.toBeInTheDocument();
    unmount();
    show(<PackageActions id={ID} state="UPLOADED" zipComplete />);
    await userEvent.click(screen.getByRole("button", { name: "preview" }));
    await waitFor(() => expect(actions.previewPackageAction).toHaveBeenCalledWith(ID));
    expect(toast.success).toHaveBeenCalledWith("previewStarted");
  });

  it("apply a previewed package after confirming, and again after it applied", async () => {
    const { unmount } = show(<PackageActions id={ID} state="PREVIEWED" zipComplete />);

    await userEvent.click(screen.getByRole("button", { name: "apply" }));
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "apply" }));
    await waitFor(() => expect(actions.applyPackageAction).toHaveBeenCalledWith(ID));
    unmount();
    show(<PackageActions id={ID} state="APPLIED" zipComplete />);
    expect(screen.getByRole("button", { name: "applyAgain" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "preview" })).not.toBeInTheDocument();
  });

  it("delete after confirming, never while it runs", async () => {
    const { unmount } = show(<PackageActions id={ID} state="APPLYING" zipComplete />);

    expect(screen.getByRole("button", { name: "delete" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "applyAgain" })).not.toBeInTheDocument();
    unmount();
    show(<PackageActions id={ID} state="FAILED" zipComplete />);
    expect(screen.getByRole("button", { name: "preview" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "delete" }));
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "delete" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/manage/packages"));
    expect(actions.deletePackageAction).toHaveBeenCalledWith(ID);
  });
});

describe("A package's report", () => {
  const app = (name: string, status: string, extra = {}) => ({
    app: name, status, records: 3, files: 2, created: 1, updated: 1, unchanged: 1, kept: 0, failed: 0, message: null, webUrl: null, items: [], ...extra,
  });

  it("shows each application the report has, with counts, link, message and the items that need attention", () => {
    render(<PackageReport report={{
      unmatched: ["bilder/okänd.jpg: ingen rad"], warnings: ["Ett namn är olöst"],
      apps: [
        app("SPEXIPEDIA", "CHECKED", { webUrl: "https://spexipedia.test/spex/1984" }),
        app("NEWAPP", "FAILED", {
          failed: 1, kept: 2, message: "Kunde inte nås",
          items: [
            { kind: "TRACK", sourceKey: "pkg:1:track:1", id: null, outcome: "FAILED", message: "Ingen fil", warnings: ["kolla"] },
            { kind: "ALBUM", sourceKey: "pkg:1:album", id: "a1", outcome: "CREATED", message: null, warnings: [] },
          ],
        }),
      ],
    }} />);

    expect(screen.getAllByRole("heading").map(heading => heading.textContent)).toEqual(["SPEXIPEDIA", "NEWAPP"]);
    expect(screen.getByRole("link", { name: "open" })).toHaveAttribute("href", "https://spexipedia.test/spex/1984");
    expect(screen.getByText("CHECKED")).toBeInTheDocument();
    expect(screen.getAllByText("counts.kept")).toHaveLength(1);
    expect(screen.getByText("Kunde inte nås")).toBeInTheDocument();
    expect(screen.getByText(`itemsWithMessages:{"count":1}`)).toBeInTheDocument();
    expect(screen.getByText("Ingen fil")).toBeInTheDocument();
    expect(screen.getByText("kolla")).toBeInTheDocument();
    expect(screen.getByText("bilder/okänd.jpg: ingen rad")).toBeInTheDocument();
    expect(screen.getByText("Ett namn är olöst")).toBeInTheDocument();
  });

  it("names states, sizes and progress", () => {
    render(<><StateChip state="PREVIEWING" /><ProgressBar value={140} label="p" /></>);

    expect(screen.getByText("PREVIEWING")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(20_000_000_000, "en")).toBe("20 GB");
    expect(formatBytes(1_500_000, "en")).toBe("1.5 MB");
  });
});
