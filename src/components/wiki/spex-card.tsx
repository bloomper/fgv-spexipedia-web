import Link from "next/link";
import { useTranslations } from "next-intl";
import { Drama } from "lucide-react";
import { WikiImage, type WikiImageData } from "@/components/wiki/wiki-image";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";

export type SpexCardData = {
  id: string;
  slug: string;
  year: string;
  title: string;
  revival: boolean;
  published: boolean;
  category?: { name: string } | null;
  poster?: WikiImageData | null;
  /** How much of the page is filled in; the server gives it to authors only. */
  completeness?: { share: number } | null;
};

/**
 * A spex as a tile: its poster, year and title, and for authors how much of its page is filled in (a bar along the
 * poster's foot, and the percentage).
 */
export function SpexCard({ spex, introduction }: { spex: SpexCardData; introduction?: string | null }) {
  const t = useTranslations("Spex");

  return (
    <Link href={`/spex/${spex.slug}`}
          className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/60">
      <div className="relative aspect-[3/4] bg-muted">
        {spex.poster
          ? <WikiImage image={spex.poster} sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" className="size-full object-cover" />
          : <div className="flex size-full items-center justify-center"><Drama className="size-12 text-muted-foreground/30" aria-hidden /></div>}
        {/* Wraps and truncates within the tile, which is narrow on phones */}
        <div className="absolute inset-x-1.5 top-1.5 flex flex-wrap items-start gap-1 sm:inset-x-2 sm:top-2">
          {spex.revival && <Badge variant="secondary" className="max-w-full"><span className="min-w-0 truncate">{t("revival")}</span></Badge>}
          {!spex.published && <Badge variant="outline" className="max-w-full bg-background/80"><span className="min-w-0 truncate">{t("unpublished")}</span></Badge>}
        </div>
        {spex.completeness && <CompletenessBar share={spex.completeness.share} label={t("filledIn", { percent: Math.round(spex.completeness.share * 100) })} />}
      </div>
      <div className="space-y-1 p-2 sm:p-3">
        <p className="text-xs tracking-[0.12em] text-link sm:tracking-[0.18em]">{spex.year}</p>
        <p className="wiki-heading text-base leading-tight font-semibold [overflow-wrap:anywhere] group-hover:text-link sm:text-lg">{spex.title}</p>
        {introduction && <p className="line-clamp-2 text-xs text-muted-foreground">{introduction}</p>}
      </div>
    </Link>
  );
}

function CompletenessBar({ share, label }: { share: number; label: string }) {
  const percent = Math.round(share * 100);

  return (
    <div className="absolute inset-x-0 bottom-0" data-testid="spex-card-completeness">
      <span className="absolute right-1.5 bottom-2.5 rounded-full bg-background/85 px-1.5 py-0.5 text-[11px] leading-none font-medium tabular-nums sm:right-2 sm:bottom-3"
            aria-hidden>{percent}%</span>
      <div className="h-1 bg-background/70" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={label}>
        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
