"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImagePlus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { WikiImage, type WikiImageData } from "@/components/wiki/wiki-image";
import { ACCEPTED_IMAGES, uploadImage } from "@/components/wiki/editor/upload.client";
import { useServerState } from "@/hooks/use-server-state.client";
import { cn } from "@/utils/utils";
import type { ImageKind, ImageRefInput } from "@/gql/graphql";

export type PlacedImage = { image: WikiImageData; kind?: string | null; caption?: string | null };
export type ImageRef = ImageRefInput;

/**
 * The images of a section (or a character), in order, with captions: drop files to upload them, reorder by dragging
 * or with the arrows, remove; saved together. Images must not show identifiable people: those belong in Spexgram.
 */
export function ImageListEditor({ title, images, uploadKind, kinds, onSave, disabled }: {
  title: string;
  images: PlacedImage[];
  /** The kind uploads get, e.g. SCENOGRAPHY. */
  uploadKind: string;
  /** Kinds to choose from per image, e.g. a character's sketch, make-up and costume. */
  kinds?: string[];
  onSave: (images: ImageRef[]) => Promise<boolean>;
  disabled?: boolean;
}) {
  const t = useTranslations("Manage");
  const tk = useTranslations("SpexPage.imageKinds");
  const [list, setList] = useServerState(images, value => JSON.stringify(value.map(item => [item.image.id, item.kind, item.caption])));
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [dragged, setDragged] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const change = (next: PlacedImage[]) => {
    setList(next);
    setDirty(true);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) {
      return;
    }
    const next = [...list];
    const [item] = next.splice(from, 1);

    next.splice(to, 0, item);
    change(next);
  };
  const upload = async (files: FileList | null) => {
    const chosen = Array.from(files ?? []);

    setUploading(count => count + chosen.length);
    const added: PlacedImage[] = [];

    for (const file of chosen) {
      try {
        const image = await uploadImage(file, uploadKind);

        added.push({ image, kind: kinds?.[0] ?? null, caption: null });
      } catch (error) {
        toast.error(t("uploadFailed", { message: `${file.name}: ${(error as Error).message}` }));
      } finally {
        setUploading(count => count - 1);
      }
    }
    if (added.length > 0) {
      setList(current => [...current, ...added]);
      setDirty(true);
    }
  };

  return (
    <div className="space-y-3"
         onDragOver={event => event.dataTransfer.types.includes("Files") && event.preventDefault()}
         onDrop={event => {
           if (event.dataTransfer.files.length > 0) {
             event.preventDefault();
             void upload(event.dataTransfer.files);
           }
         }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => input.current?.click()}>
            {uploading > 0 ? <Spinner /> : <ImagePlus aria-hidden />} {t("addImages")}
          </Button>
          <Button type="button" size="sm" disabled={disabled || !dirty || uploading > 0} onClick={async () => {
            if (await onSave(list.map(item => ({ imageId: item.image.id, kind: (item.kind ?? null) as ImageKind | null, caption: item.caption?.trim() || null })))) {
              setDirty(false);
            }
          }}><Save aria-hidden /> {t("save")}</Button>
        </div>
      </div>
      {list.length === 0 && <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{t("dropImages")}</p>}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item, index) => (
          <li key={`${item.image.id}-${index}`} draggable
              onDragStart={() => setDragged(index)}
              onDragOver={event => dragged !== null && event.preventDefault()}
              onDrop={event => {
                if (dragged !== null) {
                  event.preventDefault();
                  move(dragged, index);
                  setDragged(null);
                }
              }}
              className={cn("space-y-2 rounded-lg border border-border bg-card p-2", dragged === index && "opacity-50")}>
            <WikiImage image={item.image} sizes="20rem" className="aspect-[4/3] w-full cursor-grab rounded object-cover" />
            {kinds && (
              <NativeSelect aria-label={t("kind")} value={item.kind ?? ""} onChange={event => change(list.map((other, i) => i === index ? { ...other, kind: event.target.value } : other))}>
                {kinds.map(kind => <NativeSelectOption key={kind} value={kind}>{tk(kind)}</NativeSelectOption>)}
              </NativeSelect>
            )}
            <Input aria-label={t("caption")} placeholder={t("caption")} value={item.caption ?? ""}
                   onChange={event => change(list.map((other, i) => i === index ? { ...other, caption: event.target.value } : other))} />
            <div className="flex justify-between">
              <div className="flex">
                <Button type="button" size="icon" variant="ghost" aria-label={t("moveUp")} disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp /></Button>
                <Button type="button" size="icon" variant="ghost" aria-label={t("moveDown")} disabled={index === list.length - 1} onClick={() => move(index, index + 1)}><ArrowDown /></Button>
              </div>
              <Button type="button" size="icon" variant="ghost" aria-label={t("remove")} onClick={() => change(list.filter((_, i) => i !== index))}><Trash2 /></Button>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">{t("noPeople")}</p>
      <input ref={input} type="file" multiple accept={ACCEPTED_IMAGES} hidden onChange={event => {
        void upload(event.target.files);
        event.target.value = "";
      }} />
    </div>
  );
}
