import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getOrphanArticles } from "@/lib/wiki/wiki.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
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
      <Page variant="content" className="mx-auto w-full max-w-7xl">
        <PageHeader title={t("orphans")} description={t("orphansDescription")} />
        <ArticleList articles={orphans} />
      </Page>
    );
  });
}
