"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchSpexareAction } from "@/app/(app)/manage/actions.server";

/** A credit as the editor holds it: a spexare by id (with how to show them), or a name for someone outside FGV. */
export type CreditValue = { spexareId?: string | null; name?: string | null; label?: string | null };

export function toCreditValue(credit: { name?: string | null; person?: { id?: string | null; name?: string | null; nickname?: string | null } | null }): CreditValue {
  return credit.person?.id
    ? { spexareId: credit.person.id, label: [credit.person.name, credit.person.nickname && `”${credit.person.nickname}”`].filter(Boolean).join(" ") }
    : { name: credit.name ?? null };
}

export const toCreditInput = (credit: CreditValue) => credit.spexareId ? { spexareId: credit.spexareId } : { name: credit.name?.trim() || null };

/**
 * Credits picked from Spexregister by name (the server stores only the spexare's id), or typed as free text for people
 * outside FGV. `single` holds at most one, e.g. a conductor or who wore the vest.
 */
export function CreditPicker({ label, value, onChange, single = false }: {
  label: string;
  value: CreditValue[];
  onChange: (value: CreditValue[]) => void;
  single?: boolean;
}) {
  const t = useTranslations("Manage");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ id: string | null; label: string }[]>([]);
  const [pending, startTransition] = useTransition();

  const add = (credit: CreditValue) => {
    onChange(single ? [credit] : [...value, credit]);
    setQ("");
    setHits([]);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <ul className="flex flex-wrap gap-1.5">
        {value.map((credit, index) => (
          <li key={index} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs">
            {credit.spexareId && <UserRound className="size-3" aria-hidden />}
            {credit.label ?? credit.name ?? t("hiddenSpexare")}
            <button type="button" aria-label={t("remove")} onClick={() => onChange(value.filter((_, i) => i !== index))}><X className="size-3" /></button>
          </li>
        ))}
      </ul>
      {(!single || value.length === 0) && (
        <div className="relative">
          <div className="flex gap-2">
            <Input value={q} placeholder={t("creditSearch")} aria-label={`${label}: ${t("creditSearch")}`} onChange={event => {
              const next = event.target.value;

              setQ(next);
              if (next.trim().length >= 2) {
                startTransition(async () => {
                  const result = await searchSpexareAction(next);

                  setHits(result.ok ? result.data : []);
                });
              } else {
                setHits([]);
              }
            }} />
            <Button type="button" variant="outline" size="sm" disabled={!q.trim()} title={t("addFreeText")} onClick={() => add({ name: q.trim() })}>
              <Plus aria-hidden /> {t("freeText")}
            </Button>
          </div>
          {(hits.length > 0 || pending) && (
            <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
              {hits.filter(hit => hit.id).map(hit => (
                <li key={hit.id}>
                  <button type="button" className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent" onClick={() => add({ spexareId: hit.id, label: hit.label })}>{hit.label}</button>
                </li>
              ))}
              {pending && <li className="px-3 py-1.5 text-xs text-muted-foreground">{t("searching")}</li>}
            </ul>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{t("creditHelp")}</p>
        </div>
      )}
    </div>
  );
}
