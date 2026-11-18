import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WikiImage } from "@/components/wiki/wiki-image";
import { Badge } from "@/components/ui/badge";
import { getBooks } from "@/lib/wiki/wiki.server";
import { publicMetadata } from "@/lib/wiki/metadata.server";
import { SortControl } from "@/components/sort-control";
import { parseSort, type SortChoice, sortItems } from "@/utils/sorting";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const FIELDS = ["volume", "year", "title"] as const;
const DEFAULT: SortChoice<(typeof FIELDS)[number]> = { field: "volume", dir: "asc" };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Books");

  return publicMetadata(t("title"), t("description"));
}

/**
 * Every published book (all for editors), by volume, year or title as the visitor picks.
 */
export default async function BooksPage({ searchParams }: Props) {
  const [t, ts, all, params] = await Promise.all([getTranslations("Books"), getTranslations("Sort"), getBooks(), searchParams]);
  const sort = parseSort(params, FIELDS, DEFAULT);
  const books = sort.field === "volume" ? sortItems(all, sort.dir, b => b.volume, b => b.title)
    : sort.field === "year" ? sortItems(all, sort.dir, b => b.publishedYear, b => b.volume ?? Number.MAX_SAFE_INTEGER, b => b.title)
      : sortItems(all, sort.dir, b => b.title, b => b.volume ?? Number.MAX_SAFE_INTEGER);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader title={t("title")} description={t("description")} />
      {books.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : (<>
        <SortControl path="/books" params={params} current={sort} fallback={DEFAULT} fields={[
          { field: "volume", label: ts("volume") }, { field: "year", label: ts("year") }, { field: "title", label: ts("title") },
        ]} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map(book => (
            <li key={book.id}>
              <Link href={`/books/${book.slug}`} className="group flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/60">
                {book.cover
                  ? <WikiImage image={book.cover} sizes="5rem" className="h-28 w-20 shrink-0 rounded object-cover" />
                  : <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded bg-muted"><BookText className="size-9 text-muted-foreground/40" aria-hidden /></div>}
                <div className="min-w-0 space-y-1 text-sm">
                  <p className="wiki-heading text-lg leading-tight font-semibold group-hover:text-primary">{book.title}</p>
                  <p className="text-muted-foreground">{book.kind.name}{book.publishedYear && ` · ${book.publishedYear}`}</p>
                  {!book.published && <Badge variant="outline">{t("unpublished")}</Badge>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </>)}
    </div>
  );
}
