"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Archive, ArchiveRestore, Merge, Pencil, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@/components/dialogs.client";
import { mergeKindAction, reorderKindsAction, retireKindAction, saveKindAction } from "@/app/(app)/admin/actions.server";
import type { FactValueType, KindType, KindUse } from "@/gql/graphql";
import { factValueTypes } from "@/utils/kinds";

export type KindRow = {
  id: string;
  nameSv: string;
  nameEn: string;
  aliases: string[];
  position: number;
  retired: boolean;
  valueType?: FactValueType | null;
};

/**
 * The kinds of one type (and, for image kinds, one use), as admins keep them (spec 4.6): Swedish and English names,
 * the aliases the import recognises, their order (the first in use is the default), retired or in use, and merging one
 * into another. A kind in use is never deleted; merging moves what refers to it and keeps its names as aliases.
 */
export function KindsEditor({ type, use, kinds }: { type: KindType; use: KindUse | null; kinds: KindRow[] }) {
  const t = useTranslations("AdminKinds");
  const { save, pending } = useSave();
  const { confirm, choose } = useDialogs();
  const [editing, setEditing] = useState<string | null>(null);
  const label = (kind: KindRow) => kind.nameSv === kind.nameEn ? kind.nameSv : `${kind.nameSv} / ${kind.nameEn}`;

  const move = (from: number, to: number) => {
    const ids = kinds.map(kind => kind.id);
    const [id] = ids.splice(from, 1);

    ids.splice(to, 0, id);
    void save(() => reorderKindsAction(type, use, ids), { success: false });
  };

  return (
    <div className="space-y-3">
      <Button type="button" size="sm" variant="outline" onClick={() => setEditing("new")}><Plus aria-hidden /> {t("add")}</Button>
      {editing === "new" && <KindForm type={type} use={use} onDone={() => setEditing(null)} />}
      {kinds.length === 0 && <p className="text-sm text-muted-foreground">{t("none")}</p>}
      <ol className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
        {kinds.map((kind, index) => (
          <li key={kind.id} className="space-y-2 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-6 text-muted-foreground">{index + 1}</span>
              <span className={kind.retired ? "font-medium text-muted-foreground line-through" : "font-medium"}>{label(kind)}</span>
              {type === "FACT" && kind.valueType && <Badge variant="secondary">{t(`valueTypes.${kind.valueType}`)}</Badge>}
              {kind.retired && <Badge variant="outline">{t("retired")}</Badge>}
              {kind.aliases.length > 0 && (
                <span className="min-w-0 truncate text-xs text-muted-foreground" title={kind.aliases.join("\n")}>
                  {t("aliasesShort", { aliases: kind.aliases.join(", ") })}
                </span>
              )}
              <span className="ml-auto inline-flex">
                <Button type="button" size="icon" variant="ghost" aria-label={t("moveUp")} disabled={pending || index === 0} onClick={() => move(index, index - 1)}><ArrowUp /></Button>
                <Button type="button" size="icon" variant="ghost" aria-label={t("moveDown")} disabled={pending || index === kinds.length - 1} onClick={() => move(index, index + 1)}><ArrowDown /></Button>
                <Button type="button" size="icon" variant="ghost" aria-label={t("edit")} onClick={() => setEditing(editing === kind.id ? null : kind.id)}><Pencil /></Button>
                <Button type="button" size="icon" variant="ghost" aria-label={kind.retired ? t("reinstate") : t("retire")} title={kind.retired ? t("reinstate") : t("retire")} disabled={pending}
                        onClick={() => save(() => retireKindAction(kind.id, !kind.retired), { success: kind.retired ? t("reinstated") : t("retiredToast") })}>
                  {kind.retired ? <ArchiveRestore /> : <Archive />}
                </Button>
                <Button type="button" size="icon" variant="ghost" aria-label={t("merge")} title={t("merge")} disabled={pending || kinds.length < 2} onClick={async () => {
                  const intoId = await choose({ title: t("mergeTitle", { name: kind.nameSv }), items: kinds.filter(other => other.id !== kind.id).map(other => ({ id: other.id, label: label(other) })) });
                  const into = kinds.find(other => other.id === intoId);

                  if (into && await confirm({ title: t("mergeConfirm", { name: kind.nameSv, into: into.nameSv }), description: t("mergeText"), confirmLabel: t("merge"), destructive: true })) {
                    void save(() => mergeKindAction(kind.id, into.id), { success: t("merged") });
                  }
                }}><Merge /></Button>
              </span>
            </div>
            {editing === kind.id && <KindForm type={type} use={use} kind={kind} onDone={() => setEditing(null)} />}
          </li>
        ))}
      </ol>
    </div>
  );
}

function KindForm({ type, use, kind, onDone }: { type: KindType; use: KindUse | null; kind?: KindRow; onDone: () => void }) {
  const t = useTranslations("AdminKinds");
  const { save, pending } = useSave();
  const id = kind?.id ?? `new-${type}-${use ?? ""}`;
  const [values, setValues] = useState({
    nameSv: kind?.nameSv ?? "",
    nameEn: kind?.nameEn ?? "",
    aliases: kind?.aliases.join("\n") ?? "",
    valueType: (kind?.valueType ?? "TEXT") as FactValueType,
  });

  return (
    <form className="space-y-3 rounded-md border border-border p-3" onSubmit={async event => {
      event.preventDefault();
      const input = {
        type, use,
        valueType: type === "FACT" ? values.valueType : null,
        nameSv: values.nameSv,
        nameEn: values.nameEn,
        aliases: values.aliases.split("\n"),
      };

      if (await save(() => saveKindAction(kind?.id ?? null, input))) {
        onDone();
      }
    }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor={`sv-${id}`}>{t("nameSv")}</Label><Input id={`sv-${id}`} required maxLength={100} value={values.nameSv} onChange={event => setValues({ ...values, nameSv: event.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor={`en-${id}`}>{t("nameEn")}</Label><Input id={`en-${id}`} required maxLength={100} value={values.nameEn} onChange={event => setValues({ ...values, nameEn: event.target.value })} /></div>
      </div>
      {type === "FACT" && (
        <div className="space-y-1.5 sm:max-w-xs">
          <Label htmlFor={`vt-${id}`}>{t("valueType")}</Label>
          <NativeSelect id={`vt-${id}`} value={values.valueType} onChange={event => setValues({ ...values, valueType: event.target.value as FactValueType })}>
            {factValueTypes().map(valueType => <NativeSelectOption key={valueType} value={valueType}>{t(`valueTypes.${valueType}`)}</NativeSelectOption>)}
          </NativeSelect>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor={`al-${id}`}>{t("aliases")}</Label>
        <Textarea id={`al-${id}`} rows={4} maxLength={2000} value={values.aliases} onChange={event => setValues({ ...values, aliases: event.target.value })} className="font-mono text-sm" />
        <p className="text-xs text-muted-foreground">{t("aliasesHelp")}</p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}><Save aria-hidden /> {t("save")}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}><X aria-hidden /> {t("cancel")}</Button>
      </div>
    </form>
  );
}
