<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Spexipedia Web — project notes

Next.js 16 App Router + React 19 frontend for Spexipedia, FGV's encyclopedia of the Chalmers spex: spex pages, characters,
numbers and wiki articles. It is backed by `fgv-spexipedia-server`'s GraphQL API (which answers
without a token too, with what is public) and its `POST /api/images`; images come from the media server (nginx,
`spexipedia-media`, under `MEDIA_ORIGIN`). Product spec: `fgv-spexipedia-spec`. The scaffolding comes from
`fgv-spexgram-web`; keep them alike.

## Commands

- `npm run dev` (port 3006) / `build` / `start`
- `npm run lint`, `npm run typecheck` (covers `src/**` only)
- `npm run test` (Vitest); `npm run test:e2e` (Playwright, against `e2e/mock-backend.mjs`, which replays the local API's
  answers in `e2e/recorded.json` and adds sample spexare as the server shows them). A visitor must see no sample
  spexare's name on any public page, nor after a member viewed it. Record again with the API running locally on sample
  data and `API_MEDIA_BASE_URL=http://localhost:8089/media` (CI must be refused the images at once, or pages never finish
  loading): `MOCK_RECORD_FROM=http://localhost:8088/api/graphql npm run test:e2e`.
  What a visitor's recording cannot hold lives in `e2e/mock-live.mjs`, seeded from the recording and checked by role as
  the server does: articles with revisions, categories, the trash, the admin lists, settings, kinds, the change log, search
  beyond the recorded query and the old-wiki redirects. Personas: `admin`, `editor`, `author`, `member`, `noaccess`;
  `mock.failNext(operation, classification)` fails the next call, `mock.state()` reads what the web sent. While
  recording, everything goes to the real server, so record with the reading specs only (`people`, `reading`, `mobile`).
  Next.js keeps pages it navigated away from in the document, hidden (React's `<Activity>`), so text and ids can be
  there twice: role locators skip hidden elements, `getByText` and CSS locators need `.filter({ visible: true })`.
  The `mobile` project (Pixel 7) runs `e2e/mobile.spec.ts`: no page wider than the screen down to 320 pixels, and the
  spex page's section bar.
- `npm run gql-codegen` — regenerate `src/gql/` from the sibling `../fgv-spexipedia-server` checkout. Commit the result.

**Don't run `npm run format`**: `.prettierrc` differs from the code base.

## Conventions

- `"use client"` ⇔ `*.client.ts(x)`; `import "server-only"` and `"use server"` ⇔ `*.server.ts`. Exceptions:
  `src/auth.ts` and Next.js reserved file names.
- Cache Components is on. `(app)/layout.tsx` keeps `export const instant = false`. Pages set their own titles, robots
  and Open Graph tags (`src/lib/wiki/metadata.server.ts`: `publicMetadata`, `privateMetadata`).
- A client component that copies a server prop into state uses `useServerState`, never `useState(prop)`.
- Locale is a cookie (`sv` default); messages in `messages/{sv,en}.json`. Dark by default.
- Auth: Better Auth + Keycloak, stateless. `getSessionContext()` in `src/utils/auth.server.ts`; roles come from
  `resource_access["fgv-spexipedia"].roles`: `USER` (members), `AUTHOR`, `EDITOR`, `ADMIN`. The tokens stay on the server.
- The Content Security Policy is set in `src/proxy.ts` (`src/utils/csp.ts`) because it names `MEDIA_ORIGIN`,
  `SPEXGRAM_MEDIA_ORIGIN` (Spexgram's media server, for the photos and videos of people) and `SPEXFLIX_MEDIA_ORIGIN`,
  `SPEXIFY_MEDIA_ORIGIN` and `ARCHIVE_MEDIA_ORIGIN` (sections that show those applications' material). No third-party
  scripts or frames.
- Dialogs: never `window.confirm`/`prompt`/`alert`; use `useDialogs()`.

## Who sees what

- **Visitors** read published spex pages, public articles and search. People appear by nickname
  only; the server never sends them names. `getViewer()` (`src/lib/wiki/viewer.server.ts`) says `loggedIn`, `member`,
  `author`, `editor`, `admin`; it only decides what to show.
- **Members** (`USER`) also see names (with links to Spexregister), members' articles and photos from Spexgram, write
  articles and see the latest changes on the start page.
- **Authors** write spex page texts, images and photos and publish articles; **editors** keep base data and the
  structured parts; **admins** retire and merge base data, keep redirects, notify recipients, settings and maintenance.
- Not found and not allowed look the same: an article a visitor may not see shows `LoginPrompt`.
- Names of spexare are never written by the web either: credits are picked by `searchSpexareAction` and stored as ids.

## Shared FGV UI

The theme, the shadcn components and the application shell come from `@bloomper/fgv-web-ui` (repo
`bloomper/fgv-web-ui`, published to GitHub Packages), shared by all eight FGV web applications:

- `@bloomper/fgv-web-ui/ui/<name>` for every shadcn component (`button`, `sidebar`, `dialog`, …). Don't add a local
  copy with `shadcn add`: the shell and the application must share one `SidebarProvider`, and a change that belongs in
  every application goes into the package.
- `shell/*`: `SiteHeader` (wrapped in `src/components/site-header.client.tsx` with Spexipedia's own controls),
  `AppSwitcher`, `resolveApplications`, `SidebarBrand`, `NavMain`, `NavSecondary`, the toggles, `DataEmpty`, the
  status pages and the logos.
- **Pages** are a `Page` (`variant="content"` for articles and records, the default for lists and forms) with a
  `PageHeader` first (`title`, `description`, `actions`, `eyebrow`, `badges`), both from `shell/page-header`; a page's
  `loading.tsx` uses the same `Page`.
- **Confirmations** always ask in an alert dialog: `ConfirmButton` (`shell/confirm-button`), or
  `useDialogs().confirm` / `prompt` / `choose` (`shell/dialogs`, `DialogsProvider` in the `(app)` layout) inside a
  handler. Never `window.confirm` or `window.prompt`.
- `src/app/globals.css` imports `tailwindcss` and the package's `styles.css`, then only what is Spexipedia's own. The brand
  colour on the page background (links, labels, active icons) is `text-link`; `primary` is for fills.
- The favicons in `src/app/` (`icon.svg`, `favicon.ico`, `apple-icon.png`) are Spexipedia's switcher icon on the brand
  blue, generated in the package (`scripts/app-icons.mjs`).
- The shell's texts live in the package under `FgvUi`; `withFgvMessages` adds them wherever messages are loaded
  (`src/i18n/request.ts`, `src/app/layout.tsx`, `changeLocale` in `src/app/provider.client.tsx`), and
  `FgvShellProvider` there hands the shell `changeLocale` and Umami's `track`.
- Installing needs a token, even locally: `.npmrc` reads `NODE_AUTH_TOKEN` (a token with `read:packages`). CI uses
  `GITHUB_TOKEN`, and the image build gets it as the `npm_token` build secret.
- Vitest inlines the package (`server.deps.inline`) so the mocks in the setup file reach it.

## How the pages work

- **Spex page** (`/spex/[slug]`, `src/app/(app)/spex/[slug]/page.tsx`): the head (poster beside year, title, category,
  introduction and description), then the sections in the order the server gives (`Spex.sections`: the section kinds'
  default order, or the spex' own), each by its content (`body`) and only when it has something, a `SpexSection` with
  the kind's name (or the section's own heading) and subtitle, and `SectionRail` beside it (scroll-spy). Sections of
  other applications (spec 4.2.1) show what the server got for the viewer: a Spexflix video (`EmbeddedVideo`, hls.js
  loaded on demand), Spexgram photos (`PhotoSet`), a Spexify record (`RecordCard`, with tracks playing from Spexify's
  signed links) or a Spexarkivet document's first pages. The contents with one kind keep their old anchors (`#music`). An id or old slug redirects to the current slug, so
  other applications link by id. Structured data (`CreativeWork`) for published pages. Markdown texts arrive as HTML
  from the server (`descriptionHtml` and so on) and are shown with `HtmlContent`; never render Markdown in the web.
- **Images** are Spexipedia's own (no people): `WikiImage` with the thumbnail/page/full variants as `srcset`;
  `ImageGallery` opens them in yet-another-react-lightbox. **Photos of people** come from Spexgram (`PhotoSet`), with
  members' photos counted for those who may not see them.
- **Articles** (`/articles`): Markdown with `[[Title]]` links, revisions, history with line diffs (`src/utils/diff.ts`),
  restore, hide (authors). `ArticleForm` tells the server who is editing every minute and, on CONFLICT, shows the
  differences to the newer revision to take or overwrite. The preview is rendered by the server (`markdownPreview`).
  Articles form a tree (`src/components/wiki/article-tree.tsx`: breadcrumbs, the tree around an article, its table of
  contents; authors move and reorder them) and categories nest; _What links here_, wanted and orphaned articles come
  from the server. Links to missing articles point at `/articles/new?title=` and are shown red by that address.
- **Records and books are not Spexipedia's** (`fgv-infra-deploy` `docs/data-ownership.md`): a spex page shows the
  spex' records from Spexify's discography (`Spex.records`, covers by links Spexify signs) and each number the books of
  Spexarkivet it is in (`Number.books`), read-only, with links into those applications for users with access there.
- **Kinds** (number, credit, image per use, fact, section) are data: pages read them from `kinds(type, use)`, editors
  are offered those in use (`src/utils/kinds.ts`), admins keep them at `/admin/kinds`. Section kinds have a content and
  a subtitle and are the pages' default order; each image section (content `IMAGES`) has image kinds of its own
  (`kinds(type: IMAGE, use: SECTION, sectionId:)`). Only the schema's enums (types, uses, contents, value types) appear in
  code. Authors arrange a spex' sections on its editing page (`SpexSectionsEditor`). Imported credits nobody resolved are shown to editors only (`/manage/credits`).
- **Importera** (spex packages in code; `/manage/packages`, editors): a spreadsheet and an optional zip of up to 20 GB become a spex in
  every application. The files go through `/api/packages` (`src/lib/http/packages.server.ts`), streamed to the server
  with the user's token; the zip in 32 MB parts at the server's `Upload-Offset`, resumable
  (`src/components/wiki/packages/package-upload.client.ts`). The zip parts skip `src/proxy.ts` (its matcher), which
  would copy each body into memory. Preview and apply run on the server; the page polls while they run and shows the
  report per application the server sends.
- **Old MediaWiki addresses**: `src/proxy.ts` (`src/lib/http/old-wiki.ts`) answers with HTTP redirects: `/<Title>` and `/index.php?title=` by the
  server's redirect table, else to a search.
- **Editing** (`/manage/spex/[id]`, `/manage/base-data`): `useSave()` runs an action, toasts and
  refreshes. Images go through `/api/images` (streamed to the server with the user's token). Lists can be pasted as
  text (formats as in the schema's descriptions) and reordered. Spexregister links its editors to
  `/manage/spex/<id>`, `/manage/spex-categories/<id>`, `/manage/tasks/<id>` and `/manage/task-categories/<id>`.

## Look

FGV's shell (sidebar, header, application switcher) and colours as in the other webs, from `@bloomper/fgv-web-ui`;
`src/app/globals.css` adds only the wiki's own classes (`.wiki-heading`, `.article-tree`, `.wiki-missing`,
`.prose-wiki`, whose links take `--link`). The page layouts follow the Apps Script pages Spexipedia replaces (poster
beside the title, sections with subtitles, a right rail with scroll-spy). Headings are Geist like the rest of FGV's webs
(`.wiki-heading` only tightens them). Every page is a `Page` one width wide, `className="mx-auto w-full max-w-7xl"`,
and its `loading.tsx` skeleton uses the same; the article and spex pages with a rail keep that width and padding in a
row of their own. Running text (`.prose-wiki`) keeps to 75ch. The favicons in `src/app/` are Spexipedia's switcher icon
on the brand blue, from the package.

## Consent and visitor statistics

As in Spexgram: c15t with only the `necessary` category; Umami through `/stats/`.

## Application switcher

`AppSwitcher` and `resolveApplications` from `@bloomper/fgv-web-ui`, as in every FGV application; the id passed in
`applications.server.ts` is `"spexipedia"`.
