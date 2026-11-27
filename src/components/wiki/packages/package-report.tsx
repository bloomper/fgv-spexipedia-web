import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import type { SpexPackageReportData } from "@/lib/packages/packages.server";
import { cn } from "@/utils/utils";

type App = SpexPackageReportData["apps"][number];

const TONES: Record<string, string> = {
  CHECKED: "border-emerald-500/60 text-emerald-600 dark:text-emerald-400",
  APPLIED: "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  DEFERRED: "border-sky-500/60 text-sky-600 dark:text-sky-400",
  UNAVAILABLE: "border-amber-500/60 text-amber-600 dark:text-amber-400",
  FAILED: "border-destructive/60 text-destructive",
};

/** A status or state the server reports, named in the viewer's language when it is known, else as it came. */
export function useLabel(namespace: "statuses" | "outcomes") {
  const t = useTranslations("Packages");

  return (value: string) => (t.has(`${namespace}.${value}`) ? t(`${namespace}.${value}`) : value);
}

/** An application's name as the application switcher gives it, else as the server sent it. */
function useAppName() {
  const t = useTranslations("FgvUi.applications");

  return (app: string) => (t.has(app.toLowerCase()) ? t(app.toLowerCase()) : app);
}

export function StatusChip({ status }: { status: string }) {
  const label = useLabel("statuses");

  return (
    <Badge
      variant="outline"
      className={cn(TONES[status])}
    >
      {label(status)}
    </Badge>
  );
}

/**
 * What a preview or an application of a package did, per application in the order the server sends them (Spexipedia
 * first), with what went nowhere and the warnings.
 */
export function PackageReport({ report }: { report: SpexPackageReportData }) {
  const t = useTranslations("Packages");

  return (
    <div className="space-y-4">
      <ul className="grid gap-4 md:grid-cols-2">
        {report.apps.map((app) => (
          <AppReport
            key={app.app}
            app={app}
          />
        ))}
      </ul>
      {report.unmatched.length > 0 && (
        <Notes
          title={t("unmatched", { count: report.unmatched.length })}
          notes={report.unmatched}
        />
      )}
      {report.warnings.length > 0 && (
        <Notes
          title={t("warnings", { count: report.warnings.length })}
          notes={report.warnings}
        />
      )}
    </div>
  );
}

function Notes({ title, notes }: { title: string; notes: string[] }) {
  return (
    <details
      className="border-border bg-card rounded-lg border p-3"
      open={notes.length <= 5}
    >
      <summary className="cursor-pointer text-sm font-semibold">{title}</summary>
      <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
        {notes.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
    </details>
  );
}

function AppReport({ app }: { app: App }) {
  const t = useTranslations("Packages");
  const name = useAppName();
  const outcome = useLabel("outcomes");
  const failed = app.items.filter((item) => item.outcome === "FAILED" || item.message);
  const counts = (["created", "updated", "unchanged", "kept", "failed"] as const).filter(
    (key) => key !== "kept" || app.kept > 0
  );

  return (
    <li className="border-border bg-card space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="wiki-heading text-xl font-semibold">{name(app.app)}</h3>
        <StatusChip status={app.status} />
        {app.webUrl && (
          <a
            href={app.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-link/80 ml-auto inline-flex items-center gap-1 text-sm"
          >
            {t("open")}{" "}
            <ExternalLink
              className="size-3.5"
              aria-hidden
            />
          </a>
        )}
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center text-sm sm:grid-cols-5">
        {counts.map((key) => (
          <div
            key={key}
            className={cn(
              "bg-muted/40 rounded-md px-2 py-1",
              key === "failed" && app.failed > 0 && "bg-destructive/10 text-destructive"
            )}
          >
            <dt className="text-muted-foreground text-xs">{t(`counts.${key}`)}</dt>
            <dd className="font-semibold tabular-nums">{app[key]}</dd>
          </div>
        ))}
      </dl>
      <p className="text-muted-foreground text-xs">
        {t("recordsAndFiles", { records: app.records, files: app.files })}
      </p>
      {app.message && <p className="text-sm">{app.message}</p>}
      {failed.length > 0 && (
        <details className="text-sm">
          <summary className="text-destructive cursor-pointer">
            {t("itemsWithMessages", { count: failed.length })}
          </summary>
          <ul className="mt-2 space-y-1">
            {failed.map((item) => (
              <li
                key={`${item.kind}-${item.sourceKey}`}
                className="border-border rounded border px-2 py-1"
              >
                <span className="font-medium">{item.kind}</span>{" "}
                <code className="text-muted-foreground text-xs">{item.sourceKey}</code>{" "}
                <span className="text-xs">({outcome(item.outcome)})</span>
                {item.message && <p className="text-muted-foreground">{item.message}</p>}
                {item.warnings.map((warning, index) => (
                  <p
                    key={index}
                    className="text-xs text-amber-600 dark:text-amber-400"
                  >
                    {warning}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}
