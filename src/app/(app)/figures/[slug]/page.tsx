import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { HtmlContent } from "@/components/wiki/html-content";
import { WikiImage } from "@/components/wiki/wiki-image";
import { getFigure } from "@/lib/wiki/wiki.server";
import { privateMetadata, publicMetadata } from "@/lib/wiki/metadata.server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const figure = await getFigure(decodeURIComponent((await params).slug));

  return figure ? publicMetadata(figure.name) : privateMetadata("Spexipedia");
}

/**
 * A figure and the characters it has been, with their spex.
 */
export default async function FigurePage({ params }: Props) {
  const { slug } = await params;
  const [figure, t] = await Promise.all([getFigure(decodeURIComponent(slug)), getTranslations("Figures")]);

  if (!figure) {
    notFound();
  }
  if (figure.slug !== decodeURIComponent(slug)) {
    permanentRedirect(`/figures/${figure.slug}`);
  }
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <header className="space-y-1">
        <p className="text-sm tracking-[0.25em] text-primary uppercase">{t("figure")}</p>
        <h1 className="wiki-heading text-4xl font-semibold">{figure.name}</h1>
      </header>
      <HtmlContent html={figure.descriptionHtml} className="max-w-3xl" />
      <ul className="space-y-4">
        {figure.characters.map(character => (
          <li key={character.id} className="flex gap-4 rounded-lg border border-border bg-card p-4">
            {(character.images[0]?.image ?? character.spex.poster) && (
              <WikiImage image={(character.images[0]?.image ?? character.spex.poster)!} sizes="6rem" className="h-28 w-20 shrink-0 rounded object-cover" />
            )}
            <div className="min-w-0 space-y-1">
              <Link href={`/spex/${character.spex.slug}#character-${character.id}`} className="wiki-heading text-xl font-semibold hover:text-primary">
                {character.name}
              </Link>
              <p className="text-sm text-muted-foreground">{character.spex.title} ({character.spex.year})</p>
              <HtmlContent html={character.descriptionHtml} className="text-sm" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
