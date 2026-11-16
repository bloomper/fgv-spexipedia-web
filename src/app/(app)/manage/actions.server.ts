"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, toActionResult } from "@/lib/graphql.server";
import * as edit from "@/lib/wiki/edit.server";
import { getSpexgramAlbums } from "@/lib/wiki/edit.server";
import { spexareSearch } from "@/lib/wiki/wiki.server";
import type {
  BaseDataKind,
  CharacterInput,
  FigureInput,
  ImageInput,
  ImageRefInput,
  ImageSection,
  NumberInput,
  OrderInput,
  PhotoSection,
  RecordingInput,
  RevivalChangeInput,
  RevivalChangeKind,
  SceneInput,
  SpexCategoryInput,
  SpexInput,
  SpexPageInput,
  TaskCategoryInput,
  TaskInput,
  TrackInput,
} from "@/gql/graphql";
import type { AuthzResult } from "@/types/auth";
import { withPolicyAction } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { ID } from "@/utils/ids";

/*
 * The editing pages' actions. Each is held to the role the server holds it to (AUTHOR for spex page texts, images and
 * photos; EDITOR for base data and the structured parts; ADMIN for retiring and merging), and refreshes the pages
 * that show what it changed. The whole site is revalidated, as a spex's change shows on the start page, its category,
 * its revivals and its figures.
 */

function requireIds(...ids: (string | null | undefined)[]) {
  if (ids.some(id => id != null && !ID.test(id))) {
    throw new Error("Invalid id");
  }
}

const run = <T, >(policy: () => Promise<AuthzResult>, work: () => Promise<T>) => withPolicyAction(policy, () => toActionResult(async () => {
  const result = await work();

  revalidatePath("/", "layout");
  return result;
}));

const author = <T, >(work: () => Promise<T>): Promise<ActionResult<T>> => run(Policies.author.requireAuthor, work);
const editor = <T, >(work: () => Promise<T>): Promise<ActionResult<T>> => run(Policies.editor.requireEditor, work);
const admin = <T, >(work: () => Promise<T>): Promise<ActionResult<T>> => run(Policies.admin.requireAdmin, work);

// Lookups for pickers ---------------------------------------------------------------------------------------------------

/** Published spexare by name, for credits: names need USER, which every author has. */
export async function searchSpexareAction(q: string): Promise<ActionResult<{ id: string | null; label: string }[]>> {
  return withPolicyAction(Policies.author.requireAuthor, () => toActionResult(async () => {
    if (q.trim().length < 2) {
      return [];
    }
    return (await spexareSearch(q.trim().slice(0, 100))).map(person => ({
      id: person.id ?? null,
      label: [person.name, person.nickname && `”${person.nickname}”`].filter(Boolean).join(" "),
    }));
  }));
}

/** The spex's albums in Spexgram with their items, for picking photos. */
export async function spexgramAlbumsAction(spexId: string) {
  requireIds(spexId);
  return withPolicyAction(Policies.author.requireAuthor, () => toActionResult(() => getSpexgramAlbums(spexId)));
}

// Base data -------------------------------------------------------------------------------------------------------------

export async function saveSpexCategoryAction(id: string | null, input: SpexCategoryInput, logoId: string | null | undefined) {
  requireIds(id, logoId);
  return editor(async () => {
    const saved = id ? (await edit.spexCategoryUpdate(id, input), { id }) : await edit.spexCategoryCreate(input);

    if (logoId !== undefined) {
      await edit.spexCategorySetLogo(saved.id, logoId);
    }
    return null;
  });
}

export async function saveSpexAction(id: string | null, input: SpexInput, posterId?: string | null) {
  requireIds(id, input.categoryId, posterId);
  return editor(async () => {
    const saved = id ? { id, slug: (await edit.spexUpdate(id, input))!.spexUpdate.slug } : await edit.spexCreate(input);

    if (posterId !== undefined) {
      await edit.spexSetPoster(saved.id, posterId);
    }
    return saved;
  });
}

export async function createRevivalAction(parentId: string, year: string) {
  requireIds(parentId);
  return editor(() => edit.spexRevivalCreate(parentId, year));
}

export async function saveTaskCategoryAction(id: string | null, input: TaskCategoryInput) {
  requireIds(id);
  return editor(async () => {
    await (id ? edit.taskCategoryUpdate(id, input) : edit.taskCategoryCreate(input));
    return null;
  });
}

export async function saveTaskAction(id: string | null, input: TaskInput) {
  requireIds(id, input.categoryId);
  return editor(async () => {
    await (id ? edit.taskUpdate(id, input) : edit.taskCreate(input));
    return null;
  });
}

export async function saveFigureAction(id: string | null, input: FigureInput) {
  requireIds(id);
  return editor(async () => {
    await (id ? edit.figureUpdate(id, input) : edit.figureCreate(input));
    return null;
  });
}

export async function deleteFigureAction(id: string) {
  requireIds(id);
  return editor(async () => (await edit.figureDelete(id), null));
}

export async function retireAction(kind: BaseDataKind, id: string, retired: boolean) {
  requireIds(id);
  return admin(async () => (await edit.baseDataRetire(kind, id, retired), null));
}

export async function mergeAction(kind: BaseDataKind, id: string, intoId: string) {
  requireIds(id, intoId);
  return admin(async () => (await edit.baseDataMerge(kind, id, intoId), null));
}

// Spex pages ------------------------------------------------------------------------------------------------------------

export async function savePageAction(spexId: string, input: SpexPageInput) {
  requireIds(spexId);
  return author(async () => (await edit.spexPageUpdate(spexId, input), null));
}

export async function setPageImagesAction(spexId: string, section: ImageSection, images: ImageRefInput[]) {
  requireIds(spexId, ...images.map(image => image.imageId));
  return author(async () => (await edit.spexPageSetImages(spexId, section, images), null));
}

export async function setPagePhotosAction(spexId: string, section: PhotoSection, characterId: string | null, itemIds: string[]) {
  requireIds(spexId, characterId, ...itemIds);
  return author(async () => (await edit.spexPageSetPhotos(spexId, section, characterId, itemIds), null));
}

export async function setRebusAction(spexId: string, rebusImageId: string | null, solutionImageId: string | null) {
  requireIds(spexId, rebusImageId, solutionImageId);
  return author(async () => (await edit.spexPageSetRebus(spexId, rebusImageId, solutionImageId), null));
}

export async function setPagePublishedAction(spexId: string, published: boolean) {
  requireIds(spexId);
  return author(async () => (await edit.spexPageSetPublished(spexId, published), null));
}

export async function saveCharacterAction(spexId: string, id: string | null, input: CharacterInput) {
  requireIds(spexId, id, input.figureId);
  return editor(async () => (await (id ? edit.characterUpdate(id, input) : edit.characterCreate(spexId, input)), null));
}

export async function deleteCharacterAction(id: string) {
  requireIds(id);
  return editor(async () => (await edit.characterDelete(id), null));
}

export async function pasteCharactersAction(spexId: string, text: string) {
  requireIds(spexId);
  return editor(async () => (await edit.charactersPaste(spexId, text.slice(0, 20_000)), null));
}

export async function reorderCharactersAction(spexId: string, ids: string[]) {
  requireIds(spexId, ...ids);
  return editor(async () => (await edit.charactersReorder(spexId, ids), null));
}

export async function setCharacterImagesAction(id: string, images: ImageRefInput[]) {
  requireIds(id, ...images.map(image => image.imageId));
  return author(async () => (await edit.characterSetImages(id, images), null));
}

export async function saveSceneAction(spexId: string, id: string | null, input: SceneInput) {
  requireIds(spexId, id);
  return editor(async () => (await (id ? edit.sceneUpdate(id, input) : edit.sceneCreate(spexId, input)), null));
}

export async function deleteSceneAction(id: string) {
  requireIds(id);
  return editor(async () => (await edit.sceneDelete(id), null));
}

export async function pasteScenesAction(spexId: string, text: string) {
  requireIds(spexId);
  return editor(async () => (await edit.scenesPaste(spexId, text.slice(0, 20_000)), null));
}

export async function reorderScenesAction(spexId: string, items: OrderInput[]) {
  requireIds(spexId, ...items.map(item => item.id));
  return editor(async () => (await edit.scenesReorder(spexId, items), null));
}

export async function saveNumberAction(spexId: string, id: string | null, input: NumberInput) {
  requireIds(spexId, id, ...(input.characterIds ?? []));
  return editor(async () => (await (id ? edit.numberUpdate(id, input) : edit.numberCreate(spexId, input)), null));
}

export async function deleteNumberAction(id: string) {
  requireIds(id);
  return editor(async () => (await edit.numberDelete(id), null));
}

export async function pasteNumbersAction(spexId: string, text: string) {
  requireIds(spexId);
  return editor(async () => (await edit.numbersPaste(spexId, text.slice(0, 20_000)), null));
}

export async function reorderNumbersAction(spexId: string, items: OrderInput[]) {
  requireIds(spexId, ...items.map(item => item.id));
  return editor(async () => (await edit.numbersReorder(spexId, items), null));
}

export async function setRevivalChangesAction(revivalId: string, kind: RevivalChangeKind, changes: RevivalChangeInput[]) {
  requireIds(revivalId, ...changes.map(change => change.recordId));
  return editor(async () => (await edit.revivalSetChanges(revivalId, kind, changes), null));
}

// Recordings ------------------------------------------------------------------------------------------------------------

export async function saveRecordingAction(id: string | null, input: RecordingInput) {
  requireIds(id, input.spexId, input.frontImageId, input.backImageId, input.spexifyAlbumId);
  return editor(async () => id ? (await edit.recordingUpdate(id, input), { id }) : await edit.recordingCreate(input));
}

export async function setTracksAction(id: string, tracks: TrackInput[]) {
  requireIds(id, ...tracks.map(track => track.numberId));
  return editor(async () => (await edit.recordingSetTracks(id, tracks), null));
}

export async function pasteTracksAction(id: string, text: string) {
  requireIds(id);
  return editor(async () => (await edit.recordingPasteTracks(id, text.slice(0, 20_000)), null));
}

export async function setRecordingPublishedAction(id: string, published: boolean) {
  requireIds(id);
  return editor(async () => (await edit.recordingSetPublished(id, published), null));
}

export async function deleteRecordingAction(id: string) {
  requireIds(id);
  return editor(async () => (await edit.recordingDelete(id), null));
}

// Images and the trash ----------------------------------------------------------------------------------------------------

export async function updateImageAction(id: string, input: ImageInput) {
  requireIds(id);
  return author(async () => (await edit.imageUpdate(id, input), null));
}

export async function trashImageAction(id: string) {
  requireIds(id);
  return author(async () => (await edit.imageTrash(id), null));
}

export async function restoreImageAction(id: string) {
  requireIds(id);
  return author(async () => (await edit.imageRestore(id), null));
}

export async function restoreArticleAction(id: string) {
  requireIds(id);
  return author(async () => (await edit.articleRestoreFromTrash(id), null));
}

export async function emptyTrashAction() {
  return admin(() => edit.trashEmpty());
}

