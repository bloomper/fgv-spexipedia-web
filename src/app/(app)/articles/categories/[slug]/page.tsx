import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FolderOpen } from "lucide-react";
import { getArticleCategory, getArticles } from "@/lib/wiki/wiki.server";
import { privateMetadata, publicMetadata } from "@/lib/wiki/metadata.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
import { ArticleList } from "@/components/wiki/article-list";
import { LinkSegments } from "@/components/link-tabs";
import { ArticleCategoryDialog } from "@/components/wiki/editor/article-category-dialog.client";
import { getViewer } from "@/lib/wiki/viewer.server";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ all?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getArticleCategory(decodeURIComponent((await params).slug));

  return category ? publicMetadata(category.name, category.description) : privateMetadata("Spexipedia");
}

/**
 * An article category (spec 4.5): the categories it belongs to, its subcategories, and its articles, or with `?all=1`
 * also the articles of the categories below it. Members add subcategories; authors change the category and its parents.
 */
export default async function ArticleCategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { all }, t, viewer] = await Promise.all([params, searchParams, getTranslations("Articles"), getViewer()]);
  const category = await getArticleCategory(decodeURIComponent(slug));

  if (!category) {
    notFound();
  }
  const withSubcategories = all === "1" && category.subcategories.length > 0;
  const data = await getArticles(category.id, withSubcategories);
  const href = `/articles/categories/${category.slug}`;
  const categories = data?.articleCategories ?? [];

  return (
    <Page variant="content" className="mx-auto w-full max-w-7xl">
      <PageHeader title={category.name} description={category.description} actions={viewer.member && (
        <>
          <ArticleCategoryDialog categories={categories} parentId={category.id} label={t("newSubcategory")} />
          {viewer.author && <ArticleCategoryDialog category={category} categories={categories} label={t("editCategory")} />}
        </>
      )} />
      {category.parents.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {t("inCategories")}{" "}
          {category.parents.map((parent, index) => (
            <span key={parent.id}>{index > 0 && ", "}<Link href={`/articles/categories/${parent.slug}`} className="text-link hover:text-link/80">{parent.name}</Link></span>
          ))}
        </p>
      )}
      {category.subcategories.length > 0 && (
        <section aria-labelledby="subcategories-heading" className="space-y-2">
          <h2 id="subcategories-heading" className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase">{t("subcategories")}</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.subcategories.map(sub => (
              <li key={sub.id}>
                <Link href={`/articles/categories/${sub.slug}`} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:border-primary hover:text-link">
                  <FolderOpen className="size-4 shrink-0" aria-hidden /> <span className="min-w-0 truncate">{sub.name}</span>
                  <span className="ml-auto text-muted-foreground">{sub.articleCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section aria-labelledby="articles-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="articles-heading" className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase">{t("title")}</h2>
          {category.subcategories.length > 0 && (
            <LinkSegments label={t("whichArticles")} items={[
              { href, label: t("onlyHere"), active: !withSubcategories },
              { href: `${href}?all=1`, label: t("withSubcategories"), active: withSubcategories },
            ]} />
          )}
        </div>
        <ArticleList articles={data?.articles ?? []} />
      </section>
    </Page>
  );
}
