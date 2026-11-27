"use client";

import { useTranslations } from "next-intl";
import { ArchiveRestore, Trash } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { WikiImage, type WikiImageData } from "@/components/wiki/wiki-image";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@bloomper/fgv-web-ui/shell/dialogs";
import { emptyTrashAction, restoreArticleAction, restoreImageAction } from "@/app/(app)/manage/actions.server";
import { formatInstant } from "@/utils/format";

export function TrashView({ articles, images, admin }: {
  articles: { id: string; title: string; trashedAt?: string | null }[];
  images: (WikiImageData & { trashedAt?: string | null; originalFileName?: string | null })[];
  admin: boolean;
}) {
  const t = useTranslations("Trash");
  const { save, pending } = useSave();
  const { confirm } = useDialogs();

  if (articles.length === 0 && images.length === 0) {
    return <DataEmpty title={t("empty")} description={null} />;
  }
  return (
    <div className="space-y-8">
      {admin && (
        <Button variant="destructive" disabled={pending} onClick={async () => {
          if (await confirm({ title: t("emptyTitle"), description: t("emptyText"), confirmLabel: t("emptyTrash"), destructive: true })) {
            void save(() => emptyTrashAction(), { success: t("emptied") });
          }
        }}><Trash aria-hidden /> {t("emptyTrash")}</Button>
      )}
      {articles.length > 0 && (
        <section className="space-y-2">
          <h2 className="wiki-heading text-xl font-semibold">{t("articles")}</h2>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {articles.map(article => (
              <li key={article.id} className="flex items-center gap-3 px-3 py-2">
                <span className="font-medium">{article.title}</span>
                <span className="text-xs text-muted-foreground">{formatInstant(article.trashedAt)}</span>
                <Button size="sm" variant="ghost" className="ml-auto" disabled={pending} onClick={() => save(() => restoreArticleAction(article.id))}><ArchiveRestore aria-hidden /> {t("restore")}</Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {images.length > 0 && (
        <section className="space-y-2">
          <h2 className="wiki-heading text-xl font-semibold">{t("images")}</h2>
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map(image => (
              <li key={image.id} className="space-y-1 rounded-lg border border-border bg-card p-2 text-xs">
                <WikiImage image={image} sizes="16rem" className="aspect-[4/3] w-full rounded object-cover" />
                <p className="truncate">{image.originalFileName ?? image.alt}</p>
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => save(() => restoreImageAction(image.id))}><ArchiveRestore aria-hidden /> {t("restore")}</Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
