"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CircleHelp, Plus, UserRound, UserRoundCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchSpexareAction } from "@/app/(app)/manage/actions.server";
import type { CreditInput } from "@/gql/graphql";

/**
 * A credit as the editor holds it: a spexare by id (with how to show them), or a name for someone outside FGV. An
 * imported name nobody has resolved yet (spec 5.3) is `unresolved`: kept as it is until an editor resolves it.
 */
export type CreditValue = { spexareId?: string | null; name?: string | null; label?: string | null; unresolved?: boolean };

type CreditData = {
  name?: string | null;
  unresolved?: boolean | null;
  person?: { id?: string | null; name?: string | null; nickname?: string | null } | null;
};

export function toCreditValue(credit: CreditData): CreditValue {
  if (credit.unresolved) {
    return { name: credit.name ?? null, unresolved: true };
  }
  return credit.person?.id
    ? { spexareId: credit.person.id, label: [credit.person.name, credit.person.nickname && `”${credit.person.nickname}”`].filter(Boolean).join(" ") }
    : { name: credit.name ?? null };
}

export const toCreditInput = (credit: CreditValue): CreditInput => credit.spexareId ? { spexareId: credit.spexareId } : { name: credit.name?.trim() || null };

type Hit = { id: string | null; label: string };

/** Spexare matching what is typed, from Spexregister. */
function useSpexareSearch() {
  const [hits, setHits] = useState<Hit[]>([]);
  const [pending, startTransition] = useTransition();

  const search = (q: string) => {
    if (q.trim().length >= 2) {
      startTransition(async () => {
        const result = await searchSpexareAction(q);

        setHits(result.ok ? result.data : []);
      });
    } else {
      setHits([]);
    }
  };

  return { hits, pending, search, clear: () => setHits([]) };
}

function Hits({ hits, pending, onPick }: { hits: Hit[]; pending: boolean; onPick: (hit: Hit & { id: string }) => void }) {
  const t = useTranslations("Manage");

  if (hits.length === 0 && !pending) {
    return null;
  }
  return (
    <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
      {hits.filter((hit): hit is Hit & { id: string } => !!hit.id).map(hit => (
        <li key={hit.id}>
          <button type="button" className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent" onClick={() => onPick(hit)}>{hit.label}</button>
        </li>
      ))}
      {pending && <li className="px-3 py-1.5 text-xs text-muted-foreground">{t("searching")}</li>}
    </ul>
  );
}

/**
 * Credits picked from Spexregister by name (the server stores only the spexare's id), or typed as free text for people
 * outside FGV. `single` holds at most one, e.g. a conductor or who wore the vest. Unresolved credits are shown as such
 * and kept; they are resolved one by one with `CreditResolver`.
 */
export function CreditPicker({ label, value, onChange, single = false }: {
  label: string;
  value: CreditValue[];
  onChange: (value: CreditValue[]) => void;
  single?: boolean;
}) {
  const t = useTranslations("Manage");
  const [q, setQ] = useState("");
  const { hits, pending, search, clear } = useSpexareSearch();

  const add = (credit: CreditValue) => {
    onChange(single ? [credit] : [...value, credit]);
    setQ("");
    clear();
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <ul className="flex flex-wrap gap-1.5">
        {value.map((credit, index) => (
          <li key={index} title={credit.unresolved ? t("unresolvedHelp") : undefined}
              className={credit.unresolved
                ? "inline-flex items-center gap-1 rounded-full border border-dashed border-amber-500/70 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400"
                : "inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"}>
            {credit.spexareId && <UserRound className="size-3" aria-hidden />}
            {credit.unresolved && <CircleHelp className="size-3" aria-hidden />}
            {credit.label ?? credit.name ?? t("hiddenSpexare")}
            {credit.unresolved && <span className="sr-only">({t("unresolved")})</span>}
            <button type="button" aria-label={t("remove")} onClick={() => onChange(value.filter((_, i) => i !== index))}><X className="size-3" /></button>
          </li>
        ))}
      </ul>
      {(!single || value.length === 0) && (
        <div className="relative">
          <div className="flex gap-2">
            <Input value={q} placeholder={t("creditSearch")} aria-label={`${label}: ${t("creditSearch")}`} onChange={event => {
              setQ(event.target.value);
              search(event.target.value);
            }} />
            <Button type="button" variant="outline" size="sm" disabled={!q.trim()} title={t("addFreeText")} onClick={() => add({ name: q.trim() })}>
              <Plus aria-hidden /> {t("freeText")}
            </Button>
          </div>
          <Hits hits={hits} pending={pending} onPick={hit => add({ spexareId: hit.id, label: hit.label })} />
          <p className="mt-1 text-xs text-muted-foreground">{t("creditHelp")}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Resolves one imported name (spec 5.3): pick the spexare it means from Spexregister, or mark it as someone outside
 * FGV, keeping the name. The search starts with the imported name.
 */
export function CreditResolver({ name, onResolve, disabled }: {
  name: string;
  onResolve: (credit: CreditInput) => Promise<boolean>;
  disabled?: boolean;
}) {
  const t = useTranslations("Manage");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(name);
  const { hits, pending, search, clear } = useSpexareSearch();

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => {
        setOpen(true);
        search(name);
      }}><UserRoundCheck aria-hidden /> {t("resolve")}</Button>
    );
  }
  return (
    <div className="relative w-full max-w-md space-y-2">
      <div className="flex gap-2">
        <Input value={q} autoFocus aria-label={t("resolveSearch", { name })} placeholder={t("creditSearch")} onChange={event => {
          setQ(event.target.value);
          search(event.target.value);
        }} />
        <Button type="button" size="sm" variant="ghost" aria-label={t("cancel")} onClick={() => {
          setOpen(false);
          clear();
        }}><X /></Button>
      </div>
      <Hits hits={hits} pending={pending} onPick={async hit => {
        if (await onResolve({ spexareId: hit.id })) {
          setOpen(false);
          clear();
        }
      }} />
      <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={async () => {
        if (await onResolve({ name })) {
          setOpen(false);
        }
      }}>{t("outsideFgv", { name })}</Button>
    </div>
  );
}
