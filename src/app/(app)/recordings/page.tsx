import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Disc3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WikiImage } from "@/components/wiki/wiki-image";
import { Badge } from "@/components/ui/badge";
import { getRecordings } from "@/lib/wiki/wiki.server";
import { publicMetadata } from "@/lib/wiki/metadata.server";
import { SortControl } from "@/components/sort-control";
import { parseSort, type SortChoice, sortItems } from "@/utils/sorting";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const FIELDS = ["catalogue", "released", "title"] as const;
const DEFAULT: SortChoice<(typeof FIELDS)[number]> = { field: "catalogue", dir: "asc" };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Recordings");

  return publicMetadata(t("title"), t("description"));
}

/**
 * Every published recording (all for editors), by catalogue number, release date or title as the visitor picks.
 */
export default async function RecordingsPage({ searchParams }: Props) {
  const [t, ts, all, params] = await Promise.all([getTranslations("Recordings"), getTranslations("Sort"), getRecordings(), searchParams]);
  const sort = parseSort(params, FIELDS, DEFAULT);
  const recordings = sort.field === "catalogue" ? sortItems(all, sort.dir, r => r.catalogueNumber, r => r.title)
    : sort.field === "released" ? sortItems(all, sort.dir, r => r.released, r => r.catalogueNumber)
      : sortItems(all, sort.dir, r => r.title, r => r.catalogueNumber);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader title={t("title")} description={t("description")} />
      <SortControl path="/recordings" params={params} current={sort} fallback={DEFAULT} fields={[
        { field: "catalogue", label: ts("catalogueNumber") }, { field: "released", label: ts("released") }, { field: "title", label: ts("title") },
      ]} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recordings.map(recording => (
          <li key={recording.id}>
            <Link href={`/recordings/${recording.slug}`} className="flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/60">
              {recording.front
                ? <WikiImage image={recording.front} sizes="6rem" className="size-24 shrink-0 rounded object-cover" />
                : <div className="flex size-24 shrink-0 items-center justify-center rounded bg-muted"><Disc3 className="size-10 text-muted-foreground/40" aria-hidden /></div>}
              <div className="min-w-0 space-y-1 text-sm">
                <p className="text-xs tracking-[0.15em] text-primary">{recording.catalogueNumber}</p>
                <p className="wiki-heading text-lg leading-tight font-semibold">{recording.title}</p>
                <p className="text-muted-foreground">{recording.medium.name}{recording.released && ` · ${recording.released}`}</p>
                {recording.spex && <p className="text-xs text-muted-foreground">{recording.spex.title} ({recording.spex.year})</p>}
                {!recording.published && <Badge variant="outline">{t("unpublished")}</Badge>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
