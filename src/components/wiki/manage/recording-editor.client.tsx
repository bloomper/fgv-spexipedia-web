"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ClipboardPaste, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ImageSlot } from "@/components/wiki/editor/image-slot.client";
import { CreditPicker, toCreditInput, toCreditValue, type CreditValue } from "@/components/wiki/editor/credit-picker.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@/components/dialogs.client";
import {
  deleteRecordingAction,
  pasteTracksAction,
  saveRecordingAction,
  setRecordingPublishedAction,
  setTracksAction,
} from "@/app/(app)/manage/actions.server";
import type { EditKind, RecordingEditData } from "@/lib/wiki/edit.server";
import { defaultKindId, offeredKinds } from "@/utils/kinds";
const DATE = "\\d{4}(-\\d{2}(-\\d{2})?)?";

type SpexOption = { id: string; label: string };

/**
 * A new recording: catalogue number, title, medium and spex; the rest is edited on its own page.
 */
export function NewRecordingForm({ spex, media }: { spex: SpexOption[]; media: EditKind[] }) {
  const t = useTranslations("ManageRecordings");
  const router = useRouter();
  const { save, pending } = useSave();
  const [values, setValues] = useState({ catalogueNumber: "", title: "", mediumId: defaultKindId(media) ?? "", spexId: "" });

  return (
    <form className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3" onSubmit={event => {
      event.preventDefault();
      void save(() => saveRecordingAction(null, { ...values, spexId: values.spexId || null }), { then: saved => router.push(`/manage/recordings/${saved.id}`) });
    }}>
      <Label className="flex-col items-start">{t("catalogueNumber")}<Input required className="w-32" value={values.catalogueNumber} onChange={event => setValues({ ...values, catalogueNumber: event.target.value })} /></Label>
      <Label className="flex-1 flex-col items-start">{t("recordingTitle")}<Input required value={values.title} onChange={event => setValues({ ...values, title: event.target.value })} /></Label>
      <Label className="flex-col items-start">{t("medium")}
        <NativeSelect required value={values.mediumId} onChange={event => setValues({ ...values, mediumId: event.target.value })}>
          {offeredKinds(media).map(medium => <NativeSelectOption key={medium.id} value={medium.id}>{medium.name}</NativeSelectOption>)}
        </NativeSelect>
      </Label>
      <Label className="flex-col items-start">{t("spex")}
        <NativeSelect value={values.spexId} onChange={event => setValues({ ...values, spexId: event.target.value })}>
          <NativeSelectOption value="">{t("compilation")}</NativeSelectOption>
          {spex.map(s => <NativeSelectOption key={s.id} value={s.id}>{s.label}</NativeSelectOption>)}
        </NativeSelect>
      </Label>
      <Button type="submit" disabled={pending}><Plus aria-hidden /> {t("create")}</Button>
    </form>
  );
}

type TrackRow = { side: string; numberId: string; title: string };

export function RecordingEditor({ recording, spex, media }: { recording: RecordingEditData; spex: SpexOption[]; media: EditKind[] }) {
  const t = useTranslations("ManageRecordings");
  const router = useRouter();
  const { confirm } = useDialogs();
  const { save, pending } = useSave();
  const [values, setValues] = useState({
    catalogueNumber: recording.catalogueNumber,
    title: recording.title,
    mediumId: recording.medium.id,
    spexId: recording.spex?.id ?? "",
    released: recording.released ?? "",
    recorded: recording.recorded ?? "",
    description: recording.description ?? "",
    spexifyAlbumId: recording.spexifyAlbumId ?? "",
  });
  const [conductor, setConductor] = useState<CreditValue[]>(recording.conductor ? [toCreditValue(recording.conductor)] : []);
  const [tracks, setTracks] = useState<TrackRow[]>(recording.tracks.map(track => ({ side: track.side ?? "", numberId: track.number?.id ?? "", title: track.number ? "" : track.title })));
  const [paste, setPaste] = useState("");
  const numbers = recording.spex?.numbers ?? [];

  const input = (front: string | null | undefined, back: string | null | undefined) => ({
    catalogueNumber: values.catalogueNumber.trim(),
    title: values.title.trim(),
    mediumId: values.mediumId,
    spexId: values.spexId || null,
    released: values.released || null,
    recorded: values.recorded || null,
    description: values.description.trim() || null,
    spexifyAlbumId: values.spexifyAlbumId.trim() || null,
    conductor: conductor[0] ? toCreditInput(conductor[0]) : null,
    frontImageId: front ?? null,
    backImageId: back ?? null,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
        <p className="text-sm">{recording.published ? t("published") : t("unpublishedText")}</p>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => save(() => setRecordingPublishedAction(recording.id, !recording.published))}>
            {recording.published ? <EyeOff aria-hidden /> : <Eye aria-hidden />} {recording.published ? t("unpublish") : t("publish")}
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={async () => {
            if (await confirm({ title: t("deleteTitle"), description: t("deleteText"), confirmLabel: t("delete"), destructive: true })) {
              void save(() => deleteRecordingAction(recording.id), { then: () => router.push("/manage/recordings") });
            }
          }}><Trash2 aria-hidden /> {t("delete")}</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[22rem_1fr]">
        <div className="grid grid-cols-2 gap-4">
          <ImageSlot label={t("front")} kind="COVER" image={recording.front} onChange={id => save(() => saveRecordingAction(recording.id, input(id, recording.back?.id)))} />
          <ImageSlot label={t("back")} kind="COVER" image={recording.back} onChange={id => save(() => saveRecordingAction(recording.id, input(recording.front?.id, id)))} />
        </div>
        <form className="space-y-4" onSubmit={event => {
          event.preventDefault();
          void save(() => saveRecordingAction(recording.id, input(recording.front?.id, recording.back?.id)));
        }}>
          <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
            <Label className="flex-col items-start">{t("catalogueNumber")}<Input required value={values.catalogueNumber} onChange={event => setValues({ ...values, catalogueNumber: event.target.value })} /></Label>
            <Label className="flex-col items-start">{t("recordingTitle")}<Input required value={values.title} onChange={event => setValues({ ...values, title: event.target.value })} /></Label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Label className="flex-col items-start">{t("medium")}
              <NativeSelect value={values.mediumId} onChange={event => setValues({ ...values, mediumId: event.target.value })}>
                {offeredKinds(media, recording.medium.id).map(medium => <NativeSelectOption key={medium.id} value={medium.id}>{medium.name}</NativeSelectOption>)}
              </NativeSelect>
            </Label>
            <Label className="flex-col items-start">{t("spex")}
              <NativeSelect value={values.spexId} onChange={event => setValues({ ...values, spexId: event.target.value })}>
                <NativeSelectOption value="">{t("compilation")}</NativeSelectOption>
                {spex.map(s => <NativeSelectOption key={s.id} value={s.id}>{s.label}</NativeSelectOption>)}
              </NativeSelect>
            </Label>
            <Label className="flex-col items-start">{t("released")}<Input pattern={DATE} placeholder="1984-05" value={values.released} onChange={event => setValues({ ...values, released: event.target.value })} /></Label>
            <Label className="flex-col items-start">{t("recorded")}<Input pattern={DATE} placeholder="1984" value={values.recorded} onChange={event => setValues({ ...values, recorded: event.target.value })} /></Label>
          </div>
          <CreditPicker label={t("conductor")} value={conductor} onChange={setConductor} single />
          <Label className="flex-col items-start">{t("description")}<Textarea rows={4} value={values.description} onChange={event => setValues({ ...values, description: event.target.value })} /></Label>
          <Label className="flex-col items-start">{t("spexifyAlbumId")}<Input value={values.spexifyAlbumId} onChange={event => setValues({ ...values, spexifyAlbumId: event.target.value })} placeholder="00000000-0000-0000-0000-000000000000" /></Label>
          <Button type="submit" disabled={pending}><Save aria-hidden /> {t("save")}</Button>
        </form>
      </div>

      <section className="space-y-3" aria-labelledby="tracks-heading">
        <h2 id="tracks-heading" className="wiki-heading text-xl font-semibold">{t("tracks")}</h2>
        <ol className="space-y-2">
          {tracks.map((track, index) => (
            <li key={index} className="flex flex-wrap items-center gap-2">
              <span className="w-6 text-sm text-muted-foreground">{index + 1}</span>
              <Input aria-label={t("side")} placeholder={t("side")} className="w-16" value={track.side} onChange={event => setTracks(tracks.map((other, i) => i === index ? { ...other, side: event.target.value } : other))} />
              {numbers.length > 0 && (
                <NativeSelect aria-label={t("number")} value={track.numberId} onChange={event => setTracks(tracks.map((other, i) => i === index ? { ...other, numberId: event.target.value } : other))}>
                  <NativeSelectOption value="">{t("freeTitle")}</NativeSelectOption>
                  {numbers.map(number => <NativeSelectOption key={number.id} value={number.id}>{number.act}:{number.position} {number.title}</NativeSelectOption>)}
                </NativeSelect>
              )}
              {!track.numberId && <Input aria-label={t("trackTitle")} placeholder={t("trackTitle")} className="min-w-48 flex-1" value={track.title} onChange={event => setTracks(tracks.map((other, i) => i === index ? { ...other, title: event.target.value } : other))} />}
              <Button type="button" size="icon" variant="ghost" aria-label={t("removeTrack")} onClick={() => setTracks(tracks.filter((_, i) => i !== index))}><Trash2 /></Button>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setTracks([...tracks, { side: tracks.at(-1)?.side ?? "", numberId: "", title: "" }])}><Plus aria-hidden /> {t("addTrack")}</Button>
          <Button type="button" size="sm" disabled={pending} onClick={() => save(() => setTracksAction(recording.id, tracks.map(track => ({
            side: track.side.trim() || null, numberId: track.numberId || null, title: track.numberId ? null : track.title.trim() || null,
          }))))}><Save aria-hidden /> {t("saveTracks")}</Button>
        </div>
        <div className="space-y-2">
          <Textarea rows={4} aria-label={t("pasteTracks")} placeholder={t("pasteTracksHelp")} value={paste} onChange={event => setPaste(event.target.value)} className="font-mono text-sm" />
          <Button type="button" size="sm" variant="outline" disabled={pending || !paste.trim()} onClick={() => save(() => pasteTracksAction(recording.id, paste), { then: () => setPaste("") })}>
            <ClipboardPaste aria-hidden /> {t("pasteTracks")}
          </Button>
        </div>
      </section>
    </div>
  );
}
