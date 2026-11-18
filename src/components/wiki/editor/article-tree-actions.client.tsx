"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, FolderTree, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDialogs } from "@/components/dialogs.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { moveArticleAction, reorderChildrenAction } from "@/app/(app)/articles/actions.server";

type Choice = { id: string; title: string; parent?: { id: string } | null };

/**
 * The ids of an article and everything below it, which it cannot be moved under.
 */
export function subtree(id: string, articles: Choice[]): Set<string> {
  const below = new Set([id]);
  let grew = true;

  while (grew) {
    grew = false;
    for (const article of articles) {
      if (article.parent && below.has(article.parent.id) && !below.has(article.id)) {
        below.add(article.id);
        grew = true;
      }
    }
  }
  return below;
}

/**
 * Moves an article under another article, or to the top of the tree; its children go with it and its address stays.
 */
export function MoveArticleButton({ id, parentId, articles }: { id: string; parentId: string | null; articles: Choice[] }) {
  const t = useTranslations("Articles");
  const { choose } = useDialogs();
  const { save, pending } = useSave();
  const excluded = subtree(id, articles);

  return (
    <Button variant="ghost" size="sm" disabled={pending} onClick={async () => {
      const chosen = await choose({
        title: t("moveTitle"),
        items: articles.filter(article => !excluded.has(article.id) && article.id !== parentId)
          .map(article => ({ id: article.id, label: article.title }))
          .sort((a, b) => a.label.localeCompare(b.label, "sv")),
        createLabel: parentId ? t("moveToTop") : undefined,
      });

      if (chosen !== null) {
        void save(() => moveArticleAction(id, chosen || null), { success: t("moved") });
      }
    }}>
      <FolderTree aria-hidden /> {t("move")}
    </Button>
  );
}

type Child = { id: string; slug: string; title: string; visibility: string; published: boolean };

/**
 * An article's children in their order, at the bottom of the article; authors move them up and down.
 */
export function ChildArticles({ parentId, items, reorder }: { parentId: string | null; items: Child[]; reorder: boolean }) {
  const t = useTranslations("Articles");
  const { save, pending } = useSave();

  const move = (from: number, to: number) => {
    const ids = items.map(child => child.id);
    const [moved] = ids.splice(from, 1);

    ids.splice(to, 0, moved);
    void save(() => reorderChildrenAction(parentId, ids), { success: false });
  };

  return (
    <ol className="divide-y divide-border rounded-lg border border-border bg-card">
      {items.map((child, index) => (
        <li key={child.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
          <Link href={`/articles/${child.slug}`} className="wiki-heading text-lg font-semibold hover:text-primary">{child.title}</Link>
          {child.visibility === "MEMBERS" && <Badge variant="secondary"><Lock aria-hidden /> {t("members")}</Badge>}
          {!child.published && <Badge variant="outline">{t("unpublished")}</Badge>}
          {reorder && (
            <span className="ml-auto inline-flex">
              <Button type="button" size="icon" variant="ghost" aria-label={t("moveUp", { title: child.title })} disabled={pending || index === 0} onClick={() => move(index, index - 1)}><ArrowUp /></Button>
              <Button type="button" size="icon" variant="ghost" aria-label={t("moveDown", { title: child.title })} disabled={pending || index === items.length - 1} onClick={() => move(index, index + 1)}><ArrowDown /></Button>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
