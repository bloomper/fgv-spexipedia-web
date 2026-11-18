import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FilePlus, History, Lock, Pencil } from "lucide-react";
import { getArticle, getArticles } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata, publicMetadata } from "@/lib/wiki/metadata.server";
import { HtmlContent } from "@/components/wiki/html-content";
import { LoginPrompt } from "@/components/login-prompt.client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArticleActions } from "@/components/wiki/editor/article-actions.client";
import { ChildArticles, MoveArticleButton } from "@/components/wiki/editor/article-tree-actions.client";
import { Breadcrumbs, TableOfContents, TreeAround } from "@/components/wiki/article-tree";
import { formatInstant } from "@/utils/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(decodeURIComponent((await params).slug));

  return article && article.visibility === "PUBLIC" && article.published
    ? publicMetadata(article.title, article.body?.slice(0, 300))
    : privateMetadata(article?.title ?? "Spexipedia");
}

/**
 * An article, with its place in the tree (breadcrumbs, the articles around it, its children), its table of contents,
 * and what links here. One the viewer may not see looks the same as one that does not exist: visitors are asked to log in
 * (it may be for members), members get not found.
 */
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, viewer, t] = await Promise.all([getArticle(decodeURIComponent(slug)), getViewer(), getTranslations("Articles")]);

  if (!article) {
    if (!viewer.member) {
      return <LoginPrompt noAccess={viewer.loggedIn} />;
    }
    notFound();
  }
  if (article.slug !== decodeURIComponent(slug)) {
    permanentRedirect(`/articles/${article.slug}`);
  }
  const choices = viewer.author ? (await getArticles())?.articles ?? [] : [];
  const rail = (
    <>
      <TableOfContents toc={article.toc} />
      <TreeAround current={article.id} parent={article.parent} siblings={article.siblings} items={article.children} />
    </>
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-10 px-4 py-6 md:px-8">
      <article className="min-w-0 flex-1 space-y-6">
        <header className="space-y-3">
          {article.ancestors.length > 0 && <Breadcrumbs ancestors={article.ancestors} title={article.title} />}
          <div className="flex flex-wrap gap-2">
            {article.categories.map(category => (
              <Link key={category.id} href={`/articles/categories/${category.slug}`} className="text-xs tracking-[0.2em] text-primary uppercase hover:text-primary/80">{category.name}</Link>
            ))}
          </div>
          <h1 className="wiki-heading text-3xl font-semibold md:text-4xl">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {article.visibility === "MEMBERS" && <Badge variant="secondary"><Lock aria-hidden /> {t("members")}</Badge>}
            {!article.published && <Badge variant="outline">{t("unpublished")}</Badge>}
            {article.trashedAt && <Badge variant="destructive">{t("trashed")}</Badge>}
            {article.editingBy.length > 0 && <span className="text-xs text-muted-foreground">{t("editingBy", { names: article.editingBy.join(", ") })}</span>}
          </div>
          {viewer.member && (
            <div className="flex flex-wrap gap-2">
              <Link href={`/articles/${article.slug}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}><Pencil aria-hidden /> {t("edit")}</Link>
              <Link href={`/articles/${article.slug}/history`} className={buttonVariants({ variant: "ghost", size: "sm" })}><History aria-hidden /> {t("history")}</Link>
              <Link href={`/articles/new?parent=${article.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}><FilePlus aria-hidden /> {t("newChild")}</Link>
              {viewer.author && <MoveArticleButton id={article.id} parentId={article.parent?.id ?? null} articles={choices} />}
              {viewer.author && <ArticleActions id={article.id} published={article.published} childCount={article.children.length} />}
            </div>
          )}
        </header>
        {article.toc.length > 0 && (
          <details className="rounded-lg border border-border p-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium">{t("contents")}</summary>
            <div className="mt-3"><TableOfContents toc={article.toc} /></div>
          </details>
        )}
        {article.html ? <HtmlContent html={article.html} /> : <p className="text-sm text-muted-foreground">{t("textHidden")}</p>}
        {article.children.length > 0 && (
          <section aria-labelledby="children-heading" className="space-y-3">
            <h2 id="children-heading" className="wiki-heading text-xl font-semibold">{t("children")}</h2>
            <ChildArticles parentId={article.id} items={article.children} reorder={viewer.author && article.children.length > 1} />
          </section>
        )}
        <section aria-labelledby="backlinks-heading" className="space-y-2 border-t border-border/60 pt-4">
          <h2 id="backlinks-heading" className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase">{t("backlinks")}</h2>
          {article.backlinks.length > 0 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {article.backlinks.map(link => <li key={link.id}><Link href={`/articles/${link.slug}`} className="text-primary hover:text-primary/80">{link.title}</Link></li>)}
            </ul>
          ) : <p className="text-sm text-muted-foreground">{t("noBacklinks")}</p>}
        </section>
        {article.lastModifiedAt && (
          <p className="text-xs text-muted-foreground">{t("lastModified", { at: formatInstant(article.lastModifiedAt) ?? "" })}</p>
        )}
      </article>
      <aside className="w-60 shrink-0 max-lg:hidden">
        <div className="sticky top-20 space-y-6">{rail}</div>
      </aside>
    </div>
  );
}
