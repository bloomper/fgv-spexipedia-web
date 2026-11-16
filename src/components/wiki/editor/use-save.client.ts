"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/graphql.server";

/**
 * Runs an editing action: a toast with the outcome (the server's message when it refuses), and the page rendered
 * again so that it shows what was saved.
 */
export function useSave() {
  const t = useTranslations("Manage");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const save = <T, >(action: () => Promise<ActionResult<T>>, options: { success?: string | false; then?: (data: T) => void } = {}) =>
    new Promise<boolean>(resolve => startTransition(async () => {
      try {
        const result = await action();

        if (result.ok) {
          if (options.success !== false) {
            toast.success(options.success ?? t("saved"));
          }
          options.then?.(result.data);
          router.refresh();
          resolve(true);
        } else {
          toast.error(result.message);
          resolve(false);
        }
      } catch {
        toast.error(t("failed"));
        resolve(false);
      }
    }));

  return { save, pending };
}
