<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Spexipedia Web — project notes

Next.js 16 App Router + React 19 frontend for Spexipedia, FGV's encyclopedia of the Chalmers spex: spex pages, characters,
figures, numbers, recordings and wiki articles. It is backed by `fgv-spexipedia-server`'s GraphQL API (which answers
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
  The `mobile` project (Pixel 7) runs `e2e/mobile.spec.ts`: no page wider than the screen down to 320 pixels, and the
  spex page's section bar.
- `npm run gql-codegen` — regenerate `src/gql/` from the sibling `../fgv-spexipedia-server` checkout. Commit the result.

**Don't run `npm run format`**: `.prettierrc` differs from the code base.

## Conventions

- `"use client"` ⇔ `*.client.ts(x)`; `import "server-only"` and `"use server"` ⇔ `*.server.ts`. Exceptions:
  `src/auth.ts`, Next.js reserved file names, and shadcn's `src/components/ui/**` and `src/hooks/use-mobile.ts`.
- Cache Components is on. `(app)/layout.tsx` keeps `export const instant = false`. Pages set their own titles, robots
  and Open Graph tags (`src/lib/wiki/metadata.server.ts`: `publicMetadata`, `privateMetadata`).
- A client component that copies a server prop into state uses `useServerState`, never `useState(prop)`.
- Locale is a cookie (`sv` default); messages in `messages/{sv,en}.json`. Dark by default.
- Auth: Better Auth + Keycloak, stateless. `getSessionContext()` in `src/utils/auth.server.ts`; roles come from
  `resource_access["fgv-spexipedia"].roles`: `USER` (members), `AUTHOR`, `EDITOR`, `ADMIN`. The tokens stay on the server.
- The Content Security Policy is set in `src/proxy.ts` (`src/utils/csp.ts`) because it names `MEDIA_ORIGIN` and
  `SPEXGRAM_MEDIA_ORIGIN` (Spexgram's media server, for the photos and videos of people). No third-party scripts or frames.
- Dialogs: never `window.confirm`/`prompt`/`alert`; use `useDialogs()`.

## Who sees what

- **Visitors** read published spex pages, public articles, figures, recordings and search. People appear by nickname
  only; the server never sends them names. `getViewer()` (`src/lib/wiki/viewer.server.ts`) says `loggedIn`, `member`,
  `author`, `editor`, `admin`; it only decides what to show.
- **Members** (`USER`) also see names (with links to Spexregister), members' articles and photos from Spexgram, write
  articles and follow *Senaste ändringar*.
- **Authors** write spex page texts, images and photos and publish articles; **editors** keep base data and the
  structured parts; **admins** retire and merge base data, keep redirects, notify recipients, settings and maintenance.
- Not found and not allowed look the same: an article a visitor may not see shows `LoginPrompt`.
- Names of spexare are never written by the web either: credits are picked by `searchSpexareAction` and stored as ids.

## How the pages work

- **Spex page** (`/spex/[slug]`, `src/app/(app)/spex/[slug]/page.tsx`): the head (poster beside year, title, category,
  introduction and description), then only the sections with content (`sectionsOf`), each a `SpexSection` with a serif
  heading and subtitle, and `SectionRail` beside it (scroll-spy). An id or old slug redirects to the current slug, so
  other applications link by id. Structured data (`CreativeWork`) for published pages. Markdown texts arrive as HTML
  from the server (`descriptionHtml` and so on) and are shown with `HtmlContent`; never render Markdown in the web.
- **Images** are Spexipedia's own (no people): `WikiImage` with the thumbnail/page/full variants as `srcset`;
  `ImageGallery` opens them in yet-another-react-lightbox. **Photos of people** come from Spexgram (`PhotoSet`), with
  members' photos counted for those who may not see them.
- **Articles** (`/articles`): Markdown with `[[Title]]` links, revisions, history with line diffs (`src/utils/diff.ts`),
  restore, hide (authors). `ArticleForm` tells the server who is editing every minute and, on CONFLICT, shows the
  differences to the newer revision to take or overwrite. The preview is rendered by the server (`markdownPreview`).
  Articles form a tree (`src/components/wiki/article-tree.tsx`: breadcrumbs, the tree around an article, its table of
  contents; authors move and reorder them) and categories nest; *What links here*, wanted and orphaned articles come
  from the server. Links to missing articles point at `/articles/new?title=` and are shown red by that address.
- **Kinds** (number, credit, medium, image per use, fact) are data: pages read them from `kinds(type, use)`, editors
  are offered those in use (`src/utils/kinds.ts`), admins keep them at `/admin/kinds`. Only the schema's enums (types,
  uses, value types) appear in code. Imported credits nobody resolved are shown to editors only (`/manage/credits`).
- **Spex packages** (`/manage/packages`, editors): a spreadsheet and an optional zip of up to 20 GB become a spex in
  every application. The files go through `/api/packages` (`src/lib/http/packages.server.ts`), streamed to the server
  with the user's token; the zip in 32 MB parts at the server's `Upload-Offset`, resumable
  (`src/components/wiki/packages/package-upload.client.ts`). The zip parts skip `src/proxy.ts` (its matcher), which
  would copy each body into memory. Preview and apply run on the server; the page polls while they run and shows the
  report per application the server sends.
- **Old MediaWiki addresses**: `src/proxy.ts` (`src/lib/http/old-wiki.ts`) answers with HTTP redirects: `/<Title>` and `/index.php?title=` by the
  server's redirect table, else to a search.
- **Editing** (`/manage/spex/[id]`, `/manage/base-data`, `/manage/recordings`): `useSave()` runs an action, toasts and
  refreshes. Images go through `/api/images` (streamed to the server with the user's token). Lists can be pasted as
  text (formats as in the schema's descriptions) and reordered. Spexregister links its editors to
  `/manage/spex/<id>`, `/manage/spex-categories/<id>`, `/manage/tasks/<id>` and `/manage/task-categories/<id>`.

## Look

FGV's shell (sidebar, header, application switcher) and colours as in the other webs: the palette in
`src/app/globals.css` and the manifest colours are Spexgram's, so keep them in step with the other FGV webs. The page
layouts follow the Apps Script pages Spexipedia replaces (poster beside the title, sections with subtitles, a right rail
with scroll-spy), with Cormorant Garamond for content headings (`.wiki-heading`, `.prose-wiki`).

## Consent and visitor statistics

As in Spexgram: c15t with only the `necessary` category; Umami through `/stats/`.

## Application switcher

As in the other webs (`src/components/app-switcher.client.tsx`, `src/utils/applications.ts`); the id passed in
`applications.server.ts` is `"spexipedia"`.
