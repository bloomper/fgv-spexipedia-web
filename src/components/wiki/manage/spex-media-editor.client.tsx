"use client";

import { useTranslations } from "next-intl";
import { ImageListEditor } from "@/components/wiki/editor/image-list-editor.client";
import { ImageSlot } from "@/components/wiki/editor/image-slot.client";
import { PhotoPicker } from "@/components/wiki/editor/photo-picker.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { setPageImagesAction, setPagePhotosAction, setRebusAction } from "@/app/(app)/manage/actions.server";
import type { SpexEditData } from "@/lib/wiki/edit.server";

const SECTIONS = [
  ["BACKDROP", "backdrop", "SCENOGRAPHY"],
  ["STAGE", "stage", "SCENOGRAPHY"],
  ["PROPS", "props", "SCENOGRAPHY"],
  ["VEST", "vest", "VEST"],
  ["OTHER", "other", "OTHER"],
] as const;

/**
 * The page's own images by section, the rebus and its solution, and the photos from Spexgram, for authors.
 */
export function SpexMediaEditor({ spex }: { spex: SpexEditData }) {
  const t = useTranslations("Manage");
  const { save } = useSave();
  const page = spex.page;

  return (
    <div className="space-y-8">
      {SECTIONS.map(([section, field, kind]) => (
        <ImageListEditor key={section} title={t(`sections.${section}`)} uploadKind={kind}
                         images={page?.[field] ?? []}
                         onSave={images => save(() => setPageImagesAction(spex.id, section, images))} />
      ))}
      <div className="grid gap-6 sm:grid-cols-2 lg:max-w-xl">
        <ImageSlot label={t("rebus")} kind="REBUS" image={page?.rebus}
                   onChange={imageId => save(() => setRebusAction(spex.id, imageId, page?.rebusSolution?.id ?? null))} />
        <ImageSlot label={t("rebusSolution")} kind="REBUS" image={page?.rebusSolution}
                   onChange={imageId => save(() => setRebusAction(spex.id, page?.rebus?.id ?? null, imageId))} />
      </div>
      <PhotoPicker title={t("groupPhotos")} spexId={spex.id} chosen={page?.groupPhotos.itemIds ?? []}
                   onSave={itemIds => save(() => setPagePhotosAction(spex.id, "GROUP", null, itemIds))} />
      <PhotoPicker title={t("boardPhotos")} spexId={spex.id} chosen={page?.boardPhotos.itemIds ?? []}
                   onSave={itemIds => save(() => setPagePhotosAction(spex.id, "BOARD", null, itemIds))} />
    </div>
  );
}
