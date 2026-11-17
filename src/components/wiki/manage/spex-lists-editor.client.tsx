"use client";

import { type ChangeEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ClipboardPaste, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ImageListEditor } from "@/components/wiki/editor/image-list-editor.client";
import { PhotoPicker } from "@/components/wiki/editor/photo-picker.client";
import { CreditPicker, CreditResolver, toCreditInput, toCreditValue, type CreditValue } from "@/components/wiki/editor/credit-picker.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@/components/dialogs.client";
import {
  deleteCharacterAction,
  deleteNumberAction,
  deleteSceneAction,
  pasteCharactersAction,
  pasteNumbersAction,
  pasteScenesAction,
  reorderCharactersAction,
  reorderNumbersAction,
  reorderScenesAction,
  resolveCreditAction,
  saveCharacterAction,
  saveNumberAction,
  saveSceneAction,
  setCharacterImagesAction,
  setPagePhotosAction,
  setRevivalChangesAction,
} from "@/app/(app)/manage/actions.server";
import type { EditKind, SpexEditData } from "@/lib/wiki/edit.server";
import type { NumberCreditInput } from "@/gql/graphql";
import { offeredKinds } from "@/utils/kinds";
import { groupBy } from "@/utils/wiki";

type Character = SpexEditData["characters"][number];
type Scene = SpexEditData["scenes"][number];
type SpexNumber = SpexEditData["numbers"][number];

/**
 * Pastes a list as text, one per line, added after the existing ones.
 */
function PasteBox({ help, onPaste }: { help: string; onPaste: (text: string) => Promise<boolean> }) {
  const t = useTranslations("Manage");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  if (!open) {
    return <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}><ClipboardPaste aria-hidden /> {t("paste")}</Button>;
  }
  return (
    <div className="w-full space-y-2 rounded-md border border-border p-3">
      <Textarea rows={6} value={text} onChange={event => setText(event.target.value)} aria-label={t("paste")} className="font-mono text-sm" />
      <p className="text-xs text-muted-foreground">{help}</p>
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={!text.trim()} onClick={async () => {
          if (await onPaste(text)) {
            setText("");
            setOpen(false);
          }
        }}>{t("addLines")}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>{t("cancel")}</Button>
      </div>
    </div>
  );
}

function MoveButtons({ index, count, onMove }: { index: number; count: number; onMove: (to: number) => void }) {
  const t = useTranslations("Manage");

  return (
    <span className="inline-flex">
      <Button type="button" size="icon" variant="ghost" aria-label={t("moveUp")} disabled={index === 0} onClick={() => onMove(index - 1)}><ArrowUp /></Button>
      <Button type="button" size="icon" variant="ghost" aria-label={t("moveDown")} disabled={index === count - 1} onClick={() => onMove(index + 1)}><ArrowDown /></Button>
    </span>
  );
}

function moved<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);

  next.splice(to, 0, item);
  return next;
}

// Characters ------------------------------------------------------------------------------------------------------------

/**
 * The spex's characters: name, figure and description for editors; images and actor photos for authors. A revival
 * edits only the characters it added; its parent's are cut or kept in the revival's changes.
 */
export function CharactersEditor({ spex, figures, editor, imageKinds }: {
  spex: SpexEditData;
  figures: { id: string; name: string }[];
  editor: boolean;
  /** Image kinds for characters (spec 4.6). */
  imageKinds: EditKind[];
}) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const own = spex.characters.filter(character => character.spex.id === spex.id);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {editor && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing("new")}><Plus aria-hidden /> {t("addCharacter")}</Button>
          <PasteBox help={t("pasteCharactersHelp")} onPaste={text => save(() => pasteCharactersAction(spex.id, text))} />
        </div>
      )}
      {editing === "new" && <CharacterForm spexId={spex.id} figures={figures} onDone={() => setEditing(null)} />}
      <ol className="space-y-3">
        {spex.characters.map(character => {
          const mine = character.spex.id === spex.id;
          const index = own.indexOf(character);

          return (
            <li key={character.id} className="space-y-3 rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="wiki-heading text-lg font-semibold">{character.name}</span>
                {character.figure && <Badge variant="secondary">{character.figure.name}</Badge>}
                {character.retired && <Badge variant="outline">{t("retired")}</Badge>}
                {!mine && <Badge variant="outline">{t("fromParent")}</Badge>}
                {editor && mine && (
                  <span className="ml-auto inline-flex">
                    <MoveButtons index={index} count={own.length} onMove={to => save(() => reorderCharactersAction(spex.id, moved(own, index, to).map(c => c.id)), { success: false })} />
                    <Button type="button" size="icon" variant="ghost" aria-label={t("edit")} onClick={() => setEditing(editing === character.id ? null : character.id)}><Pencil /></Button>
                    <DeleteButton disabled={pending} onDelete={() => save(() => deleteCharacterAction(character.id))} />
                  </span>
                )}
              </div>
              {editing === character.id && <CharacterForm spexId={spex.id} figures={figures} character={character} onDone={() => setEditing(null)} />}
              <details>
                <summary className="cursor-pointer text-sm text-primary">{t("imagesAndPhotos")}</summary>
                <div className="mt-3 space-y-4">
                  <ImageListEditor title={t("characterImages")} uploadKind="SKETCH" kinds={imageKinds}
                                   images={character.images}
                                   onSave={images => save(() => setCharacterImagesAction(character.id, images))} />
                  <PhotoPicker title={t("actorPhotos")} spexId={spex.id} chosen={character.photos.itemIds}
                               onSave={itemIds => save(() => setPagePhotosAction(spex.id, "ACTOR", character.id, itemIds))} />
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CharacterForm({ spexId, figures, character, onDone }: {
  spexId: string;
  figures: { id: string; name: string }[];
  character?: Character;
  onDone: () => void;
}) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const [name, setName] = useState(character?.name ?? "");
  const [figureId, setFigureId] = useState(character?.figure?.id ?? "");
  const [description, setDescription] = useState(character?.description ?? "");

  return (
    <form className="space-y-3 rounded-md border border-border p-3" onSubmit={async event => {
      event.preventDefault();
      if (await save(() => saveCharacterAction(spexId, character?.id ?? null, { name: name.trim(), figureId: figureId || null, description: description.trim() || null }))) {
        onDone();
      }
    }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`name-${character?.id ?? "new"}`}>{t("name")}</Label>
          <Input id={`name-${character?.id ?? "new"}`} required value={name} onChange={event => setName(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`figure-${character?.id ?? "new"}`}>{t("figure")}</Label>
          <NativeSelect id={`figure-${character?.id ?? "new"}`} value={figureId} onChange={event => setFigureId(event.target.value)}>
            <NativeSelectOption value="">{t("none")}</NativeSelectOption>
            {figures.map(figure => <NativeSelectOption key={figure.id} value={figure.id}>{figure.name}</NativeSelectOption>)}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`description-${character?.id ?? "new"}`}>{t("description")}</Label>
        <Textarea id={`description-${character?.id ?? "new"}`} rows={3} value={description} onChange={event => setDescription(event.target.value)} />
      </div>
      <FormButtons pending={pending} onCancel={onDone} />
    </form>
  );
}

function FormButtons({ pending, onCancel }: { pending: boolean; onCancel: () => void }) {
  const t = useTranslations("Manage");

  return (
    <div className="flex gap-2">
      <Button type="submit" size="sm" disabled={pending}><Save aria-hidden /> {t("save")}</Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}><X aria-hidden /> {t("cancel")}</Button>
    </div>
  );
}

function DeleteButton({ onDelete, disabled }: { onDelete: () => void; disabled?: boolean }) {
  const t = useTranslations("Manage");
  const { confirm } = useDialogs();

  return (
    <Button type="button" size="icon" variant="ghost" aria-label={t("delete")} disabled={disabled} onClick={async () => {
      if (await confirm({ title: t("deleteTitle"), description: t("deleteText"), confirmLabel: t("delete"), destructive: true })) {
        onDelete();
      }
    }}><Trash2 /></Button>
  );
}

// Scenes ----------------------------------------------------------------------------------------------------------------

/**
 * The scenes by act: title, place and whether an interval follows.
 */
export function ScenesEditor({ spex }: { spex: SpexEditData }) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const own = spex.scenes.filter(scene => scene.spex.id === spex.id);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing("new")}><Plus aria-hidden /> {t("addScene")}</Button>
        <PasteBox help={t("pasteScenesHelp")} onPaste={text => save(() => pasteScenesAction(spex.id, text))} />
      </div>
      {editing === "new" && <SceneForm spexId={spex.id} act={own.at(-1)?.act ?? 1} onDone={() => setEditing(null)} />}
      <ol className="divide-y divide-border rounded-lg border border-border bg-card">
        {spex.scenes.map(scene => {
          const mine = scene.spex.id === spex.id;
          const index = own.indexOf(scene);

          return (
            <li key={scene.id} className="space-y-2 px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-14 text-muted-foreground">{t("actShort", { act: scene.act })}</span>
                <span className="font-medium">{scene.title}</span>
                {scene.place && <span className="text-muted-foreground">— {scene.place}</span>}
                {scene.intervalAfter && <Badge variant="secondary">{t("interval")}</Badge>}
                {!mine && <Badge variant="outline">{t("fromParent")}</Badge>}
                {mine && (
                  <span className="ml-auto inline-flex">
                    <MoveButtons index={index} count={own.length} onMove={to => save(() => reorderScenesAction(spex.id, moved(own, index, to).map(s => ({ id: s.id, act: s.act }))), { success: false })} />
                    <Button type="button" size="icon" variant="ghost" aria-label={t("edit")} onClick={() => setEditing(editing === scene.id ? null : scene.id)}><Pencil /></Button>
                    <DeleteButton disabled={pending} onDelete={() => save(() => deleteSceneAction(scene.id))} />
                  </span>
                )}
              </div>
              {editing === scene.id && <SceneForm spexId={spex.id} scene={scene} act={scene.act} onDone={() => setEditing(null)} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SceneForm({ spexId, scene, act, onDone }: { spexId: string; scene?: Scene; act: number; onDone: () => void }) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const [values, setValues] = useState({ act: scene?.act ?? act, title: scene?.title ?? "", place: scene?.place ?? "", intervalAfter: scene?.intervalAfter ?? false });
  const id = scene?.id ?? "new";

  return (
    <form className="space-y-3 rounded-md border border-border p-3" onSubmit={async event => {
      event.preventDefault();
      if (await save(() => saveSceneAction(spexId, scene?.id ?? null, { ...values, title: values.title.trim(), place: values.place.trim() || null }))) {
        onDone();
      }
    }}>
      <div className="grid gap-3 sm:grid-cols-[5rem_1fr_1fr]">
        <div className="space-y-1.5"><Label htmlFor={`act-${id}`}>{t("act")}</Label><Input id={`act-${id}`} type="number" min={1} max={9} value={values.act} onChange={event => setValues({ ...values, act: Number(event.target.value) })} /></div>
        <div className="space-y-1.5"><Label htmlFor={`title-${id}`}>{t("title")}</Label><Input id={`title-${id}`} required value={values.title} onChange={event => setValues({ ...values, title: event.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor={`place-${id}`}>{t("place")}</Label><Input id={`place-${id}`} value={values.place} onChange={event => setValues({ ...values, place: event.target.value })} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={values.intervalAfter} onCheckedChange={checked => setValues({ ...values, intervalAfter: !!checked })} /> {t("intervalAfter")}</label>
      <FormButtons pending={pending} onCancel={onDone} />
    </form>
  );
}

// Numbers ---------------------------------------------------------------------------------------------------------------

/**
 * The numbers by act: title, kind, original song and where it is from, first line, credits per credit kind (picked
 * from Spexregister, or free text for people outside FGV) and the characters who sing them. Imported credits nobody has
 * resolved (spec 5.3) are listed under their number to resolve.
 */
export function NumbersEditor({ spex, numberKinds, creditKinds }: { spex: SpexEditData; numberKinds: EditKind[]; creditKinds: EditKind[] }) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const own = spex.numbers.filter(number => number.spex.id === spex.id);
  const [editing, setEditing] = useState<string | null>(null);
  const kindName = (id: string | null | undefined) => [...numberKinds, ...creditKinds].find(kind => kind.id === id)?.name;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing("new")}><Plus aria-hidden /> {t("addNumber")}</Button>
        <PasteBox help={t("pasteNumbersHelp")} onPaste={text => save(() => pasteNumbersAction(spex.id, text))} />
      </div>
      {editing === "new" && <NumberForm spex={spex} numberKinds={numberKinds} creditKinds={creditKinds} act={own.at(-1)?.act ?? 1} onDone={() => setEditing(null)} />}
      <ol className="divide-y divide-border rounded-lg border border-border bg-card">
        {spex.numbers.map(number => {
          const mine = number.spex.id === spex.id;
          const index = own.indexOf(number);
          const unresolved = number.credits.filter(credit => credit.credit.unresolved);

          return (
            <li key={number.id} id={`number-${number.id}`} className="scroll-mt-24 space-y-2 px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-14 text-muted-foreground">{t("actShort", { act: number.act })}</span>
                <span className="font-medium">{number.title}</span>
                {number.kind && <Badge variant="secondary">{kindName(number.kind.id)}</Badge>}
                {number.originalTitle && <span className="text-muted-foreground">({number.originalTitle}{number.originalArtist && ` – ${number.originalArtist}`})</span>}
                {number.retired && <Badge variant="outline">{t("retired")}</Badge>}
                {!mine && <Badge variant="outline">{t("fromParent")}</Badge>}
                {unresolved.length > 0 && <Badge variant="outline" className="border-amber-500/70 text-amber-600 dark:text-amber-400">{t("unresolvedCount", { count: unresolved.length })}</Badge>}
                {mine && (
                  <span className="ml-auto inline-flex">
                    <MoveButtons index={index} count={own.length} onMove={to => save(() => reorderNumbersAction(spex.id, moved(own, index, to).map(n => ({ id: n.id, act: n.act }))), { success: false })} />
                    <Button type="button" size="icon" variant="ghost" aria-label={t("edit")} onClick={() => setEditing(editing === number.id ? null : number.id)}><Pencil /></Button>
                    <DeleteButton disabled={pending} onDelete={() => save(() => deleteNumberAction(number.id))} />
                  </span>
                )}
              </div>
              {unresolved.length > 0 && (
                <ul className="space-y-2 rounded-md border border-dashed border-amber-500/50 p-2">
                  {unresolved.map(credit => (
                    <li key={`${credit.kind.id}-${credit.position}`} className="flex flex-wrap items-center gap-2">
                      <span className="text-muted-foreground">{kindName(credit.kind.id)}:</span>
                      <span className="font-medium">{credit.credit.name}</span>
                      <CreditResolver name={credit.credit.name ?? ""} disabled={pending}
                                      onResolve={value => save(() => resolveCreditAction(number.id, credit.kind.id, credit.position, value), { success: t("resolved") })} />
                    </li>
                  ))}
                </ul>
              )}
              {editing === number.id && <NumberForm spex={spex} numberKinds={numberKinds} creditKinds={creditKinds} number={number} act={number.act} onDone={() => setEditing(null)} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** A number's credits per credit kind, in the server's order (kind, then position). */
function creditsByKind(number: SpexNumber | undefined): Record<string, CreditValue[]> {
  return Object.fromEntries(groupBy(number?.credits ?? [], credit => credit.kind.id)
    .map(([kindId, credits]) => [kindId, [...credits].sort((a, b) => a.position - b.position).map(credit => toCreditValue(credit.credit))]));
}

function NumberForm({ spex, number, act, numberKinds, creditKinds, onDone }: {
  spex: SpexEditData;
  number?: SpexNumber;
  act: number;
  numberKinds: EditKind[];
  creditKinds: EditKind[];
  onDone: () => void;
}) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const id = number?.id ?? "new";
  const [values, setValues] = useState({
    act: number?.act ?? act,
    title: number?.title ?? "",
    kindId: number?.kind?.id ?? "",
    originalTitle: number?.originalTitle ?? "",
    originalArtist: number?.originalArtist ?? "",
    fromWork: number?.fromWork ?? "",
    firstLine: number?.firstLine ?? "",
  });
  const [credits, setCredits] = useState<Record<string, CreditValue[]>>(() => creditsByKind(number));
  const [characterIds, setCharacterIds] = useState<string[]>(number?.characters.map(c => c.id) ?? []);
  // Credit kinds in use, and retired ones the number still has credits of
  const shownCreditKinds = creditKinds.filter(kind => !kind.retired || (credits[kind.id] ?? []).length > 0);
  const text = (field: keyof typeof values) => ({
    id: `n${field}-${id}`,
    value: values[field],
    onChange: (event: ChangeEvent<HTMLInputElement>) => setValues({ ...values, [field]: event.target.value }),
  });

  return (
    <form className="space-y-3 rounded-md border border-border p-3" onSubmit={async event => {
      event.preventDefault();
      const input = {
        act: values.act,
        title: values.title.trim(),
        kindId: values.kindId || null,
        originalTitle: values.originalTitle.trim() || null,
        originalArtist: values.originalArtist.trim() || null,
        fromWork: values.fromWork.trim() || null,
        firstLine: values.firstLine.trim() || null,
        characterIds,
        credits: shownCreditKinds.flatMap(kind => (credits[kind.id] ?? []).map((credit): NumberCreditInput => credit.unresolved
          ? { kindId: kind.id, name: credit.name ?? "", unresolved: true }
          : { kindId: kind.id, ...toCreditInput(credit) })),
      };

      if (await save(() => saveNumberAction(spex.id, number?.id ?? null, input))) {
        onDone();
      }
    }}>
      <div className="grid gap-3 sm:grid-cols-[5rem_1fr_12rem]">
        <div className="space-y-1.5"><Label htmlFor={`nact-${id}`}>{t("act")}</Label><Input id={`nact-${id}`} type="number" min={1} max={9} value={values.act} onChange={event => setValues({ ...values, act: Number(event.target.value) })} /></div>
        <div className="space-y-1.5"><Label htmlFor={`ntitle-${id}`}>{t("title")}</Label><Input required {...text("title")} /></div>
        <div className="space-y-1.5">
          <Label htmlFor={`nkind-${id}`}>{t("numberKind")}</Label>
          <NativeSelect id={`nkind-${id}`} value={values.kindId} onChange={event => setValues({ ...values, kindId: event.target.value })}>
            <NativeSelectOption value="">{t("none")}</NativeSelectOption>
            {offeredKinds(numberKinds, number?.kind?.id).map(kind => <NativeSelectOption key={kind.id} value={kind.id}>{kind.name}</NativeSelectOption>)}
          </NativeSelect>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5"><Label htmlFor={`noriginalTitle-${id}`}>{t("originalTitle")}</Label><Input {...text("originalTitle")} /></div>
        <div className="space-y-1.5"><Label htmlFor={`noriginalArtist-${id}`}>{t("originalArtist")}</Label><Input {...text("originalArtist")} /></div>
        <div className="space-y-1.5"><Label htmlFor={`nfromWork-${id}`}>{t("fromWork")}</Label><Input placeholder={t("fromWorkPlaceholder")} {...text("fromWork")} /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor={`nfirstLine-${id}`}>{t("firstLine")}</Label><Input maxLength={500} {...text("firstLine")} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {shownCreditKinds.map(kind => (
          <CreditPicker key={kind.id} label={kind.retired ? `${kind.name} (${t("retired")})` : kind.name} value={credits[kind.id] ?? []}
                        onChange={value => setCredits({ ...credits, [kind.id]: value })} />
        ))}
      </div>
      {spex.characters.length > 0 && (
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium">{t("sungBy")}</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {spex.characters.map(character => (
              <label key={character.id} className="flex items-center gap-2">
                <Checkbox checked={characterIds.includes(character.id)} onCheckedChange={checked => setCharacterIds(checked ? [...characterIds, character.id] : characterIds.filter(c => c !== character.id))} />
                {character.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <FormButtons pending={pending} onCancel={onDone} />
    </form>
  );
}

// Revival changes -------------------------------------------------------------------------------------------------------

/**
 * For a revival: which of its parent's characters, scenes and numbers it cuts. Moving them is done on the lists above
 * once they are the revival's; here the parent's are kept or cut.
 */
export function RevivalChangesEditor({ spex }: { spex: SpexEditData }) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const parent = spex.parent;

  if (!parent) {
    return null;
  }
  const kinds = [
    ["CHARACTER", parent.characters.map(c => ({ id: c.id, label: c.name }))],
    ["SCENE", parent.scenes.map(s => ({ id: s.id, label: `${t("actShort", { act: s.act })} ${s.title}` }))],
    ["NUMBER", parent.numbers.map(n => ({ id: n.id, label: `${t("actShort", { act: n.act })} ${n.title}` }))],
  ] as const;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t("revivalHelp", { title: parent.title, year: parent.year })}</p>
      {kinds.map(([kind, records]) => (
        <RevivalKind key={kind} kind={kind} records={[...records]} pending={pending}
                     cut={spex.revivalChanges.filter(change => change.kind === kind && change.cut).map(change => change.recordId)}
                     onSave={cut => save(() => setRevivalChangesAction(spex.id, kind, cut.map(recordId => ({ recordId, cut: true, act: null, position: null }))))} />
      ))}
    </div>
  );
}

function RevivalKind({ kind, records, cut, onSave, pending }: {
  kind: string;
  records: { id: string; label: string }[];
  cut: string[];
  onSave: (cut: string[]) => Promise<boolean>;
  pending: boolean;
}) {
  const t = useTranslations("Manage");
  const [selected, setSelected] = useState(cut);

  if (records.length === 0) {
    return null;
  }
  return (
    <fieldset className="space-y-2 rounded-lg border border-border p-3">
      <legend className="px-1 text-sm font-semibold">{t(`revivalKinds.${kind}`)}</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {records.map(record => (
          <label key={record.id} className="flex items-center gap-2">
            <Checkbox checked={selected.includes(record.id)} onCheckedChange={checked => setSelected(checked ? [...selected, record.id] : selected.filter(s => s !== record.id))} />
            <span className={selected.includes(record.id) ? "line-through opacity-60" : undefined}>{record.label}</span>
          </label>
        ))}
      </div>
      <Button type="button" size="sm" disabled={pending || JSON.stringify([...selected].sort()) === JSON.stringify([...cut].sort())} onClick={() => onSave(selected)}>
        <Save aria-hidden /> {t("saveCuts")}
      </Button>
    </fieldset>
  );
}
