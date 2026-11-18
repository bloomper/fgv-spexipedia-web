import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getArticles, getArticleTree } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { publicMetadata } from "@/lib/wiki/metadata.server";
import { ArticleList } from "@/components/wiki/article-list";
import { ArticleTree } from "@/components/wiki/article-tree";
import { LinkSegments } from "@/components/link-tabs";
import { DataEmpty } from "@/components/data-empty";

type Props = { searchParams: Promise<{ view?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Articles");

  return publicMetadata(t("title"), t("description"));
}

/**
 * Every article the viewer may see, A–Ö or as the tree (spec 4.5), with the top categories to browse by. Members write
 * new ones and find the wanted and orphaned articles.
 */
export default async function ArticlesPage({ searchParams }: Props) {
  const tree = (await searchParams).view === "tree";
  const [t, data, roots, viewer] = await Promise.all([
    getTranslations("Articles"), getArticles(), tree ? getArticleTree() : Promise.resolve([]), getViewer(),
  ]);
  // Categories that belong to no other are the ways in; the rest are found on their parents' pages
  const categories = (data?.articleCategories ?? []).filter(category => category.parents.length === 0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader title={<span className="wiki-heading text-4xl">{t("title")}</span>} description={t("description")}
                  actions={viewer.member && <Link href="/articles/new" className={buttonVariants()}><Plus aria-hidden /> {t("new")}</Link>} />
      {categories.length > 0 && (
        <nav aria-label={t("categories")} className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Link key={category.id} href={`/articles/categories/${category.slug}`} className="rounded-full border border-border px-3 py-1 text-sm hover:border-primary hover:text-primary">
              {category.name} <span className="text-muted-foreground">({category.articleCount})</span>
            </Link>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <LinkSegments label={t("view")} items={[
          { href: "/articles", label: t("alphabetical"), active: !tree },
          { href: "/articles?view=tree", label: t("treeView"), active: tree },
        ]} />
        {viewer.member && (
          <nav aria-label={t("lists")} className="flex gap-4 text-sm">
            <Link href="/articles/wanted" className="text-primary hover:underline">{t("wanted")}</Link>
            <Link href="/articles/orphans" className="text-primary hover:underline">{t("orphans")}</Link>
          </nav>
        )}
      </div>
      {tree
        ? roots.length > 0 ? <div className="rounded-lg border border-border bg-card p-4"><ArticleTree nodes={roots} /></div> : <DataEmpty title={t("empty")} />
        : <ArticleList articles={data?.articles ?? []} />}
    </div>
  );
}
