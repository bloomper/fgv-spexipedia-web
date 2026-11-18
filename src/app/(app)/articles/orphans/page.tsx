import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getOrphanArticles } from "@/lib/wiki/wiki.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { ArticleList } from "@/components/wiki/article-list";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("Articles"))("orphans"));
}

/**
 * Orphaned articles (spec 4.5): nothing links to them, and they have no parent, children or category.
 */
export default async function OrphanArticlesPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const [t, orphans] = await Promise.all([getTranslations("Articles"), getOrphanArticles()]);

    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("orphans")} description={t("orphansDescription")} />
        <ArticleList articles={orphans} />
      </div>
    );
  });
}
