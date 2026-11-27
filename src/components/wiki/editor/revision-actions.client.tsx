"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { EyeOff, Eye, RotateCcw } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { useDialogs } from "@bloomper/fgv-web-ui/shell/dialogs";
import { restoreRevisionAction, setRevisionHiddenAction } from "@/app/(app)/articles/actions.server";

/**
 * Restoring a revision (as a new one), and for authors hiding its text, e.g. one that named someone in a public article.
 */
export function RevisionActions({ articleId, revisionId, hidden, latest, author }: {
  articleId: string;
  revisionId: string;
  hidden: boolean;
  latest: boolean;
  author: boolean;
}) {
  const t = useTranslations("Revisions");
  const router = useRouter();
  const { confirm } = useDialogs();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {!latest && (
        <Button variant="outline" size="sm" disabled={pending} onClick={async () => {
          if (!await confirm({ title: t("restoreTitle"), description: t("restoreText"), confirmLabel: t("restore") })) {
            return;
          }
          startTransition(async () => {
            const result = await restoreRevisionAction(articleId, revisionId);

            if (result.ok) {
              toast.success(t("restored"));
              router.push(`/articles/${result.data.slug}`);
            } else {
              toast.error(result.message);
            }
          });
        }}><RotateCcw aria-hidden /> {t("restore")}</Button>
      )}
      {author && (
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(async () => {
          const result = await setRevisionHiddenAction(revisionId, !hidden);

          if (result.ok) {
            router.refresh();
          } else {
            toast.error(result.message);
          }
        })}>{hidden ? <Eye aria-hidden /> : <EyeOff aria-hidden />} {hidden ? t("unhide") : t("hide")}</Button>
      )}
    </div>
  );
}
