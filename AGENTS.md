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
- `npm run test` (Vitest). Playwright tests (a visitor sees no sample spexare's name, page by page) are still to be written.
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
- The Content Security Policy is set in `src/proxy.ts` (`src/utils/csp.ts`) because it names `MEDIA_ORIGIN`.
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
- **Old MediaWiki addresses**: `src/proxy.ts` (`src/lib/http/old-wiki.ts`) answers with HTTP redirects: `/<Title>` and `/index.php?title=` by the
  server's redirect table, else to a search.
- **Editing** (`/manage/spex/[id]`, `/manage/base-data`, `/manage/recordings`): `useSave()` runs an action, toasts and
  refreshes. Images go through `/api/images` (streamed to the server with the user's token). Lists can be pasted as
  text (formats as in the schema's descriptions) and reordered. Spexregister links its editors to
  `/manage/spex/<id>`, `/manage/spex-categories/<id>`, `/manage/tasks/<id>` and `/manage/task-categories/<id>`.

## Look

FGV's shell (sidebar, header, application switcher) as in the other webs, with Spexipedia's palette in
`src/app/globals.css`, after the Apps Script pages it replaces: a warm dark ground (`#14110f`, panels `#1e1a17`), gold
accent (`#c9a55c`) and Cormorant Garamond for content headings (`.wiki-heading`, `.prose-wiki`).

## Consent and visitor statistics

As in Spexgram: c15t with only the `necessary` category; Umami through `/stats/`.

## Application switcher

As in the other webs (`src/components/app-switcher.client.tsx`, `src/utils/applications.ts`); the id passed in
`applications.server.ts` is `"spexipedia"`.
