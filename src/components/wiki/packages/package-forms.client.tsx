"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, Play, Trash2, Upload, X } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { FileInput } from "@/components/file-input.client";
import { Label } from "@bloomper/fgv-web-ui/ui/label";
import { useDialogs } from "@bloomper/fgv-web-ui/shell/dialogs";
import { useSave } from "@/components/wiki/editor/use-save.client";
import {
  applyPackageAction,
  deletePackageAction,
  previewPackageAction,
} from "@/app/(app)/manage/packages/actions.server";
import {
  createPackage,
  SPREADSHEET_TYPES,
  uploadZip,
  ZIP_TYPES,
} from "@/components/wiki/packages/package-upload.client";
import type { SpexPackageState } from "@/gql/graphql";

/** Bytes as the user reads them, in the page's language. */
export function formatBytes(bytes: number, locale: string): string {
  const units = ["B", "kB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;

  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }
  return `${value.toLocaleString(locale, { maximumFractionDigits: unit < 2 ? 0 : 1 })} ${units[unit]}`;
}

/**
 * How far something has come, 0–100, with a label for screen readers.
 */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="bg-muted h-2 w-full overflow-hidden rounded-full"
    >
      <div
        className="bg-primary h-full rounded-full transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/** The zip's upload as it goes: bytes received of all, and a bar. */
function ZipProgress({ received, size }: { received: number; size: number }) {
  const t = useTranslations("Packages");
  const locale = useLocale();

  return (
    <div className="space-y-1">
      <ProgressBar
        value={size > 0 ? (received / size) * 100 : 0}
        label={t("zipProgress")}
      />
      <p className="text-muted-foreground text-xs tabular-nums">
        {t("received", { received: formatBytes(received, locale), size: formatBytes(size, locale) })}
      </p>
    </div>
  );
}

/**
 * A new spex package: the spreadsheet (required) and a zip (optional). The spreadsheet goes first and makes the
 * package; the zip follows in parts. When the zip does not get through, the package's page offers to continue.
 */
export function NewPackageForm() {
  const t = useTranslations("Packages");
  const locale = useLocale();
  const router = useRouter();
  const [spreadsheet, setSpreadsheet] = useState<File | null>(null);
  const [zip, setZip] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [received, setReceived] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);

  return (
    <form
      className="max-w-2xl space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!spreadsheet) {
          return;
        }
        setBusy(true);
        let id: string | null = null;

        try {
          id = await createPackage(spreadsheet, zip);
          if (zip) {
            abort.current = new AbortController();
            setReceived(0);
            await uploadZip(id, zip, setReceived, abort.current.signal);
          }
          toast.success(t("uploaded"));
        } catch (error) {
          toast.error(
            id
              ? t("zipFailed", { message: (error as Error).message })
              : t("uploadFailed", { message: (error as Error).message })
          );
        } finally {
          setBusy(false);
          abort.current = null;
        }
        if (id) {
          router.push(`/manage/packages/${id}`);
        }
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="spreadsheet">{t("spreadsheet")}</Label>
        <FileInput
          id="spreadsheet"
          accept={SPREADSHEET_TYPES}
          disabled={busy}
          onChange={setSpreadsheet}
        />
        <p className="text-muted-foreground text-xs">{t("spreadsheetHelp")}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="zip">{t("zip")}</Label>
        <FileInput
          id="zip"
          accept={ZIP_TYPES}
          disabled={busy}
          onChange={setZip}
        />
        <p className="text-muted-foreground text-xs">
          {zip ? t("zipChosen", { size: formatBytes(zip.size, locale) }) : t("zipHelp")}
        </p>
      </div>
      {zip && received !== null && (
        <ZipProgress
          received={received}
          size={zip.size}
        />
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={busy || !spreadsheet}
        >
          <Upload aria-hidden /> {busy ? t("uploading") : t("upload")}
        </Button>
        {busy && zip && received !== null && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => abort.current?.abort()}
          >
            <X aria-hidden /> {t("stop")}
          </Button>
        )}
      </div>
    </form>
  );
}

/**
 * The rest of a zip that did not all arrive: the user picks the same file again and the upload continues from what
 * the server has.
 */
export function ZipResume({
  id,
  zipFileName,
  zipSize,
  zipReceived,
}: {
  id: string;
  zipFileName: string | null;
  zipSize: number;
  zipReceived: number;
}) {
  const t = useTranslations("Packages");
  const locale = useLocale();
  const router = useRouter();
  const [received, setReceived] = useState(zipReceived);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  return (
    <div className="space-y-3 rounded-lg border border-amber-500/50 bg-amber-500/5 p-4">
      <p className="text-sm">{t("zipIncomplete", { name: zipFileName ?? "zip" })}</p>
      <ZipProgress
        received={received}
        size={zipSize}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Label
          htmlFor="resume-zip"
          className="sr-only"
        >
          {t("pickSameZip")}
        </Label>
        <FileInput
          id="resume-zip"
          accept={ZIP_TYPES}
          disabled={busy}
          className="max-w-sm"
          onChange={async (file) => {
            if (!file) {
              return;
            }
            if (file.size !== zipSize || (zipFileName && file.name !== zipFileName)) {
              toast.error(t("notTheSameZip", { name: zipFileName ?? "", size: formatBytes(zipSize, locale) }));
              return;
            }
            setBusy(true);
            abort.current = new AbortController();
            try {
              await uploadZip(id, file, setReceived, abort.current.signal);
              toast.success(t("uploaded"));
              router.refresh();
            } catch (error) {
              toast.error(t("zipFailed", { message: (error as Error).message }));
            } finally {
              setBusy(false);
              abort.current = null;
            }
          }}
        />
        {busy && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => abort.current?.abort()}
          >
            <X aria-hidden /> {t("stop")}
          </Button>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{t("pickSameZip")}</p>
    </div>
  );
}

/**
 * Preview (once uploaded), apply (once previewed, and again after it applied or failed, which is safe) and delete
 * (not while it runs).
 */
export function PackageActions({
  id,
  state,
  zipComplete,
}: {
  id: string;
  state: SpexPackageState;
  zipComplete: boolean;
}) {
  const t = useTranslations("Packages");
  const router = useRouter();
  const { confirm } = useDialogs();
  const { save, pending } = useSave();
  const running = state === "PREVIEWING" || state === "APPLYING";
  const canApply = state === "PREVIEWED" || state === "APPLIED" || state === "FAILED";

  return (
    <div className="flex flex-wrap gap-2">
      {(state === "UPLOADED" || state === "PREVIEWED" || state === "FAILED") && (
        <Button
          type="button"
          variant={state === "UPLOADED" ? "default" : "outline"}
          disabled={pending || !zipComplete}
          onClick={() => save(() => previewPackageAction(id), { success: t("previewStarted") })}
        >
          <Eye aria-hidden /> {t("preview")}
        </Button>
      )}
      {canApply && (
        <Button
          type="button"
          disabled={pending || !zipComplete}
          onClick={async () => {
            if (await confirm({ title: t("applyTitle"), description: t("applyText"), confirmLabel: t("apply") })) {
              void save(() => applyPackageAction(id), { success: t("applyStarted") });
            }
          }}
        >
          <Play aria-hidden /> {state === "PREVIEWED" ? t("apply") : t("applyAgain")}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        disabled={pending || running}
        onClick={async () => {
          if (
            await confirm({
              title: t("deleteTitle"),
              description: t("deleteText"),
              confirmLabel: t("delete"),
              destructive: true,
            })
          ) {
            void save(() => deletePackageAction(id), {
              success: t("deleted"),
              then: () => router.push("/manage/packages"),
            });
          }
        }}
      >
        <Trash2 aria-hidden /> {t("delete")}
      </Button>
    </div>
  );
}
