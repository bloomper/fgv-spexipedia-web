import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getWantedArticles } from "@/lib/wiki/wiki.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { DataEmpty } from "@/components/data-empty";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("Articles"))("wanted"));
}

/**
 * Wanted articles (spec 4.5): titles articles link to that no article has, most linked first, each a link to write it.
 */
export default async function WantedArticlesPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const [t, wanted] = await Promise.all([getTranslations("Articles"), getWantedArticles()]);

    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("wanted")} description={t("wantedDescription")} />
        {wanted.length === 0 ? <DataEmpty title={t("noWanted")} /> : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {wanted.map(item => (
              <li key={item.title} className="flex flex-wrap items-center gap-2 px-4 py-2">
                <Link href={`/articles/new?title=${encodeURIComponent(item.title)}`} className="wiki-missing font-medium">{item.title}</Link>
                <span className="ml-auto text-xs text-muted-foreground">{t("linkCount", { count: item.links })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });
}
