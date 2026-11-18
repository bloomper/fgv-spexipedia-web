import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WikiImage } from "@/components/wiki/wiki-image";
import { Badge } from "@/components/ui/badge";
import { getBooks } from "@/lib/wiki/wiki.server";
import { publicMetadata } from "@/lib/wiki/metadata.server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Books");

  return publicMetadata(t("title"), t("description"));
}

/**
 * Every published book (all for editors), by volume.
 */
export default async function BooksPage() {
  const [t, books] = await Promise.all([getTranslations("Books"), getBooks()]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader title={t("title")} description={t("description")} />
      {books.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : (
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
      )}
    </div>
  );
}
