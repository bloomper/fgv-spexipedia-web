"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { useDialogs } from "@bloomper/fgv-web-ui/shell/dialogs";
import { setPublishedAction, trashArticleAction } from "@/app/(app)/articles/actions.server";

/**
 * An author's buttons on an article: publish or unpublish, and move it to the trash (with its children, if it has any,
 * which the author is told).
 */
export function ArticleActions({ id, published, childCount = 0 }: { id: string; published: boolean; childCount?: number }) {
  const t = useTranslations("Articles");
  const router = useRouter();
  const { confirm } = useDialogs();
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => startTransition(async () => {
        const result = await setPublishedAction(id, !published);

        if (result.ok) {
          toast.success(published ? t("unpublishedToast") : t("publishedToast"));
          router.refresh();
        } else {
          toast.error(result.message);
        }
      })}>
        {published ? <EyeOff aria-hidden /> : <Eye aria-hidden />} {published ? t("unpublish") : t("publish")}
      </Button>
      <Button variant="ghost" size="sm" disabled={pending} onClick={async () => {
        const description = childCount > 0 ? `${t("trashText")} ${t("trashChildren", { count: childCount })}` : t("trashText");

        if (!await confirm({ title: t("trashTitle"), description, confirmLabel: t("trash"), destructive: true })) {
          return;
        }
        startTransition(async () => {
          const result = await trashArticleAction(id, childCount > 0);

          if (result.ok) {
            toast.success(t("trashedToast"));
            router.push("/articles");
          } else {
            toast.error(result.message);
          }
        });
      }}>
        <Trash2 aria-hidden /> {t("trash")}
      </Button>
    </>
  );
}
