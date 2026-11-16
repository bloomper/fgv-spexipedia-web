import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleCategory, getArticles } from "@/lib/wiki/wiki.server";
import { privateMetadata, publicMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { ArticleList } from "@/components/wiki/article-list";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getArticleCategory(decodeURIComponent((await params).slug));

  return category ? publicMetadata(category.name, category.description) : privateMetadata("Spexipedia");
}

/**
 * An article category and its articles.
 */
export default async function ArticleCategoryPage({ params }: Props) {
  const category = await getArticleCategory(decodeURIComponent((await params).slug));

  if (!category) {
    notFound();
  }
  const data = await getArticles(category.id);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader title={<span className="wiki-heading text-4xl">{category.name}</span>} description={category.description} />
      <ArticleList articles={data?.articles ?? []} />
    </div>
  );
}
