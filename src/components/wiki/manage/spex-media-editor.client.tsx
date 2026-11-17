"use client";

import { useTranslations } from "next-intl";
import { ImageListEditor } from "@/components/wiki/editor/image-list-editor.client";
import { ImageSlot } from "@/components/wiki/editor/image-slot.client";
import { PhotoPicker } from "@/components/wiki/editor/photo-picker.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { setPageImagesAction, setPagePhotosAction, setRebusAction } from "@/app/(app)/manage/actions.server";
import type { EditKind, EditKinds, SpexEditData } from "@/lib/wiki/edit.server";
import type { ImageSection } from "@/gql/graphql";
import { imagesByKind } from "@/utils/kinds";

type PageImage = NonNullable<SpexEditData["page"]>["vest"][number];

/**
 * The page's own images, the rebus and its solution, and the photos from Spexgram, for authors. Scenography and other
 * images are kept per image kind of their use (spec 4.6): one list per kind in use, and per retired kind that still
 * has images.
 */
export function SpexMediaEditor({ spex, kinds }: { spex: SpexEditData; kinds: Pick<EditKinds, "scenographyImageKinds" | "pageImageKinds"> }) {
  const t = useTranslations("Manage");
  const { save } = useSave();
  const page = spex.page;
  const perKind = (section: ImageSection, images: PageImage[], sectionKinds: EditKind[]) =>
    imagesByKind(images, sectionKinds.filter(kind => !kind.retired || images.some(image => image.kind?.id === kind.id)), true)
      .filter(group => group.kind)
      .map(group => (
        <ImageListEditor key={`${section}-${group.kind!.id}`} title={`${t(`sections.${section}`)}: ${group.kind!.name}`}
                         uploadKind={section === "SCENOGRAPHY" ? "SCENOGRAPHY" : "OTHER"} images={group.images}
                         onSave={images => save(() => setPageImagesAction(spex.id, section, group.kind!.id, images))} />
      ));

  return (
    <div className="space-y-8">
      {perKind("SCENOGRAPHY", page?.scenography ?? [], kinds.scenographyImageKinds)}
      <ImageListEditor title={t("sections.VEST")} uploadKind="VEST" images={page?.vest ?? []}
                       onSave={images => save(() => setPageImagesAction(spex.id, "VEST", null, images))} />
      {perKind("OTHER", page?.other ?? [], kinds.pageImageKinds)}
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
