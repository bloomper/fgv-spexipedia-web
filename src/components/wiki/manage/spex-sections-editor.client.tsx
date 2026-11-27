"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { Label } from "@bloomper/fgv-web-ui/ui/label";
import { NativeSelect, NativeSelectOption } from "@bloomper/fgv-web-ui/ui/native-select";
import { PhotoPicker } from "@/components/wiki/editor/photo-picker.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@bloomper/fgv-web-ui/shell/dialogs";
import { setSectionsAction } from "@/app/(app)/manage/actions.server";
import { appRefAction } from "@/app/(app)/articles/actions.server";
import { useServerState } from "@/hooks/use-server-state.client";
import type { EditSection, SectionKind, SpexEditData } from "@/lib/wiki/edit.server";
import type { SectionContent } from "@/gql/graphql";
import { isExternal } from "@/utils/kinds";
import { cn } from "@/utils/utils";

/** Material of another application a section can show, from what the spex has there. */
export type SectionMaterial = { content: SectionContent; id: string; title: string };

type Row = {
  key: string;
  id: string | null;
  kindId: string;
  kindName: string;
  content: SectionContent;
  hidden: boolean;
  title: string;
  refId: string | null;
  itemIds: string[];
  startSeconds: number | null;
  /** What the application answered about the material, when the page was loaded; null when it found nothing. */
  found: string | null;
};

/** The reference prefix an address pasted from each application becomes (utils/app-refs.ts). */
const REFS: Partial<Record<SectionContent, string>> = {
  SPEXFLIX_VIDEO: "spexflix:video/",
  SPEXGRAM: "spexgram:album/",
  SPEXIFY_ALBUM: "spexify:album/",
  ARCHIVE_DOCUMENT: "arkiv:document/",
};

function found(section: EditSection): string | null {
  return section.video?.title ?? section.photos?.title ?? section.record?.title ?? section.document?.title ?? null;
}

const rowOf = (section: EditSection): Row => ({
  key: section.id, id: section.id, kindId: section.kind.id, kindName: section.kind.name, content: section.content,
  hidden: section.hidden, title: section.ownTitle ?? "", refId: section.refId ?? null, itemIds: section.itemIds,
  startSeconds: section.startSeconds ?? null, found: isExternal(section.content) ? found(section) : section.kind.name,
});

/** "1:02:03", "2:03" or "45" as seconds; null when empty or not a time. */
export function parseTime(text: string): number | null {
  const parts = text.trim().split(":");

  if (!text.trim() || parts.length > 3 || parts.some(part => !/^\d+$/.test(part))) {
    return null;
  }
  return parts.reduce((total, part) => total * 60 + Number(part), 0);
}

export function formatTime(seconds: number | null): string {
  if (seconds == null) {
    return "";
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * The order of the sections of the spex' page (spec 4.2): drag them or move them with the arrows, hide and show them,
 * give them headings of their own, and add sections that show material of the other applications (4.2.1), picked from
 * what the spex has there or by an address pasted from the application. Saved together; going back to the default
 * order removes the spex' own list.
 */
export function SpexSectionsEditor({ spex, sectionKinds, materials }: {
  spex: SpexEditData;
  sectionKinds: SectionKind[];
  materials: SectionMaterial[];
}) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const { confirm } = useDialogs();
  const [rows, setRows] = useServerState(spex.sections.map(rowOf), value => JSON.stringify(value.map(row => [row.id, row.hidden, row.title, row.refId, row.itemIds, row.startSeconds])));
  const [dirty, setDirty] = useState(false);
  const [dragged, setDragged] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const externalKinds = sectionKinds.filter(kind => kind.content && isExternal(kind.content) && !kind.retired);

  const change = (next: Row[]) => {
    setRows(next);
    setDirty(true);
  };
  const update = (index: number, patch: Partial<Row>) => change(rows.map((row, i) => i === index ? { ...row, ...patch } : row));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) {
      return;
    }
    const next = [...rows];
    const [row] = next.splice(from, 1);

    next.splice(to, 0, row);
    change(next);
  };
  const submit = () => save(() => setSectionsAction(spex.id, rows.map(row => ({
    id: row.id, kindId: row.kindId, hidden: row.hidden, title: row.title || null, refId: row.refId,
    itemIds: row.content === "SPEXGRAM" ? row.itemIds : null, startSeconds: row.content === "SPEXFLIX_VIDEO" ? row.startSeconds : null,
  })))).then(ok => ok && setDirty(false));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t(`sectionOrder.${spex.sectionOrder}`)}</p>
      <ol className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
        {rows.map((row, index) => (
          <li key={row.key} draggable onDragStart={() => setDragged(index)} onDragOver={event => event.preventDefault()}
              onDrop={() => {
                if (dragged != null) {
                  move(dragged, index);
                }
                setDragged(null);
              }}
              className={cn("space-y-2 px-3 py-2", row.hidden && "opacity-60", dragged === index && "bg-muted")}>
            <div className="flex flex-wrap items-center gap-2">
              <GripVertical className="size-4 cursor-grab text-muted-foreground" aria-hidden />
              <span className="font-medium">{row.title || row.kindName}</span>
              {row.title && <span className="text-xs text-muted-foreground">({row.kindName})</span>}
              {isExternal(row.content) && <Badge variant="secondary">{t(`sectionMaterial.${row.content}`)}</Badge>}
              {row.hidden && <Badge variant="outline">{t("sectionHidden")}</Badge>}
              <span className="ml-auto inline-flex">
                <Button type="button" size="icon" variant="ghost" aria-label={t("moveUp")} disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp /></Button>
                <Button type="button" size="icon" variant="ghost" aria-label={t("moveDown")} disabled={index === rows.length - 1} onClick={() => move(index, index + 1)}><ArrowDown /></Button>
                {isExternal(row.content) ? (
                  <Button type="button" size="icon" variant="ghost" aria-label={t("sectionRemove")} title={t("sectionRemove")}
                          onClick={() => change(rows.filter((_, i) => i !== index))}><Trash2 /></Button>
                ) : (
                  <Button type="button" size="icon" variant="ghost" aria-label={row.hidden ? t("sectionShow") : t("sectionHide")} title={row.hidden ? t("sectionShow") : t("sectionHide")}
                          onClick={() => update(index, { hidden: !row.hidden })}>{row.hidden ? <EyeOff /> : <Eye />}</Button>
                )}
              </span>
            </div>
            <div className="grid gap-2 pl-6 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor={`title-${row.key}`} className="text-xs">{t("sectionTitle")}</Label>
                <Input id={`title-${row.key}`} maxLength={200} placeholder={row.kindName} value={row.title} onChange={event => update(index, { title: event.target.value })} />
              </div>
              {row.content === "SPEXFLIX_VIDEO" && (
                <div className="space-y-1">
                  <Label htmlFor={`start-${row.key}`} className="text-xs">{t("sectionStart")}</Label>
                  <Input id={`start-${row.key}`} inputMode="numeric" placeholder="0:00" defaultValue={formatTime(row.startSeconds)}
                         onBlur={event => update(index, { startSeconds: parseTime(event.target.value) })} />
                </div>
              )}
            </div>
            {isExternal(row.content) && (
              <p className={cn("flex items-center gap-1.5 pl-6 text-xs", row.found ? "text-muted-foreground" : "text-destructive")}>
                {row.found ? t("sectionShows", { title: row.found }) : <><AlertTriangle className="size-3.5" aria-hidden /> {t("sectionNotFound")}</>}
              </p>
            )}
            {row.content === "SPEXGRAM" && row.refId && (
              <div className="pl-6">
                <PhotoPicker title={row.itemIds.length > 0 ? t("sectionSomeItems") : t("sectionWholeAlbum")} spexId={spex.id} albumId={row.refId}
                             chosen={row.itemIds} onSave={async itemIds => (update(index, { itemIds }), true)} />
              </div>
            )}
          </li>
        ))}
      </ol>
      {adding ? (
        <AddSection kinds={externalKinds} materials={materials} onCancel={() => setAdding(false)} onAdd={row => {
          change([...rows, row]);
          setAdding(false);
        }} />
      ) : (
        externalKinds.length > 0 && <Button type="button" size="sm" variant="outline" onClick={() => setAdding(true)}><Plus aria-hidden /> {t("sectionAdd")}</Button>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={pending || !dirty} onClick={() => void submit()}><Save aria-hidden /> {t("save")}</Button>
        {spex.sectionOrder === "OWN" && (
          <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={async () => {
            if (await confirm({ title: t("sectionDefaultTitle"), description: t("sectionDefaultText"), confirmLabel: t("sectionDefault"), destructive: true })) {
              void save(() => setSectionsAction(spex.id, [])).then(ok => ok && setDirty(false));
            }
          }}><RotateCcw aria-hidden /> {t("sectionDefault")}</Button>
        )}
      </div>
    </div>
  );
}

/**
 * A new section of another application: its kind, and the material, from what the spex has there or by an address
 * pasted from the application.
 */
function AddSection({ kinds, materials, onAdd, onCancel }: {
  kinds: SectionKind[];
  materials: SectionMaterial[];
  onAdd: (row: Row) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Manage");
  const [kindId, setKindId] = useState(kinds[0]?.id ?? "");
  const [materialId, setMaterialId] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const added = useRef(0);
  const kind = kinds.find(each => each.id === kindId);
  const content = kind?.content ?? null;
  const offered = materials.filter(material => material.content === content);

  const add = async () => {
    if (!kind || !content) {
      return;
    }
    let refId = materialId || null;
    let startSeconds: number | null = null;
    let title = offered.find(material => material.id === materialId)?.title ?? null;

    if (address.trim()) {
      const result = await appRefAction(address);
      const prefix = REFS[content];

      if (!result.ok || !prefix || !result.data.startsWith(prefix)) {
        setError(t("sectionAddressWrong", { kind: t(`sectionMaterial.${content}`) }));
        return;
      }
      refId = result.data.slice(prefix.length);
      title = null;
      try {
        const time = new URL(address.trim()).searchParams.get("t");

        startSeconds = time && /^\d+$/.test(time) ? Number(time) : null;
      } catch {
        // The address was read already
      }
    }
    if (!refId) {
      setError(t("sectionPickMaterial"));
      return;
    }
    onAdd({
      key: `new-${++added.current}`, id: null, kindId: kind.id, kindName: kind.name, content, hidden: false, title: "",
      refId, itemIds: [], startSeconds, found: title ?? t("sectionSavedFirst"),
    });
  };

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="section-kind">{t("sectionKind")}</Label>
          <NativeSelect id="section-kind" value={kindId} onChange={event => {
            setKindId(event.target.value);
            setMaterialId("");
            setError(null);
          }}>
            {kinds.map(each => <NativeSelectOption key={each.id} value={each.id}>{each.name}</NativeSelectOption>)}
          </NativeSelect>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="section-material">{t("sectionMaterialLabel")}</Label>
          <NativeSelect id="section-material" value={materialId} disabled={offered.length === 0} onChange={event => {
            setMaterialId(event.target.value);
            setError(null);
          }}>
            <NativeSelectOption value="">{offered.length === 0 ? t("sectionNoMaterial") : t("sectionChoose")}</NativeSelectOption>
            {offered.map(material => <NativeSelectOption key={material.id} value={material.id}>{material.title}</NativeSelectOption>)}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="section-address">{t("sectionAddress")}</Label>
        <Input id="section-address" type="url" placeholder="https://" value={address} onChange={event => {
          setAddress(event.target.value);
          setError(null);
        }} />
        <p className="text-xs text-muted-foreground">{t("sectionAddressHelp")}</p>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => void add()}><Plus aria-hidden /> {t("sectionAddIt")}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>{t("cancel")}</Button>
      </div>
    </div>
  );
}
