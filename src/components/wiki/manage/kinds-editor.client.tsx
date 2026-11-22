"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Archive, ArchiveRestore, Merge, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@/components/dialogs.client";
import { deleteKindAction, mergeKindAction, reorderKindsAction, retireKindAction, saveKindAction } from "@/app/(app)/admin/actions.server";
import type { FactValueType, KindType, KindUse, SectionContent } from "@/gql/graphql";
import { creatableContents, factValueTypes, SECTION_CONTENTS } from "@/utils/kinds";

export type KindRow = {
  id: string;
  nameSv: string;
  nameEn: string;
  aliases: string[];
  position: number;
  retired: boolean;
  valueType?: FactValueType | null;
  content?: SectionContent | null;
  subtitleSv?: string | null;
  subtitleEn?: string | null;
};

/**
 * The kinds of one type (and, for image kinds, one use, or one image section), as admins keep them (spec 4.6): Swedish
 * and English names, the aliases the import recognises, their order (the first in use is the default), retired or in
 * use, merging one into another, and deleting one. Only a kind nothing refers to is deleted (the server says when one
 * is in use); merging moves what refers to it and keeps its names as aliases. Section kinds also have a content and a subtitle, and their order is the spex pages' default order;
 * those of a content with one kind (the vest, the music …) are never merged or deleted.
 */
export function KindsEditor({ type, use, sectionId = null, kinds }: { type: KindType; use: KindUse | null; sectionId?: string | null; kinds: KindRow[] }) {
  const t = useTranslations("AdminKinds");
  const { save, pending } = useSave();
  const { confirm, choose } = useDialogs();
  const [editing, setEditing] = useState<string | null>(null);
  // The last kind in use of a type is its default; sections may all be retired
  const last = (kind: KindRow) => type !== "SECTION" && !kind.retired && kinds.filter(other => !other.retired).length === 1;
  const label = (kind: KindRow) => kind.nameSv === kind.nameEn ? kind.nameSv : `${kind.nameSv} / ${kind.nameEn}`;

  const move = (from: number, to: number) => {
    const ids = kinds.map(kind => kind.id);
    const [id] = ids.splice(from, 1);

    ids.splice(to, 0, id);
    void save(() => reorderKindsAction(type, use, ids, sectionId), { success: false });
  };

  return (
    <div className="space-y-3">
      <Button type="button" size="sm" variant="outline" onClick={() => setEditing("new")}><Plus aria-hidden /> {t("add")}</Button>
      {editing === "new" && <KindForm type={type} use={use} sectionId={sectionId} onDone={() => setEditing(null)} />}
      {kinds.length === 0 && <p className="text-sm text-muted-foreground">{t("none")}</p>}
      <ol className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
        {kinds.map((kind, index) => (
          <li key={kind.id} className="space-y-2 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-6 text-muted-foreground">{index + 1}</span>
              <span className={kind.retired ? "font-medium text-muted-foreground line-through" : "font-medium"}>{label(kind)}</span>
              {type === "FACT" && kind.valueType && <Badge variant="secondary">{t(`valueTypes.${kind.valueType}`)}</Badge>}
              {kind.content && <Badge variant="secondary">{t(`contents.${kind.content}`)}</Badge>}
              {kind.retired && <Badge variant="outline">{t("retired")}</Badge>}
              {kind.content === "IMAGES" && <Link href={`/admin/kinds?type=IMAGE#section-${kind.id}`} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">{t("imageKinds")}</Link>}
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
                {mergeable(kind) && <Button type="button" size="icon" variant="ghost" aria-label={t("merge")} title={t("merge")} disabled={pending || kinds.filter(other => sameGroup(other, kind)).length < 2} onClick={async () => {
                  const intoId = await choose({ title: t("mergeTitle", { name: kind.nameSv }), items: kinds.filter(other => other.id !== kind.id && sameGroup(other, kind)).map(other => ({ id: other.id, label: label(other) })) });
                  const into = kinds.find(other => other.id === intoId);

                  if (into && await confirm({ title: t("mergeConfirm", { name: kind.nameSv, into: into.nameSv }), description: t("mergeText"), confirmLabel: t("merge"), destructive: true })) {
                    void save(() => mergeKindAction(kind.id, into.id), { success: t("merged") });
                  }
                }}><Merge /></Button>}
                {mergeable(kind) && <Button type="button" size="icon" variant="ghost" aria-label={t("delete")} title={t("delete")} disabled={pending || last(kind)} onClick={async () => {
                  if (await confirm({ title: t("deleteConfirm", { name: label(kind) }), description: kind.content === "IMAGES" ? t("deleteSectionText") : t("deleteText"), confirmLabel: t("delete"), destructive: true })) {
                    void save(() => deleteKindAction(kind.id), { success: t("deleted") });
                  }
                }}><Trash2 /></Button>}
              </span>
            </div>
            {kind.subtitleSv && <p className="pl-8 text-xs text-muted-foreground">{kind.subtitleSv}{kind.subtitleEn && kind.subtitleEn !== kind.subtitleSv && ` / ${kind.subtitleEn}`}</p>}
            {editing === kind.id && <KindForm type={type} use={use} sectionId={sectionId} kind={kind} onDone={() => setEditing(null)} />}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Section kinds of a content with one kind are never merged, and merge only with kinds of the same content. */
const mergeable = (kind: KindRow) => !kind.content || !SECTION_CONTENTS[kind.content].single;
const sameGroup = (a: KindRow, b: KindRow) => (a.content ?? null) === (b.content ?? null);

function KindForm({ type, use, sectionId, kind, onDone }: { type: KindType; use: KindUse | null; sectionId: string | null; kind?: KindRow; onDone: () => void }) {
  const t = useTranslations("AdminKinds");
  const { save, pending } = useSave();
  const id = kind?.id ?? `new-${type}-${use ?? ""}-${sectionId ?? ""}`;
  const [values, setValues] = useState({
    nameSv: kind?.nameSv ?? "",
    nameEn: kind?.nameEn ?? "",
    aliases: kind?.aliases.join("\n") ?? "",
    valueType: (kind?.valueType ?? "TEXT") as FactValueType,
    content: (kind?.content ?? "IMAGES") as SectionContent,
    subtitleSv: kind?.subtitleSv ?? "",
    subtitleEn: kind?.subtitleEn ?? "",
  });
  const section = type === "SECTION";

  return (
    <form className="space-y-3 rounded-md border border-border p-3" onSubmit={async event => {
      event.preventDefault();
      const input = {
        type, use, sectionId,
        content: section && !kind ? values.content : null,
        valueType: type === "FACT" ? values.valueType : null,
        nameSv: values.nameSv,
        nameEn: values.nameEn,
        aliases: values.aliases.split("\n"),
        ...(section ? { subtitleSv: values.subtitleSv, subtitleEn: values.subtitleEn } : {}),
      };

      if (await save(() => saveKindAction(kind?.id ?? null, input))) {
        onDone();
      }
    }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor={`sv-${id}`}>{t("nameSv")}</Label><Input id={`sv-${id}`} required maxLength={100} value={values.nameSv} onChange={event => setValues({ ...values, nameSv: event.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor={`en-${id}`}>{t("nameEn")}</Label><Input id={`en-${id}`} required maxLength={100} value={values.nameEn} onChange={event => setValues({ ...values, nameEn: event.target.value })} /></div>
      </div>
      {section && (
        <>
          {!kind && (
            <div className="space-y-1.5 sm:max-w-xs">
              <Label htmlFor={`ct-${id}`}>{t("content")}</Label>
              <NativeSelect id={`ct-${id}`} value={values.content} onChange={event => setValues({ ...values, content: event.target.value as SectionContent })}>
                {creatableContents().map(content => <NativeSelectOption key={content} value={content}>{t(`contents.${content}`)}</NativeSelectOption>)}
              </NativeSelect>
              <p className="text-xs text-muted-foreground">{t("contentHelp")}</p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor={`ssv-${id}`}>{t("subtitleSv")}</Label><Input id={`ssv-${id}`} maxLength={200} value={values.subtitleSv} onChange={event => setValues({ ...values, subtitleSv: event.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor={`sen-${id}`}>{t("subtitleEn")}</Label><Input id={`sen-${id}`} maxLength={200} value={values.subtitleEn} onChange={event => setValues({ ...values, subtitleEn: event.target.value })} /></div>
          </div>
        </>
      )}
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
