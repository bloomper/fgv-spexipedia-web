/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AppLinkKind =
  | 'ARCHIVE_ARRANGEMENT'
  | 'ARCHIVE_MANUSCRIPT'
  | 'SPEXFLIX_VIDEO'
  | 'SPEXGRAM_ALBUM'
  | 'SPEXIFY_ALBUM'
  | 'SPEXIFY_TRACK'
  | 'SPEXREGISTER';

export type ArticleCategoryInput = {
  description?: string | null | undefined;
  name: string;
};

export type ArticleInput = {
  body: string;
  categoryIds?: Array<string> | null | undefined;
  /** What changed, for the history. */
  comment?: string | null | undefined;
  title: string;
  visibility: Visibility;
};

/** What to show of the audit log; every field is optional. */
export type AuditFilter = {
  action?: string | null | undefined;
  /** Only ADMIN sees others' changes. */
  actorId?: string | null | undefined;
  entityId?: string | null | undefined;
  entityType?: string | null | undefined;
  from?: string | null | undefined;
  q?: string | null | undefined;
  to?: string | null | undefined;
};

export type BaseDataKind =
  | 'CHARACTER'
  | 'NUMBER'
  | 'SPEX'
  | 'SPEX_CATEGORY'
  | 'TASK'
  | 'TASK_CATEGORY';

export type CharacterInput = {
  description?: string | null | undefined;
  figureId?: string | null | undefined;
  name: string;
};

export type CreditInput = {
  /** Only for people outside FGV; editors refer to spexare instead. */
  name?: string | null | undefined;
  spexareId?: string | null | undefined;
};

export type FigureInput = {
  description?: string | null | undefined;
  name: string;
};

export type ImageInput = {
  alt?: string | null | undefined;
  caption?: string | null | undefined;
};

export type ImageKind =
  | 'ARTICLE'
  | 'COSTUME'
  | 'COVER'
  | 'LOGO'
  | 'MAKEUP'
  | 'OTHER'
  | 'POSTER'
  | 'REBUS'
  | 'SCENOGRAPHY'
  | 'SKETCH'
  | 'VEST';

export type ImageRefInput = {
  caption?: string | null | undefined;
  imageId: string;
  /** For a character's images: SKETCH, MAKEUP or COSTUME. */
  kind?: ImageKind | null | undefined;
};

export type ImageSection =
  | 'BACKDROP'
  | 'OTHER'
  | 'PROPS'
  | 'STAGE'
  | 'VEST';

/**
 * A scheduled maintenance job: making missing image variants (IMAGE_VARIANTS), checking the links to the other
 * applications (LINK_CHECK), rebuilding the search index (SEARCH_REBUILD), sending notifications that failed
 * (SYNC_NOTIFY), removing unfinished uploads (UPLOAD_CLEANUP) and deleting people past their retention (RETENTION).
 */
export type MaintenanceJob =
  | 'IMAGE_VARIANTS'
  | 'LINK_CHECK'
  | 'RETENTION'
  | 'SEARCH_REBUILD'
  | 'SYNC_NOTIFY'
  | 'UPLOAD_CLEANUP';

export type Medium =
  | 'CD'
  | 'DIGITAL'
  | 'EP'
  | 'LP'
  | 'OTHER';

export type NumberInput = {
  act: number;
  arrangers?: Array<CreditInput> | null | undefined;
  characterIds?: Array<string> | null | undefined;
  choreographers?: Array<CreditInput> | null | undefined;
  composers?: Array<CreditInput> | null | undefined;
  lyrics?: Array<CreditInput> | null | undefined;
  originalArtist?: string | null | undefined;
  originalTitle?: string | null | undefined;
  title: string;
};

export type OrderInput = {
  act: number;
  id: string;
};

export type PhotoSection =
  | 'ACTOR'
  | 'BOARD'
  | 'GROUP';

export type RecordingInput = {
  backImageId?: string | null | undefined;
  catalogueNumber: string;
  conductor?: CreditInput | null | undefined;
  description?: string | null | undefined;
  frontImageId?: string | null | undefined;
  medium: Medium;
  recorded?: string | null | undefined;
  released?: string | null | undefined;
  spexId?: string | null | undefined;
  spexifyAlbumId?: string | null | undefined;
  title: string;
};

export type RedirectInput = {
  id?: string | null | undefined;
  oldTitle: string;
  target: string;
};

export type RevisionTarget =
  | 'ARTICLE'
  | 'SPEX_PAGE';

export type RevivalChangeInput = {
  act?: number | null | undefined;
  cut: boolean;
  position?: number | null | undefined;
  recordId: string;
};

export type RevivalChangeKind =
  | 'CHARACTER'
  | 'NUMBER'
  | 'SCENE';

export type SceneInput = {
  act: number;
  intervalAfter: boolean;
  place?: string | null | undefined;
  title: string;
};

export type SearchKind =
  | 'ARTICLE'
  | 'CHARACTER'
  | 'FIGURE'
  | 'NUMBER'
  | 'RECORDING'
  | 'SPEX';

export type SettingsInput = {
  contactEmail?: string | null | undefined;
  publicWelcomeEn?: string | null | undefined;
  publicWelcomeSv?: string | null | undefined;
  welcomeEn?: string | null | undefined;
  welcomeSv?: string | null | undefined;
};

export type SpexCategoryInput = {
  description?: string | null | undefined;
  firstYear: string;
  name: string;
};

export type SpexInput = {
  /** Ignored for a revival. */
  categoryId?: string | null | undefined;
  /** Ignored for a revival. */
  title?: string | null | undefined;
  /** yyyy */
  year: string;
};

export type SpexPageInput = {
  baseRevisionIds?: SpexPageRevisionIdsInput | null | undefined;
  description?: string | null | undefined;
  generation?: string | null | undefined;
  introduction?: string | null | undefined;
  premiere?: string | null | undefined;
  synopsis?: string | null | undefined;
  vestDescription?: string | null | undefined;
  vestWornBy?: CreditInput | null | undefined;
};

export type SpexPageRevisionIdsInput = {
  description?: string | null | undefined;
  introduction?: string | null | undefined;
  synopsis?: string | null | undefined;
};

export type SyncConsumerInput = {
  clientId: string;
  enabled: boolean;
  id?: string | null | undefined;
  name: string;
  notifyUrl?: string | null | undefined;
};

export type TaskCategoryInput = {
  actorPresent: boolean;
  board: boolean;
  instruments?: boolean | null | undefined;
  name: string;
};

export type TaskInput = {
  categoryId: string;
  name: string;
};

export type TrackInput = {
  numberId?: string | null | undefined;
  side?: string | null | undefined;
  title?: string | null | undefined;
};

export type Visibility =
  | 'MEMBERS'
  | 'PUBLIC';

export type AuditLogQueryVariables = Exact<{
  page?: number | null | undefined;
  size?: number | null | undefined;
  filter?: AuditFilter | null | undefined;
}>;


export type AuditLogQuery = { auditLog: { totalCount: number, page: number, size: number, entries: Array<{ id: string, at: string, actorId: string, actorName: string | null, action: string, entityType: string, entityId: string | null, summary: string }> } };

export type AuditActorsQueryVariables = Exact<{ [key: string]: never; }>;


export type AuditActorsQuery = { auditActors: Array<{ id: string, name: string | null }> };

export type SettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SettingsQuery = { settings: { welcomeSv: string | null, welcomeEn: string | null, publicWelcomeSv: string | null, publicWelcomeEn: string | null, contactEmail: string | null, lastModifiedAt: string | null } };

export type SettingsUpdateMutationVariables = Exact<{
  input: SettingsInput;
}>;


export type SettingsUpdateMutation = { settingsUpdate: { lastModifiedAt: string | null } };

export type MaintenanceJobsQueryVariables = Exact<{ [key: string]: never; }>;


export type MaintenanceJobsQuery = { maintenanceJobs: Array<{ job: MaintenanceJob, schedule: string | null, running: boolean, lastStartedAt: string | null, lastFinishedAt: string | null, lastSucceeded: boolean | null }> };

export type MaintenanceJobRunMutationVariables = Exact<{
  job: MaintenanceJob;
}>;


export type MaintenanceJobRunMutation = { maintenanceJobRun: boolean };

export type SyncConsumersQueryVariables = Exact<{ [key: string]: never; }>;


export type SyncConsumersQuery = { syncConsumers: Array<{ id: string, name: string, clientId: string, notifyUrl: string | null, enabled: boolean, acknowledged: string | null, acknowledgedAt: string | null, lag: number, lastNotifiedAt: string | null, lastError: string | null }> };

export type SyncConsumerSaveMutationVariables = Exact<{
  input: SyncConsumerInput;
}>;


export type SyncConsumerSaveMutation = { syncConsumerSave: { id: string } };

export type SyncConsumerDeleteMutationVariables = Exact<{
  id: string;
}>;


export type SyncConsumerDeleteMutation = { syncConsumerDelete: boolean };

export type RedirectsQueryVariables = Exact<{ [key: string]: never; }>;


export type RedirectsQuery = { redirects: Array<{ id: string, oldTitle: string, target: string }> };

export type RedirectSaveMutationVariables = Exact<{
  input: RedirectInput;
}>;


export type RedirectSaveMutation = { redirectSave: { id: string } };

export type RedirectDeleteMutationVariables = Exact<{
  id: string;
}>;


export type RedirectDeleteMutation = { redirectDelete: boolean };

export type ArticleCreateMutationVariables = Exact<{
  input: ArticleInput;
}>;


export type ArticleCreateMutation = { articleCreate: { id: string, slug: string } };

export type ArticleUpdateMutationVariables = Exact<{
  id: string;
  input: ArticleInput;
  baseRevisionId?: string | null | undefined;
}>;


export type ArticleUpdateMutation = { articleUpdate: { id: string, slug: string } };

export type ArticleEditingMutationVariables = Exact<{
  id: string;
}>;


export type ArticleEditingMutation = { articleEditing: { id: string, editingBy: Array<string> } };

export type ArticleRestoreMutationVariables = Exact<{
  id: string;
  revisionId: string;
}>;


export type ArticleRestoreMutation = { articleRestore: { id: string, slug: string } };

export type ArticleSetPublishedMutationVariables = Exact<{
  id: string;
  published: boolean;
}>;


export type ArticleSetPublishedMutation = { articleSetPublished: { id: string } };

export type ArticleTrashMutationVariables = Exact<{
  id: string;
}>;


export type ArticleTrashMutation = { articleTrash: boolean };

export type ArticleRestoreFromTrashMutationVariables = Exact<{
  id: string;
}>;


export type ArticleRestoreFromTrashMutation = { articleRestoreFromTrash: { id: string } };

export type RevisionSetHiddenMutationVariables = Exact<{
  id: string;
  hidden: boolean;
}>;


export type RevisionSetHiddenMutation = { revisionSetHidden: { id: string } };

export type ArticleCategoryCreateMutationVariables = Exact<{
  input: ArticleCategoryInput;
}>;


export type ArticleCategoryCreateMutation = { articleCategoryCreate: { id: string } };

export type ArticleCategoryUpdateMutationVariables = Exact<{
  id: string;
  input: ArticleCategoryInput;
}>;


export type ArticleCategoryUpdateMutation = { articleCategoryUpdate: { id: string } };

export type BaseDataQueryVariables = Exact<{ [key: string]: never; }>;


export type BaseDataQuery = { spexCategories: Array<{ id: string, name: string, firstYear: string, description: string | null, retired: boolean, logo: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null }>, spexAll: Array<{ id: string, slug: string, year: string, title: string, revival: boolean, retired: boolean, published: boolean, parent: { id: string } | null, category: { id: string, name: string } | null }>, taskCategories: Array<{ id: string, name: string, actorPresent: boolean, board: boolean, instruments: boolean, retired: boolean }>, tasks: Array<{ id: string, name: string, retired: boolean, category: { id: string, name: string } | null }>, figures: Array<{ id: string, slug: string, name: string, description: string | null }> };

export type SpexCategoryCreateMutationVariables = Exact<{
  input: SpexCategoryInput;
}>;


export type SpexCategoryCreateMutation = { spexCategoryCreate: { id: string } };

export type SpexCategoryUpdateMutationVariables = Exact<{
  id: string;
  input: SpexCategoryInput;
}>;


export type SpexCategoryUpdateMutation = { spexCategoryUpdate: { id: string } };

export type SpexCategorySetLogoMutationVariables = Exact<{
  id: string;
  imageId?: string | null | undefined;
}>;


export type SpexCategorySetLogoMutation = { spexCategorySetLogo: { id: string } };

export type SpexCreateMutationVariables = Exact<{
  input: SpexInput;
}>;


export type SpexCreateMutation = { spexCreate: { id: string, slug: string } };

export type SpexUpdateMutationVariables = Exact<{
  id: string;
  input: SpexInput;
}>;


export type SpexUpdateMutation = { spexUpdate: { id: string, slug: string } };

export type SpexRevivalCreateMutationVariables = Exact<{
  parentId: string;
  year: string;
}>;


export type SpexRevivalCreateMutation = { spexRevivalCreate: { id: string, slug: string } };

export type SpexSetPosterMutationVariables = Exact<{
  id: string;
  imageId?: string | null | undefined;
}>;


export type SpexSetPosterMutation = { spexSetPoster: { id: string } };

export type TaskCategoryCreateMutationVariables = Exact<{
  input: TaskCategoryInput;
}>;


export type TaskCategoryCreateMutation = { taskCategoryCreate: { id: string } };

export type TaskCategoryUpdateMutationVariables = Exact<{
  id: string;
  input: TaskCategoryInput;
}>;


export type TaskCategoryUpdateMutation = { taskCategoryUpdate: { id: string } };

export type TaskCreateMutationVariables = Exact<{
  input: TaskInput;
}>;


export type TaskCreateMutation = { taskCreate: { id: string } };

export type TaskUpdateMutationVariables = Exact<{
  id: string;
  input: TaskInput;
}>;


export type TaskUpdateMutation = { taskUpdate: { id: string } };

export type BaseDataRetireMutationVariables = Exact<{
  kind: BaseDataKind;
  id: string;
  retired: boolean;
}>;


export type BaseDataRetireMutation = { baseDataRetire: boolean };

export type BaseDataMergeMutationVariables = Exact<{
  kind: BaseDataKind;
  id: string;
  intoId: string;
}>;


export type BaseDataMergeMutation = { baseDataMerge: boolean };

export type FigureCreateMutationVariables = Exact<{
  input: FigureInput;
}>;


export type FigureCreateMutation = { figureCreate: { id: string } };

export type FigureUpdateMutationVariables = Exact<{
  id: string;
  input: FigureInput;
}>;


export type FigureUpdateMutation = { figureUpdate: { id: string } };

export type FigureDeleteMutationVariables = Exact<{
  id: string;
}>;


export type FigureDeleteMutation = { figureDelete: boolean };

export type EditCreditFragment = { name: string | null, person: { id: string | null, nickname: string | null, name: string | null } | null };

export type SpexEditQueryVariables = Exact<{
  id: string;
}>;


export type SpexEditQuery = { spex: { id: string, slug: string, year: string, title: string, revival: boolean, retired: boolean, published: boolean, category: { id: string } | null, parent: { id: string, slug: string, title: string, year: string, characters: Array<{ id: string, name: string }>, scenes: Array<{ id: string, act: number, position: number, title: string }>, numbers: Array<{ id: string, act: number, position: number, title: string }> } | null, poster: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null, revivalChanges: Array<{ kind: RevivalChangeKind, recordId: string, cut: boolean, act: number | null, position: number | null }>, page: { generation: string | null, premiere: string | null, introduction: string | null, description: string | null, synopsis: string | null, vestDescription: string | null, published: boolean, revisionIds: { introduction: string | null, description: string | null, synopsis: string | null }, vestWornBy: { name: string | null, person: { id: string | null, nickname: string | null, name: string | null } | null } | null, rebus: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null, rebusSolution: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null, backdrop: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, stage: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, props: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, vest: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, other: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, groupPhotos: { hiddenCount: number, available: boolean, itemIds: Array<string>, photos: Array<{ itemId: string, caption: string | null, thumbnailUrl: string, previewUrl: string, width: number | null, height: number | null, url: string, public: boolean, video: boolean, videoUrl: string | null }> }, boardPhotos: { hiddenCount: number, available: boolean, itemIds: Array<string>, photos: Array<{ itemId: string, caption: string | null, thumbnailUrl: string, previewUrl: string, width: number | null, height: number | null, url: string, public: boolean, video: boolean, videoUrl: string | null }> }, history: Array<{ id: string, target: RevisionTarget, targetId: string, targetTitle: string, field: string | null, comment: string | null, hidden: boolean, authorName: string | null, createdAt: string, previousId: string | null }> } | null, characters: Array<{ id: string, name: string, description: string | null, position: number, retired: boolean, figure: { id: string, name: string } | null, images: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, photos: { hiddenCount: number, available: boolean, itemIds: Array<string>, photos: Array<{ itemId: string, caption: string | null, thumbnailUrl: string, previewUrl: string, width: number | null, height: number | null, url: string, public: boolean, video: boolean, videoUrl: string | null }> }, spex: { id: string } }>, scenes: Array<{ id: string, act: number, position: number, title: string, place: string | null, intervalAfter: boolean, spex: { id: string } }>, numbers: Array<{ id: string, act: number, position: number, title: string, originalTitle: string | null, originalArtist: string | null, retired: boolean, spex: { id: string }, lyrics: Array<{ name: string | null, person: { id: string | null, nickname: string | null, name: string | null } | null }>, composers: Array<{ name: string | null, person: { id: string | null, nickname: string | null, name: string | null } | null }>, arrangers: Array<{ name: string | null, person: { id: string | null, nickname: string | null, name: string | null } | null }>, choreographers: Array<{ name: string | null, person: { id: string | null, nickname: string | null, name: string | null } | null }>, characters: Array<{ id: string }> }> } | null, figures: Array<{ id: string, name: string }> };

export type SpexgramAlbumsForPickingQueryVariables = Exact<{
  spexId: string;
}>;


export type SpexgramAlbumsForPickingQuery = { spexgramAlbums: Array<{ id: string, title: string, url: string, items: Array<{ itemId: string, caption: string | null, thumbnailUrl: string, previewUrl: string, public: boolean, video: boolean }> }> };

export type SpexPageUpdateMutationVariables = Exact<{
  spexId: string;
  input: SpexPageInput;
}>;


export type SpexPageUpdateMutation = { spexPageUpdate: { published: boolean } };

export type SpexPageSetImagesMutationVariables = Exact<{
  spexId: string;
  section: ImageSection;
  images: Array<ImageRefInput> | ImageRefInput;
}>;


export type SpexPageSetImagesMutation = { spexPageSetImages: { published: boolean } };

export type SpexPageSetPhotosMutationVariables = Exact<{
  spexId: string;
  section: PhotoSection;
  characterId?: string | null | undefined;
  itemIds: Array<string> | string;
}>;


export type SpexPageSetPhotosMutation = { spexPageSetPhotos: { published: boolean } };

export type SpexPageSetRebusMutationVariables = Exact<{
  spexId: string;
  rebusImageId?: string | null | undefined;
  solutionImageId?: string | null | undefined;
}>;


export type SpexPageSetRebusMutation = { spexPageSetRebus: { published: boolean } };

export type SpexPageSetPublishedMutationVariables = Exact<{
  spexId: string;
  published: boolean;
}>;


export type SpexPageSetPublishedMutation = { spexPageSetPublished: { published: boolean } };

export type CharacterCreateMutationVariables = Exact<{
  spexId: string;
  input: CharacterInput;
}>;


export type CharacterCreateMutation = { characterCreate: { id: string } };

export type CharacterUpdateMutationVariables = Exact<{
  id: string;
  input: CharacterInput;
}>;


export type CharacterUpdateMutation = { characterUpdate: { id: string } };

export type CharacterDeleteMutationVariables = Exact<{
  id: string;
}>;


export type CharacterDeleteMutation = { characterDelete: boolean };

export type CharactersPasteMutationVariables = Exact<{
  spexId: string;
  text: string;
}>;


export type CharactersPasteMutation = { charactersPaste: Array<{ id: string }> };

export type CharactersReorderMutationVariables = Exact<{
  spexId: string;
  ids: Array<string> | string;
}>;


export type CharactersReorderMutation = { charactersReorder: Array<{ id: string }> };

export type CharacterSetImagesMutationVariables = Exact<{
  id: string;
  images: Array<ImageRefInput> | ImageRefInput;
}>;


export type CharacterSetImagesMutation = { characterSetImages: { id: string } };

export type SceneCreateMutationVariables = Exact<{
  spexId: string;
  input: SceneInput;
}>;


export type SceneCreateMutation = { sceneCreate: { id: string } };

export type SceneUpdateMutationVariables = Exact<{
  id: string;
  input: SceneInput;
}>;


export type SceneUpdateMutation = { sceneUpdate: { id: string } };

export type SceneDeleteMutationVariables = Exact<{
  id: string;
}>;


export type SceneDeleteMutation = { sceneDelete: boolean };

export type ScenesPasteMutationVariables = Exact<{
  spexId: string;
  text: string;
}>;


export type ScenesPasteMutation = { scenesPaste: Array<{ id: string }> };

export type ScenesReorderMutationVariables = Exact<{
  spexId: string;
  items: Array<OrderInput> | OrderInput;
}>;


export type ScenesReorderMutation = { scenesReorder: Array<{ id: string }> };

export type NumberCreateMutationVariables = Exact<{
  spexId: string;
  input: NumberInput;
}>;


export type NumberCreateMutation = { numberCreate: { id: string } };

export type NumberUpdateMutationVariables = Exact<{
  id: string;
  input: NumberInput;
}>;


export type NumberUpdateMutation = { numberUpdate: { id: string } };

export type NumberDeleteMutationVariables = Exact<{
  id: string;
}>;


export type NumberDeleteMutation = { numberDelete: boolean };

export type NumbersPasteMutationVariables = Exact<{
  spexId: string;
  text: string;
}>;


export type NumbersPasteMutation = { numbersPaste: Array<{ id: string }> };

export type NumbersReorderMutationVariables = Exact<{
  spexId: string;
  items: Array<OrderInput> | OrderInput;
}>;


export type NumbersReorderMutation = { numbersReorder: Array<{ id: string }> };

export type RevivalSetChangesMutationVariables = Exact<{
  revivalId: string;
  kind: RevivalChangeKind;
  changes: Array<RevivalChangeInput> | RevivalChangeInput;
}>;


export type RevivalSetChangesMutation = { revivalSetChanges: { id: string } };

export type RecordingEditQueryVariables = Exact<{
  id: string;
}>;


export type RecordingEditQuery = { recording: { id: string, slug: string, catalogueNumber: string, title: string, medium: Medium, released: string | null, recorded: string | null, description: string | null, published: boolean, spexifyAlbumId: string | null, spex: { id: string, title: string, year: string, numbers: Array<{ id: string, act: number, position: number, title: string }> } | null, conductor: { name: string | null, person: { id: string | null, nickname: string | null, name: string | null } | null } | null, tracks: Array<{ id: string, side: string | null, position: number, title: string, number: { id: string } | null }>, front: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null, back: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null } | null };

export type RecordingCreateMutationVariables = Exact<{
  input: RecordingInput;
}>;


export type RecordingCreateMutation = { recordingCreate: { id: string } };

export type RecordingUpdateMutationVariables = Exact<{
  id: string;
  input: RecordingInput;
}>;


export type RecordingUpdateMutation = { recordingUpdate: { id: string } };

export type RecordingSetTracksMutationVariables = Exact<{
  id: string;
  tracks: Array<TrackInput> | TrackInput;
}>;


export type RecordingSetTracksMutation = { recordingSetTracks: { id: string } };

export type RecordingPasteTracksMutationVariables = Exact<{
  id: string;
  text: string;
}>;


export type RecordingPasteTracksMutation = { recordingPasteTracks: { id: string } };

export type RecordingSetPublishedMutationVariables = Exact<{
  id: string;
  published: boolean;
}>;


export type RecordingSetPublishedMutation = { recordingSetPublished: { id: string } };

export type RecordingDeleteMutationVariables = Exact<{
  id: string;
}>;


export type RecordingDeleteMutation = { recordingDelete: boolean };

export type ImageUpdateMutationVariables = Exact<{
  id: string;
  input: ImageInput;
}>;


export type ImageUpdateMutation = { imageUpdate: { id: string } };

export type ImageTrashMutationVariables = Exact<{
  id: string;
}>;


export type ImageTrashMutation = { imageTrash: boolean };

export type ImageRestoreMutationVariables = Exact<{
  id: string;
}>;


export type ImageRestoreMutation = { imageRestore: { id: string } };

export type TrashEmptyMutationVariables = Exact<{ [key: string]: never; }>;


export type TrashEmptyMutation = { trashEmpty: number };

export type TrashQueryVariables = Exact<{ [key: string]: never; }>;


export type TrashQuery = { trash: { articles: Array<{ id: string, slug: string, title: string, trashedAt: string | null }>, images: Array<{ trashedAt: string | null, originalFileName: string | null, id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string }> } };

export type ImageFieldsFragment = { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string };

export type PersonFieldsFragment = { id: string | null, nickname: string | null, name: string | null, url: string | null };

export type CreditFieldsFragment = { name: string | null, person: { id: string | null, nickname: string | null, name: string | null, url: string | null } | null };

export type PhotoSetFieldsFragment = { hiddenCount: number, available: boolean, itemIds: Array<string>, photos: Array<{ itemId: string, caption: string | null, thumbnailUrl: string, previewUrl: string, width: number | null, height: number | null, url: string, public: boolean, video: boolean, videoUrl: string | null }> };

export type SpexTileFragment = { id: string, slug: string, year: string, title: string, revival: boolean, published: boolean, retired: boolean, category: { id: string, name: string } | null, poster: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null };

export type PageImageFieldsFragment = { kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } };

export type RevisionFieldsFragment = { id: string, target: RevisionTarget, targetId: string, targetTitle: string, field: string | null, comment: string | null, hidden: boolean, authorName: string | null, createdAt: string, previousId: string | null };

export type StartPageQueryVariables = Exact<{ [key: string]: never; }>;


export type StartPageQuery = { startPage: { welcome: string | null, spexOfTheYear: { id: string, slug: string, year: string, title: string, revival: boolean, published: boolean, retired: boolean, page: { introduction: string | null } | null, category: { id: string, name: string } | null, poster: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null } | null, thisDay: Array<{ date: string, text: string, spex: { id: string, slug: string, title: string, year: string } | null, recording: { id: string, slug: string, title: string, catalogueNumber: string } | null }>, recentChanges: Array<{ id: string, target: RevisionTarget, targetId: string, targetTitle: string, field: string | null, comment: string | null, hidden: boolean, authorName: string | null, createdAt: string, previousId: string | null }>, decades: Array<{ decade: number, spex: Array<{ id: string, slug: string, year: string, title: string, revival: boolean, published: boolean, retired: boolean, category: { id: string, name: string } | null, poster: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null }> }> }, spexCategories: Array<{ id: string, name: string, firstYear: string, logo: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null }> };

export type SpexPageQueryVariables = Exact<{
  id: string;
}>;


export type SpexPageQuery = { spex: { lastModifiedAt: string | null, id: string, slug: string, year: string, title: string, revival: boolean, published: boolean, retired: boolean, parent: { id: string, slug: string, title: string, year: string } | null, revivals: Array<{ id: string, slug: string, year: string, published: boolean }>, previous: { id: string, slug: string, title: string, year: string } | null, next: { id: string, slug: string, title: string, year: string } | null, page: { generation: string | null, premiere: string | null, introduction: string | null, descriptionHtml: string | null, synopsisHtml: string | null, vestDescriptionHtml: string | null, published: boolean, lastModifiedAt: string | null, vestWornBy: { name: string | null, person: { id: string | null, nickname: string | null, name: string | null, url: string | null } | null } | null, rebus: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null, rebusSolution: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null, backdrop: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, stage: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, props: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, vest: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, other: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, groupPhotos: { hiddenCount: number, available: boolean, itemIds: Array<string>, photos: Array<{ itemId: string, caption: string | null, thumbnailUrl: string, previewUrl: string, width: number | null, height: number | null, url: string, public: boolean, video: boolean, videoUrl: string | null }> } } | null, characters: Array<{ id: string, name: string, descriptionHtml: string | null, position: number, retired: boolean, figure: { id: string, slug: string, name: string } | null, images: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }>, playedBy: Array<{ person: { id: string | null, nickname: string | null, name: string | null, url: string | null }, spex: { id: string, year: string, revival: boolean } }>, photos: { hiddenCount: number, available: boolean, itemIds: Array<string>, photos: Array<{ itemId: string, caption: string | null, thumbnailUrl: string, previewUrl: string, width: number | null, height: number | null, url: string, public: boolean, video: boolean, videoUrl: string | null }> } }>, scenes: Array<{ id: string, act: number, position: number, title: string, place: string | null, intervalAfter: boolean }>, numbers: Array<{ id: string, act: number, position: number, title: string, originalTitle: string | null, originalArtist: string | null, retired: boolean, lyrics: Array<{ name: string | null, person: { id: string | null, nickname: string | null, name: string | null, url: string | null } | null }>, composers: Array<{ name: string | null, person: { id: string | null, nickname: string | null, name: string | null, url: string | null } | null }>, arrangers: Array<{ name: string | null, person: { id: string | null, nickname: string | null, name: string | null, url: string | null } | null }>, choreographers: Array<{ name: string | null, person: { id: string | null, nickname: string | null, name: string | null, url: string | null } | null }>, characters: Array<{ id: string, name: string }>, links: Array<{ kind: AppLinkKind, title: string, url: string }> }>, recordings: Array<{ id: string, slug: string, title: string, catalogueNumber: string, medium: Medium, released: string | null, front: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null }>, people: { available: boolean, board: Array<{ spex: { id: string, year: string, revival: boolean }, task: { id: string, name: string }, people: Array<{ id: string | null, nickname: string | null, name: string | null, url: string | null }> }>, tasks: Array<{ spex: { id: string, year: string, revival: boolean }, task: { id: string, name: string, category: { id: string, name: string } | null }, people: Array<{ id: string | null, nickname: string | null, name: string | null, url: string | null }> }>, boardPhotos: { hiddenCount: number, available: boolean, itemIds: Array<string>, photos: Array<{ itemId: string, caption: string | null, thumbnailUrl: string, previewUrl: string, width: number | null, height: number | null, url: string, public: boolean, video: boolean, videoUrl: string | null }> } }, links: Array<{ kind: AppLinkKind, title: string, url: string }>, category: { id: string, name: string } | null, poster: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null } | null };

export type SpexBrowseQueryVariables = Exact<{ [key: string]: never; }>;


export type SpexBrowseQuery = { spexCategories: Array<{ id: string, name: string, firstYear: string, descriptionHtml: string | null, logo: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null }>, spexAll: Array<{ id: string, slug: string, year: string, title: string, revival: boolean, published: boolean, retired: boolean, category: { id: string, name: string } | null, poster: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null }> };

export type SpexCategoryPageQueryVariables = Exact<{
  id: string;
}>;


export type SpexCategoryPageQuery = { spexCategory: { id: string, name: string, firstYear: string, descriptionHtml: string | null, retired: boolean, logo: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null, spex: Array<{ id: string, slug: string, year: string, title: string, revival: boolean, published: boolean, retired: boolean, page: { introduction: string | null } | null, category: { id: string, name: string } | null, poster: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null }> } | null };

export type FiguresQueryVariables = Exact<{ [key: string]: never; }>;


export type FiguresQuery = { figures: Array<{ id: string, slug: string, name: string, characters: Array<{ id: string }> }> };

export type FigureQueryVariables = Exact<{
  id: string;
}>;


export type FigureQuery = { figure: { id: string, slug: string, name: string, descriptionHtml: string | null, characters: Array<{ id: string, name: string, descriptionHtml: string | null, spex: { id: string, slug: string, title: string, year: string, poster: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null }, images: Array<{ kind: ImageKind | null, caption: string | null, image: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } }> }> } | null };

export type RecordingsQueryVariables = Exact<{ [key: string]: never; }>;


export type RecordingsQuery = { recordings: Array<{ id: string, slug: string, catalogueNumber: string, title: string, medium: Medium, released: string | null, published: boolean, spex: { id: string, slug: string, title: string, year: string } | null, front: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null }> };

export type RecordingQueryVariables = Exact<{
  id: string;
}>;


export type RecordingQuery = { recording: { id: string, slug: string, catalogueNumber: string, title: string, medium: Medium, released: string | null, recorded: string | null, descriptionHtml: string | null, published: boolean, spexifyAlbumId: string | null, spex: { id: string, slug: string, title: string, year: string } | null, conductor: { name: string | null, person: { id: string | null, nickname: string | null, name: string | null, url: string | null } | null } | null, tracks: Array<{ id: string, side: string | null, position: number, title: string, number: { id: string, title: string, spex: { id: string, slug: string } } | null }>, front: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null, back: { id: string, kind: ImageKind, caption: string | null, alt: string, width: number, height: number, thumbnailUrl: string, pageUrl: string, fullUrl: string, pageJpegUrl: string } | null, links: Array<{ kind: AppLinkKind, title: string, url: string }> } | null };

export type ArticlesQueryVariables = Exact<{
  categoryId?: string | null | undefined;
}>;


export type ArticlesQuery = { articles: Array<{ id: string, slug: string, title: string, visibility: Visibility, published: boolean, lastModifiedAt: string | null, categories: Array<{ id: string, slug: string, name: string }> }>, articleCategories: Array<{ id: string, slug: string, name: string, description: string | null, articleCount: number }> };

export type ArticleCategoryQueryVariables = Exact<{
  id: string;
}>;


export type ArticleCategoryQuery = { articleCategory: { id: string, slug: string, name: string, description: string | null, articleCount: number } | null };

export type ArticleQueryVariables = Exact<{
  id: string;
}>;


export type ArticleQuery = { article: { id: string, slug: string, title: string, body: string | null, html: string | null, visibility: Visibility, published: boolean, trashedAt: string | null, createdAt: string, lastModifiedAt: string | null, editingBy: Array<string>, categories: Array<{ id: string, slug: string, name: string }>, revision: { id: string, target: RevisionTarget, targetId: string, targetTitle: string, field: string | null, comment: string | null, hidden: boolean, authorName: string | null, createdAt: string, previousId: string | null } | null } | null };

export type ArticleHistoryQueryVariables = Exact<{
  id: string;
}>;


export type ArticleHistoryQuery = { article: { id: string, slug: string, title: string, history: Array<{ body: string | null, id: string, target: RevisionTarget, targetId: string, targetTitle: string, field: string | null, comment: string | null, hidden: boolean, authorName: string | null, createdAt: string, previousId: string | null }> } | null };

export type RevisionQueryVariables = Exact<{
  id: string;
}>;


export type RevisionQuery = { revision: { body: string | null, id: string, target: RevisionTarget, targetId: string, targetTitle: string, field: string | null, comment: string | null, hidden: boolean, authorName: string | null, createdAt: string, previousId: string | null } | null };

export type RecentChangesQueryVariables = Exact<{
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;


export type RecentChangesQuery = { recentChanges: { totalCount: number, page: number, size: number, entries: Array<{ id: string, target: RevisionTarget, targetId: string, targetTitle: string, field: string | null, comment: string | null, hidden: boolean, authorName: string | null, createdAt: string, previousId: string | null }> } };

export type SearchQueryVariables = Exact<{
  q: string;
}>;


export type SearchQuery = { search: Array<{ kind: SearchKind, id: string, title: string, context: string | null, path: string }> };

export type SitemapQueryVariables = Exact<{ [key: string]: never; }>;


export type SitemapQuery = { sitemap: Array<{ path: string, lastModifiedAt: string | null }> };

export type RedirectLookupQueryVariables = Exact<{
  title: string;
}>;


export type RedirectLookupQuery = { redirect: string | null };

export type MarkdownPreviewQueryVariables = Exact<{
  markdown: string;
}>;


export type MarkdownPreviewQuery = { markdownPreview: string };

export type SpexareSearchQueryVariables = Exact<{
  q: string;
}>;


export type SpexareSearchQuery = { spexareSearch: Array<{ id: string | null, nickname: string | null, name: string | null, url: string | null }> };

export const EditCreditFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EditCredit"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Credit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<EditCreditFragment, unknown>;
export const PersonFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PersonFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Person"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<PersonFieldsFragment, unknown>;
export const CreditFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CreditFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Credit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PersonFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PersonFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Person"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<CreditFieldsFragment, unknown>;
export const PhotoSetFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PhotoSetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hiddenCount"}},{"kind":"Field","name":{"kind":"Name","value":"available"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewUrl"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"public"}},{"kind":"Field","name":{"kind":"Name","value":"video"}},{"kind":"Field","name":{"kind":"Name","value":"videoUrl"}}]}}]}}]} as unknown as DocumentNode<PhotoSetFieldsFragment, unknown>;
export const ImageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}}]} as unknown as DocumentNode<ImageFieldsFragment, unknown>;
export const SpexTileFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SpexTile"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Spex"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"poster"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}}]} as unknown as DocumentNode<SpexTileFragment, unknown>;
export const PageImageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}}]} as unknown as DocumentNode<PageImageFieldsFragment, unknown>;
export const RevisionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevisionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revision"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTitle"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"previousId"}}]}}]} as unknown as DocumentNode<RevisionFieldsFragment, unknown>;
export const AuditLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AuditFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"at"}},{"kind":"Field","name":{"kind":"Name","value":"actorId"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}}]}}]}}]}}]} as unknown as DocumentNode<AuditLogQuery, AuditLogQueryVariables>;
export const AuditActorsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditActors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditActors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AuditActorsQuery, AuditActorsQueryVariables>;
export const SettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"welcomeSv"}},{"kind":"Field","name":{"kind":"Name","value":"welcomeEn"}},{"kind":"Field","name":{"kind":"Name","value":"publicWelcomeSv"}},{"kind":"Field","name":{"kind":"Name","value":"publicWelcomeEn"}},{"kind":"Field","name":{"kind":"Name","value":"contactEmail"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}}]}}]}}]} as unknown as DocumentNode<SettingsQuery, SettingsQueryVariables>;
export const SettingsUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SettingsUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"settingsUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}}]}}]}}]} as unknown as DocumentNode<SettingsUpdateMutation, SettingsUpdateMutationVariables>;
export const MaintenanceJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MaintenanceJobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maintenanceJobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"job"}},{"kind":"Field","name":{"kind":"Name","value":"schedule"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"lastStartedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastFinishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastSucceeded"}}]}}]}}]} as unknown as DocumentNode<MaintenanceJobsQuery, MaintenanceJobsQueryVariables>;
export const MaintenanceJobRunDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MaintenanceJobRun"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"job"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MaintenanceJob"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"maintenanceJobRun"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"job"},"value":{"kind":"Variable","name":{"kind":"Name","value":"job"}}}]}]}}]} as unknown as DocumentNode<MaintenanceJobRunMutation, MaintenanceJobRunMutationVariables>;
export const SyncConsumersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SyncConsumers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncConsumers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"notifyUrl"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"acknowledged"}},{"kind":"Field","name":{"kind":"Name","value":"acknowledgedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lag"}},{"kind":"Field","name":{"kind":"Name","value":"lastNotifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastError"}}]}}]}}]} as unknown as DocumentNode<SyncConsumersQuery, SyncConsumersQueryVariables>;
export const SyncConsumerSaveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncConsumerSave"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SyncConsumerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncConsumerSave"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SyncConsumerSaveMutation, SyncConsumerSaveMutationVariables>;
export const SyncConsumerDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncConsumerDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncConsumerDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<SyncConsumerDeleteMutation, SyncConsumerDeleteMutationVariables>;
export const RedirectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Redirects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"redirects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"oldTitle"}},{"kind":"Field","name":{"kind":"Name","value":"target"}}]}}]}}]} as unknown as DocumentNode<RedirectsQuery, RedirectsQueryVariables>;
export const RedirectSaveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RedirectSave"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RedirectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"redirectSave"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RedirectSaveMutation, RedirectSaveMutationVariables>;
export const RedirectDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RedirectDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"redirectDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RedirectDeleteMutation, RedirectDeleteMutationVariables>;
export const ArticleCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArticleCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArticleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<ArticleCreateMutation, ArticleCreateMutationVariables>;
export const ArticleUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArticleUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArticleInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"baseRevisionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"baseRevisionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"baseRevisionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<ArticleUpdateMutation, ArticleUpdateMutationVariables>;
export const ArticleEditingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArticleEditing"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleEditing"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"editingBy"}}]}}]}}]} as unknown as DocumentNode<ArticleEditingMutation, ArticleEditingMutationVariables>;
export const ArticleRestoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArticleRestore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"revisionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleRestore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"revisionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"revisionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<ArticleRestoreMutation, ArticleRestoreMutationVariables>;
export const ArticleSetPublishedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArticleSetPublished"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"published"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleSetPublished"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"published"},"value":{"kind":"Variable","name":{"kind":"Name","value":"published"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ArticleSetPublishedMutation, ArticleSetPublishedMutationVariables>;
export const ArticleTrashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArticleTrash"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleTrash"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<ArticleTrashMutation, ArticleTrashMutationVariables>;
export const ArticleRestoreFromTrashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArticleRestoreFromTrash"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleRestoreFromTrash"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ArticleRestoreFromTrashMutation, ArticleRestoreFromTrashMutationVariables>;
export const RevisionSetHiddenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevisionSetHidden"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hidden"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revisionSetHidden"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"hidden"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hidden"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RevisionSetHiddenMutation, RevisionSetHiddenMutationVariables>;
export const ArticleCategoryCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArticleCategoryCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArticleCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleCategoryCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ArticleCategoryCreateMutation, ArticleCategoryCreateMutationVariables>;
export const ArticleCategoryUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArticleCategoryUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArticleCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleCategoryUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ArticleCategoryUpdateMutation, ArticleCategoryUpdateMutationVariables>;
export const BaseDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BaseData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeRetired"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstYear"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"spexAll"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeRetired"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"taskCategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeRetired"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"actorPresent"}},{"kind":"Field","name":{"kind":"Name","value":"board"}},{"kind":"Field","name":{"kind":"Name","value":"instruments"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tasks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeRetired"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"figures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}}]} as unknown as DocumentNode<BaseDataQuery, BaseDataQueryVariables>;
export const SpexCategoryCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexCategoryCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SpexCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexCategoryCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SpexCategoryCreateMutation, SpexCategoryCreateMutationVariables>;
export const SpexCategoryUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexCategoryUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SpexCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexCategoryUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SpexCategoryUpdateMutation, SpexCategoryUpdateMutationVariables>;
export const SpexCategorySetLogoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexCategorySetLogo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"imageId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexCategorySetLogo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"imageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SpexCategorySetLogoMutation, SpexCategorySetLogoMutationVariables>;
export const SpexCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SpexInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<SpexCreateMutation, SpexCreateMutationVariables>;
export const SpexUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SpexInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<SpexUpdateMutation, SpexUpdateMutationVariables>;
export const SpexRevivalCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexRevivalCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexRevivalCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"parentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<SpexRevivalCreateMutation, SpexRevivalCreateMutationVariables>;
export const SpexSetPosterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexSetPoster"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"imageId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexSetPoster"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"imageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SpexSetPosterMutation, SpexSetPosterMutationVariables>;
export const TaskCategoryCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TaskCategoryCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TaskCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taskCategoryCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TaskCategoryCreateMutation, TaskCategoryCreateMutationVariables>;
export const TaskCategoryUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TaskCategoryUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TaskCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taskCategoryUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TaskCategoryUpdateMutation, TaskCategoryUpdateMutationVariables>;
export const TaskCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TaskCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taskCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TaskCreateMutation, TaskCreateMutationVariables>;
export const TaskUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TaskUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taskUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<TaskUpdateMutation, TaskUpdateMutationVariables>;
export const BaseDataRetireDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BaseDataRetire"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BaseDataKind"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"retired"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"baseDataRetire"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"retired"},"value":{"kind":"Variable","name":{"kind":"Name","value":"retired"}}}]}]}}]} as unknown as DocumentNode<BaseDataRetireMutation, BaseDataRetireMutationVariables>;
export const BaseDataMergeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BaseDataMerge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BaseDataKind"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"intoId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"baseDataMerge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"intoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"intoId"}}}]}]}}]} as unknown as DocumentNode<BaseDataMergeMutation, BaseDataMergeMutationVariables>;
export const FigureCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FigureCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FigureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"figureCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<FigureCreateMutation, FigureCreateMutationVariables>;
export const FigureUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FigureUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FigureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"figureUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<FigureUpdateMutation, FigureUpdateMutationVariables>;
export const FigureDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FigureDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"figureDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<FigureDeleteMutation, FigureDeleteMutationVariables>;
export const SpexEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexEdit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spex"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scenes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"act"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"numbers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"act"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"poster"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revivalChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"recordId"}},{"kind":"Field","name":{"kind":"Name","value":"cut"}},{"kind":"Field","name":{"kind":"Name","value":"act"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generation"}},{"kind":"Field","name":{"kind":"Name","value":"premiere"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"synopsis"}},{"kind":"Field","name":{"kind":"Name","value":"vestDescription"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"revisionIds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"synopsis"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vestWornBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EditCredit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rebus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rebusSolution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"backdrop"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"BACKDROP"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"stage"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"STAGE"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"props"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"PROPS"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"vest"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"VEST"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"other"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"OTHER"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"groupPhotos"},"name":{"kind":"Name","value":"photos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"GROUP"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoSetFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"boardPhotos"},"name":{"kind":"Name","value":"photos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"BOARD"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoSetFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"history"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevisionFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"figure"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoSetFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scenes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"act"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"place"}},{"kind":"Field","name":{"kind":"Name","value":"intervalAfter"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"numbers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"act"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"originalTitle"}},{"kind":"Field","name":{"kind":"Name","value":"originalArtist"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EditCredit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"composers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EditCredit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrangers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EditCredit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"choreographers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EditCredit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"figures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EditCredit"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Credit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PhotoSetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hiddenCount"}},{"kind":"Field","name":{"kind":"Name","value":"available"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewUrl"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"public"}},{"kind":"Field","name":{"kind":"Name","value":"video"}},{"kind":"Field","name":{"kind":"Name","value":"videoUrl"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevisionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revision"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTitle"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"previousId"}}]}}]} as unknown as DocumentNode<SpexEditQuery, SpexEditQueryVariables>;
export const SpexgramAlbumsForPickingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexgramAlbumsForPicking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexgramAlbums"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewUrl"}},{"kind":"Field","name":{"kind":"Name","value":"public"}},{"kind":"Field","name":{"kind":"Name","value":"video"}}]}}]}}]}}]} as unknown as DocumentNode<SpexgramAlbumsForPickingQuery, SpexgramAlbumsForPickingQueryVariables>;
export const SpexPageUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexPageUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SpexPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexPageUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"published"}}]}}]}}]} as unknown as DocumentNode<SpexPageUpdateMutation, SpexPageUpdateMutationVariables>;
export const SpexPageSetImagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexPageSetImages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"section"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ImageSection"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"images"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ImageRefInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexPageSetImages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"Variable","name":{"kind":"Name","value":"section"}}},{"kind":"Argument","name":{"kind":"Name","value":"images"},"value":{"kind":"Variable","name":{"kind":"Name","value":"images"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"published"}}]}}]}}]} as unknown as DocumentNode<SpexPageSetImagesMutation, SpexPageSetImagesMutationVariables>;
export const SpexPageSetPhotosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexPageSetPhotos"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"section"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoSection"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"itemIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexPageSetPhotos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"Variable","name":{"kind":"Name","value":"section"}}},{"kind":"Argument","name":{"kind":"Name","value":"characterId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}},{"kind":"Argument","name":{"kind":"Name","value":"itemIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"itemIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"published"}}]}}]}}]} as unknown as DocumentNode<SpexPageSetPhotosMutation, SpexPageSetPhotosMutationVariables>;
export const SpexPageSetRebusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexPageSetRebus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rebusImageId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"solutionImageId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexPageSetRebus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"rebusImageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rebusImageId"}}},{"kind":"Argument","name":{"kind":"Name","value":"solutionImageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"solutionImageId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"published"}}]}}]}}]} as unknown as DocumentNode<SpexPageSetRebusMutation, SpexPageSetRebusMutationVariables>;
export const SpexPageSetPublishedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SpexPageSetPublished"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"published"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexPageSetPublished"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"published"},"value":{"kind":"Variable","name":{"kind":"Name","value":"published"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"published"}}]}}]}}]} as unknown as DocumentNode<SpexPageSetPublishedMutation, SpexPageSetPublishedMutationVariables>;
export const CharacterCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CharacterCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CharacterCreateMutation, CharacterCreateMutationVariables>;
export const CharacterUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CharacterUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CharacterUpdateMutation, CharacterUpdateMutationVariables>;
export const CharacterDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CharacterDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<CharacterDeleteMutation, CharacterDeleteMutationVariables>;
export const CharactersPasteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CharactersPaste"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"text"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"charactersPaste"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"text"},"value":{"kind":"Variable","name":{"kind":"Name","value":"text"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CharactersPasteMutation, CharactersPasteMutationVariables>;
export const CharactersReorderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CharactersReorder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"charactersReorder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CharactersReorderMutation, CharactersReorderMutationVariables>;
export const CharacterSetImagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CharacterSetImages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"images"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ImageRefInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterSetImages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"images"},"value":{"kind":"Variable","name":{"kind":"Name","value":"images"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CharacterSetImagesMutation, CharacterSetImagesMutationVariables>;
export const SceneCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SceneCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SceneInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sceneCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SceneCreateMutation, SceneCreateMutationVariables>;
export const SceneUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SceneUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SceneInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sceneUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SceneUpdateMutation, SceneUpdateMutationVariables>;
export const SceneDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SceneDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sceneDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<SceneDeleteMutation, SceneDeleteMutationVariables>;
export const ScenesPasteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ScenesPaste"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"text"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scenesPaste"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"text"},"value":{"kind":"Variable","name":{"kind":"Name","value":"text"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ScenesPasteMutation, ScenesPasteMutationVariables>;
export const ScenesReorderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ScenesReorder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"items"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scenesReorder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"items"},"value":{"kind":"Variable","name":{"kind":"Name","value":"items"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ScenesReorderMutation, ScenesReorderMutationVariables>;
export const NumberCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NumberCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NumberInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"numberCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<NumberCreateMutation, NumberCreateMutationVariables>;
export const NumberUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NumberUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NumberInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"numberUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<NumberUpdateMutation, NumberUpdateMutationVariables>;
export const NumberDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NumberDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"numberDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<NumberDeleteMutation, NumberDeleteMutationVariables>;
export const NumbersPasteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NumbersPaste"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"text"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"numbersPaste"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"text"},"value":{"kind":"Variable","name":{"kind":"Name","value":"text"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<NumbersPasteMutation, NumbersPasteMutationVariables>;
export const NumbersReorderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NumbersReorder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"items"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"numbersReorder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"spexId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spexId"}}},{"kind":"Argument","name":{"kind":"Name","value":"items"},"value":{"kind":"Variable","name":{"kind":"Name","value":"items"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<NumbersReorderMutation, NumbersReorderMutationVariables>;
export const RevivalSetChangesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevivalSetChanges"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"revivalId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevivalChangeKind"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"changes"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevivalChangeInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revivalSetChanges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"revivalId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"revivalId"}}},{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}},{"kind":"Argument","name":{"kind":"Name","value":"changes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"changes"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RevivalSetChangesMutation, RevivalSetChangesMutationVariables>;
export const RecordingEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecordingEdit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recording"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"catalogueNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"medium"}},{"kind":"Field","name":{"kind":"Name","value":"released"}},{"kind":"Field","name":{"kind":"Name","value":"recorded"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"spexifyAlbumId"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"numbers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"act"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"conductor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EditCredit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"side"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"number"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"front"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"back"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EditCredit"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Credit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}}]} as unknown as DocumentNode<RecordingEditQuery, RecordingEditQueryVariables>;
export const RecordingCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordingCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecordingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordingCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RecordingCreateMutation, RecordingCreateMutationVariables>;
export const RecordingUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordingUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecordingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordingUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RecordingUpdateMutation, RecordingUpdateMutationVariables>;
export const RecordingSetTracksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordingSetTracks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tracks"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TrackInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordingSetTracks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"tracks"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tracks"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RecordingSetTracksMutation, RecordingSetTracksMutationVariables>;
export const RecordingPasteTracksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordingPasteTracks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"text"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordingPasteTracks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"text"},"value":{"kind":"Variable","name":{"kind":"Name","value":"text"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RecordingPasteTracksMutation, RecordingPasteTracksMutationVariables>;
export const RecordingSetPublishedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordingSetPublished"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"published"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordingSetPublished"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"published"},"value":{"kind":"Variable","name":{"kind":"Name","value":"published"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RecordingSetPublishedMutation, RecordingSetPublishedMutationVariables>;
export const RecordingDeleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordingDelete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordingDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RecordingDeleteMutation, RecordingDeleteMutationVariables>;
export const ImageUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ImageUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ImageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ImageUpdateMutation, ImageUpdateMutationVariables>;
export const ImageTrashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ImageTrash"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageTrash"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<ImageTrashMutation, ImageTrashMutationVariables>;
export const ImageRestoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ImageRestore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageRestore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ImageRestoreMutation, ImageRestoreMutationVariables>;
export const TrashEmptyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrashEmpty"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trashEmpty"}}]}}]} as unknown as DocumentNode<TrashEmptyMutation, TrashEmptyMutationVariables>;
export const TrashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Trash"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trash"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"originalFileName"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}}]} as unknown as DocumentNode<TrashQuery, TrashQueryVariables>;
export const StartPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StartPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"welcome"}},{"kind":"Field","name":{"kind":"Name","value":"spexOfTheYear"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SpexTile"}},{"kind":"Field","name":{"kind":"Name","value":"page"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"introduction"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"thisDay"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recording"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"catalogueNumber"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"recentChanges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevisionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"decades"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"decade"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SpexTile"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"spexCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstYear"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SpexTile"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Spex"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"poster"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevisionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revision"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTitle"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"previousId"}}]}}]} as unknown as DocumentNode<StartPageQuery, StartPageQueryVariables>;
export const SpexPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spex"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SpexTile"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revivals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"published"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previous"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}},{"kind":"Field","name":{"kind":"Name","value":"next"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generation"}},{"kind":"Field","name":{"kind":"Name","value":"premiere"}},{"kind":"Field","name":{"kind":"Name","value":"introduction"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionHtml"}},{"kind":"Field","name":{"kind":"Name","value":"synopsisHtml"}},{"kind":"Field","name":{"kind":"Name","value":"vestDescriptionHtml"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"vestWornBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CreditFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rebus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rebusSolution"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"backdrop"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"BACKDROP"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"stage"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"STAGE"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"props"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"PROPS"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"vest"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"VEST"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"other"},"name":{"kind":"Name","value":"images"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"OTHER"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"groupPhotos"},"name":{"kind":"Name","value":"photos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"section"},"value":{"kind":"EnumValue","value":"GROUP"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoSetFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionHtml"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"figure"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"playedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PersonFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoSetFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scenes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"act"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"place"}},{"kind":"Field","name":{"kind":"Name","value":"intervalAfter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"numbers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"act"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"originalTitle"}},{"kind":"Field","name":{"kind":"Name","value":"originalArtist"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"lyrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CreditFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"composers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CreditFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"arrangers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CreditFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"choreographers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CreditFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"links"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"recordings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"catalogueNumber"}},{"kind":"Field","name":{"kind":"Name","value":"medium"}},{"kind":"Field","name":{"kind":"Name","value":"released"}},{"kind":"Field","name":{"kind":"Name","value":"front"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"people"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"available"}},{"kind":"Field","name":{"kind":"Name","value":"board"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}}]}},{"kind":"Field","name":{"kind":"Name","value":"task"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"people"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PersonFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"tasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}}]}},{"kind":"Field","name":{"kind":"Name","value":"task"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"people"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PersonFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"boardPhotos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PhotoSetFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"links"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PersonFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Person"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SpexTile"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Spex"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"poster"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CreditFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Credit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PersonFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PhotoSetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PhotoSet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hiddenCount"}},{"kind":"Field","name":{"kind":"Name","value":"available"}},{"kind":"Field","name":{"kind":"Name","value":"itemIds"}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"itemId"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"previewUrl"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"public"}},{"kind":"Field","name":{"kind":"Name","value":"video"}},{"kind":"Field","name":{"kind":"Name","value":"videoUrl"}}]}}]}}]} as unknown as DocumentNode<SpexPageQuery, SpexPageQueryVariables>;
export const SpexBrowseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexBrowse"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstYear"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionHtml"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"spexAll"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SpexTile"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SpexTile"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Spex"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"poster"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}}]} as unknown as DocumentNode<SpexBrowseQuery, SpexBrowseQueryVariables>;
export const SpexCategoryPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexCategoryPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstYear"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionHtml"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SpexTile"}},{"kind":"Field","name":{"kind":"Name","value":"page"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"introduction"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SpexTile"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Spex"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"revival"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"retired"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"poster"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}}]} as unknown as DocumentNode<SpexCategoryPageQuery, SpexCategoryPageQueryVariables>;
export const FiguresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Figures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"figures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<FiguresQuery, FiguresQueryVariables>;
export const FigureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Figure"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"figure"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionHtml"}},{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionHtml"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"poster"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageImageFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}}]} as unknown as DocumentNode<FigureQuery, FigureQueryVariables>;
export const RecordingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Recordings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"catalogueNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"medium"}},{"kind":"Field","name":{"kind":"Name","value":"released"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}},{"kind":"Field","name":{"kind":"Name","value":"front"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}}]} as unknown as DocumentNode<RecordingsQuery, RecordingsQueryVariables>;
export const RecordingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Recording"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recording"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"catalogueNumber"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"medium"}},{"kind":"Field","name":{"kind":"Name","value":"released"}},{"kind":"Field","name":{"kind":"Name","value":"recorded"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionHtml"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"spexifyAlbumId"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}},{"kind":"Field","name":{"kind":"Name","value":"conductor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CreditFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"side"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"number"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"front"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"back"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ImageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"links"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PersonFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Person"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CreditFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Credit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PersonFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ImageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Image"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"caption"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fullUrl"}},{"kind":"Field","name":{"kind":"Name","value":"pageJpegUrl"}}]}}]} as unknown as DocumentNode<RecordingQuery, RecordingQueryVariables>;
export const ArticlesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Articles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"categoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"articleCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"articleCount"}}]}}]}}]} as unknown as DocumentNode<ArticlesQuery, ArticlesQueryVariables>;
export const ArticleCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ArticleCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"articleCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"articleCount"}}]}}]}}]} as unknown as DocumentNode<ArticleCategoryQuery, ArticleCategoryQueryVariables>;
export const ArticleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Article"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"article"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"html"}},{"kind":"Field","name":{"kind":"Name","value":"visibility"}},{"kind":"Field","name":{"kind":"Name","value":"published"}},{"kind":"Field","name":{"kind":"Name","value":"trashedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"editingBy"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revision"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevisionFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevisionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revision"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTitle"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"previousId"}}]}}]} as unknown as DocumentNode<ArticleQuery, ArticleQueryVariables>;
export const ArticleHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ArticleHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"article"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"history"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevisionFields"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevisionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revision"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTitle"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"previousId"}}]}}]} as unknown as DocumentNode<ArticleHistoryQuery, ArticleHistoryQueryVariables>;
export const RevisionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Revision"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revision"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevisionFields"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevisionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revision"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTitle"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"previousId"}}]}}]} as unknown as DocumentNode<RevisionQuery, RevisionQueryVariables>;
export const RecentChangesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecentChanges"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recentChanges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevisionFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevisionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revision"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"targetId"}},{"kind":"Field","name":{"kind":"Name","value":"targetTitle"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"hidden"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"previousId"}}]}}]} as unknown as DocumentNode<RecentChangesQuery, RecentChangesQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"context"}},{"kind":"Field","name":{"kind":"Name","value":"path"}}]}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const SitemapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sitemap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sitemap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}}]}}]}}]} as unknown as DocumentNode<SitemapQuery, SitemapQueryVariables>;
export const RedirectLookupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RedirectLookup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"redirect"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}]}]}}]} as unknown as DocumentNode<RedirectLookupQuery, RedirectLookupQueryVariables>;
export const MarkdownPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MarkdownPreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"markdown"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markdownPreview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"markdown"},"value":{"kind":"Variable","name":{"kind":"Name","value":"markdown"}}}]}]}}]} as unknown as DocumentNode<MarkdownPreviewQuery, MarkdownPreviewQueryVariables>;
export const SpexareSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexareSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexareSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PersonFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PersonFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Person"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<SpexareSearchQuery, SpexareSearchQueryVariables>;