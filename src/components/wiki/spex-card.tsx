import Link from "next/link";
import { useTranslations } from "next-intl";
import { Drama } from "lucide-react";
import { WikiImage, type WikiImageData } from "@/components/wiki/wiki-image";
import { Badge } from "@/components/ui/badge";

export type SpexCardData = {
  id: string;
  slug: string;
  year: string;
  title: string;
  revival: boolean;
  published: boolean;
  category?: { name: string } | null;
  poster?: WikiImageData | null;
};

/**
 * A spex as a tile: its poster, year and title.
 */
export function SpexCard({ spex, introduction }: { spex: SpexCardData; introduction?: string | null }) {
  const t = useTranslations("Spex");

  return (
    <Link href={`/spex/${spex.slug}`}
          className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/60">
      <div className="relative aspect-[3/4] bg-muted">
        {spex.poster
          ? <WikiImage image={spex.poster} sizes="(min-width: 1024px) 20vw, 50vw" className="size-full object-cover" />
          : <div className="flex size-full items-center justify-center"><Drama className="size-12 text-muted-foreground/30" aria-hidden /></div>}
        <div className="absolute top-2 left-2 flex gap-1">
          {spex.revival && <Badge variant="secondary">{t("revival")}</Badge>}
          {!spex.published && <Badge variant="outline" className="bg-background/80">{t("unpublished")}</Badge>}
        </div>
      </div>
      <div className="space-y-1 p-3">
        <p className="text-xs tracking-[0.18em] text-primary">{spex.year}</p>
        <p className="wiki-heading text-lg leading-tight font-semibold group-hover:text-primary">{spex.title}</p>
        {introduction && <p className="line-clamp-2 text-xs text-muted-foreground">{introduction}</p>}
      </div>
    </Link>
  );
}
