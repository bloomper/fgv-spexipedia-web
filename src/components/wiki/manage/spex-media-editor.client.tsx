"use client";

import { useTranslations } from "next-intl";
import { ImageListEditor } from "@/components/wiki/editor/image-list-editor.client";
import { ImageSlot } from "@/components/wiki/editor/image-slot.client";
import { PhotoPicker } from "@/components/wiki/editor/photo-picker.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { setPageImagesAction, setPagePhotosAction, setRebusAction } from "@/app/(app)/manage/actions.server";
import type { EditKind, EditSection, SectionKind, SpexEditData } from "@/lib/wiki/edit.server";
import { imagesByKind } from "@/utils/kinds";

/**
 * The page's own images, the rebus and its solution, and the photos from Spexgram, for authors. Each image section
 * (spec 4.2) keeps its images per image kind of its own (4.6): one list per kind in use, and per retired kind that still
 * has images; the vest has one list. Image sections the spex hides are edited here all the same.
 */
export function SpexMediaEditor({ spex, sectionKinds }: { spex: SpexEditData; sectionKinds: SectionKind[] }) {
  const t = useTranslations("Manage");
  const { save } = useSave();
  const page = spex.page;
  const sections = spex.sections.filter(section => section.content === "IMAGES" || section.content === "VEST");
  const imageKinds = (section: EditSection): EditKind[] => sectionKinds.find(kind => kind.id === section.kind.id)?.imageKinds ?? [];
  const perKind = (section: EditSection) =>
    imagesByKind(section.images, imageKinds(section).filter(kind => !kind.retired || section.images.some(image => image.kind?.id === kind.id)), true)
      .filter(group => group.kind)
      .map(group => (
        <ImageListEditor key={`${section.kind.id}-${group.kind!.id}`}
                         title={imageKinds(section).length > 1 || group.kind!.name !== section.kind.name ? `${section.kind.name}: ${group.kind!.name}` : section.kind.name}
                         uploadKind="SECTION" images={group.images}
                         onSave={images => save(() => setPageImagesAction(spex.id, section.kind.id, group.kind!.id, images))} />
      ));

  return (
    <div className="space-y-8">
      {sections.map(section => section.content === "VEST" ? (
        <ImageListEditor key={section.kind.id} title={section.kind.name} uploadKind="SECTION" images={section.images}
                         onSave={images => save(() => setPageImagesAction(spex.id, section.kind.id, null, images))} />
      ) : perKind(section))}
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
