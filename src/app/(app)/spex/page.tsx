import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { SpexCard } from "@/components/wiki/spex-card";
import { getViewer } from "@/lib/wiki/viewer.server";
import { getSpexBrowse } from "@/lib/wiki/wiki.server";
import { publicMetadata } from "@/lib/wiki/metadata.server";
import { groupBy } from "@/utils/wiki";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Browse");

  return publicMetadata(t("title"), t("description"));
}

/**
 * Every spex with a published page (and, for authors, the others), by decade, with the categories to browse by.
 */
export default async function BrowsePage() {
  const [t, data, viewer] = await Promise.all([getTranslations("Browse"), getSpexBrowse(), getViewer()]);
  // The server lists every spex, as base data; the pages of unpublished ones are for authors only
  const spex = [...(data?.spexAll ?? [])].filter(s => !s.retired && (s.published || viewer.author))
    .sort((a, b) => a.year.localeCompare(b.year));
  const decades = groupBy(spex, s => `${s.year.slice(0, 3)}0`);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 md:px-8">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="space-y-3">
        {(data?.spexCategories ?? []).length > 0 && (
          <nav aria-label={t("categories")} className="flex flex-wrap gap-2">
            {(data?.spexCategories ?? []).map(category => (
              <Link key={category.id} href={`/categories/${category.id}`} className="rounded-full bg-secondary px-3 py-1 text-sm hover:text-primary">{category.name}</Link>
            ))}
          </nav>
        )}
        <nav aria-label={t("decades")} className="flex flex-wrap gap-2">
          {decades.map(([decade]) => (
            <a key={decade} href={`#decade-${decade}`} className="rounded-full border border-border px-3 py-1 text-sm hover:border-primary hover:text-primary">{t("decade", { decade })}</a>
          ))}
        </nav>
      </div>
      {decades.map(([decade, list]) => (
        <section key={decade} id={`decade-${decade}`} className="scroll-mt-20 space-y-3">
          <h2 className="wiki-heading text-xl font-semibold">{t("decade", { decade })}</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
            {list.map(s => <SpexCard key={s.id} spex={s} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
