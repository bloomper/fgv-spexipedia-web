"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * A node of the article tree with children: a chevron in front of its row folds them away and back.
 */
export function TreeBranch({ title, row, children }: { title: string; row: ReactNode; children: ReactNode }) {
  const t = useTranslations("Articles");

  return (
    <Collapsible defaultOpen>
      <div className="flex min-h-8 items-center gap-1.5">
        <CollapsibleTrigger aria-label={t("toggleBranch", { title })}
                            className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&[data-panel-open]>svg]:rotate-90">
          <ChevronRight className="size-4 transition-transform" aria-hidden />
        </CollapsibleTrigger>
        {row}
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
