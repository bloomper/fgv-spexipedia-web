import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { PageHeader } from "@/components/page-header";
import { ArticleForm } from "@/components/wiki/editor/article-form.client";
import { getArticle, getArticles } from "@/lib/wiki/wiki.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(decodeURIComponent((await params).slug));

  return privateMetadata((await getTranslations("ArticleForm"))("editTitle", { title: article?.title ?? "" }));
}

/**
 * Editing an article, by any member: every save is a revision.
 */
export default async function EditArticlePage({ params }: Props) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const { slug } = await params;
    const [t, article, data] = await Promise.all([getTranslations("ArticleForm"), getArticle(decodeURIComponent(slug)), getArticles()]);

    if (!article) {
      notFound();
    }
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("editTitle", { title: article.title })} />
        <ArticleForm id={article.id} revisionId={article.revision?.id ?? null} categories={data?.articleCategories ?? []}
                     initial={{ title: article.title, body: article.body ?? "", visibility: article.visibility, categoryIds: article.categories.map(c => c.id) }} />
      </div>
    );
  });
}
