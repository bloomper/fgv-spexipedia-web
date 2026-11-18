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
import { SortControl } from "@/components/sort-control";
import { ArticleCategoryDialog } from "@/components/wiki/editor/article-category-dialog.client";
import { parseSort, type SortChoice, sortItems } from "@/utils/sorting";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const FIELDS = ["title", "changed"] as const;
const DEFAULT: SortChoice<(typeof FIELDS)[number]> = { field: "title", dir: "asc" };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Articles");

  return publicMetadata(t("title"), t("description"));
}

/**
 * Every article the viewer may see, by title or last change as the visitor picks, or as the tree (spec 4.5), with the
 * top categories to browse by. Members write new ones, add categories and find the wanted and orphaned articles.
 */
export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const tree = params.view === "tree";
  const sort = parseSort(params, FIELDS, DEFAULT);
  const [t, ts, data, roots, viewer] = await Promise.all([
    getTranslations("Articles"), getTranslations("Sort"), getArticles(), tree ? getArticleTree() : Promise.resolve([]), getViewer(),
  ]);
  const articles = sort.field === "title"
    ? sortItems(data?.articles ?? [], sort.dir, a => a.title)
    : sortItems(data?.articles ?? [], sort.dir, a => a.lastModifiedAt, a => a.title);
  // Categories that belong to no other are the ways in; the rest are found on their parents' pages
  const categories = (data?.articleCategories ?? []).filter(category => category.parents.length === 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader title={t("title")} description={t("description")}
                  actions={viewer.member && (
                    <>
                      <ArticleCategoryDialog categories={data?.articleCategories ?? []} label={t("newCategory")} />
                      <Link href="/articles/new" className={buttonVariants()}><Plus aria-hidden /> {t("new")}</Link>
                    </>
                  )} />
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
        {!tree && (
          <SortControl path="/articles" params={params} current={sort} fallback={DEFAULT}
                       fields={[{ field: "title", label: ts("title") }, { field: "changed", label: ts("changed") }]} />
        )}
        {viewer.member && (
          <nav aria-label={t("lists")} className="flex gap-4 text-sm">
            <Link href="/articles/wanted" className="text-primary hover:text-primary/80">{t("wanted")}</Link>
            <Link href="/articles/orphans" className="text-primary hover:text-primary/80">{t("orphans")}</Link>
          </nav>
        )}
      </div>
      {tree
        ? roots.length > 0 ? <ArticleTree nodes={roots} /> : <DataEmpty title={t("empty")} />
        : <ArticleList articles={articles} ordered changed={sort.field === "changed"} />}
    </div>
  );
}
