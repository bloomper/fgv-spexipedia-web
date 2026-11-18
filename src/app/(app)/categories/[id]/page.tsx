import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SpexCard } from "@/components/wiki/spex-card";
import { WikiImage } from "@/components/wiki/wiki-image";
import { HtmlContent } from "@/components/wiki/html-content";
import { getCategory } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata, publicMetadata } from "@/lib/wiki/metadata.server";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).id);

  return category ? publicMetadata(category.name, null, category.logo?.pageJpegUrl) : privateMetadata("Spexipedia");
}

/**
 * A spex category: its logo and description, and its spex, originals by year and then revivals.
 */
export default async function CategoryPage({ params }: Props) {
  const [category, t, viewer] = await Promise.all([getCategory((await params).id), getTranslations("Category"), getViewer()]);

  if (!category) {
    notFound();
  }
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center gap-6">
        {category.logo && <WikiImage image={category.logo} sizes="8rem" className="size-28 rounded-lg object-contain" />}
        <div className="space-y-1">
          <p className="text-sm tracking-[0.25em] text-primary">{t("since", { year: category.firstYear })}</p>
          <h1 className="wiki-heading text-3xl font-semibold">{category.name}</h1>
        </div>
      </header>
      <HtmlContent html={category.descriptionHtml} className="max-w-3xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {category.spex.filter(spex => spex.published || viewer.author).map(spex => <SpexCard key={spex.id} spex={spex} introduction={spex.page?.introduction} />)}
      </div>
    </div>
  );
}
