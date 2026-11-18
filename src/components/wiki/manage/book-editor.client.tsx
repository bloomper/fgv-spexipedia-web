"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Eye, EyeOff, ListPlus, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ImageSlot } from "@/components/wiki/editor/image-slot.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@/components/dialogs.client";
import { useServerState } from "@/hooks/use-server-state.client";
import {
  deleteBookAction,
  saveBookAction,
  setBookPublishedAction,
  setBookSongsAction,
  spexNumbersAction,
} from "@/app/(app)/manage/actions.server";
import type { BookEditData, EditKind } from "@/lib/wiki/edit.server";
import { defaultKindId, offeredKinds } from "@/utils/kinds";

const DATE = "\\d{4}(-\\d{2}(-\\d{2})?)?";

type SpexOption = { id: string; label: string };

/**
 * A new book: its title and volume; the rest is edited on its own page.
 */
export function NewBookForm({ kinds }: { kinds: EditKind[] }) {
  const t = useTranslations("ManageBooks");
  const router = useRouter();
  const { save, pending } = useSave();
  const [values, setValues] = useState({ title: "", kindId: defaultKindId(kinds) ?? "", volume: "" });

  return (
    <form className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3" onSubmit={event => {
      event.preventDefault();
      void save(() => saveBookAction(null, { title: values.title.trim(), kindId: values.kindId || null, volume: values.volume ? Number(values.volume) : null }),
        { then: saved => router.push(`/manage/books/${saved.id}`) });
    }}>
      <Label className="flex-1 flex-col items-start">{t("bookTitle")}<Input required placeholder="Chalmersspex III" value={values.title} onChange={event => setValues({ ...values, title: event.target.value })} /></Label>
      <Label className="flex-col items-start">{t("kind")}
        <NativeSelect required value={values.kindId} onChange={event => setValues({ ...values, kindId: event.target.value })}>
          {offeredKinds(kinds).map(kind => <NativeSelectOption key={kind.id} value={kind.id}>{kind.name}</NativeSelectOption>)}
        </NativeSelect>
      </Label>
      <Label className="flex-col items-start">{t("volume")}<Input type="number" min={1} max={999} className="w-24" value={values.volume} onChange={event => setValues({ ...values, volume: event.target.value })} /></Label>
      <Button type="submit" disabled={pending}><Plus aria-hidden /> {t("create")}</Button>
    </form>
  );
}

/** A song as edited: a number (with its label) or a free title. */
type SongRow = { key: string; numberId: string | null; label: string; title: string; textOnly: boolean };

let rowKey = 0;
const nextKey = () => `song-${++rowKey}`;

/**
 * Editing a book: title, volume, year, description and cover, publishing, and its songs in the book's order.
 * Songs are added from a spex's numbers (pick a spex, then the numbers) or as free titles, moved and marked as having
 * only the words.
 */
export function BookEditor({ book, kinds, spex }: { book: BookEditData; kinds: EditKind[]; spex: SpexOption[] }) {
  const t = useTranslations("ManageBooks");
  const router = useRouter();
  const { confirm } = useDialogs();
  const { save, pending } = useSave();
  const [values, setValues] = useServerState({
    title: book.title,
    kindId: book.kind.id,
    volume: book.volume?.toString() ?? "",
    publishedYear: book.publishedYear ?? "",
    description: book.description ?? "",
  }, value => JSON.stringify(value));
  const [songs, setSongs] = useServerState<SongRow[]>(book.songs.map(song => ({
    key: song.id,
    numberId: song.number?.id ?? null,
    label: song.number ? `${song.number.spex.year} ${song.number.spex.title} · ${song.number.act}:${song.number.position}` : "",
    title: song.title,
    textOnly: song.textOnly,
  })), rows => JSON.stringify(rows));
  const [pickSpex, setPickSpex] = useState("");
  const [numbers, setNumbers] = useState<{ spex: string; list: { id: string; act: number; position: number; title: string }[] } | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const input = (cover: string | null | undefined) => ({
    title: values.title.trim(),
    kindId: values.kindId,
    volume: values.volume ? Number(values.volume) : null,
    publishedYear: values.publishedYear || null,
    description: values.description.trim() || null,
    coverImageId: cover ?? null,
  });

  const move = (index: number, by: number) => {
    const next = [...songs];
    const [song] = next.splice(index, 1);

    next.splice(index + by, 0, song);
    setSongs(next);
  };

  const addPicked = () => {
    if (!numbers) {
      return;
    }

    const inBook = new Set(songs.map(song => song.numberId));

    setSongs([...songs, ...numbers.list.filter(number => picked.has(number.id) && !inBook.has(number.id)).map(number => ({
      key: nextKey(), numberId: number.id, label: `${numbers.spex} · ${number.act}:${number.position}`, title: number.title, textOnly: false,
    }))]);
    setPicked(new Set());
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
        <p className="text-sm">{book.published ? t("published") : t("unpublishedText")}</p>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => save(() => setBookPublishedAction(book.id, !book.published))}>
            {book.published ? <EyeOff aria-hidden /> : <Eye aria-hidden />} {book.published ? t("unpublish") : t("publish")}
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={async () => {
            if (await confirm({ title: t("deleteTitle"), description: t("deleteText"), confirmLabel: t("delete"), destructive: true })) {
              void save(() => deleteBookAction(book.id), { then: () => router.push("/manage/books") });
            }
          }}><Trash2 aria-hidden /> {t("delete")}</Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
        <ImageSlot label={t("cover")} kind="COVER" image={book.cover} onChange={id => save(() => saveBookAction(book.id, input(id)))} />
        <form className="space-y-4" onSubmit={event => {
          event.preventDefault();
          void save(() => saveBookAction(book.id, input(book.cover?.id)));
        }}>
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem_6rem_8rem]">
            <Label className="flex-col items-start">{t("bookTitle")}<Input required value={values.title} onChange={event => setValues({ ...values, title: event.target.value })} /></Label>
            <Label className="flex-col items-start">{t("kind")}
              <NativeSelect value={values.kindId} onChange={event => setValues({ ...values, kindId: event.target.value })}>
                {offeredKinds(kinds, book.kind.id).map(kind => <NativeSelectOption key={kind.id} value={kind.id}>{kind.name}</NativeSelectOption>)}
              </NativeSelect>
            </Label>
            <Label className="flex-col items-start">{t("volume")}<Input type="number" min={1} max={999} value={values.volume} onChange={event => setValues({ ...values, volume: event.target.value })} /></Label>
            <Label className="flex-col items-start">{t("publishedYear")}<Input pattern={DATE} placeholder="1990" value={values.publishedYear} onChange={event => setValues({ ...values, publishedYear: event.target.value })} /></Label>
          </div>
          <Label className="flex-col items-start">{t("description")}<Textarea rows={4} value={values.description} onChange={event => setValues({ ...values, description: event.target.value })} /></Label>
          <Button type="submit" disabled={pending}><Save aria-hidden /> {t("save")}</Button>
        </form>
      </div>

      <section className="space-y-3" aria-labelledby="songs-heading">
        <h2 id="songs-heading" className="wiki-heading text-xl font-semibold">{t("songs")}</h2>
        {songs.length === 0 && <p className="text-sm text-muted-foreground">{t("noSongs")}</p>}
        <ol className="space-y-1">
          {songs.map((song, index) => (
            <li key={song.key} className="flex flex-wrap items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent/50">
              <span className="w-8 text-sm text-muted-foreground">{index + 1}</span>
              {song.numberId
                ? <span className="min-w-48 flex-1 text-sm"><span className="font-medium">{song.title}</span> <span className="text-xs text-muted-foreground">{song.label}</span></span>
                : <Input aria-label={t("songTitle")} placeholder={t("songTitle")} className="min-w-48 flex-1" value={song.title}
                         onChange={event => setSongs(songs.map(other => other.key === song.key ? { ...other, title: event.target.value } : other))} />}
              <Label className="text-xs font-normal">
                <Checkbox checked={song.textOnly} onCheckedChange={checked => setSongs(songs.map(other => other.key === song.key ? { ...other, textOnly: checked === true } : other))} />
                {t("textOnly")}
              </Label>
              <Button type="button" size="icon" variant="ghost" aria-label={t("moveUp")} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button>
              <Button type="button" size="icon" variant="ghost" aria-label={t("moveDown")} disabled={index === songs.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button>
              <Button type="button" size="icon" variant="ghost" aria-label={t("removeSong")} onClick={() => setSongs(songs.filter(other => other.key !== song.key))}><Trash2 /></Button>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setSongs([...songs, { key: nextKey(), numberId: null, label: "", title: "", textOnly: false }])}>
            <Plus aria-hidden /> {t("addFreeSong")}
          </Button>
          <Button type="button" size="sm" disabled={pending} onClick={() => save(() => setBookSongsAction(book.id, songs.map(song => ({
            numberId: song.numberId, title: song.numberId ? null : song.title.trim() || null, textOnly: song.textOnly,
          }))))}><Save aria-hidden /> {t("saveSongs")}</Button>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-3">
          <h3 className="text-sm font-semibold">{t("addFromSpex")}</h3>
          <div className="flex flex-wrap items-end gap-2">
            <Label className="flex-col items-start">{t("spex")}
              <NativeSelect value={pickSpex} onChange={event => {
                const id = event.target.value;

                setPickSpex(id);
                setPicked(new Set());
                setNumbers(null);
                if (id) {
                  void save(() => spexNumbersAction(id), {
                    success: false,
                    then: data => setNumbers(data ? { spex: `${data.year} ${data.title}`, list: data.numbers } : null),
                  });
                }
              }}>
                <NativeSelectOption value="">{t("chooseSpex")}</NativeSelectOption>
                {spex.map(s => <NativeSelectOption key={s.id} value={s.id}>{s.label}</NativeSelectOption>)}
              </NativeSelect>
            </Label>
            {numbers && numbers.list.length > 0 && (
              <>
                <Button type="button" size="sm" variant="ghost" onClick={() => setPicked(new Set(numbers.list.map(number => number.id)))}>{t("pickAll")}</Button>
                <Button type="button" size="sm" variant="outline" disabled={picked.size === 0} onClick={addPicked}><ListPlus aria-hidden /> {t("addPicked", { count: picked.size })}</Button>
              </>
            )}
          </div>
          {numbers && (numbers.list.length === 0
            ? <p className="text-sm text-muted-foreground">{t("noNumbers")}</p>
            : (
              <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {numbers.list.map(number => (
                  <li key={number.id}>
                    <Label className="text-sm font-normal">
                      <Checkbox checked={picked.has(number.id)} onCheckedChange={checked => {
                        const next = new Set(picked);

                        if (checked === true) {
                          next.add(number.id);
                        } else {
                          next.delete(number.id);
                        }
                        setPicked(next);
                      }} />
                      <span className="text-muted-foreground">{number.act}:{number.position}</span> {number.title}
                    </Label>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </section>
    </div>
  );
}
