import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Pencil } from "lucide-react";
import { getBook } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata, publicMetadata } from "@/lib/wiki/metadata.server";
import { HtmlContent } from "@/components/wiki/html-content";
import { ImageGallery } from "@/components/wiki/image-gallery.client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook(decodeURIComponent((await params).slug));

  if (!book) {
    return privateMetadata("Bok");
  }
  return book.published ? publicMetadata(book.title, null, book.cover?.pageJpegUrl) : privateMetadata(book.title);
}

/**
 * A book: something printed, e.g. a book; its songs in the book's order, each leading to its number on the
 * spex page.
 */
export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const [book, viewer, t] = await Promise.all([getBook(decodeURIComponent(slug)), getViewer(), getTranslations("Books")]);

  if (!book) {
    notFound();
  }
  if (book.slug !== decodeURIComponent(slug)) {
    permanentRedirect(`/books/${book.slug}`);
  }
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 md:px-8">
      <header className="grid gap-6 md:grid-cols-[minmax(0,14rem)_1fr]">
        {book.cover ? <ImageGallery images={[{ image: book.cover, caption: null }]} columns={2} className="md:grid-cols-1" /> : <div className="max-md:hidden" />}
        <div className="space-y-3">
          <p className="text-sm tracking-[0.25em] text-primary">{book.kind.name}{book.publishedYear && ` · ${book.publishedYear}`}</p>
          <h1 className="wiki-heading text-3xl font-semibold md:text-4xl">{book.title}</h1>
          {!book.published && <Badge variant="outline">{t("unpublished")}</Badge>}
          <HtmlContent html={book.descriptionHtml} />
          {viewer.editor && (
            <Link href={`/manage/books/${book.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}><Pencil aria-hidden /> {t("edit")}</Link>
          )}
        </div>
      </header>
      {book.songs.length > 0 && (
        <section className="space-y-3" aria-labelledby="songs">
          <h2 id="songs" className="wiki-heading text-xl font-semibold">{t("songs")}</h2>
          <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-sm">
            {book.songs.map(song => (
              <li key={song.id} className={`flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-3 py-2 ${song.number ? "link-row" : ""}`}>
                <span className="w-8 text-muted-foreground">{song.position}</span>
                {song.number
                  ? <Link href={`/spex/${song.number.spex.slug}#number-${song.number.id}`} className="row-link min-w-0 flex-1">{song.title}</Link>
                  : <span className="min-w-0 flex-1">{song.title}</span>}
                {song.textOnly && <Badge variant="secondary">{t("textOnly")}</Badge>}
                {song.number && (
                  <span className="text-xs text-muted-foreground">
                    {t("songNumber", { spex: `${song.number.spex.title} (${song.number.spex.year})`, act: song.number.act, number: song.number.position })}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
