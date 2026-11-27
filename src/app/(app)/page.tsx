import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { HomeSection } from "@/components/home-section";
import { SpexCard } from "@/components/wiki/spex-card";
import { WikiImage } from "@/components/wiki/wiki-image";
import { getStartPage } from "@/lib/wiki/wiki.server";
import { formatDay } from "@/utils/format";
import { SortControl } from "@/components/sort-control";
import { parseSort, type SortChoice, sortItems } from "@/utils/sorting";
import { Page } from "@bloomper/fgv-web-ui/shell/page-header";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const FIELDS = ["year", "title"] as const;
const DEFAULT: SortChoice<(typeof FIELDS)[number]> = { field: "year", dir: "asc" };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Meta");

  return {
    title: t("title"),
    description: t("description"),
    robots: { index: true, follow: true },
    openGraph: { title: t("title"), description: t("description"), type: "website", siteName: "Spexipedia" },
  };
}

/**
 * The start page: the welcome text, the spex of the year, this day in history and browsing by
 * category and decade. The visitor picks which way the decades run and whether the spex in them go by year or title.
 */
export default async function HomePage({ searchParams }: Props) {
  const [t, ts, data, locale, params] = await Promise.all([getTranslations("Home"), getTranslations("Sort"), getStartPage(), getLocale(), searchParams]);
  const start = data?.startPage;
  const featured = start?.spexOfTheYear;
  const sort = parseSort(params, FIELDS, DEFAULT);
  const decades = sortItems(start?.decades ?? [], sort.dir, decade => decade.decade).map(decade => ({
    ...decade,
    spex: sort.field === "year"
      ? sortItems(decade.spex, sort.dir, s => s.year, s => s.title)
      : sortItems(decade.spex, sort.dir, s => s.title, s => s.year),
  }));

  return (
    <Page variant="content" className="mx-auto w-full max-w-7xl gap-12">
      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="space-y-4">
          <p className="text-sm tracking-[0.3em] text-link uppercase">{t("kicker")}</p>
          <h1 className="wiki-heading text-5xl leading-none font-semibold md:text-6xl">Spexipedia</h1>
          <p className="max-w-2xl text-lg whitespace-pre-line text-pretty text-muted-foreground">{start?.welcome || t("intro")}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {(data?.spexCategories ?? []).map(category => (
              <Link key={category.id} href={`/categories/${category.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-link">
                {category.logo && <WikiImage image={category.logo} sizes="1.5rem" className="size-5 rounded-full object-contain" />}
                {category.name}
              </Link>
            ))}
          </div>
          {start && start.thisDay.length > 0 && (
            <HomeSection id="this-day" className="pt-6" title={t("thisDay")}>
              <ul className="space-y-2">
                {start.thisDay.map((entry, i) => {
                  const href = entry.spex ? `/spex/${entry.spex.slug}` : null;

                  return (
                    <li key={i} className="flex gap-4 text-sm">
                      <span className="w-36 shrink-0 text-link">{formatDay(entry.date, locale)}</span>
                      {href ? <Link href={href} className="hover:text-link">{entry.text}</Link> : <span>{entry.text}</span>}
                    </li>
                  );
                })}
              </ul>
            </HomeSection>
          )}
        </div>
        {featured && (
          <div className="w-56 space-y-2 lg:w-full">
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">{t("spexOfTheYear")}</p>
            <SpexCard spex={featured} introduction={featured.page?.introduction} />
          </div>
        )}
      </section>

      {decades.length > 0 && (
        <div className="-mb-6 flex justify-end">
          <SortControl path="/" params={params} current={sort} fallback={DEFAULT}
                       fields={[{ field: "year", label: ts("year") }, { field: "title", label: ts("title") }]} />
        </div>
      )}
      {decades.map(decade => (
        <HomeSection key={decade.decade} id={`decade-${decade.decade}`} title={t("decade", { decade: decade.decade })}
                     more={{ href: `/spex#decade-${decade.decade}`, label: t("allSpex") }}>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
            {decade.spex.map(spex => <SpexCard key={spex.id} spex={spex} />)}
          </div>
        </HomeSection>
      ))}
    </Page>
  );
}
