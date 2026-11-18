"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CreditResolver } from "@/components/wiki/editor/credit-picker.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { DataEmpty } from "@/components/data-empty";
import { resolveCreditAction } from "@/app/(app)/manage/actions.server";
import type { UnresolvedCreditsData } from "@/lib/wiki/edit.server";
import { groupBy } from "@/utils/wiki";

/**
 * Credits that an import brought as names nobody has resolved (spec 5.3), by spex: an editor picks the spexare each
 * means, or marks it as someone outside FGV. Until then the name is shown to editors only.
 */
export function UnresolvedCredits({ data }: { data: UnresolvedCreditsData }) {
  const t = useTranslations("UnresolvedCredits");
  const { save, pending } = useSave();

  if (data.credits.length === 0) {
    return <DataEmpty title={t("empty")} />;
  }
  return (
    <div className="space-y-6">
      {data.total > data.credits.length && <p className="text-sm text-muted-foreground">{t("showing", { shown: data.credits.length, total: data.total })}</p>}
      {groupBy(data.credits, credit => credit.number.spex.id).map(([spexId, credits]) => (
        <section key={spexId} className="space-y-2">
          <h2 className="wiki-heading text-xl font-semibold">
            <Link href={`/manage/spex/${spexId}#edit-numbers`} className="hover:text-primary">{credits[0].number.spex.title} ({credits[0].number.spex.year})</Link>
          </h2>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {credits.map(credit => (
              <li key={`${credit.number.id}-${credit.kind?.id}-${credit.position}`} className="flex flex-wrap items-center gap-2 px-3 py-2">
                <Link href={`/manage/spex/${spexId}#number-${credit.number.id}`} className="font-medium hover:text-primary">{credit.number.title}</Link>
                {credit.kind && <span className="text-muted-foreground">· {credit.kind.name}</span>}
                <span className="font-semibold">”{credit.name}”</span>
                <span className="ml-auto">
                  {credit.kind && (
                    <CreditResolver name={credit.name} disabled={pending}
                                    onResolve={value => save(() => resolveCreditAction(credit.number.id, credit.kind!.id, credit.position, value), { success: t("resolved") })} />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
