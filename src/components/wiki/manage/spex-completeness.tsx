import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import type { Completeness } from "@/lib/wiki/edit.server";
import { cn } from "@/utils/utils";

export const percent = (share: number) => Math.round(share * 100);

/** The whole as a ring, the percentage in its middle. */
export function CompletenessRing({ share, label, className }: { share: number; label: string; className?: string }) {
  const radius = 26;
  const length = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={label} className={cn("size-16 shrink-0 -rotate-90", className)}>
      <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="7" className="stroke-muted" />
      <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-primary transition-[stroke-dasharray]"
              strokeDasharray={`${share * length} ${length}`} />
      <text x="32" y="32" textAnchor="middle" dominantBaseline="central" transform="rotate(90 32 32)"
            className="fill-foreground text-[15px] font-semibold tabular-nums">{percent(share)}%</text>
    </svg>
  );
}

/**
 * How much of the spex's page is filled in (the server's Spex.completeness): a ring for the whole and a bar per section of
 * the editing page; a section opens to what is missing and links to it when the viewer may edit it.
 */
export async function SpexCompleteness({ completeness, sections, revival, folded = false, className }: {
  completeness: Completeness;
  /** The sections shown on the page, by name: the others are listed without a link. */
  sections: string[];
  revival: boolean;
  /** Only the ring until opened, where the card would push the editor far down (phones and tablets). */
  folded?: boolean;
  className?: string;
}) {
  const t = await getTranslations("Manage");
  const total = percent(completeness.share);
  const head = (
    <div className="flex items-center gap-3">
      <CompletenessRing share={completeness.share} label={t("completeness.total", { percent: total })} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{t("completeness.title")}</p>
        <p className="text-xs text-muted-foreground">{revival ? t("completeness.revivalHelp") : t("completeness.help")}</p>
      </div>
      {folded && <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-open/card:rotate-180" />}
    </div>
  );
  const list = (
      <ul className={cn("space-y-1.5", folded && "mt-3")}>
        {completeness.sections.map(section => {
          const missing = section.items.filter(item => item.filled < 1);
          const value = percent(section.share);
          const name = section.section.toLowerCase();
          const title = t(`editSections.${name}`);
          const bar = (
            <span className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">{title}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{value}%</span>
            </span>
          );

          return (
            <li key={name}>
              <details className="group">
                <summary className={cn("cursor-pointer list-none space-y-1 rounded-sm [&::-webkit-details-marker]:hidden", missing.length === 0 && "pointer-events-none")}>
                  {bar}
                  <span className="block h-1.5 overflow-hidden rounded-full bg-muted" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={title}>
                    <span className={cn("block h-full rounded-full", value === 100 ? "bg-primary" : "bg-primary/70")} style={{ width: `${value}%` }} />
                  </span>
                </summary>
                {missing.length > 0 && (
                  <div className="mt-1.5 space-y-1 pl-1 text-xs text-muted-foreground">
                    <p>
                      {t("completeness.missing")}{" "}
                      {missing.map(item => item.filled > 0
                        ? t("completeness.partly", { item: t(`completeness.items.${item.item}`), percent: percent(item.filled) })
                        : t(`completeness.items.${item.item}`)).join(", ")}
                    </p>
                    {sections.includes(name) && <a href={`#edit-${name}`} className="text-primary hover:underline">{t("completeness.goTo", { section: title })}</a>}
                  </div>
                )}
              </details>
            </li>
          );
        })}
      </ul>
  );
  const card = cn("rounded-lg border border-border bg-card p-4", className);

  return folded ? (
    <details className={cn("group/card", card)} data-testid="spex-completeness">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">{head}</summary>
      {list}
    </details>
  ) : (
    <div className={cn("space-y-3", card)} data-testid="spex-completeness">
      {head}
      {list}
    </div>
  );
}
