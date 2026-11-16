import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { HomeSection } from "@/components/home-section";
import { SpexCard } from "@/components/wiki/spex-card";
import { WikiImage } from "@/components/wiki/wiki-image";
import { RevisionList } from "@/components/wiki/revision-list";
import { getStartPage } from "@/lib/wiki/wiki.server";
import { formatDay } from "@/utils/format";

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
 * The start page: the welcome text, the spex of the year, this day in history, recent changes and browsing by
 * category and decade.
 */
export default async function HomePage() {
  const [t, data, locale] = await Promise.all([getTranslations("Home"), getStartPage(), getLocale()]);
  const start = data?.startPage;
  const featured = start?.spexOfTheYear;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-4 py-6 md:px-8">
      <section className="grid items-start gap-8 lg:grid-cols-[1fr_14rem]">
        <div className="space-y-4">
          <p className="text-sm tracking-[0.3em] text-primary uppercase">{t("kicker")}</p>
          <h1 className="wiki-heading text-5xl leading-none font-semibold md:text-6xl">Spexipedia</h1>
          <p className="max-w-2xl text-lg whitespace-pre-line text-pretty text-muted-foreground">{start?.welcome || t("intro")}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {(data?.spexCategories ?? []).map(category => (
              <Link key={category.id} href={`/categories/${category.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary">
                {category.logo && <WikiImage image={category.logo} sizes="1.5rem" className="size-5 rounded-full object-contain" />}
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        {featured && (
          <div className="w-56 space-y-2 lg:w-full">
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">{t("spexOfTheYear")}</p>
            <SpexCard spex={featured} introduction={featured.page?.introduction} />
          </div>
        )}
      </section>

      {start && start.thisDay.length > 0 && (
        <HomeSection id="this-day" title={t("thisDay")}>
          <ul className="space-y-2">
            {start.thisDay.map((entry, i) => {
              const href = entry.spex ? `/spex/${entry.spex.slug}` : entry.recording ? `/recordings/${entry.recording.slug}` : null;

              return (
                <li key={i} className="flex gap-4 text-sm">
                  <span className="w-36 shrink-0 text-primary">{formatDay(entry.date, locale)}</span>
                  {href ? <Link href={href} className="hover:underline">{entry.text}</Link> : <span>{entry.text}</span>}
                </li>
              );
            })}
          </ul>
        </HomeSection>
      )}

      {start && start.decades.map(decade => (
        <HomeSection key={decade.decade} id={`decade-${decade.decade}`} title={t("decade", { decade: decade.decade })}
                     more={{ href: `/spex#decade-${decade.decade}`, label: t("allSpex") }}>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
            {decade.spex.map(spex => <SpexCard key={spex.id} spex={spex} />)}
          </div>
        </HomeSection>
      ))}

      {start && start.recentChanges.length > 0 && (
        <HomeSection id="recent" title={t("recentChanges")} more={{ href: "/recent-changes", label: t("allChanges") }}>
          <RevisionList revisions={start.recentChanges.slice(0, 10)} />
        </HomeSection>
      )}
    </div>
  );
}
