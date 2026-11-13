"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/dialogs.client";
import { setPublishedAction, trashArticleAction } from "@/app/(app)/articles/actions.server";

/**
 * An author's buttons on an article: publish or unpublish, and move it to the trash.
 */
export function ArticleActions({ id, published }: { id: string; published: boolean }) {
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
        if (!await confirm({ title: t("trashTitle"), description: t("trashText"), confirmLabel: t("trash"), destructive: true })) {
          return;
        }
        startTransition(async () => {
          const result = await trashArticleAction(id);

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
