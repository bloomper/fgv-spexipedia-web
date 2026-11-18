import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { PageHeader } from "@/components/page-header";
import { DiffView } from "@/components/wiki/diff-view";
import { RevisionActions } from "@/components/wiki/editor/revision-actions.client";
import { getArticleHistory, getRevision } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { formatInstant } from "@/utils/format";
import { cn } from "@/utils/utils";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ revision?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleHistory(decodeURIComponent((await params).slug));

  return privateMetadata((await getTranslations("Revisions"))("historyOf", { title: article?.title ?? "" }));
}

/**
 * An article's revisions, newest first. One chosen is compared with the one before it, and can be restored; an author
 * can hide a revision's text.
 */
export default async function ArticleHistoryPage({ params, searchParams }: Props) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const [{ slug }, { revision: chosenId }] = await Promise.all([params, searchParams]);
    const [t, article, viewer] = await Promise.all([getTranslations("Revisions"), getArticleHistory(decodeURIComponent(slug)), getViewer()]);

    if (!article) {
      notFound();
    }
    const chosen = article.history.find(revision => revision.id === chosenId) ?? article.history[0];
    const previous = chosen?.previousId ? await getRevision(chosen.previousId) : null;

    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("historyOf", { title: article.title })}
                    actions={<Link href={`/articles/${article.slug}`} className="text-sm text-primary hover:text-primary/80">{t("backToArticle")}</Link>} />
        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          <ol className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {article.history.map(revision => (
              <li key={revision.id}>
                <Link href={`?revision=${revision.id}`} aria-current={revision.id === chosen?.id ? "true" : undefined}
                      className={cn("block px-3 py-2 hover:bg-accent", revision.id === chosen?.id && "bg-accent")}>
                  <span className="block text-xs text-muted-foreground">{formatInstant(revision.createdAt)}</span>
                  {revision.authorName && <span className="block">{revision.authorName}</span>}
                  {revision.comment && <span className="block text-muted-foreground italic">{revision.comment}</span>}
                  {revision.hidden && <span className="block text-xs text-muted-foreground">{t("hidden")}</span>}
                </Link>
              </li>
            ))}
          </ol>
          {chosen && (
            <div className="min-w-0 space-y-3">
              <RevisionActions articleId={article.id} revisionId={chosen.id} hidden={chosen.hidden} latest={chosen.id === article.history[0]?.id} author={viewer.author} />
              {chosen.body == null
                ? <p className="text-sm text-muted-foreground">{t("hiddenText")}</p>
                : <DiffView before={previous?.body ?? ""} after={chosen.body} labels={{ removed: t("removed"), added: t("added") }} />}
            </div>
          )}
        </div>
      </div>
    );
  });
}
