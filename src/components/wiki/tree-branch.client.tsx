"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@bloomper/fgv-web-ui/ui/collapsible";

/**
 * A node of the article tree with children: a chevron in front of its row folds them away and back.
 */
export function TreeBranch({ title, row, children }: { title: string; row: ReactNode; children: ReactNode }) {
  const t = useTranslations("Articles");

  return (
    <Collapsible defaultOpen>
      <div className="flex min-h-8 items-center gap-1.5">
        <CollapsibleTrigger
          aria-label={t("toggleBranch", { title })}
          className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring grid size-5 shrink-0 place-items-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none [&[data-panel-open]>svg]:rotate-90"
        >
          <ChevronRight
            className="size-4 transition-transform"
            aria-hidden
          />
        </CollapsibleTrigger>
        {row}
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
