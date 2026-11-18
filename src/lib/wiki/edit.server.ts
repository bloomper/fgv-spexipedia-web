import "server-only";

import { graphql } from "@/gql";
import { runMutation, runQuery } from "@/lib/graphql.server";
import type {
  ArticleCategoryInput,
  ArticleInput,
  BaseDataKind,
  CharacterInput,
  CreditInput,
  FactInput,
  ImageInput,
  ImageRefInput,
  ImageSection,
  NumberInput,
  OrderInput,
  PhotoSection,
  RecordingInput,
  BookInput,
  BookSongInput,
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

/*
 * What the editing pages read and change. The server checks every role; these only carry the calls.
 */

// Articles ------------------------------------------------------------------------------------------------------------

const ArticleCreate = graphql(`mutation ArticleCreate($input: ArticleInput!) { articleCreate(input: $input) { id slug } }`);
const ArticleUpdate = graphql(`
  mutation ArticleUpdate($id: ID!, $input: ArticleInput!, $baseRevisionId: ID) {
    articleUpdate(id: $id, input: $input, baseRevisionId: $baseRevisionId) { id slug }
  }
`);
const ArticleEditing = graphql(`mutation ArticleEditing($id: ID!) { articleEditing(id: $id) { id editingBy } }`);
const ArticleRestore = graphql(`mutation ArticleRestore($id: ID!, $revisionId: ID!) { articleRestore(id: $id, revisionId: $revisionId) { id slug } }`);
const ArticleSetPublished = graphql(`mutation ArticleSetPublished($id: ID!, $published: Boolean!) { articleSetPublished(id: $id, published: $published) { id } }`);
const ArticleTrash = graphql(`mutation ArticleTrash($id: ID!, $withChildren: Boolean!) { articleTrash(id: $id, withChildren: $withChildren) }`);
const ArticleMove = graphql(`mutation ArticleMove($id: ID!, $parentId: ID, $position: Int) { articleMove(id: $id, parentId: $parentId, position: $position) { id } }`);
const ArticleReorderChildren = graphql(`mutation ArticleReorderChildren($parentId: ID, $ids: [ID!]!) { articleReorderChildren(parentId: $parentId, ids: $ids) { id } }`);
const ArticleRestoreFromTrash = graphql(`mutation ArticleRestoreFromTrash($id: ID!) { articleRestoreFromTrash(id: $id) { id } }`);
const RevisionSetHidden = graphql(`mutation RevisionSetHidden($id: ID!, $hidden: Boolean!) { revisionSetHidden(id: $id, hidden: $hidden) { id } }`);
const ArticleCategoryCreate = graphql(`mutation ArticleCategoryCreate($input: ArticleCategoryInput!) { articleCategoryCreate(input: $input) { id } }`);
const ArticleCategoryUpdate = graphql(`mutation ArticleCategoryUpdate($id: ID!, $input: ArticleCategoryInput!) { articleCategoryUpdate(id: $id, input: $input) { id } }`);

export const articleCreate = async (input: ArticleInput) => (await runMutation(ArticleCreate, { input }))!.articleCreate;
export const articleUpdate = async (id: string, input: ArticleInput, baseRevisionId: string | null) =>
  (await runMutation(ArticleUpdate, { id, input, baseRevisionId }))!.articleUpdate;
export const articleEditing = async (id: string) => (await runMutation(ArticleEditing, { id }))?.articleEditing.editingBy ?? [];
export const articleRestore = async (id: string, revisionId: string) => (await runMutation(ArticleRestore, { id, revisionId }))!.articleRestore;
export const articleSetPublished = (id: string, published: boolean) => runMutation(ArticleSetPublished, { id, published });
export const articleTrash = (id: string, withChildren = false) => runMutation(ArticleTrash, { id, withChildren });
export const articleMove = (id: string, parentId: string | null, position: number | null = null) => runMutation(ArticleMove, { id, parentId, position });
export const articleReorderChildren = (parentId: string | null, ids: string[]) => runMutation(ArticleReorderChildren, { parentId, ids });
export const articleRestoreFromTrash = (id: string) => runMutation(ArticleRestoreFromTrash, { id });
export const revisionSetHidden = (id: string, hidden: boolean) => runMutation(RevisionSetHidden, { id, hidden });
export const articleCategoryCreate = (input: ArticleCategoryInput) => runMutation(ArticleCategoryCreate, { input });
export const articleCategoryUpdate = (id: string, input: ArticleCategoryInput) => runMutation(ArticleCategoryUpdate, { id, input });

// Base data -----------------------------------------------------------------------------------------------------------

const BaseDataQuery = graphql(`
  query BaseData {
    spexCategories(includeRetired: true) { id name firstYear description retired logo { ...ImageFields } }
    spexAll(includeRetired: true) { id slug year title revival retired published parent { id } category { id name } }
    taskCategories(includeRetired: true) { id name actorPresent instruments retired }
    tasks(includeRetired: true) { id name board retired category { id name } }
  }
`);

const SpexCategoryCreate = graphql(`mutation SpexCategoryCreate($input: SpexCategoryInput!) { spexCategoryCreate(input: $input) { id } }`);
const SpexCategoryUpdate = graphql(`mutation SpexCategoryUpdate($id: ID!, $input: SpexCategoryInput!) { spexCategoryUpdate(id: $id, input: $input) { id } }`);
const SpexCategorySetLogo = graphql(`mutation SpexCategorySetLogo($id: ID!, $imageId: ID) { spexCategorySetLogo(id: $id, imageId: $imageId) { id } }`);
const SpexCreate = graphql(`mutation SpexCreate($input: SpexInput!) { spexCreate(input: $input) { id slug } }`);
const SpexUpdate = graphql(`mutation SpexUpdate($id: ID!, $input: SpexInput!) { spexUpdate(id: $id, input: $input) { id slug } }`);
const SpexRevivalCreate = graphql(`mutation SpexRevivalCreate($parentId: ID!, $year: String!) { spexRevivalCreate(parentId: $parentId, year: $year) { id slug } }`);
const SpexSetPoster = graphql(`mutation SpexSetPoster($id: ID!, $imageId: ID) { spexSetPoster(id: $id, imageId: $imageId) { id } }`);
const TaskCategoryCreate = graphql(`mutation TaskCategoryCreate($input: TaskCategoryInput!) { taskCategoryCreate(input: $input) { id } }`);
const TaskCategoryUpdate = graphql(`mutation TaskCategoryUpdate($id: ID!, $input: TaskCategoryInput!) { taskCategoryUpdate(id: $id, input: $input) { id } }`);
const TaskCreate = graphql(`mutation TaskCreate($input: TaskInput!) { taskCreate(input: $input) { id } }`);
const TaskUpdate = graphql(`mutation TaskUpdate($id: ID!, $input: TaskInput!) { taskUpdate(id: $id, input: $input) { id } }`);
const BaseDataRetire = graphql(`mutation BaseDataRetire($kind: BaseDataKind!, $id: ID!, $retired: Boolean!) { baseDataRetire(kind: $kind, id: $id, retired: $retired) }`);
const BaseDataMerge = graphql(`mutation BaseDataMerge($kind: BaseDataKind!, $id: ID!, $intoId: ID!) { baseDataMerge(kind: $kind, id: $id, intoId: $intoId) }`);

export const getBaseData = async () => runQuery(BaseDataQuery, {});
export const spexCategoryCreate = async (input: SpexCategoryInput) => (await runMutation(SpexCategoryCreate, { input }))!.spexCategoryCreate;
export const spexCategoryUpdate = (id: string, input: SpexCategoryInput) => runMutation(SpexCategoryUpdate, { id, input });
export const spexCategorySetLogo = (id: string, imageId: string | null) => runMutation(SpexCategorySetLogo, { id, imageId });
export const spexCreate = async (input: SpexInput) => (await runMutation(SpexCreate, { input }))!.spexCreate;
export const spexUpdate = (id: string, input: SpexInput) => runMutation(SpexUpdate, { id, input });
export const spexRevivalCreate = async (parentId: string, year: string) => (await runMutation(SpexRevivalCreate, { parentId, year }))!.spexRevivalCreate;
export const spexSetPoster = (id: string, imageId: string | null) => runMutation(SpexSetPoster, { id, imageId });
export const taskCategoryCreate = async (input: TaskCategoryInput) => (await runMutation(TaskCategoryCreate, { input }))!.taskCategoryCreate;
export const taskCategoryUpdate = (id: string, input: TaskCategoryInput) => runMutation(TaskCategoryUpdate, { id, input });
export const taskCreate = async (input: TaskInput) => (await runMutation(TaskCreate, { input }))!.taskCreate;
export const taskUpdate = (id: string, input: TaskInput) => runMutation(TaskUpdate, { id, input });
export const baseDataRetire = (kind: BaseDataKind, id: string, retired: boolean) => runMutation(BaseDataRetire, { kind, id, retired });
export const baseDataMerge = (kind: BaseDataKind, id: string, intoId: string) => runMutation(BaseDataMerge, { kind, id, intoId });

// Spex pages ----------------------------------------------------------------------------------------------------------

graphql(`
  fragment EditCredit on Credit { name unresolved person { id nickname name } }
`);

graphql(`
  fragment EditKind on Kind { id name retired valueType }
`);

/** The kinds editors choose from (spec 4.6), retired ones included so that records keep showing theirs. */
const EditKindsQuery = graphql(`
  query EditKinds {
    numberKinds: kinds(type: NUMBER, includeRetired: true) { ...EditKind }
    creditKinds: kinds(type: CREDIT, includeRetired: true) { ...EditKind }
    factKinds: kinds(type: FACT, includeRetired: true) { ...EditKind }
    characterImageKinds: kinds(type: IMAGE, use: CHARACTER, includeRetired: true) { ...EditKind }
    scenographyImageKinds: kinds(type: IMAGE, use: SCENOGRAPHY, includeRetired: true) { ...EditKind }
    pageImageKinds: kinds(type: IMAGE, use: PAGE, includeRetired: true) { ...EditKind }
  }
`);

const MediaQuery = graphql(`
  query RecordingMedia { kinds(type: MEDIUM, includeRetired: true) { ...EditKind } }
`);

const BookKindsQuery = graphql(`
  query BookKinds { kinds(type: BOOK, includeRetired: true) { ...EditKind } }
`);

const SpexEditQuery = graphql(`
  query SpexEdit($id: ID!) {
    spex(id: $id) {
      id slug year title revival retired published
      category { id }
      revivals { id year retired }
      parent { id slug title year revivals { id year retired } characters { id name } scenes { id act position title } numbers { id act position title } }
      poster { ...ImageFields }
      revivalChanges { kind recordId cut act position }
      page {
        premiere introduction shortDescription description synopsis vestDescription published
        revisionIds { introduction description synopsis }
        facts { kind { id } value }
        vestWornBy { ...EditCredit }
        rebus { ...ImageFields }
        rebusSolution { ...ImageFields }
        scenography: images(section: SCENOGRAPHY) { ...PageImageFields }
        vest: images(section: VEST) { ...PageImageFields }
        other: images(section: OTHER) { ...PageImageFields }
        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }
        boardPhotos: photos(section: BOARD) { ...PhotoSetFields }
        history { ...RevisionFields }
      }
      characters { id name description position retired images { ...PageImageFields } photos { ...PhotoSetFields } spex { id } }
      scenes { id act position title place intervalAfter spex { id } }
      numbers {
        id act position title originalTitle originalArtist fromWork firstLine retired spex { id }
        kind { id }
        credits { kind { id } position credit { ...EditCredit } }
        characters { id }
      }
    }
  }
`);

const SpexgramAlbumsQuery = graphql(`
  query SpexgramAlbumsForPicking($spexId: ID!) {
    spexgramAlbums(spexId: $spexId) { id title url items { itemId caption thumbnailUrl previewUrl public video } }
  }
`);

const SpexPageUpdate = graphql(`mutation SpexPageUpdate($spexId: ID!, $input: SpexPageInput!) { spexPageUpdate(spexId: $spexId, input: $input) { published } }`);
const SpexPageSetImages = graphql(`mutation SpexPageSetImages($spexId: ID!, $section: ImageSection!, $kindId: ID, $images: [ImageRefInput!]!) { spexPageSetImages(spexId: $spexId, section: $section, kindId: $kindId, images: $images) { published } }`);
const SpexPageSetFacts = graphql(`mutation SpexPageSetFacts($spexId: ID!, $facts: [FactInput!]!) { spexPageSetFacts(spexId: $spexId, facts: $facts) { published } }`);
const SpexPageSetPhotos = graphql(`mutation SpexPageSetPhotos($spexId: ID!, $section: PhotoSection!, $characterId: ID, $itemIds: [ID!]!) { spexPageSetPhotos(spexId: $spexId, section: $section, characterId: $characterId, itemIds: $itemIds) { published } }`);
const SpexPageSetRebus = graphql(`mutation SpexPageSetRebus($spexId: ID!, $rebusImageId: ID, $solutionImageId: ID) { spexPageSetRebus(spexId: $spexId, rebusImageId: $rebusImageId, solutionImageId: $solutionImageId) { published } }`);
const SpexPageSetPublished = graphql(`mutation SpexPageSetPublished($spexId: ID!, $published: Boolean!) { spexPageSetPublished(spexId: $spexId, published: $published) { published } }`);
const CharacterCreate = graphql(`mutation CharacterCreate($spexId: ID!, $input: CharacterInput!) { characterCreate(spexId: $spexId, input: $input) { id } }`);
const CharacterUpdate = graphql(`mutation CharacterUpdate($id: ID!, $input: CharacterInput!) { characterUpdate(id: $id, input: $input) { id } }`);
const CharacterDelete = graphql(`mutation CharacterDelete($id: ID!) { characterDelete(id: $id) }`);
const CharactersPaste = graphql(`mutation CharactersPaste($spexId: ID!, $text: String!) { charactersPaste(spexId: $spexId, text: $text) { id } }`);
const CharactersReorder = graphql(`mutation CharactersReorder($spexId: ID!, $ids: [ID!]!) { charactersReorder(spexId: $spexId, ids: $ids) { id } }`);
const CharacterSetImages = graphql(`mutation CharacterSetImages($id: ID!, $images: [ImageRefInput!]!) { characterSetImages(id: $id, images: $images) { id } }`);
const SceneCreate = graphql(`mutation SceneCreate($spexId: ID!, $input: SceneInput!) { sceneCreate(spexId: $spexId, input: $input) { id } }`);
const SceneUpdate = graphql(`mutation SceneUpdate($id: ID!, $input: SceneInput!) { sceneUpdate(id: $id, input: $input) { id } }`);
const SceneDelete = graphql(`mutation SceneDelete($id: ID!) { sceneDelete(id: $id) }`);
const ScenesPaste = graphql(`mutation ScenesPaste($spexId: ID!, $text: String!) { scenesPaste(spexId: $spexId, text: $text) { id } }`);
const ScenesReorder = graphql(`mutation ScenesReorder($spexId: ID!, $items: [OrderInput!]!) { scenesReorder(spexId: $spexId, items: $items) { id } }`);
const NumberCreate = graphql(`mutation NumberCreate($spexId: ID!, $input: NumberInput!) { numberCreate(spexId: $spexId, input: $input) { id } }`);
const NumberUpdate = graphql(`mutation NumberUpdate($id: ID!, $input: NumberInput!) { numberUpdate(id: $id, input: $input) { id } }`);
const CreditResolve = graphql(`mutation CreditResolve($numberId: ID!, $kindId: ID!, $position: Int!, $credit: CreditInput!) { creditResolve(numberId: $numberId, kindId: $kindId, position: $position, credit: $credit) { id } }`);
const UnresolvedCreditsQuery = graphql(`
  query UnresolvedCredits($limit: Int!) {
    unresolvedCredits(limit: $limit) {
      total
      credits { position name kind { id name } number { id title act spex { id slug title year } } }
    }
  }
`);
const NumberDelete = graphql(`mutation NumberDelete($id: ID!) { numberDelete(id: $id) }`);
const NumbersPaste = graphql(`mutation NumbersPaste($spexId: ID!, $text: String!) { numbersPaste(spexId: $spexId, text: $text) { id } }`);
const NumbersReorder = graphql(`mutation NumbersReorder($spexId: ID!, $items: [OrderInput!]!) { numbersReorder(spexId: $spexId, items: $items) { id } }`);
const RevivalSetChanges = graphql(`mutation RevivalSetChanges($revivalId: ID!, $kind: RevivalChangeKind!, $changes: [RevivalChangeInput!]!) { revivalSetChanges(revivalId: $revivalId, kind: $kind, changes: $changes) { id } }`);

export const getSpexEdit = async (id: string) => runQuery(SpexEditQuery, { id });
export const getEditKinds = async () => runQuery(EditKindsQuery, {});
export const getMedia = async () => (await runQuery(MediaQuery, {}))?.kinds ?? [];
export const getBookKinds = async () => (await runQuery(BookKindsQuery, {}))?.kinds ?? [];
export const getSpexgramAlbums = async (spexId: string) => (await runQuery(SpexgramAlbumsQuery, { spexId }))?.spexgramAlbums ?? [];
export const spexPageUpdate = (spexId: string, input: SpexPageInput) => runMutation(SpexPageUpdate, { spexId, input });
export const spexPageSetImages = (spexId: string, section: ImageSection, kindId: string | null, images: ImageRefInput[]) =>
  runMutation(SpexPageSetImages, { spexId, section, kindId, images });
export const spexPageSetFacts = (spexId: string, facts: FactInput[]) => runMutation(SpexPageSetFacts, { spexId, facts });
export const spexPageSetPhotos = (spexId: string, section: PhotoSection, characterId: string | null, itemIds: string[]) =>
  runMutation(SpexPageSetPhotos, { spexId, section, characterId, itemIds });
export const spexPageSetRebus = (spexId: string, rebusImageId: string | null, solutionImageId: string | null) =>
  runMutation(SpexPageSetRebus, { spexId, rebusImageId, solutionImageId });
export const spexPageSetPublished = (spexId: string, published: boolean) => runMutation(SpexPageSetPublished, { spexId, published });
export const characterCreate = (spexId: string, input: CharacterInput) => runMutation(CharacterCreate, { spexId, input });
export const characterUpdate = (id: string, input: CharacterInput) => runMutation(CharacterUpdate, { id, input });
export const characterDelete = (id: string) => runMutation(CharacterDelete, { id });
export const charactersPaste = (spexId: string, text: string) => runMutation(CharactersPaste, { spexId, text });
export const charactersReorder = (spexId: string, ids: string[]) => runMutation(CharactersReorder, { spexId, ids });
export const characterSetImages = (id: string, images: ImageRefInput[]) => runMutation(CharacterSetImages, { id, images });
export const sceneCreate = (spexId: string, input: SceneInput) => runMutation(SceneCreate, { spexId, input });
export const sceneUpdate = (id: string, input: SceneInput) => runMutation(SceneUpdate, { id, input });
export const sceneDelete = (id: string) => runMutation(SceneDelete, { id });
export const scenesPaste = (spexId: string, text: string) => runMutation(ScenesPaste, { spexId, text });
export const scenesReorder = (spexId: string, items: OrderInput[]) => runMutation(ScenesReorder, { spexId, items });
export const numberCreate = (spexId: string, input: NumberInput) => runMutation(NumberCreate, { spexId, input });
export const numberUpdate = (id: string, input: NumberInput) => runMutation(NumberUpdate, { id, input });
export const numberDelete = (id: string) => runMutation(NumberDelete, { id });
export const creditResolve = (numberId: string, kindId: string, position: number, credit: CreditInput) =>
  runMutation(CreditResolve, { numberId, kindId, position, credit });
export const getUnresolvedCredits = async (limit = 200) => (await runQuery(UnresolvedCreditsQuery, { limit }))?.unresolvedCredits;
export const numbersPaste = (spexId: string, text: string) => runMutation(NumbersPaste, { spexId, text });
export const numbersReorder = (spexId: string, items: OrderInput[]) => runMutation(NumbersReorder, { spexId, items });
export const revivalSetChanges = (revivalId: string, kind: RevivalChangeKind, changes: RevivalChangeInput[]) =>
  runMutation(RevivalSetChanges, { revivalId, kind, changes });

// Recordings ----------------------------------------------------------------------------------------------------------

const RecordingEditQuery = graphql(`
  query RecordingEdit($id: ID!) {
    recording(id: $id) {
      id slug catalogueNumber title medium { id } released recorded description published spexifyAlbumId
      spex { id title year numbers { id act position title } }
      conductor { ...EditCredit }
      tracks { id side position title number { id } }
      front { ...ImageFields }
      back { ...ImageFields }
    }
  }
`);
const RecordingCreate = graphql(`mutation RecordingCreate($input: RecordingInput!) { recordingCreate(input: $input) { id } }`);
const RecordingUpdate = graphql(`mutation RecordingUpdate($id: ID!, $input: RecordingInput!) { recordingUpdate(id: $id, input: $input) { id } }`);
const RecordingSetTracks = graphql(`mutation RecordingSetTracks($id: ID!, $tracks: [TrackInput!]!) { recordingSetTracks(id: $id, tracks: $tracks) { id } }`);
const RecordingPasteTracks = graphql(`mutation RecordingPasteTracks($id: ID!, $text: String!) { recordingPasteTracks(id: $id, text: $text) { id } }`);
const RecordingSetPublished = graphql(`mutation RecordingSetPublished($id: ID!, $published: Boolean!) { recordingSetPublished(id: $id, published: $published) { id } }`);
const RecordingDelete = graphql(`mutation RecordingDelete($id: ID!) { recordingDelete(id: $id) }`);

export const getRecordingEdit = async (id: string) => (await runQuery(RecordingEditQuery, { id }))?.recording ?? null;
export const recordingCreate = async (input: RecordingInput) => (await runMutation(RecordingCreate, { input }))!.recordingCreate;
export const recordingUpdate = (id: string, input: RecordingInput) => runMutation(RecordingUpdate, { id, input });
export const recordingSetTracks = (id: string, tracks: TrackInput[]) => runMutation(RecordingSetTracks, { id, tracks });
export const recordingPasteTracks = (id: string, text: string) => runMutation(RecordingPasteTracks, { id, text });
export const recordingSetPublished = (id: string, published: boolean) => runMutation(RecordingSetPublished, { id, published });
export const recordingDelete = (id: string) => runMutation(RecordingDelete, { id });

// Books ----------------------------------------------------------------------------------------------------------

const BookEditQuery = graphql(`
  query BookEdit($id: ID!) {
    book(id: $id) {
      id slug title kind { id } volume publishedYear description published
      cover { ...ImageFields }
      songs { id title textOnly number { id title act position spex { id title year } } }
    }
  }
`);
const SpexNumbersQuery = graphql(`
  query SpexNumbersForBook($id: ID!) { spex(id: $id) { id title year numbers { id act position title } } }
`);
const BookCreate = graphql(`mutation BookCreate($input: BookInput!) { bookCreate(input: $input) { id } }`);
const BookUpdate = graphql(`mutation BookUpdate($id: ID!, $input: BookInput!) { bookUpdate(id: $id, input: $input) { id } }`);
const BookSetSongs = graphql(`mutation BookSetSongs($id: ID!, $songs: [BookSongInput!]!) { bookSetSongs(id: $id, songs: $songs) { id } }`);
const BookSetPublished = graphql(`mutation BookSetPublished($id: ID!, $published: Boolean!) { bookSetPublished(id: $id, published: $published) { id } }`);
const BookDelete = graphql(`mutation BookDelete($id: ID!) { bookDelete(id: $id) }`);

export const getBookEdit = async (id: string) => (await runQuery(BookEditQuery, { id }))?.book ?? null;
export const getSpexNumbers = async (id: string) => (await runQuery(SpexNumbersQuery, { id }))?.spex ?? null;
export const bookCreate = async (input: BookInput) => (await runMutation(BookCreate, { input }))!.bookCreate;
export const bookUpdate = (id: string, input: BookInput) => runMutation(BookUpdate, { id, input });
export const bookSetSongs = (id: string, songs: BookSongInput[]) => runMutation(BookSetSongs, { id, songs });
export const bookSetPublished = (id: string, published: boolean) => runMutation(BookSetPublished, { id, published });
export const bookDelete = (id: string) => runMutation(BookDelete, { id });

// Images and the trash ------------------------------------------------------------------------------------------------

const ImageUpdate = graphql(`mutation ImageUpdate($id: ID!, $input: ImageInput!) { imageUpdate(id: $id, input: $input) { id } }`);
const ImageTrash = graphql(`mutation ImageTrash($id: ID!) { imageTrash(id: $id) }`);
const ImageRestore = graphql(`mutation ImageRestore($id: ID!) { imageRestore(id: $id) { id } }`);
const TrashEmpty = graphql(`mutation TrashEmpty { trashEmpty }`);
const TrashQuery = graphql(`
  query Trash {
    trash {
      articles { id slug title trashedAt }
      images { ...ImageFields trashedAt originalFileName }
    }
  }
`);

export const imageUpdate = (id: string, input: ImageInput) => runMutation(ImageUpdate, { id, input });
export const imageTrash = (id: string) => runMutation(ImageTrash, { id });
export const imageRestore = (id: string) => runMutation(ImageRestore, { id });
export const trashEmpty = async () => (await runMutation(TrashEmpty, {}))?.trashEmpty ?? 0;
export const getTrash = async () => (await runQuery(TrashQuery, {}))?.trash;

export type SpexEditData = NonNullable<NonNullable<Awaited<ReturnType<typeof getSpexEdit>>>["spex"]>;
export type BaseData = NonNullable<Awaited<ReturnType<typeof getBaseData>>>;
export type RecordingEditData = NonNullable<Awaited<ReturnType<typeof getRecordingEdit>>>;
export type BookEditData = NonNullable<Awaited<ReturnType<typeof getBookEdit>>>;
export type EditKinds = NonNullable<Awaited<ReturnType<typeof getEditKinds>>>;
export type EditKind = EditKinds["numberKinds"][number];
export type UnresolvedCreditsData = NonNullable<Awaited<ReturnType<typeof getUnresolvedCredits>>>;
