import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { History, Lock, Pencil } from "lucide-react";
import { getArticle } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata, publicMetadata } from "@/lib/wiki/metadata.server";
import { HtmlContent } from "@/components/wiki/html-content";
import { LoginPrompt } from "@/components/login-prompt.client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArticleActions } from "@/components/wiki/editor/article-actions.client";
import { formatInstant } from "@/utils/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(decodeURIComponent((await params).slug));

  return article && article.visibility === "PUBLIC" && article.published
    ? publicMetadata(article.title, article.body?.slice(0, 300))
    : privateMetadata(article?.title ?? "Spexipedia");
}

/**
 * An article. One the viewer may not see looks the same as one that does not exist: visitors are asked to log in
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
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {article.categories.map(category => (
            <Link key={category.id} href={`/articles/categories/${category.slug}`} className="text-xs tracking-[0.2em] text-primary uppercase hover:underline">{category.name}</Link>
          ))}
        </div>
        <h1 className="wiki-heading text-4xl font-semibold md:text-5xl">{article.title}</h1>
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
            {viewer.author && <ArticleActions id={article.id} published={article.published} />}
          </div>
        )}
      </header>
      {article.html ? <HtmlContent html={article.html} /> : <p className="text-sm text-muted-foreground">{t("textHidden")}</p>}
      {article.lastModifiedAt && (
        <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">{t("lastModified", { at: formatInstant(article.lastModifiedAt) ?? "" })}</p>
      )}
    </div>
  );
}
