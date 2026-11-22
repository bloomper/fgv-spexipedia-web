/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query AuditLog($page: Int!, $size: Int!, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n": typeof types.AuditLogDocument,
    "\n    query AuditActors { auditActors { id name } }\n": typeof types.AuditActorsDocument,
    "\n    query Settings {\n        settings {\n            welcomeSv welcomeEn publicWelcomeSv publicWelcomeEn contactEmail lastModifiedAt\n        }\n    }\n": typeof types.SettingsDocument,
    "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { lastModifiedAt } }\n": typeof types.SettingsUpdateDocument,
    "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n": typeof types.MaintenanceJobsDocument,
    "\n    mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }\n": typeof types.MaintenanceJobRunDocument,
    "\n    query SyncConsumers {\n        syncConsumers { id name clientId notifyUrl enabled acknowledged acknowledgedAt lag lastNotifiedAt lastError }\n    }\n": typeof types.SyncConsumersDocument,
    "\n    mutation SyncConsumerSave($input: SyncConsumerInput!) { syncConsumerSave(input: $input) { id } }\n": typeof types.SyncConsumerSaveDocument,
    "\n    mutation SyncConsumerDelete($id: ID!) { syncConsumerDelete(id: $id) }\n": typeof types.SyncConsumerDeleteDocument,
    "\n    query Redirects { redirects { id oldTitle target } }\n": typeof types.RedirectsDocument,
    "\n    mutation RedirectSave($input: RedirectInput!) { redirectSave(input: $input) { id } }\n": typeof types.RedirectSaveDocument,
    "\n    mutation RedirectDelete($id: ID!) { redirectDelete(id: $id) }\n": typeof types.RedirectDeleteDocument,
    "\n    query AdminKinds($type: KindType!, $use: KindUse, $sectionId: ID) {\n        kinds(type: $type, use: $use, sectionId: $sectionId, includeRetired: true) {\n            id type use valueType content name nameSv nameEn subtitleSv subtitleEn aliases position retired\n        }\n    }\n": typeof types.AdminKindsDocument,
    "\n    mutation KindSave($id: ID, $input: KindInput!) { kindSave(id: $id, input: $input) { id } }\n": typeof types.KindSaveDocument,
    "\n    mutation KindsReorder($type: KindType!, $use: KindUse, $sectionId: ID, $ids: [ID!]!) { kindsReorder(type: $type, use: $use, sectionId: $sectionId, ids: $ids) { id } }\n": typeof types.KindsReorderDocument,
    "\n    mutation KindRetire($id: ID!, $retired: Boolean!) { kindRetire(id: $id, retired: $retired) { id } }\n": typeof types.KindRetireDocument,
    "\n    mutation KindDelete($id: ID!) { kindDelete(id: $id) }\n": typeof types.KindDeleteDocument,
    "\n    mutation KindMerge($id: ID!, $intoId: ID!) { kindMerge(id: $id, intoId: $intoId) { id } }\n": typeof types.KindMergeDocument,
    "\n  fragment SpexPackageReportFields on SpexPackageReport {\n    unmatched warnings\n    apps {\n      app status records files created updated unchanged kept failed message webUrl\n      items { kind sourceKey id outcome message warnings }\n    }\n  }\n": typeof types.SpexPackageReportFieldsFragmentDoc,
    "\n  fragment SpexPackageRow on SpexPackage {\n    id state fileName zipFileName zipSize zipReceived progress message uploadedByName createdAt appliedAt\n    spex { id slug title year }\n  }\n": typeof types.SpexPackageRowFragmentDoc,
    "\n  query SpexPackages { spexPackages { ...SpexPackageRow } }\n": typeof types.SpexPackagesDocument,
    "\n  query SpexPackage($id: ID!) {\n    spexPackage(id: $id) {\n      ...SpexPackageRow\n      preview { ...SpexPackageReportFields }\n      results { ...SpexPackageReportFields }\n    }\n  }\n": typeof types.SpexPackageDocument,
    "mutation SpexPackagePreview($id: ID!) { spexPackagePreview(id: $id) { id state } }": typeof types.SpexPackagePreviewDocument,
    "mutation SpexPackageApply($id: ID!) { spexPackageApply(id: $id) { id state } }": typeof types.SpexPackageApplyDocument,
    "mutation SpexPackageDelete($id: ID!) { spexPackageDelete(id: $id) }": typeof types.SpexPackageDeleteDocument,
    "mutation ArticleCreate($input: ArticleInput!) { articleCreate(input: $input) { id slug } }": typeof types.ArticleCreateDocument,
    "\n  mutation ArticleUpdate($id: ID!, $input: ArticleInput!, $baseRevisionId: ID) {\n    articleUpdate(id: $id, input: $input, baseRevisionId: $baseRevisionId) { id slug }\n  }\n": typeof types.ArticleUpdateDocument,
    "mutation ArticleEditing($id: ID!) { articleEditing(id: $id) { id editingBy } }": typeof types.ArticleEditingDocument,
    "mutation ArticleRestore($id: ID!, $revisionId: ID!) { articleRestore(id: $id, revisionId: $revisionId) { id slug } }": typeof types.ArticleRestoreDocument,
    "mutation ArticleSetPublished($id: ID!, $published: Boolean!) { articleSetPublished(id: $id, published: $published) { id } }": typeof types.ArticleSetPublishedDocument,
    "mutation ArticleTrash($id: ID!, $withChildren: Boolean!) { articleTrash(id: $id, withChildren: $withChildren) }": typeof types.ArticleTrashDocument,
    "mutation ArticleMove($id: ID!, $parentId: ID, $position: Int) { articleMove(id: $id, parentId: $parentId, position: $position) { id } }": typeof types.ArticleMoveDocument,
    "mutation ArticleReorderChildren($parentId: ID, $ids: [ID!]!) { articleReorderChildren(parentId: $parentId, ids: $ids) { id } }": typeof types.ArticleReorderChildrenDocument,
    "mutation ArticleRestoreFromTrash($id: ID!) { articleRestoreFromTrash(id: $id) { id } }": typeof types.ArticleRestoreFromTrashDocument,
    "mutation RevisionSetHidden($id: ID!, $hidden: Boolean!) { revisionSetHidden(id: $id, hidden: $hidden) { id } }": typeof types.RevisionSetHiddenDocument,
    "mutation ArticleCategoryCreate($input: ArticleCategoryInput!) { articleCategoryCreate(input: $input) { id slug } }": typeof types.ArticleCategoryCreateDocument,
    "mutation ArticleCategoryUpdate($id: ID!, $input: ArticleCategoryInput!) { articleCategoryUpdate(id: $id, input: $input) { id slug } }": typeof types.ArticleCategoryUpdateDocument,
    "\n  query BaseData {\n    spexCategories(includeRetired: true) { id name firstYear description retired logo { ...ImageFields } }\n    spexAll(includeRetired: true) { id slug year title revival retired published parent { id } category { id name } }\n    taskCategories(includeRetired: true) { id name actorPresent instruments retired }\n    tasks(includeRetired: true) { id name board retired category { id name } }\n  }\n": typeof types.BaseDataDocument,
    "mutation SpexCategoryCreate($input: SpexCategoryInput!) { spexCategoryCreate(input: $input) { id } }": typeof types.SpexCategoryCreateDocument,
    "mutation SpexCategoryUpdate($id: ID!, $input: SpexCategoryInput!) { spexCategoryUpdate(id: $id, input: $input) { id } }": typeof types.SpexCategoryUpdateDocument,
    "mutation SpexCategorySetLogo($id: ID!, $imageId: ID) { spexCategorySetLogo(id: $id, imageId: $imageId) { id } }": typeof types.SpexCategorySetLogoDocument,
    "mutation SpexCreate($input: SpexInput!) { spexCreate(input: $input) { id slug } }": typeof types.SpexCreateDocument,
    "mutation SpexUpdate($id: ID!, $input: SpexInput!) { spexUpdate(id: $id, input: $input) { id slug } }": typeof types.SpexUpdateDocument,
    "mutation SpexRevivalCreate($parentId: ID!, $year: String!) { spexRevivalCreate(parentId: $parentId, year: $year) { id slug } }": typeof types.SpexRevivalCreateDocument,
    "mutation SpexSetPoster($id: ID!, $imageId: ID) { spexSetPoster(id: $id, imageId: $imageId) { id } }": typeof types.SpexSetPosterDocument,
    "mutation TaskCategoryCreate($input: TaskCategoryInput!) { taskCategoryCreate(input: $input) { id } }": typeof types.TaskCategoryCreateDocument,
    "mutation TaskCategoryUpdate($id: ID!, $input: TaskCategoryInput!) { taskCategoryUpdate(id: $id, input: $input) { id } }": typeof types.TaskCategoryUpdateDocument,
    "mutation TaskCreate($input: TaskInput!) { taskCreate(input: $input) { id } }": typeof types.TaskCreateDocument,
    "mutation TaskUpdate($id: ID!, $input: TaskInput!) { taskUpdate(id: $id, input: $input) { id } }": typeof types.TaskUpdateDocument,
    "mutation BaseDataRetire($kind: BaseDataKind!, $id: ID!, $retired: Boolean!) { baseDataRetire(kind: $kind, id: $id, retired: $retired) }": typeof types.BaseDataRetireDocument,
    "mutation BaseDataMerge($kind: BaseDataKind!, $id: ID!, $intoId: ID!) { baseDataMerge(kind: $kind, id: $id, intoId: $intoId) }": typeof types.BaseDataMergeDocument,
    "\n  fragment EditCredit on Credit { name unresolved person { id nickname name } }\n": typeof types.EditCreditFragmentDoc,
    "\n  fragment EditKind on Kind { id name retired valueType }\n": typeof types.EditKindFragmentDoc,
    "\n  query EditKinds {\n    numberKinds: kinds(type: NUMBER, includeRetired: true) { ...EditKind }\n    creditKinds: kinds(type: CREDIT, includeRetired: true) { ...EditKind }\n    factKinds: kinds(type: FACT, includeRetired: true) { ...EditKind }\n    characterImageKinds: kinds(type: IMAGE, use: CHARACTER, includeRetired: true) { ...EditKind }\n    sectionKinds: kinds(type: SECTION, includeRetired: true) { ...EditKind content imageKinds { ...EditKind } }\n  }\n": typeof types.EditKindsDocument,
    "\n  query SpexEdit($id: ID!) {\n    spex(id: $id) {\n      id slug year title revival retired published\n      category { id }\n      revivals { id year retired }\n      parent { id slug title year revivals { id year retired } characters { id name } scenes { id act position title } numbers { id act position title } }\n      poster { ...ImageFields }\n      revivalChanges { kind recordId cut act position }\n      completeness { share sections { section share items { item filled } } }\n      page {\n        premiere introduction shortDescription description synopsis vestDescription published\n        revisionIds { introduction description synopsis }\n        facts { kind { id } value }\n        vestWornBy { ...EditCredit }\n        rebus { ...ImageFields }\n        rebusSolution { ...ImageFields }\n        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }\n        boardPhotos: photos(section: BOARD) { ...PhotoSetFields }\n        history { ...RevisionFields }\n      }\n      links { kind title url detail }\n      records { id title year }\n      sectionOrder\n      sections(includeHidden: true) {\n        id content title ownTitle hidden refId itemIds startSeconds\n        kind { id name content }\n        images { ...PageImageFields }\n        video { title access }\n        photos { title }\n        record { title }\n        document { title access }\n      }\n      characters { id name description position retired images { ...PageImageFields } photos { ...PhotoSetFields } spex { id } }\n      scenes { id act position title place intervalAfter spex { id } }\n      numbers {\n        id act position title originalTitle originalArtist fromWork firstLine retired spex { id }\n        kind { id }\n        credits { kind { id } position credit { ...EditCredit } }\n        characters { id }\n      }\n    }\n  }\n": typeof types.SpexEditDocument,
    "\n  query SpexgramAlbumsForPicking($spexId: ID!) {\n    spexgramAlbums(spexId: $spexId) { id title url items { itemId caption thumbnailUrl previewUrl public video } }\n  }\n": typeof types.SpexgramAlbumsForPickingDocument,
    "mutation SpexPageUpdate($spexId: ID!, $input: SpexPageInput!) { spexPageUpdate(spexId: $spexId, input: $input) { published } }": typeof types.SpexPageUpdateDocument,
    "mutation SpexPageSetImages($spexId: ID!, $sectionId: ID!, $kindId: ID, $images: [ImageRefInput!]!) { spexPageSetImages(spexId: $spexId, sectionId: $sectionId, kindId: $kindId, images: $images) { published } }": typeof types.SpexPageSetImagesDocument,
    "mutation SpexSetSections($spexId: ID!, $sections: [PageSectionInput!]!) { spexSetSections(spexId: $spexId, sections: $sections) { id } }": typeof types.SpexSetSectionsDocument,
    "mutation SpexPageSetFacts($spexId: ID!, $facts: [FactInput!]!) { spexPageSetFacts(spexId: $spexId, facts: $facts) { published } }": typeof types.SpexPageSetFactsDocument,
    "mutation SpexPageSetPhotos($spexId: ID!, $section: PhotoSection!, $characterId: ID, $itemIds: [ID!]!) { spexPageSetPhotos(spexId: $spexId, section: $section, characterId: $characterId, itemIds: $itemIds) { published } }": typeof types.SpexPageSetPhotosDocument,
    "mutation SpexPageSetRebus($spexId: ID!, $rebusImageId: ID, $solutionImageId: ID) { spexPageSetRebus(spexId: $spexId, rebusImageId: $rebusImageId, solutionImageId: $solutionImageId) { published } }": typeof types.SpexPageSetRebusDocument,
    "mutation SpexPageSetPublished($spexId: ID!, $published: Boolean!) { spexPageSetPublished(spexId: $spexId, published: $published) { published } }": typeof types.SpexPageSetPublishedDocument,
    "mutation CharacterCreate($spexId: ID!, $input: CharacterInput!) { characterCreate(spexId: $spexId, input: $input) { id } }": typeof types.CharacterCreateDocument,
    "mutation CharacterUpdate($id: ID!, $input: CharacterInput!) { characterUpdate(id: $id, input: $input) { id } }": typeof types.CharacterUpdateDocument,
    "mutation CharacterDelete($id: ID!) { characterDelete(id: $id) }": typeof types.CharacterDeleteDocument,
    "mutation CharactersPaste($spexId: ID!, $text: String!) { charactersPaste(spexId: $spexId, text: $text) { id } }": typeof types.CharactersPasteDocument,
    "mutation CharactersReorder($spexId: ID!, $ids: [ID!]!) { charactersReorder(spexId: $spexId, ids: $ids) { id } }": typeof types.CharactersReorderDocument,
    "mutation CharacterSetImages($id: ID!, $images: [ImageRefInput!]!) { characterSetImages(id: $id, images: $images) { id } }": typeof types.CharacterSetImagesDocument,
    "mutation SceneCreate($spexId: ID!, $input: SceneInput!) { sceneCreate(spexId: $spexId, input: $input) { id } }": typeof types.SceneCreateDocument,
    "mutation SceneUpdate($id: ID!, $input: SceneInput!) { sceneUpdate(id: $id, input: $input) { id } }": typeof types.SceneUpdateDocument,
    "mutation SceneDelete($id: ID!) { sceneDelete(id: $id) }": typeof types.SceneDeleteDocument,
    "mutation ScenesPaste($spexId: ID!, $text: String!) { scenesPaste(spexId: $spexId, text: $text) { id } }": typeof types.ScenesPasteDocument,
    "mutation ScenesReorder($spexId: ID!, $items: [OrderInput!]!) { scenesReorder(spexId: $spexId, items: $items) { id } }": typeof types.ScenesReorderDocument,
    "mutation NumberCreate($spexId: ID!, $input: NumberInput!) { numberCreate(spexId: $spexId, input: $input) { id } }": typeof types.NumberCreateDocument,
    "mutation NumberUpdate($id: ID!, $input: NumberInput!) { numberUpdate(id: $id, input: $input) { id } }": typeof types.NumberUpdateDocument,
    "mutation CreditResolve($numberId: ID!, $kindId: ID!, $position: Int!, $credit: CreditInput!) { creditResolve(numberId: $numberId, kindId: $kindId, position: $position, credit: $credit) { id } }": typeof types.CreditResolveDocument,
    "\n  query UnresolvedCredits($limit: Int!) {\n    unresolvedCredits(limit: $limit) {\n      total\n      credits { position name kind { id name } number { id title act spex { id slug title year } } }\n    }\n  }\n": typeof types.UnresolvedCreditsDocument,
    "mutation NumberDelete($id: ID!) { numberDelete(id: $id) }": typeof types.NumberDeleteDocument,
    "mutation NumbersPaste($spexId: ID!, $text: String!) { numbersPaste(spexId: $spexId, text: $text) { id } }": typeof types.NumbersPasteDocument,
    "mutation NumbersReorder($spexId: ID!, $items: [OrderInput!]!) { numbersReorder(spexId: $spexId, items: $items) { id } }": typeof types.NumbersReorderDocument,
    "mutation RevivalSetChanges($revivalId: ID!, $kind: RevivalChangeKind!, $changes: [RevivalChangeInput!]!) { revivalSetChanges(revivalId: $revivalId, kind: $kind, changes: $changes) { id } }": typeof types.RevivalSetChangesDocument,
    "mutation ImageUpdate($id: ID!, $input: ImageInput!) { imageUpdate(id: $id, input: $input) { id } }": typeof types.ImageUpdateDocument,
    "mutation ImageTrash($id: ID!) { imageTrash(id: $id) }": typeof types.ImageTrashDocument,
    "mutation ImageRestore($id: ID!) { imageRestore(id: $id) { id } }": typeof types.ImageRestoreDocument,
    "mutation TrashEmpty { trashEmpty }": typeof types.TrashEmptyDocument,
    "\n  query Trash {\n    trash {\n      articles { id slug title trashedAt }\n      images { ...ImageFields trashedAt originalFileName }\n    }\n  }\n": typeof types.TrashDocument,
    "\n  fragment ImageFields on Image {\n    id kind caption alt width height thumbnailUrl pageUrl fullUrl pageJpegUrl\n  }\n": typeof types.ImageFieldsFragmentDoc,
    "\n  fragment PersonFields on Person { id nickname name url }\n": typeof types.PersonFieldsFragmentDoc,
    "\n  fragment CreditFields on Credit { name person { ...PersonFields } }\n": typeof types.CreditFieldsFragmentDoc,
    "\n  fragment PhotoSetFields on PhotoSet {\n    hiddenCount available itemIds\n    photos { itemId caption thumbnailUrl previewUrl width height url public video videoUrl }\n  }\n": typeof types.PhotoSetFieldsFragmentDoc,
    "\n  fragment SpexTile on Spex {\n    id slug year title revival published retired\n    category { id name }\n    poster { ...ImageFields }\n  }\n": typeof types.SpexTileFragmentDoc,
    "\n  fragment KindName on Kind { id name }\n": typeof types.KindNameFragmentDoc,
    "\n  fragment PageImageFields on PageImage { kind { ...KindName } caption image { ...ImageFields } }\n": typeof types.PageImageFieldsFragmentDoc,
    "\n  fragment RevisionFields on Revision {\n    id target targetId targetTitle field comment hidden authorName createdAt previousId\n  }\n": typeof types.RevisionFieldsFragmentDoc,
    "\n  query StartPage {\n    startPage {\n      welcome\n      spexOfTheYear { ...SpexTile page { introduction } }\n      thisDay { date text spex { id slug title year } }\n      decades { decade spex { ...SpexTile } }\n    }\n    spexCategories { id name firstYear logo { ...ImageFields } }\n  }\n": typeof types.StartPageDocument,
    "\n  query SpexPage($id: ID!) {\n    spex(id: $id) {\n      ...SpexTile\n      lastModifiedAt\n      parent { id slug title year }\n      revivals { id slug year published }\n      previous { id slug title year }\n      next { id slug title year }\n      page {\n        premiere introduction shortDescription descriptionHtml synopsisHtml vestDescriptionHtml published lastModifiedAt\n        facts { kind { id name valueType } value }\n        vestWornBy { ...CreditFields }\n        rebus { ...ImageFields }\n        rebusSolution { ...ImageFields }\n        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }\n      }\n      characters {\n        id name descriptionHtml position retired\n        images { ...PageImageFields }\n        playedBy { person { ...PersonFields } spex { id year revival } }\n        photos { ...PhotoSetFields }\n      }\n      scenes { id act position title place intervalAfter }\n      numbers {\n        id act position title originalTitle originalArtist fromWork firstLine retired\n        kind { ...KindName }\n        credits { kind { ...KindName } position credit { ...CreditFields unresolved } }\n        characters { id name }\n        links { kind title url detail }\n        books { id title volume position textOnly url }\n      }\n      records {\n        id title year kindNameSv kindNameEn mediumNameSv mediumNameEn catalogueNumber released conductor coverUrl url\n        tracks { id side discNumber position title hasAudio url number { id title } }\n      }\n      people {\n        available\n        board { spex { id year revival } task { id name } people { ...PersonFields } }\n        tasks { spex { id year revival } task { id name category { id name } } people { ...PersonFields } }\n        boardPhotos { ...PhotoSetFields }\n      }\n      links { kind title url detail }\n      sections {\n        id content title subtitle\n        images { ...PageImageFields }\n        video {\n          id title year durationSeconds access url posterUrl startSeconds\n          chapters { title startSeconds }\n          playback { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n        }\n        photos { albumId title url photos { ...PhotoSetFields } }\n        record {\n          id title year mediumNameSv mediumNameEn catalogueNumber released conductor coverUrl url\n          tracks { id side position title hasAudio url audioUrl number { id title } }\n        }\n        document { id title year kindName access url files { id title pages previewUrl } }\n      }\n    }\n  }\n": typeof types.SpexPageDocument,
    "\n  query SpexBrowse {\n    spexCategories { id name firstYear descriptionHtml logo { ...ImageFields } }\n    spexAll { ...SpexTile completeness { share } }\n  }\n": typeof types.SpexBrowseDocument,
    "\n  query SpexCategoryPage($id: ID!) {\n    spexCategory(id: $id) {\n      id name firstYear descriptionHtml retired\n      logo { ...ImageFields }\n      spex { ...SpexTile page { introduction } }\n    }\n  }\n": typeof types.SpexCategoryPageDocument,
    "\n  fragment ArticleLink on Article { id slug title visibility published }\n": typeof types.ArticleLinkFragmentDoc,
    "\n  query Articles($categoryId: ID, $includeSubcategories: Boolean! = false) {\n    articles(categoryId: $categoryId, includeSubcategories: $includeSubcategories) {\n      ...ArticleLink lastModifiedAt\n      categories { id slug name }\n      parent { id }\n    }\n    articleCategories { id slug name description articleCount parents { id } }\n  }\n": typeof types.ArticlesDocument,
    "\n  query ArticleCategory($id: ID!) {\n    articleCategory(id: $id) {\n      id slug name description articleCount\n      parents { id slug name }\n      subcategories { id slug name articleCount }\n    }\n  }\n": typeof types.ArticleCategoryDocument,
    "\n  query ArticleTree {\n    articleRoots {\n      ...ArticleLink\n      children { ...ArticleLink children { ...ArticleLink children { ...ArticleLink children { id } } } }\n    }\n  }\n": typeof types.ArticleTreeDocument,
    "\n  query WantedArticles { wantedArticles(limit: 500) { title links } }\n": typeof types.WantedArticlesDocument,
    "\n  query OrphanArticles { orphanArticles { ...ArticleLink categories { id slug name } } }\n": typeof types.OrphanArticlesDocument,
    "\n  query Article($id: ID!) {\n    article(id: $id) {\n      id slug title body html visibility published trashedAt createdAt lastModifiedAt editingBy\n      categories { id slug name }\n      revision { ...RevisionFields }\n      parent { id slug title }\n      ancestors { id slug title }\n      children { ...ArticleLink }\n      siblings { ...ArticleLink }\n      backlinks { ...ArticleLink }\n      toc { level anchor text }\n    }\n  }\n": typeof types.ArticleDocument,
    "\n  query ArticleHistory($id: ID!) {\n    article(id: $id) { id slug title history { ...RevisionFields body } }\n  }\n": typeof types.ArticleHistoryDocument,
    "\n  query Revision($id: ID!) { revision(id: $id) { ...RevisionFields body } }\n": typeof types.RevisionDocument,
    "\n  query Search($q: String!) { search(q: $q) { kind id title context path } }\n": typeof types.SearchDocument,
    "\n  query Sitemap { sitemap { path lastModifiedAt } }\n": typeof types.SitemapDocument,
    "\n  query RedirectLookup($title: String!) { redirect(title: $title) }\n": typeof types.RedirectLookupDocument,
    "\n  query MarkdownPreview($markdown: String!) { markdownPreview(markdown: $markdown) }\n": typeof types.MarkdownPreviewDocument,
    "\n  query SpexareSearch($q: String!) { spexareSearch(q: $q) { ...PersonFields } }\n": typeof types.SpexareSearchDocument,
};
const documents: Documents = {
    "\n    query AuditLog($page: Int!, $size: Int!, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n": types.AuditLogDocument,
    "\n    query AuditActors { auditActors { id name } }\n": types.AuditActorsDocument,
    "\n    query Settings {\n        settings {\n            welcomeSv welcomeEn publicWelcomeSv publicWelcomeEn contactEmail lastModifiedAt\n        }\n    }\n": types.SettingsDocument,
    "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { lastModifiedAt } }\n": types.SettingsUpdateDocument,
    "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n": types.MaintenanceJobsDocument,
    "\n    mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }\n": types.MaintenanceJobRunDocument,
    "\n    query SyncConsumers {\n        syncConsumers { id name clientId notifyUrl enabled acknowledged acknowledgedAt lag lastNotifiedAt lastError }\n    }\n": types.SyncConsumersDocument,
    "\n    mutation SyncConsumerSave($input: SyncConsumerInput!) { syncConsumerSave(input: $input) { id } }\n": types.SyncConsumerSaveDocument,
    "\n    mutation SyncConsumerDelete($id: ID!) { syncConsumerDelete(id: $id) }\n": types.SyncConsumerDeleteDocument,
    "\n    query Redirects { redirects { id oldTitle target } }\n": types.RedirectsDocument,
    "\n    mutation RedirectSave($input: RedirectInput!) { redirectSave(input: $input) { id } }\n": types.RedirectSaveDocument,
    "\n    mutation RedirectDelete($id: ID!) { redirectDelete(id: $id) }\n": types.RedirectDeleteDocument,
    "\n    query AdminKinds($type: KindType!, $use: KindUse, $sectionId: ID) {\n        kinds(type: $type, use: $use, sectionId: $sectionId, includeRetired: true) {\n            id type use valueType content name nameSv nameEn subtitleSv subtitleEn aliases position retired\n        }\n    }\n": types.AdminKindsDocument,
    "\n    mutation KindSave($id: ID, $input: KindInput!) { kindSave(id: $id, input: $input) { id } }\n": types.KindSaveDocument,
    "\n    mutation KindsReorder($type: KindType!, $use: KindUse, $sectionId: ID, $ids: [ID!]!) { kindsReorder(type: $type, use: $use, sectionId: $sectionId, ids: $ids) { id } }\n": types.KindsReorderDocument,
    "\n    mutation KindRetire($id: ID!, $retired: Boolean!) { kindRetire(id: $id, retired: $retired) { id } }\n": types.KindRetireDocument,
    "\n    mutation KindDelete($id: ID!) { kindDelete(id: $id) }\n": types.KindDeleteDocument,
    "\n    mutation KindMerge($id: ID!, $intoId: ID!) { kindMerge(id: $id, intoId: $intoId) { id } }\n": types.KindMergeDocument,
    "\n  fragment SpexPackageReportFields on SpexPackageReport {\n    unmatched warnings\n    apps {\n      app status records files created updated unchanged kept failed message webUrl\n      items { kind sourceKey id outcome message warnings }\n    }\n  }\n": types.SpexPackageReportFieldsFragmentDoc,
    "\n  fragment SpexPackageRow on SpexPackage {\n    id state fileName zipFileName zipSize zipReceived progress message uploadedByName createdAt appliedAt\n    spex { id slug title year }\n  }\n": types.SpexPackageRowFragmentDoc,
    "\n  query SpexPackages { spexPackages { ...SpexPackageRow } }\n": types.SpexPackagesDocument,
    "\n  query SpexPackage($id: ID!) {\n    spexPackage(id: $id) {\n      ...SpexPackageRow\n      preview { ...SpexPackageReportFields }\n      results { ...SpexPackageReportFields }\n    }\n  }\n": types.SpexPackageDocument,
    "mutation SpexPackagePreview($id: ID!) { spexPackagePreview(id: $id) { id state } }": types.SpexPackagePreviewDocument,
    "mutation SpexPackageApply($id: ID!) { spexPackageApply(id: $id) { id state } }": types.SpexPackageApplyDocument,
    "mutation SpexPackageDelete($id: ID!) { spexPackageDelete(id: $id) }": types.SpexPackageDeleteDocument,
    "mutation ArticleCreate($input: ArticleInput!) { articleCreate(input: $input) { id slug } }": types.ArticleCreateDocument,
    "\n  mutation ArticleUpdate($id: ID!, $input: ArticleInput!, $baseRevisionId: ID) {\n    articleUpdate(id: $id, input: $input, baseRevisionId: $baseRevisionId) { id slug }\n  }\n": types.ArticleUpdateDocument,
    "mutation ArticleEditing($id: ID!) { articleEditing(id: $id) { id editingBy } }": types.ArticleEditingDocument,
    "mutation ArticleRestore($id: ID!, $revisionId: ID!) { articleRestore(id: $id, revisionId: $revisionId) { id slug } }": types.ArticleRestoreDocument,
    "mutation ArticleSetPublished($id: ID!, $published: Boolean!) { articleSetPublished(id: $id, published: $published) { id } }": types.ArticleSetPublishedDocument,
    "mutation ArticleTrash($id: ID!, $withChildren: Boolean!) { articleTrash(id: $id, withChildren: $withChildren) }": types.ArticleTrashDocument,
    "mutation ArticleMove($id: ID!, $parentId: ID, $position: Int) { articleMove(id: $id, parentId: $parentId, position: $position) { id } }": types.ArticleMoveDocument,
    "mutation ArticleReorderChildren($parentId: ID, $ids: [ID!]!) { articleReorderChildren(parentId: $parentId, ids: $ids) { id } }": types.ArticleReorderChildrenDocument,
    "mutation ArticleRestoreFromTrash($id: ID!) { articleRestoreFromTrash(id: $id) { id } }": types.ArticleRestoreFromTrashDocument,
    "mutation RevisionSetHidden($id: ID!, $hidden: Boolean!) { revisionSetHidden(id: $id, hidden: $hidden) { id } }": types.RevisionSetHiddenDocument,
    "mutation ArticleCategoryCreate($input: ArticleCategoryInput!) { articleCategoryCreate(input: $input) { id slug } }": types.ArticleCategoryCreateDocument,
    "mutation ArticleCategoryUpdate($id: ID!, $input: ArticleCategoryInput!) { articleCategoryUpdate(id: $id, input: $input) { id slug } }": types.ArticleCategoryUpdateDocument,
    "\n  query BaseData {\n    spexCategories(includeRetired: true) { id name firstYear description retired logo { ...ImageFields } }\n    spexAll(includeRetired: true) { id slug year title revival retired published parent { id } category { id name } }\n    taskCategories(includeRetired: true) { id name actorPresent instruments retired }\n    tasks(includeRetired: true) { id name board retired category { id name } }\n  }\n": types.BaseDataDocument,
    "mutation SpexCategoryCreate($input: SpexCategoryInput!) { spexCategoryCreate(input: $input) { id } }": types.SpexCategoryCreateDocument,
    "mutation SpexCategoryUpdate($id: ID!, $input: SpexCategoryInput!) { spexCategoryUpdate(id: $id, input: $input) { id } }": types.SpexCategoryUpdateDocument,
    "mutation SpexCategorySetLogo($id: ID!, $imageId: ID) { spexCategorySetLogo(id: $id, imageId: $imageId) { id } }": types.SpexCategorySetLogoDocument,
    "mutation SpexCreate($input: SpexInput!) { spexCreate(input: $input) { id slug } }": types.SpexCreateDocument,
    "mutation SpexUpdate($id: ID!, $input: SpexInput!) { spexUpdate(id: $id, input: $input) { id slug } }": types.SpexUpdateDocument,
    "mutation SpexRevivalCreate($parentId: ID!, $year: String!) { spexRevivalCreate(parentId: $parentId, year: $year) { id slug } }": types.SpexRevivalCreateDocument,
    "mutation SpexSetPoster($id: ID!, $imageId: ID) { spexSetPoster(id: $id, imageId: $imageId) { id } }": types.SpexSetPosterDocument,
    "mutation TaskCategoryCreate($input: TaskCategoryInput!) { taskCategoryCreate(input: $input) { id } }": types.TaskCategoryCreateDocument,
    "mutation TaskCategoryUpdate($id: ID!, $input: TaskCategoryInput!) { taskCategoryUpdate(id: $id, input: $input) { id } }": types.TaskCategoryUpdateDocument,
    "mutation TaskCreate($input: TaskInput!) { taskCreate(input: $input) { id } }": types.TaskCreateDocument,
    "mutation TaskUpdate($id: ID!, $input: TaskInput!) { taskUpdate(id: $id, input: $input) { id } }": types.TaskUpdateDocument,
    "mutation BaseDataRetire($kind: BaseDataKind!, $id: ID!, $retired: Boolean!) { baseDataRetire(kind: $kind, id: $id, retired: $retired) }": types.BaseDataRetireDocument,
    "mutation BaseDataMerge($kind: BaseDataKind!, $id: ID!, $intoId: ID!) { baseDataMerge(kind: $kind, id: $id, intoId: $intoId) }": types.BaseDataMergeDocument,
    "\n  fragment EditCredit on Credit { name unresolved person { id nickname name } }\n": types.EditCreditFragmentDoc,
    "\n  fragment EditKind on Kind { id name retired valueType }\n": types.EditKindFragmentDoc,
    "\n  query EditKinds {\n    numberKinds: kinds(type: NUMBER, includeRetired: true) { ...EditKind }\n    creditKinds: kinds(type: CREDIT, includeRetired: true) { ...EditKind }\n    factKinds: kinds(type: FACT, includeRetired: true) { ...EditKind }\n    characterImageKinds: kinds(type: IMAGE, use: CHARACTER, includeRetired: true) { ...EditKind }\n    sectionKinds: kinds(type: SECTION, includeRetired: true) { ...EditKind content imageKinds { ...EditKind } }\n  }\n": types.EditKindsDocument,
    "\n  query SpexEdit($id: ID!) {\n    spex(id: $id) {\n      id slug year title revival retired published\n      category { id }\n      revivals { id year retired }\n      parent { id slug title year revivals { id year retired } characters { id name } scenes { id act position title } numbers { id act position title } }\n      poster { ...ImageFields }\n      revivalChanges { kind recordId cut act position }\n      completeness { share sections { section share items { item filled } } }\n      page {\n        premiere introduction shortDescription description synopsis vestDescription published\n        revisionIds { introduction description synopsis }\n        facts { kind { id } value }\n        vestWornBy { ...EditCredit }\n        rebus { ...ImageFields }\n        rebusSolution { ...ImageFields }\n        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }\n        boardPhotos: photos(section: BOARD) { ...PhotoSetFields }\n        history { ...RevisionFields }\n      }\n      links { kind title url detail }\n      records { id title year }\n      sectionOrder\n      sections(includeHidden: true) {\n        id content title ownTitle hidden refId itemIds startSeconds\n        kind { id name content }\n        images { ...PageImageFields }\n        video { title access }\n        photos { title }\n        record { title }\n        document { title access }\n      }\n      characters { id name description position retired images { ...PageImageFields } photos { ...PhotoSetFields } spex { id } }\n      scenes { id act position title place intervalAfter spex { id } }\n      numbers {\n        id act position title originalTitle originalArtist fromWork firstLine retired spex { id }\n        kind { id }\n        credits { kind { id } position credit { ...EditCredit } }\n        characters { id }\n      }\n    }\n  }\n": types.SpexEditDocument,
    "\n  query SpexgramAlbumsForPicking($spexId: ID!) {\n    spexgramAlbums(spexId: $spexId) { id title url items { itemId caption thumbnailUrl previewUrl public video } }\n  }\n": types.SpexgramAlbumsForPickingDocument,
    "mutation SpexPageUpdate($spexId: ID!, $input: SpexPageInput!) { spexPageUpdate(spexId: $spexId, input: $input) { published } }": types.SpexPageUpdateDocument,
    "mutation SpexPageSetImages($spexId: ID!, $sectionId: ID!, $kindId: ID, $images: [ImageRefInput!]!) { spexPageSetImages(spexId: $spexId, sectionId: $sectionId, kindId: $kindId, images: $images) { published } }": types.SpexPageSetImagesDocument,
    "mutation SpexSetSections($spexId: ID!, $sections: [PageSectionInput!]!) { spexSetSections(spexId: $spexId, sections: $sections) { id } }": types.SpexSetSectionsDocument,
    "mutation SpexPageSetFacts($spexId: ID!, $facts: [FactInput!]!) { spexPageSetFacts(spexId: $spexId, facts: $facts) { published } }": types.SpexPageSetFactsDocument,
    "mutation SpexPageSetPhotos($spexId: ID!, $section: PhotoSection!, $characterId: ID, $itemIds: [ID!]!) { spexPageSetPhotos(spexId: $spexId, section: $section, characterId: $characterId, itemIds: $itemIds) { published } }": types.SpexPageSetPhotosDocument,
    "mutation SpexPageSetRebus($spexId: ID!, $rebusImageId: ID, $solutionImageId: ID) { spexPageSetRebus(spexId: $spexId, rebusImageId: $rebusImageId, solutionImageId: $solutionImageId) { published } }": types.SpexPageSetRebusDocument,
    "mutation SpexPageSetPublished($spexId: ID!, $published: Boolean!) { spexPageSetPublished(spexId: $spexId, published: $published) { published } }": types.SpexPageSetPublishedDocument,
    "mutation CharacterCreate($spexId: ID!, $input: CharacterInput!) { characterCreate(spexId: $spexId, input: $input) { id } }": types.CharacterCreateDocument,
    "mutation CharacterUpdate($id: ID!, $input: CharacterInput!) { characterUpdate(id: $id, input: $input) { id } }": types.CharacterUpdateDocument,
    "mutation CharacterDelete($id: ID!) { characterDelete(id: $id) }": types.CharacterDeleteDocument,
    "mutation CharactersPaste($spexId: ID!, $text: String!) { charactersPaste(spexId: $spexId, text: $text) { id } }": types.CharactersPasteDocument,
    "mutation CharactersReorder($spexId: ID!, $ids: [ID!]!) { charactersReorder(spexId: $spexId, ids: $ids) { id } }": types.CharactersReorderDocument,
    "mutation CharacterSetImages($id: ID!, $images: [ImageRefInput!]!) { characterSetImages(id: $id, images: $images) { id } }": types.CharacterSetImagesDocument,
    "mutation SceneCreate($spexId: ID!, $input: SceneInput!) { sceneCreate(spexId: $spexId, input: $input) { id } }": types.SceneCreateDocument,
    "mutation SceneUpdate($id: ID!, $input: SceneInput!) { sceneUpdate(id: $id, input: $input) { id } }": types.SceneUpdateDocument,
    "mutation SceneDelete($id: ID!) { sceneDelete(id: $id) }": types.SceneDeleteDocument,
    "mutation ScenesPaste($spexId: ID!, $text: String!) { scenesPaste(spexId: $spexId, text: $text) { id } }": types.ScenesPasteDocument,
    "mutation ScenesReorder($spexId: ID!, $items: [OrderInput!]!) { scenesReorder(spexId: $spexId, items: $items) { id } }": types.ScenesReorderDocument,
    "mutation NumberCreate($spexId: ID!, $input: NumberInput!) { numberCreate(spexId: $spexId, input: $input) { id } }": types.NumberCreateDocument,
    "mutation NumberUpdate($id: ID!, $input: NumberInput!) { numberUpdate(id: $id, input: $input) { id } }": types.NumberUpdateDocument,
    "mutation CreditResolve($numberId: ID!, $kindId: ID!, $position: Int!, $credit: CreditInput!) { creditResolve(numberId: $numberId, kindId: $kindId, position: $position, credit: $credit) { id } }": types.CreditResolveDocument,
    "\n  query UnresolvedCredits($limit: Int!) {\n    unresolvedCredits(limit: $limit) {\n      total\n      credits { position name kind { id name } number { id title act spex { id slug title year } } }\n    }\n  }\n": types.UnresolvedCreditsDocument,
    "mutation NumberDelete($id: ID!) { numberDelete(id: $id) }": types.NumberDeleteDocument,
    "mutation NumbersPaste($spexId: ID!, $text: String!) { numbersPaste(spexId: $spexId, text: $text) { id } }": types.NumbersPasteDocument,
    "mutation NumbersReorder($spexId: ID!, $items: [OrderInput!]!) { numbersReorder(spexId: $spexId, items: $items) { id } }": types.NumbersReorderDocument,
    "mutation RevivalSetChanges($revivalId: ID!, $kind: RevivalChangeKind!, $changes: [RevivalChangeInput!]!) { revivalSetChanges(revivalId: $revivalId, kind: $kind, changes: $changes) { id } }": types.RevivalSetChangesDocument,
    "mutation ImageUpdate($id: ID!, $input: ImageInput!) { imageUpdate(id: $id, input: $input) { id } }": types.ImageUpdateDocument,
    "mutation ImageTrash($id: ID!) { imageTrash(id: $id) }": types.ImageTrashDocument,
    "mutation ImageRestore($id: ID!) { imageRestore(id: $id) { id } }": types.ImageRestoreDocument,
    "mutation TrashEmpty { trashEmpty }": types.TrashEmptyDocument,
    "\n  query Trash {\n    trash {\n      articles { id slug title trashedAt }\n      images { ...ImageFields trashedAt originalFileName }\n    }\n  }\n": types.TrashDocument,
    "\n  fragment ImageFields on Image {\n    id kind caption alt width height thumbnailUrl pageUrl fullUrl pageJpegUrl\n  }\n": types.ImageFieldsFragmentDoc,
    "\n  fragment PersonFields on Person { id nickname name url }\n": types.PersonFieldsFragmentDoc,
    "\n  fragment CreditFields on Credit { name person { ...PersonFields } }\n": types.CreditFieldsFragmentDoc,
    "\n  fragment PhotoSetFields on PhotoSet {\n    hiddenCount available itemIds\n    photos { itemId caption thumbnailUrl previewUrl width height url public video videoUrl }\n  }\n": types.PhotoSetFieldsFragmentDoc,
    "\n  fragment SpexTile on Spex {\n    id slug year title revival published retired\n    category { id name }\n    poster { ...ImageFields }\n  }\n": types.SpexTileFragmentDoc,
    "\n  fragment KindName on Kind { id name }\n": types.KindNameFragmentDoc,
    "\n  fragment PageImageFields on PageImage { kind { ...KindName } caption image { ...ImageFields } }\n": types.PageImageFieldsFragmentDoc,
    "\n  fragment RevisionFields on Revision {\n    id target targetId targetTitle field comment hidden authorName createdAt previousId\n  }\n": types.RevisionFieldsFragmentDoc,
    "\n  query StartPage {\n    startPage {\n      welcome\n      spexOfTheYear { ...SpexTile page { introduction } }\n      thisDay { date text spex { id slug title year } }\n      decades { decade spex { ...SpexTile } }\n    }\n    spexCategories { id name firstYear logo { ...ImageFields } }\n  }\n": types.StartPageDocument,
    "\n  query SpexPage($id: ID!) {\n    spex(id: $id) {\n      ...SpexTile\n      lastModifiedAt\n      parent { id slug title year }\n      revivals { id slug year published }\n      previous { id slug title year }\n      next { id slug title year }\n      page {\n        premiere introduction shortDescription descriptionHtml synopsisHtml vestDescriptionHtml published lastModifiedAt\n        facts { kind { id name valueType } value }\n        vestWornBy { ...CreditFields }\n        rebus { ...ImageFields }\n        rebusSolution { ...ImageFields }\n        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }\n      }\n      characters {\n        id name descriptionHtml position retired\n        images { ...PageImageFields }\n        playedBy { person { ...PersonFields } spex { id year revival } }\n        photos { ...PhotoSetFields }\n      }\n      scenes { id act position title place intervalAfter }\n      numbers {\n        id act position title originalTitle originalArtist fromWork firstLine retired\n        kind { ...KindName }\n        credits { kind { ...KindName } position credit { ...CreditFields unresolved } }\n        characters { id name }\n        links { kind title url detail }\n        books { id title volume position textOnly url }\n      }\n      records {\n        id title year kindNameSv kindNameEn mediumNameSv mediumNameEn catalogueNumber released conductor coverUrl url\n        tracks { id side discNumber position title hasAudio url number { id title } }\n      }\n      people {\n        available\n        board { spex { id year revival } task { id name } people { ...PersonFields } }\n        tasks { spex { id year revival } task { id name category { id name } } people { ...PersonFields } }\n        boardPhotos { ...PhotoSetFields }\n      }\n      links { kind title url detail }\n      sections {\n        id content title subtitle\n        images { ...PageImageFields }\n        video {\n          id title year durationSeconds access url posterUrl startSeconds\n          chapters { title startSeconds }\n          playback { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n        }\n        photos { albumId title url photos { ...PhotoSetFields } }\n        record {\n          id title year mediumNameSv mediumNameEn catalogueNumber released conductor coverUrl url\n          tracks { id side position title hasAudio url audioUrl number { id title } }\n        }\n        document { id title year kindName access url files { id title pages previewUrl } }\n      }\n    }\n  }\n": types.SpexPageDocument,
    "\n  query SpexBrowse {\n    spexCategories { id name firstYear descriptionHtml logo { ...ImageFields } }\n    spexAll { ...SpexTile completeness { share } }\n  }\n": types.SpexBrowseDocument,
    "\n  query SpexCategoryPage($id: ID!) {\n    spexCategory(id: $id) {\n      id name firstYear descriptionHtml retired\n      logo { ...ImageFields }\n      spex { ...SpexTile page { introduction } }\n    }\n  }\n": types.SpexCategoryPageDocument,
    "\n  fragment ArticleLink on Article { id slug title visibility published }\n": types.ArticleLinkFragmentDoc,
    "\n  query Articles($categoryId: ID, $includeSubcategories: Boolean! = false) {\n    articles(categoryId: $categoryId, includeSubcategories: $includeSubcategories) {\n      ...ArticleLink lastModifiedAt\n      categories { id slug name }\n      parent { id }\n    }\n    articleCategories { id slug name description articleCount parents { id } }\n  }\n": types.ArticlesDocument,
    "\n  query ArticleCategory($id: ID!) {\n    articleCategory(id: $id) {\n      id slug name description articleCount\n      parents { id slug name }\n      subcategories { id slug name articleCount }\n    }\n  }\n": types.ArticleCategoryDocument,
    "\n  query ArticleTree {\n    articleRoots {\n      ...ArticleLink\n      children { ...ArticleLink children { ...ArticleLink children { ...ArticleLink children { id } } } }\n    }\n  }\n": types.ArticleTreeDocument,
    "\n  query WantedArticles { wantedArticles(limit: 500) { title links } }\n": types.WantedArticlesDocument,
    "\n  query OrphanArticles { orphanArticles { ...ArticleLink categories { id slug name } } }\n": types.OrphanArticlesDocument,
    "\n  query Article($id: ID!) {\n    article(id: $id) {\n      id slug title body html visibility published trashedAt createdAt lastModifiedAt editingBy\n      categories { id slug name }\n      revision { ...RevisionFields }\n      parent { id slug title }\n      ancestors { id slug title }\n      children { ...ArticleLink }\n      siblings { ...ArticleLink }\n      backlinks { ...ArticleLink }\n      toc { level anchor text }\n    }\n  }\n": types.ArticleDocument,
    "\n  query ArticleHistory($id: ID!) {\n    article(id: $id) { id slug title history { ...RevisionFields body } }\n  }\n": types.ArticleHistoryDocument,
    "\n  query Revision($id: ID!) { revision(id: $id) { ...RevisionFields body } }\n": types.RevisionDocument,
    "\n  query Search($q: String!) { search(q: $q) { kind id title context path } }\n": types.SearchDocument,
    "\n  query Sitemap { sitemap { path lastModifiedAt } }\n": types.SitemapDocument,
    "\n  query RedirectLookup($title: String!) { redirect(title: $title) }\n": types.RedirectLookupDocument,
    "\n  query MarkdownPreview($markdown: String!) { markdownPreview(markdown: $markdown) }\n": types.MarkdownPreviewDocument,
    "\n  query SpexareSearch($q: String!) { spexareSearch(q: $q) { ...PersonFields } }\n": types.SpexareSearchDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AuditLog($page: Int!, $size: Int!, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n"): (typeof documents)["\n    query AuditLog($page: Int!, $size: Int!, $filter: AuditFilter) {\n        auditLog(page: $page, size: $size, filter: $filter) {\n            totalCount page size\n            entries { id at actorId actorName action entityType entityId summary }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AuditActors { auditActors { id name } }\n"): (typeof documents)["\n    query AuditActors { auditActors { id name } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Settings {\n        settings {\n            welcomeSv welcomeEn publicWelcomeSv publicWelcomeEn contactEmail lastModifiedAt\n        }\n    }\n"): (typeof documents)["\n    query Settings {\n        settings {\n            welcomeSv welcomeEn publicWelcomeSv publicWelcomeEn contactEmail lastModifiedAt\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { lastModifiedAt } }\n"): (typeof documents)["\n    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { lastModifiedAt } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n"): (typeof documents)["\n    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }\n"): (typeof documents)["\n    mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SyncConsumers {\n        syncConsumers { id name clientId notifyUrl enabled acknowledged acknowledgedAt lag lastNotifiedAt lastError }\n    }\n"): (typeof documents)["\n    query SyncConsumers {\n        syncConsumers { id name clientId notifyUrl enabled acknowledged acknowledgedAt lag lastNotifiedAt lastError }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SyncConsumerSave($input: SyncConsumerInput!) { syncConsumerSave(input: $input) { id } }\n"): (typeof documents)["\n    mutation SyncConsumerSave($input: SyncConsumerInput!) { syncConsumerSave(input: $input) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SyncConsumerDelete($id: ID!) { syncConsumerDelete(id: $id) }\n"): (typeof documents)["\n    mutation SyncConsumerDelete($id: ID!) { syncConsumerDelete(id: $id) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Redirects { redirects { id oldTitle target } }\n"): (typeof documents)["\n    query Redirects { redirects { id oldTitle target } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RedirectSave($input: RedirectInput!) { redirectSave(input: $input) { id } }\n"): (typeof documents)["\n    mutation RedirectSave($input: RedirectInput!) { redirectSave(input: $input) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RedirectDelete($id: ID!) { redirectDelete(id: $id) }\n"): (typeof documents)["\n    mutation RedirectDelete($id: ID!) { redirectDelete(id: $id) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AdminKinds($type: KindType!, $use: KindUse, $sectionId: ID) {\n        kinds(type: $type, use: $use, sectionId: $sectionId, includeRetired: true) {\n            id type use valueType content name nameSv nameEn subtitleSv subtitleEn aliases position retired\n        }\n    }\n"): (typeof documents)["\n    query AdminKinds($type: KindType!, $use: KindUse, $sectionId: ID) {\n        kinds(type: $type, use: $use, sectionId: $sectionId, includeRetired: true) {\n            id type use valueType content name nameSv nameEn subtitleSv subtitleEn aliases position retired\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation KindSave($id: ID, $input: KindInput!) { kindSave(id: $id, input: $input) { id } }\n"): (typeof documents)["\n    mutation KindSave($id: ID, $input: KindInput!) { kindSave(id: $id, input: $input) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation KindsReorder($type: KindType!, $use: KindUse, $sectionId: ID, $ids: [ID!]!) { kindsReorder(type: $type, use: $use, sectionId: $sectionId, ids: $ids) { id } }\n"): (typeof documents)["\n    mutation KindsReorder($type: KindType!, $use: KindUse, $sectionId: ID, $ids: [ID!]!) { kindsReorder(type: $type, use: $use, sectionId: $sectionId, ids: $ids) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation KindRetire($id: ID!, $retired: Boolean!) { kindRetire(id: $id, retired: $retired) { id } }\n"): (typeof documents)["\n    mutation KindRetire($id: ID!, $retired: Boolean!) { kindRetire(id: $id, retired: $retired) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation KindDelete($id: ID!) { kindDelete(id: $id) }\n"): (typeof documents)["\n    mutation KindDelete($id: ID!) { kindDelete(id: $id) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation KindMerge($id: ID!, $intoId: ID!) { kindMerge(id: $id, intoId: $intoId) { id } }\n"): (typeof documents)["\n    mutation KindMerge($id: ID!, $intoId: ID!) { kindMerge(id: $id, intoId: $intoId) { id } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SpexPackageReportFields on SpexPackageReport {\n    unmatched warnings\n    apps {\n      app status records files created updated unchanged kept failed message webUrl\n      items { kind sourceKey id outcome message warnings }\n    }\n  }\n"): (typeof documents)["\n  fragment SpexPackageReportFields on SpexPackageReport {\n    unmatched warnings\n    apps {\n      app status records files created updated unchanged kept failed message webUrl\n      items { kind sourceKey id outcome message warnings }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SpexPackageRow on SpexPackage {\n    id state fileName zipFileName zipSize zipReceived progress message uploadedByName createdAt appliedAt\n    spex { id slug title year }\n  }\n"): (typeof documents)["\n  fragment SpexPackageRow on SpexPackage {\n    id state fileName zipFileName zipSize zipReceived progress message uploadedByName createdAt appliedAt\n    spex { id slug title year }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpexPackages { spexPackages { ...SpexPackageRow } }\n"): (typeof documents)["\n  query SpexPackages { spexPackages { ...SpexPackageRow } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpexPackage($id: ID!) {\n    spexPackage(id: $id) {\n      ...SpexPackageRow\n      preview { ...SpexPackageReportFields }\n      results { ...SpexPackageReportFields }\n    }\n  }\n"): (typeof documents)["\n  query SpexPackage($id: ID!) {\n    spexPackage(id: $id) {\n      ...SpexPackageRow\n      preview { ...SpexPackageReportFields }\n      results { ...SpexPackageReportFields }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexPackagePreview($id: ID!) { spexPackagePreview(id: $id) { id state } }"): (typeof documents)["mutation SpexPackagePreview($id: ID!) { spexPackagePreview(id: $id) { id state } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexPackageApply($id: ID!) { spexPackageApply(id: $id) { id state } }"): (typeof documents)["mutation SpexPackageApply($id: ID!) { spexPackageApply(id: $id) { id state } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexPackageDelete($id: ID!) { spexPackageDelete(id: $id) }"): (typeof documents)["mutation SpexPackageDelete($id: ID!) { spexPackageDelete(id: $id) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleCreate($input: ArticleInput!) { articleCreate(input: $input) { id slug } }"): (typeof documents)["mutation ArticleCreate($input: ArticleInput!) { articleCreate(input: $input) { id slug } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ArticleUpdate($id: ID!, $input: ArticleInput!, $baseRevisionId: ID) {\n    articleUpdate(id: $id, input: $input, baseRevisionId: $baseRevisionId) { id slug }\n  }\n"): (typeof documents)["\n  mutation ArticleUpdate($id: ID!, $input: ArticleInput!, $baseRevisionId: ID) {\n    articleUpdate(id: $id, input: $input, baseRevisionId: $baseRevisionId) { id slug }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleEditing($id: ID!) { articleEditing(id: $id) { id editingBy } }"): (typeof documents)["mutation ArticleEditing($id: ID!) { articleEditing(id: $id) { id editingBy } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleRestore($id: ID!, $revisionId: ID!) { articleRestore(id: $id, revisionId: $revisionId) { id slug } }"): (typeof documents)["mutation ArticleRestore($id: ID!, $revisionId: ID!) { articleRestore(id: $id, revisionId: $revisionId) { id slug } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleSetPublished($id: ID!, $published: Boolean!) { articleSetPublished(id: $id, published: $published) { id } }"): (typeof documents)["mutation ArticleSetPublished($id: ID!, $published: Boolean!) { articleSetPublished(id: $id, published: $published) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleTrash($id: ID!, $withChildren: Boolean!) { articleTrash(id: $id, withChildren: $withChildren) }"): (typeof documents)["mutation ArticleTrash($id: ID!, $withChildren: Boolean!) { articleTrash(id: $id, withChildren: $withChildren) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleMove($id: ID!, $parentId: ID, $position: Int) { articleMove(id: $id, parentId: $parentId, position: $position) { id } }"): (typeof documents)["mutation ArticleMove($id: ID!, $parentId: ID, $position: Int) { articleMove(id: $id, parentId: $parentId, position: $position) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleReorderChildren($parentId: ID, $ids: [ID!]!) { articleReorderChildren(parentId: $parentId, ids: $ids) { id } }"): (typeof documents)["mutation ArticleReorderChildren($parentId: ID, $ids: [ID!]!) { articleReorderChildren(parentId: $parentId, ids: $ids) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleRestoreFromTrash($id: ID!) { articleRestoreFromTrash(id: $id) { id } }"): (typeof documents)["mutation ArticleRestoreFromTrash($id: ID!) { articleRestoreFromTrash(id: $id) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RevisionSetHidden($id: ID!, $hidden: Boolean!) { revisionSetHidden(id: $id, hidden: $hidden) { id } }"): (typeof documents)["mutation RevisionSetHidden($id: ID!, $hidden: Boolean!) { revisionSetHidden(id: $id, hidden: $hidden) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleCategoryCreate($input: ArticleCategoryInput!) { articleCategoryCreate(input: $input) { id slug } }"): (typeof documents)["mutation ArticleCategoryCreate($input: ArticleCategoryInput!) { articleCategoryCreate(input: $input) { id slug } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ArticleCategoryUpdate($id: ID!, $input: ArticleCategoryInput!) { articleCategoryUpdate(id: $id, input: $input) { id slug } }"): (typeof documents)["mutation ArticleCategoryUpdate($id: ID!, $input: ArticleCategoryInput!) { articleCategoryUpdate(id: $id, input: $input) { id slug } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BaseData {\n    spexCategories(includeRetired: true) { id name firstYear description retired logo { ...ImageFields } }\n    spexAll(includeRetired: true) { id slug year title revival retired published parent { id } category { id name } }\n    taskCategories(includeRetired: true) { id name actorPresent instruments retired }\n    tasks(includeRetired: true) { id name board retired category { id name } }\n  }\n"): (typeof documents)["\n  query BaseData {\n    spexCategories(includeRetired: true) { id name firstYear description retired logo { ...ImageFields } }\n    spexAll(includeRetired: true) { id slug year title revival retired published parent { id } category { id name } }\n    taskCategories(includeRetired: true) { id name actorPresent instruments retired }\n    tasks(includeRetired: true) { id name board retired category { id name } }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexCategoryCreate($input: SpexCategoryInput!) { spexCategoryCreate(input: $input) { id } }"): (typeof documents)["mutation SpexCategoryCreate($input: SpexCategoryInput!) { spexCategoryCreate(input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexCategoryUpdate($id: ID!, $input: SpexCategoryInput!) { spexCategoryUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation SpexCategoryUpdate($id: ID!, $input: SpexCategoryInput!) { spexCategoryUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexCategorySetLogo($id: ID!, $imageId: ID) { spexCategorySetLogo(id: $id, imageId: $imageId) { id } }"): (typeof documents)["mutation SpexCategorySetLogo($id: ID!, $imageId: ID) { spexCategorySetLogo(id: $id, imageId: $imageId) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexCreate($input: SpexInput!) { spexCreate(input: $input) { id slug } }"): (typeof documents)["mutation SpexCreate($input: SpexInput!) { spexCreate(input: $input) { id slug } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexUpdate($id: ID!, $input: SpexInput!) { spexUpdate(id: $id, input: $input) { id slug } }"): (typeof documents)["mutation SpexUpdate($id: ID!, $input: SpexInput!) { spexUpdate(id: $id, input: $input) { id slug } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexRevivalCreate($parentId: ID!, $year: String!) { spexRevivalCreate(parentId: $parentId, year: $year) { id slug } }"): (typeof documents)["mutation SpexRevivalCreate($parentId: ID!, $year: String!) { spexRevivalCreate(parentId: $parentId, year: $year) { id slug } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexSetPoster($id: ID!, $imageId: ID) { spexSetPoster(id: $id, imageId: $imageId) { id } }"): (typeof documents)["mutation SpexSetPoster($id: ID!, $imageId: ID) { spexSetPoster(id: $id, imageId: $imageId) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation TaskCategoryCreate($input: TaskCategoryInput!) { taskCategoryCreate(input: $input) { id } }"): (typeof documents)["mutation TaskCategoryCreate($input: TaskCategoryInput!) { taskCategoryCreate(input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation TaskCategoryUpdate($id: ID!, $input: TaskCategoryInput!) { taskCategoryUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation TaskCategoryUpdate($id: ID!, $input: TaskCategoryInput!) { taskCategoryUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation TaskCreate($input: TaskInput!) { taskCreate(input: $input) { id } }"): (typeof documents)["mutation TaskCreate($input: TaskInput!) { taskCreate(input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation TaskUpdate($id: ID!, $input: TaskInput!) { taskUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation TaskUpdate($id: ID!, $input: TaskInput!) { taskUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation BaseDataRetire($kind: BaseDataKind!, $id: ID!, $retired: Boolean!) { baseDataRetire(kind: $kind, id: $id, retired: $retired) }"): (typeof documents)["mutation BaseDataRetire($kind: BaseDataKind!, $id: ID!, $retired: Boolean!) { baseDataRetire(kind: $kind, id: $id, retired: $retired) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation BaseDataMerge($kind: BaseDataKind!, $id: ID!, $intoId: ID!) { baseDataMerge(kind: $kind, id: $id, intoId: $intoId) }"): (typeof documents)["mutation BaseDataMerge($kind: BaseDataKind!, $id: ID!, $intoId: ID!) { baseDataMerge(kind: $kind, id: $id, intoId: $intoId) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment EditCredit on Credit { name unresolved person { id nickname name } }\n"): (typeof documents)["\n  fragment EditCredit on Credit { name unresolved person { id nickname name } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment EditKind on Kind { id name retired valueType }\n"): (typeof documents)["\n  fragment EditKind on Kind { id name retired valueType }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EditKinds {\n    numberKinds: kinds(type: NUMBER, includeRetired: true) { ...EditKind }\n    creditKinds: kinds(type: CREDIT, includeRetired: true) { ...EditKind }\n    factKinds: kinds(type: FACT, includeRetired: true) { ...EditKind }\n    characterImageKinds: kinds(type: IMAGE, use: CHARACTER, includeRetired: true) { ...EditKind }\n    sectionKinds: kinds(type: SECTION, includeRetired: true) { ...EditKind content imageKinds { ...EditKind } }\n  }\n"): (typeof documents)["\n  query EditKinds {\n    numberKinds: kinds(type: NUMBER, includeRetired: true) { ...EditKind }\n    creditKinds: kinds(type: CREDIT, includeRetired: true) { ...EditKind }\n    factKinds: kinds(type: FACT, includeRetired: true) { ...EditKind }\n    characterImageKinds: kinds(type: IMAGE, use: CHARACTER, includeRetired: true) { ...EditKind }\n    sectionKinds: kinds(type: SECTION, includeRetired: true) { ...EditKind content imageKinds { ...EditKind } }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpexEdit($id: ID!) {\n    spex(id: $id) {\n      id slug year title revival retired published\n      category { id }\n      revivals { id year retired }\n      parent { id slug title year revivals { id year retired } characters { id name } scenes { id act position title } numbers { id act position title } }\n      poster { ...ImageFields }\n      revivalChanges { kind recordId cut act position }\n      completeness { share sections { section share items { item filled } } }\n      page {\n        premiere introduction shortDescription description synopsis vestDescription published\n        revisionIds { introduction description synopsis }\n        facts { kind { id } value }\n        vestWornBy { ...EditCredit }\n        rebus { ...ImageFields }\n        rebusSolution { ...ImageFields }\n        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }\n        boardPhotos: photos(section: BOARD) { ...PhotoSetFields }\n        history { ...RevisionFields }\n      }\n      links { kind title url detail }\n      records { id title year }\n      sectionOrder\n      sections(includeHidden: true) {\n        id content title ownTitle hidden refId itemIds startSeconds\n        kind { id name content }\n        images { ...PageImageFields }\n        video { title access }\n        photos { title }\n        record { title }\n        document { title access }\n      }\n      characters { id name description position retired images { ...PageImageFields } photos { ...PhotoSetFields } spex { id } }\n      scenes { id act position title place intervalAfter spex { id } }\n      numbers {\n        id act position title originalTitle originalArtist fromWork firstLine retired spex { id }\n        kind { id }\n        credits { kind { id } position credit { ...EditCredit } }\n        characters { id }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SpexEdit($id: ID!) {\n    spex(id: $id) {\n      id slug year title revival retired published\n      category { id }\n      revivals { id year retired }\n      parent { id slug title year revivals { id year retired } characters { id name } scenes { id act position title } numbers { id act position title } }\n      poster { ...ImageFields }\n      revivalChanges { kind recordId cut act position }\n      completeness { share sections { section share items { item filled } } }\n      page {\n        premiere introduction shortDescription description synopsis vestDescription published\n        revisionIds { introduction description synopsis }\n        facts { kind { id } value }\n        vestWornBy { ...EditCredit }\n        rebus { ...ImageFields }\n        rebusSolution { ...ImageFields }\n        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }\n        boardPhotos: photos(section: BOARD) { ...PhotoSetFields }\n        history { ...RevisionFields }\n      }\n      links { kind title url detail }\n      records { id title year }\n      sectionOrder\n      sections(includeHidden: true) {\n        id content title ownTitle hidden refId itemIds startSeconds\n        kind { id name content }\n        images { ...PageImageFields }\n        video { title access }\n        photos { title }\n        record { title }\n        document { title access }\n      }\n      characters { id name description position retired images { ...PageImageFields } photos { ...PhotoSetFields } spex { id } }\n      scenes { id act position title place intervalAfter spex { id } }\n      numbers {\n        id act position title originalTitle originalArtist fromWork firstLine retired spex { id }\n        kind { id }\n        credits { kind { id } position credit { ...EditCredit } }\n        characters { id }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpexgramAlbumsForPicking($spexId: ID!) {\n    spexgramAlbums(spexId: $spexId) { id title url items { itemId caption thumbnailUrl previewUrl public video } }\n  }\n"): (typeof documents)["\n  query SpexgramAlbumsForPicking($spexId: ID!) {\n    spexgramAlbums(spexId: $spexId) { id title url items { itemId caption thumbnailUrl previewUrl public video } }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexPageUpdate($spexId: ID!, $input: SpexPageInput!) { spexPageUpdate(spexId: $spexId, input: $input) { published } }"): (typeof documents)["mutation SpexPageUpdate($spexId: ID!, $input: SpexPageInput!) { spexPageUpdate(spexId: $spexId, input: $input) { published } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexPageSetImages($spexId: ID!, $sectionId: ID!, $kindId: ID, $images: [ImageRefInput!]!) { spexPageSetImages(spexId: $spexId, sectionId: $sectionId, kindId: $kindId, images: $images) { published } }"): (typeof documents)["mutation SpexPageSetImages($spexId: ID!, $sectionId: ID!, $kindId: ID, $images: [ImageRefInput!]!) { spexPageSetImages(spexId: $spexId, sectionId: $sectionId, kindId: $kindId, images: $images) { published } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexSetSections($spexId: ID!, $sections: [PageSectionInput!]!) { spexSetSections(spexId: $spexId, sections: $sections) { id } }"): (typeof documents)["mutation SpexSetSections($spexId: ID!, $sections: [PageSectionInput!]!) { spexSetSections(spexId: $spexId, sections: $sections) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexPageSetFacts($spexId: ID!, $facts: [FactInput!]!) { spexPageSetFacts(spexId: $spexId, facts: $facts) { published } }"): (typeof documents)["mutation SpexPageSetFacts($spexId: ID!, $facts: [FactInput!]!) { spexPageSetFacts(spexId: $spexId, facts: $facts) { published } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexPageSetPhotos($spexId: ID!, $section: PhotoSection!, $characterId: ID, $itemIds: [ID!]!) { spexPageSetPhotos(spexId: $spexId, section: $section, characterId: $characterId, itemIds: $itemIds) { published } }"): (typeof documents)["mutation SpexPageSetPhotos($spexId: ID!, $section: PhotoSection!, $characterId: ID, $itemIds: [ID!]!) { spexPageSetPhotos(spexId: $spexId, section: $section, characterId: $characterId, itemIds: $itemIds) { published } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexPageSetRebus($spexId: ID!, $rebusImageId: ID, $solutionImageId: ID) { spexPageSetRebus(spexId: $spexId, rebusImageId: $rebusImageId, solutionImageId: $solutionImageId) { published } }"): (typeof documents)["mutation SpexPageSetRebus($spexId: ID!, $rebusImageId: ID, $solutionImageId: ID) { spexPageSetRebus(spexId: $spexId, rebusImageId: $rebusImageId, solutionImageId: $solutionImageId) { published } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SpexPageSetPublished($spexId: ID!, $published: Boolean!) { spexPageSetPublished(spexId: $spexId, published: $published) { published } }"): (typeof documents)["mutation SpexPageSetPublished($spexId: ID!, $published: Boolean!) { spexPageSetPublished(spexId: $spexId, published: $published) { published } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CharacterCreate($spexId: ID!, $input: CharacterInput!) { characterCreate(spexId: $spexId, input: $input) { id } }"): (typeof documents)["mutation CharacterCreate($spexId: ID!, $input: CharacterInput!) { characterCreate(spexId: $spexId, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CharacterUpdate($id: ID!, $input: CharacterInput!) { characterUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation CharacterUpdate($id: ID!, $input: CharacterInput!) { characterUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CharacterDelete($id: ID!) { characterDelete(id: $id) }"): (typeof documents)["mutation CharacterDelete($id: ID!) { characterDelete(id: $id) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CharactersPaste($spexId: ID!, $text: String!) { charactersPaste(spexId: $spexId, text: $text) { id } }"): (typeof documents)["mutation CharactersPaste($spexId: ID!, $text: String!) { charactersPaste(spexId: $spexId, text: $text) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CharactersReorder($spexId: ID!, $ids: [ID!]!) { charactersReorder(spexId: $spexId, ids: $ids) { id } }"): (typeof documents)["mutation CharactersReorder($spexId: ID!, $ids: [ID!]!) { charactersReorder(spexId: $spexId, ids: $ids) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CharacterSetImages($id: ID!, $images: [ImageRefInput!]!) { characterSetImages(id: $id, images: $images) { id } }"): (typeof documents)["mutation CharacterSetImages($id: ID!, $images: [ImageRefInput!]!) { characterSetImages(id: $id, images: $images) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SceneCreate($spexId: ID!, $input: SceneInput!) { sceneCreate(spexId: $spexId, input: $input) { id } }"): (typeof documents)["mutation SceneCreate($spexId: ID!, $input: SceneInput!) { sceneCreate(spexId: $spexId, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SceneUpdate($id: ID!, $input: SceneInput!) { sceneUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation SceneUpdate($id: ID!, $input: SceneInput!) { sceneUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SceneDelete($id: ID!) { sceneDelete(id: $id) }"): (typeof documents)["mutation SceneDelete($id: ID!) { sceneDelete(id: $id) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ScenesPaste($spexId: ID!, $text: String!) { scenesPaste(spexId: $spexId, text: $text) { id } }"): (typeof documents)["mutation ScenesPaste($spexId: ID!, $text: String!) { scenesPaste(spexId: $spexId, text: $text) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ScenesReorder($spexId: ID!, $items: [OrderInput!]!) { scenesReorder(spexId: $spexId, items: $items) { id } }"): (typeof documents)["mutation ScenesReorder($spexId: ID!, $items: [OrderInput!]!) { scenesReorder(spexId: $spexId, items: $items) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation NumberCreate($spexId: ID!, $input: NumberInput!) { numberCreate(spexId: $spexId, input: $input) { id } }"): (typeof documents)["mutation NumberCreate($spexId: ID!, $input: NumberInput!) { numberCreate(spexId: $spexId, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation NumberUpdate($id: ID!, $input: NumberInput!) { numberUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation NumberUpdate($id: ID!, $input: NumberInput!) { numberUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreditResolve($numberId: ID!, $kindId: ID!, $position: Int!, $credit: CreditInput!) { creditResolve(numberId: $numberId, kindId: $kindId, position: $position, credit: $credit) { id } }"): (typeof documents)["mutation CreditResolve($numberId: ID!, $kindId: ID!, $position: Int!, $credit: CreditInput!) { creditResolve(numberId: $numberId, kindId: $kindId, position: $position, credit: $credit) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UnresolvedCredits($limit: Int!) {\n    unresolvedCredits(limit: $limit) {\n      total\n      credits { position name kind { id name } number { id title act spex { id slug title year } } }\n    }\n  }\n"): (typeof documents)["\n  query UnresolvedCredits($limit: Int!) {\n    unresolvedCredits(limit: $limit) {\n      total\n      credits { position name kind { id name } number { id title act spex { id slug title year } } }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation NumberDelete($id: ID!) { numberDelete(id: $id) }"): (typeof documents)["mutation NumberDelete($id: ID!) { numberDelete(id: $id) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation NumbersPaste($spexId: ID!, $text: String!) { numbersPaste(spexId: $spexId, text: $text) { id } }"): (typeof documents)["mutation NumbersPaste($spexId: ID!, $text: String!) { numbersPaste(spexId: $spexId, text: $text) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation NumbersReorder($spexId: ID!, $items: [OrderInput!]!) { numbersReorder(spexId: $spexId, items: $items) { id } }"): (typeof documents)["mutation NumbersReorder($spexId: ID!, $items: [OrderInput!]!) { numbersReorder(spexId: $spexId, items: $items) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RevivalSetChanges($revivalId: ID!, $kind: RevivalChangeKind!, $changes: [RevivalChangeInput!]!) { revivalSetChanges(revivalId: $revivalId, kind: $kind, changes: $changes) { id } }"): (typeof documents)["mutation RevivalSetChanges($revivalId: ID!, $kind: RevivalChangeKind!, $changes: [RevivalChangeInput!]!) { revivalSetChanges(revivalId: $revivalId, kind: $kind, changes: $changes) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ImageUpdate($id: ID!, $input: ImageInput!) { imageUpdate(id: $id, input: $input) { id } }"): (typeof documents)["mutation ImageUpdate($id: ID!, $input: ImageInput!) { imageUpdate(id: $id, input: $input) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ImageTrash($id: ID!) { imageTrash(id: $id) }"): (typeof documents)["mutation ImageTrash($id: ID!) { imageTrash(id: $id) }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ImageRestore($id: ID!) { imageRestore(id: $id) { id } }"): (typeof documents)["mutation ImageRestore($id: ID!) { imageRestore(id: $id) { id } }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation TrashEmpty { trashEmpty }"): (typeof documents)["mutation TrashEmpty { trashEmpty }"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Trash {\n    trash {\n      articles { id slug title trashedAt }\n      images { ...ImageFields trashedAt originalFileName }\n    }\n  }\n"): (typeof documents)["\n  query Trash {\n    trash {\n      articles { id slug title trashedAt }\n      images { ...ImageFields trashedAt originalFileName }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ImageFields on Image {\n    id kind caption alt width height thumbnailUrl pageUrl fullUrl pageJpegUrl\n  }\n"): (typeof documents)["\n  fragment ImageFields on Image {\n    id kind caption alt width height thumbnailUrl pageUrl fullUrl pageJpegUrl\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PersonFields on Person { id nickname name url }\n"): (typeof documents)["\n  fragment PersonFields on Person { id nickname name url }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment CreditFields on Credit { name person { ...PersonFields } }\n"): (typeof documents)["\n  fragment CreditFields on Credit { name person { ...PersonFields } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PhotoSetFields on PhotoSet {\n    hiddenCount available itemIds\n    photos { itemId caption thumbnailUrl previewUrl width height url public video videoUrl }\n  }\n"): (typeof documents)["\n  fragment PhotoSetFields on PhotoSet {\n    hiddenCount available itemIds\n    photos { itemId caption thumbnailUrl previewUrl width height url public video videoUrl }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SpexTile on Spex {\n    id slug year title revival published retired\n    category { id name }\n    poster { ...ImageFields }\n  }\n"): (typeof documents)["\n  fragment SpexTile on Spex {\n    id slug year title revival published retired\n    category { id name }\n    poster { ...ImageFields }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment KindName on Kind { id name }\n"): (typeof documents)["\n  fragment KindName on Kind { id name }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PageImageFields on PageImage { kind { ...KindName } caption image { ...ImageFields } }\n"): (typeof documents)["\n  fragment PageImageFields on PageImage { kind { ...KindName } caption image { ...ImageFields } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment RevisionFields on Revision {\n    id target targetId targetTitle field comment hidden authorName createdAt previousId\n  }\n"): (typeof documents)["\n  fragment RevisionFields on Revision {\n    id target targetId targetTitle field comment hidden authorName createdAt previousId\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StartPage {\n    startPage {\n      welcome\n      spexOfTheYear { ...SpexTile page { introduction } }\n      thisDay { date text spex { id slug title year } }\n      decades { decade spex { ...SpexTile } }\n    }\n    spexCategories { id name firstYear logo { ...ImageFields } }\n  }\n"): (typeof documents)["\n  query StartPage {\n    startPage {\n      welcome\n      spexOfTheYear { ...SpexTile page { introduction } }\n      thisDay { date text spex { id slug title year } }\n      decades { decade spex { ...SpexTile } }\n    }\n    spexCategories { id name firstYear logo { ...ImageFields } }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpexPage($id: ID!) {\n    spex(id: $id) {\n      ...SpexTile\n      lastModifiedAt\n      parent { id slug title year }\n      revivals { id slug year published }\n      previous { id slug title year }\n      next { id slug title year }\n      page {\n        premiere introduction shortDescription descriptionHtml synopsisHtml vestDescriptionHtml published lastModifiedAt\n        facts { kind { id name valueType } value }\n        vestWornBy { ...CreditFields }\n        rebus { ...ImageFields }\n        rebusSolution { ...ImageFields }\n        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }\n      }\n      characters {\n        id name descriptionHtml position retired\n        images { ...PageImageFields }\n        playedBy { person { ...PersonFields } spex { id year revival } }\n        photos { ...PhotoSetFields }\n      }\n      scenes { id act position title place intervalAfter }\n      numbers {\n        id act position title originalTitle originalArtist fromWork firstLine retired\n        kind { ...KindName }\n        credits { kind { ...KindName } position credit { ...CreditFields unresolved } }\n        characters { id name }\n        links { kind title url detail }\n        books { id title volume position textOnly url }\n      }\n      records {\n        id title year kindNameSv kindNameEn mediumNameSv mediumNameEn catalogueNumber released conductor coverUrl url\n        tracks { id side discNumber position title hasAudio url number { id title } }\n      }\n      people {\n        available\n        board { spex { id year revival } task { id name } people { ...PersonFields } }\n        tasks { spex { id year revival } task { id name category { id name } } people { ...PersonFields } }\n        boardPhotos { ...PhotoSetFields }\n      }\n      links { kind title url detail }\n      sections {\n        id content title subtitle\n        images { ...PageImageFields }\n        video {\n          id title year durationSeconds access url posterUrl startSeconds\n          chapters { title startSeconds }\n          playback { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n        }\n        photos { albumId title url photos { ...PhotoSetFields } }\n        record {\n          id title year mediumNameSv mediumNameEn catalogueNumber released conductor coverUrl url\n          tracks { id side position title hasAudio url audioUrl number { id title } }\n        }\n        document { id title year kindName access url files { id title pages previewUrl } }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SpexPage($id: ID!) {\n    spex(id: $id) {\n      ...SpexTile\n      lastModifiedAt\n      parent { id slug title year }\n      revivals { id slug year published }\n      previous { id slug title year }\n      next { id slug title year }\n      page {\n        premiere introduction shortDescription descriptionHtml synopsisHtml vestDescriptionHtml published lastModifiedAt\n        facts { kind { id name valueType } value }\n        vestWornBy { ...CreditFields }\n        rebus { ...ImageFields }\n        rebusSolution { ...ImageFields }\n        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }\n      }\n      characters {\n        id name descriptionHtml position retired\n        images { ...PageImageFields }\n        playedBy { person { ...PersonFields } spex { id year revival } }\n        photos { ...PhotoSetFields }\n      }\n      scenes { id act position title place intervalAfter }\n      numbers {\n        id act position title originalTitle originalArtist fromWork firstLine retired\n        kind { ...KindName }\n        credits { kind { ...KindName } position credit { ...CreditFields unresolved } }\n        characters { id name }\n        links { kind title url detail }\n        books { id title volume position textOnly url }\n      }\n      records {\n        id title year kindNameSv kindNameEn mediumNameSv mediumNameEn catalogueNumber released conductor coverUrl url\n        tracks { id side discNumber position title hasAudio url number { id title } }\n      }\n      people {\n        available\n        board { spex { id year revival } task { id name } people { ...PersonFields } }\n        tasks { spex { id year revival } task { id name category { id name } } people { ...PersonFields } }\n        boardPhotos { ...PhotoSetFields }\n      }\n      links { kind title url detail }\n      sections {\n        id content title subtitle\n        images { ...PageImageFields }\n        video {\n          id title year durationSeconds access url posterUrl startSeconds\n          chapters { title startSeconds }\n          playback { masterUrl thumbnailsUrl expiresAt subtitles { language label url } }\n        }\n        photos { albumId title url photos { ...PhotoSetFields } }\n        record {\n          id title year mediumNameSv mediumNameEn catalogueNumber released conductor coverUrl url\n          tracks { id side position title hasAudio url audioUrl number { id title } }\n        }\n        document { id title year kindName access url files { id title pages previewUrl } }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpexBrowse {\n    spexCategories { id name firstYear descriptionHtml logo { ...ImageFields } }\n    spexAll { ...SpexTile completeness { share } }\n  }\n"): (typeof documents)["\n  query SpexBrowse {\n    spexCategories { id name firstYear descriptionHtml logo { ...ImageFields } }\n    spexAll { ...SpexTile completeness { share } }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpexCategoryPage($id: ID!) {\n    spexCategory(id: $id) {\n      id name firstYear descriptionHtml retired\n      logo { ...ImageFields }\n      spex { ...SpexTile page { introduction } }\n    }\n  }\n"): (typeof documents)["\n  query SpexCategoryPage($id: ID!) {\n    spexCategory(id: $id) {\n      id name firstYear descriptionHtml retired\n      logo { ...ImageFields }\n      spex { ...SpexTile page { introduction } }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ArticleLink on Article { id slug title visibility published }\n"): (typeof documents)["\n  fragment ArticleLink on Article { id slug title visibility published }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Articles($categoryId: ID, $includeSubcategories: Boolean! = false) {\n    articles(categoryId: $categoryId, includeSubcategories: $includeSubcategories) {\n      ...ArticleLink lastModifiedAt\n      categories { id slug name }\n      parent { id }\n    }\n    articleCategories { id slug name description articleCount parents { id } }\n  }\n"): (typeof documents)["\n  query Articles($categoryId: ID, $includeSubcategories: Boolean! = false) {\n    articles(categoryId: $categoryId, includeSubcategories: $includeSubcategories) {\n      ...ArticleLink lastModifiedAt\n      categories { id slug name }\n      parent { id }\n    }\n    articleCategories { id slug name description articleCount parents { id } }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ArticleCategory($id: ID!) {\n    articleCategory(id: $id) {\n      id slug name description articleCount\n      parents { id slug name }\n      subcategories { id slug name articleCount }\n    }\n  }\n"): (typeof documents)["\n  query ArticleCategory($id: ID!) {\n    articleCategory(id: $id) {\n      id slug name description articleCount\n      parents { id slug name }\n      subcategories { id slug name articleCount }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ArticleTree {\n    articleRoots {\n      ...ArticleLink\n      children { ...ArticleLink children { ...ArticleLink children { ...ArticleLink children { id } } } }\n    }\n  }\n"): (typeof documents)["\n  query ArticleTree {\n    articleRoots {\n      ...ArticleLink\n      children { ...ArticleLink children { ...ArticleLink children { ...ArticleLink children { id } } } }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query WantedArticles { wantedArticles(limit: 500) { title links } }\n"): (typeof documents)["\n  query WantedArticles { wantedArticles(limit: 500) { title links } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query OrphanArticles { orphanArticles { ...ArticleLink categories { id slug name } } }\n"): (typeof documents)["\n  query OrphanArticles { orphanArticles { ...ArticleLink categories { id slug name } } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Article($id: ID!) {\n    article(id: $id) {\n      id slug title body html visibility published trashedAt createdAt lastModifiedAt editingBy\n      categories { id slug name }\n      revision { ...RevisionFields }\n      parent { id slug title }\n      ancestors { id slug title }\n      children { ...ArticleLink }\n      siblings { ...ArticleLink }\n      backlinks { ...ArticleLink }\n      toc { level anchor text }\n    }\n  }\n"): (typeof documents)["\n  query Article($id: ID!) {\n    article(id: $id) {\n      id slug title body html visibility published trashedAt createdAt lastModifiedAt editingBy\n      categories { id slug name }\n      revision { ...RevisionFields }\n      parent { id slug title }\n      ancestors { id slug title }\n      children { ...ArticleLink }\n      siblings { ...ArticleLink }\n      backlinks { ...ArticleLink }\n      toc { level anchor text }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ArticleHistory($id: ID!) {\n    article(id: $id) { id slug title history { ...RevisionFields body } }\n  }\n"): (typeof documents)["\n  query ArticleHistory($id: ID!) {\n    article(id: $id) { id slug title history { ...RevisionFields body } }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Revision($id: ID!) { revision(id: $id) { ...RevisionFields body } }\n"): (typeof documents)["\n  query Revision($id: ID!) { revision(id: $id) { ...RevisionFields body } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Search($q: String!) { search(q: $q) { kind id title context path } }\n"): (typeof documents)["\n  query Search($q: String!) { search(q: $q) { kind id title context path } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Sitemap { sitemap { path lastModifiedAt } }\n"): (typeof documents)["\n  query Sitemap { sitemap { path lastModifiedAt } }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RedirectLookup($title: String!) { redirect(title: $title) }\n"): (typeof documents)["\n  query RedirectLookup($title: String!) { redirect(title: $title) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MarkdownPreview($markdown: String!) { markdownPreview(markdown: $markdown) }\n"): (typeof documents)["\n  query MarkdownPreview($markdown: String!) { markdownPreview(markdown: $markdown) }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpexareSearch($q: String!) { spexareSearch(q: $q) { ...PersonFields } }\n"): (typeof documents)["\n  query SpexareSearch($q: String!) { spexareSearch(q: $q) { ...PersonFields } }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;