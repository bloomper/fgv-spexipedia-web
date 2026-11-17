import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { PageHeader } from "@/components/page-header";
import { ArticleForm } from "@/components/wiki/editor/article-form.client";
import { getArticle, getArticles } from "@/lib/wiki/wiki.server";
import { ID } from "@/utils/ids";
import { privateMetadata } from "@/lib/wiki/metadata.server";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("ArticleForm"))("newTitle"));
}

/**
 * A new article, by any member, at the top of the tree or under a parent (`?parent=`); a red link gives the title
 * (`?title=`). It starts unpublished; an author publishes it.
 */
export default async function NewArticlePage({ searchParams }: { searchParams: Promise<{ title?: string; parent?: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const [t, data, { title, parent: parentId }] = await Promise.all([getTranslations("ArticleForm"), getArticles(), searchParams]);
    const parent = parentId && ID.test(parentId) ? await getArticle(parentId) : null;

    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("newTitle")} description={parent ? t("newChildDescription", { parent: parent.title }) : t("newDescription")} />
        <ArticleForm id={null} revisionId={null} categories={data?.articleCategories ?? []} parentId={parent?.id ?? null}
                     initial={{ title: title?.slice(0, 255) ?? "", body: "", visibility: "PUBLIC", categoryIds: [] }} />
      </div>
    );
  });
}
