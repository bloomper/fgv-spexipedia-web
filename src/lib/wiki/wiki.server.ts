import "server-only";

import { cache } from "react";
import { graphql } from "@/gql";
import { runQuery } from "@/lib/graphql.server";

/*
 * What the pages read. The server answers visitors without a token, with what is public: unpublished pages, members'
 * articles, names of spexare and members' photos only come with a token that has the role for them.
 */

graphql(`
  fragment ImageFields on Image {
    id kind caption alt width height thumbnailUrl pageUrl fullUrl pageJpegUrl
  }
`);

graphql(`
  fragment PersonFields on Person { id nickname name url }
`);

graphql(`
  fragment CreditFields on Credit { name person { ...PersonFields } }
`);

graphql(`
  fragment PhotoSetFields on PhotoSet {
    hiddenCount available itemIds
    photos { itemId caption thumbnailUrl previewUrl width height url public video videoUrl }
  }
`);

graphql(`
  fragment SpexTile on Spex {
    id slug year title revival published retired
    category { id name }
    poster { ...ImageFields }
  }
`);

graphql(`
  fragment KindName on Kind { id name }
`);

graphql(`
  fragment PageImageFields on PageImage { kind { ...KindName } caption image { ...ImageFields } }
`);

graphql(`
  fragment RevisionFields on Revision {
    id target targetId targetTitle field comment hidden authorName createdAt previousId
  }
`);

const StartPageQuery = graphql(`
  query StartPage {
    startPage {
      welcome
      spexOfTheYear { ...SpexTile page { introduction } }
      thisDay { date text spex { id slug title year } recording { id slug title catalogueNumber } }
      recentChanges { ...RevisionFields }
      decades { decade spex { ...SpexTile } }
    }
    spexCategories { id name firstYear logo { ...ImageFields } }
  }
`);

const SpexPageQuery = graphql(`
  query SpexPage($id: ID!) {
    spex(id: $id) {
      ...SpexTile
      lastModifiedAt
      parent { id slug title year }
      revivals { id slug year published }
      previous { id slug title year }
      next { id slug title year }
      page {
        premiere introduction shortDescription descriptionHtml synopsisHtml vestDescriptionHtml published lastModifiedAt
        facts { kind { id name valueType } value }
        vestWornBy { ...CreditFields }
        rebus { ...ImageFields }
        rebusSolution { ...ImageFields }
        scenography: images(section: SCENOGRAPHY) { ...PageImageFields }
        vest: images(section: VEST) { ...PageImageFields }
        other: images(section: OTHER) { ...PageImageFields }
        groupPhotos: photos(section: GROUP) { ...PhotoSetFields }
      }
      characters {
        id name descriptionHtml position retired
        images { ...PageImageFields }
        playedBy { person { ...PersonFields } spex { id year revival } }
        photos { ...PhotoSetFields }
      }
      scenes { id act position title place intervalAfter }
      numbers {
        id act position title originalTitle originalArtist fromWork firstLine retired
        kind { ...KindName }
        credits { kind { ...KindName } position credit { ...CreditFields unresolved } }
        characters { id name }
        links { kind title url }
        books { textOnly book { id slug title } }
      }
      recordings { id slug title catalogueNumber medium { ...KindName } released front { ...ImageFields } }
      people {
        available
        board { spex { id year revival } task { id name } people { ...PersonFields } }
        tasks { spex { id year revival } task { id name category { id name } } people { ...PersonFields } }
        boardPhotos { ...PhotoSetFields }
      }
      links { kind title url }
    }
  }
`);

const SpexBrowseQuery = graphql(`
  query SpexBrowse {
    spexCategories { id name firstYear descriptionHtml logo { ...ImageFields } }
    spexAll { ...SpexTile completeness { share } }
  }
`);

const CategoryQuery = graphql(`
  query SpexCategoryPage($id: ID!) {
    spexCategory(id: $id) {
      id name firstYear descriptionHtml retired
      logo { ...ImageFields }
      spex { ...SpexTile page { introduction } }
    }
  }
`);

const RecordingsQuery = graphql(`
  query Recordings {
    recordings { id slug catalogueNumber title medium { ...KindName } released published spex { id slug title year } front { ...ImageFields } }
  }
`);

const BooksQuery = graphql(`
  query Books {
    books { id slug title kind { ...KindName } volume publishedYear published cover { ...ImageFields } }
  }
`);

const BookQuery = graphql(`
  query Book($id: ID!) {
    book(id: $id) {
      id slug title kind { ...KindName } volume publishedYear descriptionHtml published
      cover { ...ImageFields }
      songs { id position title textOnly number { id title act position spex { id slug title year } } }
    }
  }
`);

const RecordingQuery = graphql(`
  query Recording($id: ID!) {
    recording(id: $id) {
      id slug catalogueNumber title medium { ...KindName } released recorded descriptionHtml published spexifyAlbumId
      spex { id slug title year }
      conductor { ...CreditFields }
      tracks { id side position title number { id title act position spex { id slug title year } } }
      front { ...ImageFields }
      back { ...ImageFields }
      links { kind title url }
    }
  }
`);

graphql(`
  fragment ArticleLink on Article { id slug title visibility published }
`);

const ArticlesQuery = graphql(`
  query Articles($categoryId: ID, $includeSubcategories: Boolean! = false) {
    articles(categoryId: $categoryId, includeSubcategories: $includeSubcategories) {
      ...ArticleLink lastModifiedAt
      categories { id slug name }
      parent { id }
    }
    articleCategories { id slug name description articleCount parents { id } }
  }
`);

const ArticleCategoryQuery = graphql(`
  query ArticleCategory($id: ID!) {
    articleCategory(id: $id) {
      id slug name description articleCount
      parents { id slug name }
      subcategories { id slug name articleCount }
    }
  }
`);

/** The top of the tree of articles, four levels down; deeper ones are shown beside their own parents. */
const ArticleTreeQuery = graphql(`
  query ArticleTree {
    articleRoots {
      ...ArticleLink
      children { ...ArticleLink children { ...ArticleLink children { ...ArticleLink children { id } } } }
    }
  }
`);

const WantedArticlesQuery = graphql(`
  query WantedArticles { wantedArticles(limit: 500) { title links } }
`);

const OrphanArticlesQuery = graphql(`
  query OrphanArticles { orphanArticles { ...ArticleLink categories { id slug name } } }
`);

const ArticleQuery = graphql(`
  query Article($id: ID!) {
    article(id: $id) {
      id slug title body html visibility published trashedAt createdAt lastModifiedAt editingBy
      categories { id slug name }
      revision { ...RevisionFields }
      parent { id slug title }
      ancestors { id slug title }
      children { ...ArticleLink }
      siblings { ...ArticleLink }
      backlinks { ...ArticleLink }
      toc { level anchor text }
    }
  }
`);

const ArticleHistoryQuery = graphql(`
  query ArticleHistory($id: ID!) {
    article(id: $id) { id slug title history { ...RevisionFields body } }
  }
`);

const RevisionQuery = graphql(`
  query Revision($id: ID!) { revision(id: $id) { ...RevisionFields body } }
`);

const SearchQuery = graphql(`
  query Search($q: String!) { search(q: $q) { kind id title context path } }
`);

const SitemapQuery = graphql(`
  query Sitemap { sitemap { path lastModifiedAt } }
`);

const RedirectQuery = graphql(`
  query RedirectLookup($title: String!) { redirect(title: $title) }
`);

const MarkdownPreviewQuery = graphql(`
  query MarkdownPreview($markdown: String!) { markdownPreview(markdown: $markdown) }
`);

const SpexareSearchQuery = graphql(`
  query SpexareSearch($q: String!) { spexareSearch(q: $q) { ...PersonFields } }
`);

export const getStartPage = async () => runQuery(StartPageQuery, {});
/** One spex by id or slug, with everything its page shows. Cached per request: the metadata reads it too. */
export const getSpexPage = cache(async (id: string) => (await runQuery(SpexPageQuery, { id }))?.spex ?? null);
export const getSpexBrowse = async () => runQuery(SpexBrowseQuery, {});
export const getCategory = cache(async (id: string) => (await runQuery(CategoryQuery, { id }))?.spexCategory ?? null);
export const getRecordings = async () => (await runQuery(RecordingsQuery, {}))?.recordings ?? [];
export const getBooks = async () => (await runQuery(BooksQuery, {}))?.books ?? [];
export const getBook = cache(async (id: string) => (await runQuery(BookQuery, { id }))?.book ?? null);
export const getRecording = cache(async (id: string) => (await runQuery(RecordingQuery, { id }))?.recording ?? null);
export const getArticles = async (categoryId?: string | null, includeSubcategories = false) =>
  runQuery(ArticlesQuery, { categoryId: categoryId ?? null, includeSubcategories });
export const getArticleTree = async () => (await runQuery(ArticleTreeQuery, {}))?.articleRoots ?? [];
export const getWantedArticles = async () => (await runQuery(WantedArticlesQuery, {}))?.wantedArticles ?? [];
export const getOrphanArticles = async () => (await runQuery(OrphanArticlesQuery, {}))?.orphanArticles ?? [];
export const getArticleCategory = cache(async (id: string) => (await runQuery(ArticleCategoryQuery, { id }))?.articleCategory ?? null);
export const getArticle = cache(async (id: string) => (await runQuery(ArticleQuery, { id }))?.article ?? null);
export const getArticleHistory = async (id: string) => (await runQuery(ArticleHistoryQuery, { id }))?.article ?? null;
export const getRevision = async (id: string) => (await runQuery(RevisionQuery, { id }))?.revision ?? null;
export const search = async (q: string) => (await runQuery(SearchQuery, { q }))?.search ?? [];
export const getSitemap = async () => (await runQuery(SitemapQuery, {}))?.sitemap ?? [];
export const getRedirect = async (title: string) => (await runQuery(RedirectQuery, { title }))?.redirect ?? null;
export const markdownPreview = async (markdown: string) => (await runQuery(MarkdownPreviewQuery, { markdown }))?.markdownPreview ?? "";
export const spexareSearch = async (q: string) => (await runQuery(SpexareSearchQuery, { q }))?.spexareSearch ?? [];

export type SpexPageData = NonNullable<Awaited<ReturnType<typeof getSpexPage>>>;
export type ArticleData = NonNullable<Awaited<ReturnType<typeof getArticle>>>;
export type ArticleTreeData = Awaited<ReturnType<typeof getArticleTree>>;
