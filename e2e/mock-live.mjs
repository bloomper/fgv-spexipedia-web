// The part of the mock backend that keeps state: what the recording cannot hold, because only visitors were recorded
// and nothing was changed. Articles (seeded from the recorded list, with revisions), the admin lists, settings, kinds,
// the change log and the trash live here; the spex pages stay recorded.
//
// Every operation checks the caller's roles as the server does: UNAUTHORIZED without USER, FORBIDDEN without the
// operation's role. `/__reset` starts afresh before each test.

const SEED_AUTHOR = { sub: "p-seed", name: "Exempeldata" };
const SEEDED_AT = "2026-11-01T10:00:00Z";

/** Ids the mock makes, UUIDv7-shaped as the web's ID check wants. */
let counter = 0;
/** The server's default section kinds (its V1_10 migration): number, content, names and subtitles. */
const SECTIONS = [
  [701, "GROUP", "Ensemblen", "The ensemble", "Gruppbilden", "The group photo"],
  [702, "CHARACTERS", "Roller", "Characters", "Rollfigurer och de som spelade dem", "Characters and who played them"],
  [703, "IMAGES", "Scenografi", "Scenography", "Fond, scen och rekvisita", "Backdrop, stage and props"],
  [704, "MANUSCRIPT", "Manus och program", "Script and programme", "Handling och scener", "Synopsis and scenes"],
  [705, "MUSIC", "Musik", "Music", "Nummer, melodier och upphovspersoner", "Numbers, melodies and credits"],
  [706, "RECORDS", "Skivor", "Records", "Skivorna i Spexify", "The records in Spexify"],
  [707, "REBUS", "Programrebus", "Programme rebus", "Kan du lösa den?", "Can you solve it?"],
  [708, "VEST", "Spexvästen", "The vest", "Västen och vem som bar den", "The vest and who wore it"],
  [709, "BOARD", "Direktionen", "The board", "Spexets direktion", "The spex's board"],
  [710, "TASKS", "Medverkande", "Crew and cast", "Vem gjorde vad", "Who did what"],
  [711, "IMAGES", "Övriga bilder", "Other images", "Fler bilder från spexet", "More images from the spex"],
  [712, "LINKS", "Mer om spexet", "More about the spex", "I FGV:s andra tjänster", "In FGV's other services"],
  [721, "SPEXFLIX_VIDEO", "Film", "Video", "Från Spexflix", "From Spexflix"],
  [722, "SPEXGRAM", "Foton", "Photos", "Från Spexgram", "From Spexgram"],
  [723, "SPEXIFY_ALBUM", "Skiva", "Record", "Från Spexify", "From Spexify"],
  [724, "ARCHIVE_DOCUMENT", "Dokument", "Document", "Från Spexarkivet", "From Spexarkivet"],
];
const EXTERNAL = ["SPEXFLIX_VIDEO", "SPEXGRAM", "SPEXIFY_ALBUM", "ARCHIVE_DOCUMENT"];
const sectionId = (n) => `01900000-0000-7000-8000-000000000${n}`;
const newId = () => `0190e2e0-0000-7000-8000-${(++counter).toString(16).padStart(12, "0")}`;
const now = () => new Date().toISOString();

export const ARTICLES_KEY = 'Articles {"categoryId":null,"includeSubcategories":false}';

// --- Roles -------------------------------------------------------------------------------------------------------------

const isMember = (persona) => Boolean(persona?.roles.includes("USER"));
const has = (persona, ...roles) => isMember(persona) && roles.some((role) => persona.roles.includes(role));
const ROLE_OF = {
  USER: (persona) => isMember(persona),
  AUTHOR: (persona) => has(persona, "AUTHOR", "EDITOR", "ADMIN"),
  EDITOR: (persona) => has(persona, "EDITOR", "ADMIN"),
  ADMIN: (persona) => has(persona, "ADMIN"),
};

class GraphQLFailure extends Error {
  constructor(classification, message) {
    super(message);
    this.classification = classification;
  }
}

function need(persona, role) {
  if (!isMember(persona)) {
    throw new GraphQLFailure("UNAUTHORIZED", "Du är inte inloggad.");
  }
  if (!ROLE_OF[role](persona)) {
    throw new GraphQLFailure("FORBIDDEN", "Du har inte behörighet att göra det.");
  }
}

const notFound = () => new GraphQLFailure("NOT_FOUND", "Det finns inte, eller så har du inte tillgång till det.");

// --- Text --------------------------------------------------------------------------------------------------------------

/** The server's slugs: lower case, without accents, words joined by hyphens. */
export function slugOf(text) {
  return (
    text
      .replace(/æ/g, "ae")
      .replace(/Æ/g, "Ae")
      .replace(/ø/g, "o")
      .replace(/Ø/g, "O")
      .replace(/ß/g, "ss")
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "artikel"
  );
}

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const wikiLinks = (body) => [...(body ?? "").matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?]]/g)].map((match) => match[1].trim());

// --- State -------------------------------------------------------------------------------------------------------------

let recordedArticles = { articles: [], articleCategories: [] };
let recordedSpex = [];
let state;

/** Takes the seed from the recording: the articles and categories visitors saw, and every spex for the search. */
export function seedFrom(recorded) {
  recordedArticles = recorded[ARTICLES_KEY]?.data ?? recordedArticles;
  recordedSpex = recorded["SpexBrowse {}"]?.data?.spexAll ?? [];
  reset();
}

const SEED_BODIES = {
  "spexets-traditioner": [
    "Chalmersspexet har många traditioner. Exempeldata: inget här är på riktigt.",
    "",
    "## Västen",
    "",
    "Varje spex har sin väst, se [[Västen]].",
    "",
    "## Sångerna",
    "",
    "Tackkören sjungs efter varje föreställning; om [[Spexets kör]] finns ingen artikel ännu.",
  ].join("\n"),
};

function seedArticle(source, position) {
  const id = source.id;
  const revision = {
    id: newId(),
    target: "ARTICLE",
    targetId: id,
    targetTitle: source.title,
    field: null,
    comment: "Exempeldata",
    hidden: false,
    authorName: SEED_AUTHOR.name,
    createdAt: SEEDED_AT,
    previousId: null,
    body: SEED_BODIES[source.slug] ?? `Exempeltext om ${source.title}. Exempeldata: inget här är på riktigt.`,
  };

  return {
    id,
    slug: source.slug,
    title: source.title,
    visibility: source.visibility,
    published: source.published,
    trashedAt: null,
    createdAt: SEEDED_AT,
    lastModifiedAt: source.lastModifiedAt ?? SEEDED_AT,
    categoryIds: (source.categories ?? []).map((category) => category.id),
    parentId: source.parent?.id ?? null,
    position,
    revisions: [revision],
    editing: new Map(),
  };
}

/** Two more than visitors could have been recorded seeing: one for members, one not yet published. */
const EXTRA_ARTICLES = [
  {
    id: "0190e2e0-0000-7000-8000-a00000000001",
    slug: "kulissen-som-foll",
    title: "Kulissen som föll",
    visibility: "MEMBERS",
    published: true,
    categories: [{ id: "01a1fd35-03dc-745f-93b9-6ac36f7fe620" }],
  },
  {
    id: "0190e2e0-0000-7000-8000-a00000000002",
    slug: "repetitionerna",
    title: "Repetitionerna",
    visibility: "PUBLIC",
    published: false,
    categories: [],
  },
];

export const SEEDED = {
  membersArticle: EXTRA_ARTICLES[0],
  unpublishedArticle: EXTRA_ARTICLES[1],
};

function freshState() {
  counter = 0;
  const articles = [...recordedArticles.articles, ...EXTRA_ARTICLES].map(seedArticle);

  return {
    articles,
    categories: recordedArticles.articleCategories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description ?? null,
      parentIds: (category.parents ?? []).map((parent) => parent.id),
    })),
    settings: {
      welcomeSv: null,
      welcomeEn: null,
      publicWelcomeSv: null,
      publicWelcomeEn: null,
      contactEmail: null,
      lastModifiedAt: null,
    },
    jobs: ["IMAGE_VARIANTS", "LINK_CHECK", "SEARCH_REBUILD", "SYNC_NOTIFY", "UPLOAD_CLEANUP", "RETENTION"].map(
      (job, index) => ({
        job,
        schedule: index === 2 ? null : `0 ${index * 5} 3 * * *`,
        running: false,
        lastStartedAt: index === 1 ? "2026-11-20T03:05:00Z" : null,
        lastFinishedAt: index === 1 ? "2026-11-20T03:05:09Z" : null,
        lastSucceeded: index === 1 ? false : null,
      })
    ),
    consumers: [
      {
        id: newId(),
        name: "Spexregister",
        clientId: "fgv-spexregister-service",
        notifyUrl: "http://spexregister-api:8080/api/sync/notify",
        enabled: true,
        acknowledged: "1204",
        acknowledgedAt: "2026-11-21T08:00:00Z",
        lag: 0,
        lastNotifiedAt: "2026-11-21T08:00:00Z",
        lastError: null,
      },
      {
        id: newId(),
        name: "Spexify",
        clientId: "fgv-spexify-service",
        notifyUrl: null,
        enabled: true,
        acknowledged: "1190",
        acknowledgedAt: "2026-11-21T07:55:00Z",
        lag: 14,
        lastNotifiedAt: null,
        lastError: "Connection refused",
      },
    ],
    redirects: [
      { id: newId(), oldTitle: "Bojan 1948", target: "/spex/1948-bojan" },
      { id: newId(), oldTitle: "Traditioner", target: "/articles/spexets-traditioner" },
    ],
    kinds: [
      ...[
        ["Sång", "Song", ["Låt"]],
        ["Ouvertyr", "Overture", []],
        ["Final", "Finale", []],
      ].map(([nameSv, nameEn, aliases], position) => ({
        type: "NUMBER",
        use: null,
        valueType: null,
        nameSv,
        nameEn,
        aliases,
        position,
      })),
      ...[
        ["Text", "Lyrics", []],
        ["Musik", "Music", []],
        ["Arrangemang", "Arrangement", ["Arr."]],
      ].map(([nameSv, nameEn, aliases], position) => ({
        type: "CREDIT",
        use: null,
        valueType: null,
        nameSv,
        nameEn,
        aliases,
        position,
      })),
      ...[
        ["Spelplats", "Venue", "TEXT"],
        ["Antal föreställningar", "Performances", "TEXT"],
        ["Sista föreställningen", "Last performance", "DATE"],
      ].map(([nameSv, nameEn, valueType], position) => ({
        type: "FACT",
        use: null,
        valueType,
        nameSv,
        nameEn,
        aliases: [],
        position,
      })),
      { type: "IMAGE", use: "CHARACTER", valueType: null, nameSv: "Skiss", nameEn: "Sketch", aliases: [], position: 0 },
      // Section kinds, with the server's fixed ids, in the pages' default order (spec 4.2)
      ...SECTIONS.map(([n, content, nameSv, nameEn, subtitleSv, subtitleEn], position) => ({
        id: sectionId(n),
        type: "SECTION",
        use: null,
        valueType: null,
        content,
        nameSv,
        nameEn,
        subtitleSv,
        subtitleEn,
        aliases: [],
        position,
      })),
      // The image sections' own image kinds
      ...[
        [703, "Fond", "Backdrop"],
        [703, "Scen", "Stage"],
        [703, "Rekvisita", "Props"],
        [711, "Övriga bilder", "Other images"],
      ].map(([n, nameSv, nameEn], position) => ({
        type: "IMAGE",
        use: "SECTION",
        sectionId: sectionId(n),
        valueType: null,
        nameSv,
        nameEn,
        aliases: [],
        position,
      })),
    ].map((kind) => ({ id: newId(), ...kind, retired: false })),
    audit: [],
    failures: new Map(),
  };
}

export function reset() {
  state = freshState();
}

/** What the backend holds, for tests that check what the web sent. */
export function snapshot() {
  return {
    articles: state.articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      visibility: article.visibility,
      published: article.published,
      trashedAt: article.trashedAt,
      parentId: article.parentId,
      categoryIds: article.categoryIds,
      revisions: article.revisions.map((revision) => ({
        id: revision.id,
        comment: revision.comment,
        hidden: revision.hidden,
        authorName: revision.authorName,
        body: revision.body,
      })),
    })),
    categories: state.categories,
    settings: state.settings,
    jobs: state.jobs,
    consumers: state.consumers,
    redirects: state.redirects,
    kinds: state.kinds,
    audit: state.audit,
  };
}

/** The next call of the operation fails with the classification. */
export function failNext(operation, classification) {
  state.failures.set(operation, classification);
}

function audit(persona, action, entityType, entityId, summary) {
  state.audit.unshift({
    id: newId(),
    at: now(),
    actorId: persona.sub,
    actorName: persona.name,
    action,
    entityType,
    entityId,
    summary,
  });
}

// --- Articles ----------------------------------------------------------------------------------------------------------

const visible = (article, persona) =>
  !article.trashedAt && (isMember(persona) || (article.published && article.visibility === "PUBLIC"));
const live = (persona) => state.articles.filter((article) => visible(article, persona));
const latest = (article) => article.revisions[0];

function findArticle(idOrSlug) {
  return state.articles.find((article) => article.id === idOrSlug || article.slug === idOrSlug) ?? null;
}

function readable(idOrSlug, persona) {
  const article = findArticle(idOrSlug);

  return article && visible(article, persona) ? article : null;
}

const categoryRef = (category) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  __typename: "ArticleCategory",
});
const categoriesOf = (article) =>
  article.categoryIds
    .map((id) => state.categories.find((category) => category.id === id))
    .filter(Boolean)
    .map(categoryRef);

function link(article) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    visibility: article.visibility,
    published: article.published,
    __typename: "Article",
  };
}

const byPosition = (a, b) => a.position - b.position || a.title.localeCompare(b.title, "sv");
const childrenOf = (id, persona) =>
  live(persona)
    .filter((article) => article.parentId === id)
    .sort(byPosition);

function revisionOut(revision, withBody) {
  const { body, ...fields } = revision;

  return { ...fields, __typename: "Revision", ...(withBody ? { body: revision.hidden ? null : body } : {}) };
}

/** Titles that link to the article, by [[Title]] or its address. */
function backlinksOf(article, persona) {
  return live(persona)
    .filter((other) => other.id !== article.id)
    .filter((other) => {
      const body = latest(other).body ?? "";

      return (
        wikiLinks(body).some((title) => title.toLowerCase() === article.title.toLowerCase()) ||
        body.includes(`/articles/${article.slug}`)
      );
    })
    .map(link);
}

/** CommonMark enough for the tests: headings with anchors, lists, paragraphs, emphasis, links and [[Title]] links. */
export function renderMarkdown(markdown, persona = null) {
  const toc = [];
  const inline = (text) =>
    escapeHtml(text)
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?]]/g, (_, title, label) => {
        const target = live(persona).find((article) => article.title.toLowerCase() === title.trim().toLowerCase());

        return target
          ? `<a href="/articles/${target.slug}">${label ?? title}</a>`
          : `<a href="/articles/new?title=${encodeURIComponent(title.trim())}" class="wiki-missing">${label ?? title}</a>`;
      })
      .replace(/\[([^\]]+)]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  const blocks = (markdown ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const html = blocks
    .map((block) => {
      const heading = /^(#{1,6})\s+(.*)$/.exec(block);

      if (heading) {
        const level = heading[1].length;
        const anchor = slugOf(heading[2]);

        if (level >= 2) {
          toc.push({ level, anchor, text: heading[2], __typename: "TocEntry" });
        }
        return `<h${level} id="${anchor}">${inline(heading[2])}</h${level}>`;
      }
      if (block.split("\n").every((line) => /^[-*]\s+/.test(line))) {
        return `<ul>\n${block
          .split("\n")
          .map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`)
          .join("\n")}\n</ul>`;
      }
      return `<p>${inline(block).replace(/\n/g, "<br>\n")}</p>`;
    })
    .join("\n");

  return { html: html ? `${html}\n` : "", toc };
}

function articleOut(article, persona) {
  const revision = latest(article);
  const { html, toc } = renderMarkdown(revision.hidden ? "" : revision.body, persona);
  const ancestors = [];

  for (let parent = findArticle(article.parentId); parent; parent = findArticle(parent.parentId)) {
    ancestors.unshift({ id: parent.id, slug: parent.slug, title: parent.title, __typename: "Article" });
  }

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    body: revision.hidden ? null : revision.body,
    html: revision.hidden ? null : html,
    visibility: article.visibility,
    published: article.published,
    trashedAt: article.trashedAt,
    createdAt: article.createdAt,
    lastModifiedAt: article.lastModifiedAt,
    editingBy: [...article.editing.entries()].filter(([sub]) => sub !== persona?.sub).map(([, name]) => name),
    categories: categoriesOf(article),
    revision: revisionOut(revision, false),
    parent: ancestors.at(-1) ?? null,
    ancestors,
    children: childrenOf(article.id, persona).map(link),
    siblings: childrenOf(article.parentId, persona)
      .filter((other) => other.id !== article.id)
      .map(link),
    backlinks: backlinksOf(article, persona),
    toc,
    __typename: "Article",
  };
}

function articleListOut(article) {
  return {
    ...link(article),
    lastModifiedAt: article.lastModifiedAt,
    categories: categoriesOf(article),
    parent: article.parentId ? { id: article.parentId, __typename: "Article" } : null,
  };
}

function categoryOut(category, persona) {
  const articleCount = live(persona).filter((article) => article.categoryIds.includes(category.id)).length;

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    articleCount,
    parents: category.parentIds
      .map((id) => state.categories.find((other) => other.id === id))
      .filter(Boolean)
      .map((parent) => ({ ...categoryRef(parent) })),
    subcategories: state.categories
      .filter((other) => other.parentIds.includes(category.id))
      .map((sub) => ({
        ...categoryRef(sub),
        articleCount: live(persona).filter((article) => article.categoryIds.includes(sub.id)).length,
      })),
    __typename: "ArticleCategory",
  };
}

function uniqueSlug(title, except = null) {
  const base = slugOf(title);
  let slug = base;

  for (let n = 2; state.articles.some((article) => article.slug === slug && article.id !== except); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}

function addRevision(article, persona, body, comment) {
  const previous = latest(article);
  const revision = {
    id: newId(),
    target: "ARTICLE",
    targetId: article.id,
    targetTitle: article.title,
    field: null,
    comment: comment ?? null,
    hidden: false,
    authorName: persona.name,
    createdAt: now(),
    previousId: previous?.id ?? null,
    body,
  };

  article.revisions.unshift(revision);
  article.lastModifiedAt = revision.createdAt;
}

function treeNode(article, persona, depth) {
  const node = { ...link(article) };

  if (depth < 4) {
    node.children = childrenOf(article.id, persona).map((child) => treeNode(child, persona, depth + 1));
  } else {
    node.children = childrenOf(article.id, persona).map((child) => ({ id: child.id, __typename: "Article" }));
  }
  return node;
}

// --- Search ------------------------------------------------------------------------------------------------------------

function search(q, persona) {
  const needle = q.trim().toLowerCase();

  if (!needle) {
    return [];
  }
  const spex = recordedSpex
    .filter((each) => each.published && each.title.toLowerCase().includes(needle))
    .map((each) => ({
      kind: "SPEX",
      id: each.id,
      title: `${each.title} (${each.year})`,
      context: each.category?.name ?? null,
      path: `/spex/${each.slug}`,
      __typename: "SearchHit",
    }));
  const articles = live(persona)
    .filter(
      (article) =>
        article.title.toLowerCase().includes(needle) || (latest(article).body ?? "").toLowerCase().includes(needle)
    )
    .map((article) => ({
      kind: "ARTICLE",
      id: article.id,
      title: article.title,
      context: null,
      path: `/articles/${article.slug}`,
      __typename: "SearchHit",
    }));

  return [...spex, ...articles];
}

// --- Operations --------------------------------------------------------------------------------------------------------

const kindOut = (kind) => ({
  content: null,
  subtitleSv: null,
  subtitleEn: null,
  ...kind,
  name: kind.nameSv,
  __typename: "Kind",
});
const sameGroup = (a, b) =>
  a.type === b.type && (a.use ?? null) === (b.use ?? null) && (a.sectionId ?? null) === (b.sectionId ?? null);

const OPERATIONS = {
  // Articles
  Articles: ({ categoryId, includeSubcategories }, persona) => {
    const categoryIds = categoryId
      ? [
          categoryId,
          ...(includeSubcategories
            ? state.categories
                .filter((category) => category.parentIds.includes(categoryId))
                .map((category) => category.id)
            : []),
        ]
      : null;

    return {
      articles: live(persona)
        .filter((article) => !categoryIds || article.categoryIds.some((id) => categoryIds.includes(id)))
        .map(articleListOut),
      articleCategories: state.categories.map((category) => {
        const out = categoryOut(category, persona);

        delete out.subcategories;
        return { ...out, parents: out.parents.map((parent) => ({ id: parent.id, __typename: "ArticleCategory" })) };
      }),
    };
  },
  ArticleCategory: ({ id }, persona) => {
    const category = state.categories.find((each) => each.id === id || each.slug === id);

    return { articleCategory: category ? categoryOut(category, persona) : null };
  },
  ArticleTree: (_, persona) => ({
    articleRoots: childrenOf(null, persona).map((article) => treeNode(article, persona, 1)),
  }),
  Article: ({ id }, persona) => {
    const article = readable(id, persona);

    return { article: article ? articleOut(article, persona) : null };
  },
  ArticleHistory: ({ id }, persona) => {
    need(persona, "USER");
    const article = readable(id, persona);

    return {
      article: article
        ? {
            id: article.id,
            slug: article.slug,
            title: article.title,
            history: article.revisions.map((revision) => revisionOut(revision, true)),
            __typename: "Article",
          }
        : null,
    };
  },
  Revision: ({ id }, persona) => {
    need(persona, "USER");
    const revision = state.articles.flatMap((article) => article.revisions).find((each) => each.id === id);

    return { revision: revision ? revisionOut(revision, true) : null };
  },
  WantedArticles: (_, persona) => {
    need(persona, "USER");
    const counts = new Map();

    for (const article of live(persona)) {
      for (const title of wikiLinks(latest(article).body)) {
        if (!state.articles.some((other) => !other.trashedAt && other.title.toLowerCase() === title.toLowerCase())) {
          counts.set(title, (counts.get(title) ?? 0) + 1);
        }
      }
    }
    return { wantedArticles: [...counts].map(([title, links]) => ({ title, links, __typename: "WantedArticle" })) };
  },
  OrphanArticles: (_, persona) => {
    need(persona, "USER");
    return {
      orphanArticles: live(persona)
        .filter(
          (article) =>
            !article.parentId &&
            childrenOf(article.id, persona).length === 0 &&
            backlinksOf(article, persona).length === 0
        )
        .map((article) => ({ ...link(article), categories: categoriesOf(article) })),
    };
  },
  MarkdownPreview: ({ markdown }, persona) => {
    need(persona, "USER");
    return { markdownPreview: renderMarkdown(markdown, persona).html };
  },
  ArticleCreate: ({ input }, persona) => {
    need(persona, "USER");
    if (!input.title?.trim()) {
      throw new GraphQLFailure("BAD_REQUEST", "Uppgifterna är inte giltiga.");
    }
    if (
      state.articles.some(
        (article) => !article.trashedAt && article.title.toLowerCase() === input.title.trim().toLowerCase()
      )
    ) {
      throw new GraphQLFailure("CONFLICT", "Det finns redan en artikel med den titeln.");
    }
    const article = {
      id: newId(),
      slug: uniqueSlug(input.title),
      title: input.title.trim(),
      visibility: input.visibility,
      published: false,
      trashedAt: null,
      createdAt: now(),
      lastModifiedAt: now(),
      categoryIds: input.categoryIds ?? [],
      parentId: input.parentId ?? null,
      position: childrenOf(input.parentId ?? null, persona).length,
      revisions: [],
      editing: new Map(),
    };

    state.articles.push(article);
    addRevision(article, persona, input.body, input.comment);
    audit(persona, "CREATE", "ARTICLE", article.id, `Skapade artikeln ${article.title}`);
    return { articleCreate: { id: article.id, slug: article.slug } };
  },
  ArticleUpdate: ({ id, input, baseRevisionId }, persona) => {
    need(persona, "USER");
    const article = readable(id, persona);

    if (!article) {
      throw notFound();
    }
    if (baseRevisionId && baseRevisionId !== latest(article).id) {
      throw new GraphQLFailure("CONFLICT", "Någon annan har sparat en nyare version av artikeln.");
    }
    const title = input.title.trim();

    if (title !== article.title) {
      article.title = title;
      article.slug = uniqueSlug(title, article.id);
    }
    article.visibility = input.visibility;
    article.categoryIds = input.categoryIds ?? article.categoryIds;
    addRevision(article, persona, input.body, input.comment);
    audit(persona, "UPDATE", "ARTICLE", article.id, `Ändrade artikeln ${article.title}`);
    return { articleUpdate: { id: article.id, slug: article.slug } };
  },
  ArticleEditing: ({ id }, persona) => {
    need(persona, "USER");
    const article = readable(id, persona);

    if (!article) {
      throw notFound();
    }
    article.editing.set(persona.sub, persona.name);
    return {
      articleEditing: {
        id: article.id,
        editingBy: [...article.editing].filter(([sub]) => sub !== persona.sub).map(([, name]) => name),
      },
    };
  },
  ArticleRestore: ({ id, revisionId }, persona) => {
    need(persona, "USER");
    const article = readable(id, persona);
    const revision = article?.revisions.find((each) => each.id === revisionId);

    if (!revision) {
      throw notFound();
    }
    addRevision(article, persona, revision.body, `Återställde versionen från ${revision.createdAt}`);
    audit(persona, "RESTORE", "ARTICLE", article.id, `Återställde en version av artikeln ${article.title}`);
    return { articleRestore: { id: article.id, slug: article.slug } };
  },
  ArticleSetPublished: ({ id, published }, persona) => {
    need(persona, "AUTHOR");
    const article = readable(id, persona);

    if (!article) {
      throw notFound();
    }
    article.published = published;
    audit(
      persona,
      published ? "PUBLISH" : "UNPUBLISH",
      "ARTICLE",
      article.id,
      `${published ? "Publicerade" : "Avpublicerade"} artikeln ${article.title}`
    );
    return { articleSetPublished: { id: article.id } };
  },
  ArticleTrash: ({ id, withChildren }, persona) => {
    need(persona, "AUTHOR");
    const article = readable(id, persona);

    if (!article) {
      throw notFound();
    }
    const children = childrenOf(article.id, persona);

    if (children.length > 0 && !withChildren) {
      throw new GraphQLFailure("CONFLICT", "Artikeln har underartiklar.");
    }
    const trash = (each) => {
      each.trashedAt = now();
      childrenOf(each.id, persona).forEach(trash);
    };

    trash(article);
    audit(persona, "TRASH", "ARTICLE", article.id, `Lade artikeln ${article.title} i papperskorgen`);
    return { articleTrash: true };
  },
  ArticleRestoreFromTrash: ({ id }, persona) => {
    need(persona, "AUTHOR");
    const article = findArticle(id);

    if (!article?.trashedAt) {
      throw notFound();
    }
    article.trashedAt = null;
    audit(persona, "RESTORE", "ARTICLE", article.id, `Återställde artikeln ${article.title} ur papperskorgen`);
    return { articleRestoreFromTrash: { id: article.id } };
  },
  ArticleMove: ({ id, parentId }, persona) => {
    need(persona, "AUTHOR");
    const article = readable(id, persona);

    if (!article) {
      throw notFound();
    }
    for (let parent = findArticle(parentId); parent; parent = findArticle(parent.parentId)) {
      if (parent.id === article.id) {
        throw new GraphQLFailure("BAD_REQUEST", "En artikel kan inte flyttas under sig själv.");
      }
    }
    article.parentId = parentId ?? null;
    article.position = childrenOf(article.parentId, persona).length;
    audit(persona, "UPDATE", "ARTICLE", article.id, `Flyttade artikeln ${article.title}`);
    return { articleMove: { id: article.id } };
  },
  ArticleReorderChildren: ({ parentId, ids }, persona) => {
    need(persona, "AUTHOR");
    ids.forEach((id, position) => {
      const article = findArticle(id);

      if (article && article.parentId === (parentId ?? null)) {
        article.position = position;
      }
    });
    return { articleReorderChildren: ids.map((id) => ({ id })) };
  },
  RevisionSetHidden: ({ id, hidden }, persona) => {
    need(persona, "AUTHOR");
    const revision = state.articles.flatMap((article) => article.revisions).find((each) => each.id === id);

    if (!revision) {
      throw notFound();
    }
    revision.hidden = hidden;
    audit(
      persona,
      hidden ? "HIDE" : "SHOW",
      "REVISION",
      revision.id,
      `${hidden ? "Dolde" : "Visade"} en version av ${revision.targetTitle}`
    );
    return { revisionSetHidden: { id } };
  },
  ArticleCategoryCreate: ({ input }, persona) => {
    need(persona, "USER");
    const category = {
      id: newId(),
      slug: slugOf(input.name),
      name: input.name.trim(),
      description: input.description ?? null,
      parentIds: input.parentIds ?? [],
    };

    state.categories.push(category);
    audit(persona, "CREATE", "ARTICLE_CATEGORY", category.id, `Skapade artikelkategorin ${category.name}`);
    return { articleCategoryCreate: { id: category.id, slug: category.slug } };
  },
  ArticleCategoryUpdate: ({ id, input }, persona) => {
    need(persona, "AUTHOR");
    const category = state.categories.find((each) => each.id === id);

    if (!category) {
      throw notFound();
    }
    Object.assign(category, {
      name: input.name.trim(),
      description: input.description ?? null,
      ...(input.parentIds ? { parentIds: input.parentIds } : {}),
    });
    return { articleCategoryUpdate: { id: category.id, slug: category.slug } };
  },

  // The trash
  Trash: (_, persona) => {
    need(persona, "AUTHOR");
    return {
      trash: {
        articles: state.articles
          .filter((article) => article.trashedAt)
          .map((article) => ({
            id: article.id,
            slug: article.slug,
            title: article.title,
            trashedAt: article.trashedAt,
            __typename: "Article",
          })),
        images: [],
        __typename: "Trash",
      },
    };
  },
  TrashEmpty: (_, persona) => {
    need(persona, "ADMIN");
    const trashed = state.articles.filter((article) => article.trashedAt);

    state.articles = state.articles.filter((article) => !article.trashedAt);
    audit(persona, "DELETE", "TRASH", null, "Tömde papperskorgen");
    return { trashEmpty: trashed.length };
  },

  // Search and old addresses
  Search: ({ q }, persona) => ({ search: search(q, persona) }),
  RedirectLookup: ({ title }) => ({
    redirect:
      state.redirects.find((redirect) => redirect.oldTitle.toLowerCase() === title.trim().toLowerCase())?.target ??
      null,
  }),
  SpexSlug: ({ id }) => {
    const spex = recordedSpex.find((each) => each.id === id);

    return { spex: spex ? { slug: spex.slug, __typename: "Spex" } : null };
  },

  // Administration
  Settings: (_, persona) => {
    need(persona, "ADMIN");
    return { settings: { ...state.settings, __typename: "Settings" } };
  },
  SettingsUpdate: ({ input }, persona) => {
    need(persona, "ADMIN");
    if (input.contactEmail && !/^[^@\s]+@[^@\s]+$/.test(input.contactEmail)) {
      throw new GraphQLFailure("BAD_REQUEST", "Uppgifterna är inte giltiga.");
    }
    const blank = (value) => (value?.trim() ? value : null);

    Object.assign(state.settings, {
      welcomeSv: blank(input.welcomeSv),
      welcomeEn: blank(input.welcomeEn),
      publicWelcomeSv: blank(input.publicWelcomeSv),
      publicWelcomeEn: blank(input.publicWelcomeEn),
      contactEmail: blank(input.contactEmail),
      lastModifiedAt: now(),
    });
    audit(persona, "UPDATE", "SETTINGS", null, "Ändrade inställningarna");
    return { settingsUpdate: { lastModifiedAt: state.settings.lastModifiedAt } };
  },
  MaintenanceJobs: (_, persona) => {
    need(persona, "ADMIN");
    return { maintenanceJobs: state.jobs.map((job) => ({ ...job, __typename: "MaintenanceJobStatus" })) };
  },
  MaintenanceJobRun: ({ job }, persona) => {
    need(persona, "ADMIN");
    const status = state.jobs.find((each) => each.job === job);

    if (!status || status.running) {
      return { maintenanceJobRun: false };
    }
    // Runs at once, and has finished by the time the page is read again
    Object.assign(status, { lastStartedAt: now(), lastFinishedAt: now(), lastSucceeded: true });
    return { maintenanceJobRun: true };
  },
  SyncConsumers: (_, persona) => {
    need(persona, "ADMIN");
    return { syncConsumers: state.consumers.map((consumer) => ({ ...consumer, __typename: "SyncConsumer" })) };
  },
  SyncConsumerSave: ({ input }, persona) => {
    need(persona, "ADMIN");
    if (state.consumers.some((consumer) => consumer.clientId === input.clientId && consumer.id !== input.id)) {
      throw new GraphQLFailure("CONFLICT", "Tjänstekontot har redan en mottagare.");
    }
    let consumer = state.consumers.find((each) => each.id === input.id);

    if (!consumer) {
      consumer = {
        id: newId(),
        acknowledged: null,
        acknowledgedAt: null,
        lag: 0,
        lastNotifiedAt: null,
        lastError: null,
      };
      state.consumers.push(consumer);
    }
    Object.assign(consumer, {
      name: input.name,
      clientId: input.clientId,
      notifyUrl: input.notifyUrl ?? null,
      enabled: input.enabled,
    });
    audit(
      persona,
      input.id ? "UPDATE" : "CREATE",
      "SYNC_CONSUMER",
      consumer.id,
      `${input.id ? "Ändrade" : "Lade till"} mottagaren ${consumer.name}`
    );
    return { syncConsumerSave: { id: consumer.id } };
  },
  SyncConsumerDelete: ({ id }, persona) => {
    need(persona, "ADMIN");
    state.consumers = state.consumers.filter((consumer) => consumer.id !== id);
    return { syncConsumerDelete: true };
  },
  Redirects: (_, persona) => {
    need(persona, "ADMIN");
    return { redirects: state.redirects.map((redirect) => ({ ...redirect, __typename: "Redirect" })) };
  },
  RedirectSave: ({ input }, persona) => {
    need(persona, "ADMIN");
    if (!input.target.startsWith("/")) {
      throw new GraphQLFailure("BAD_REQUEST", "Uppgifterna är inte giltiga.");
    }
    let redirect = state.redirects.find((each) => each.id === input.id);

    if (!redirect) {
      redirect = { id: newId() };
      state.redirects.push(redirect);
    }
    Object.assign(redirect, { oldTitle: input.oldTitle, target: input.target });
    audit(
      persona,
      input.id ? "UPDATE" : "CREATE",
      "REDIRECT",
      redirect.id,
      `Omdirigerade ${redirect.oldTitle} till ${redirect.target}`
    );
    return { redirectSave: { id: redirect.id } };
  },
  RedirectDelete: ({ id }, persona) => {
    need(persona, "ADMIN");
    state.redirects = state.redirects.filter((redirect) => redirect.id !== id);
    return { redirectDelete: true };
  },

  // Kinds
  AdminKinds: ({ type, use, sectionId }, persona) => {
    need(persona, "ADMIN");
    return {
      kinds: state.kinds
        .filter((kind) => sameGroup(kind, { type, use, sectionId }))
        .sort((a, b) => a.position - b.position)
        .map(kindOut),
    };
  },
  KindSave: ({ id, input }, persona) => {
    need(persona, "ADMIN");
    const aliases = (input.aliases ?? []).map((alias) => alias.trim()).filter(Boolean);
    let kind = state.kinds.find((each) => each.id === id);

    if (!kind) {
      const group = {
        type: input.type,
        use: input.type === "IMAGE" ? input.use : null,
        sectionId: input.use === "SECTION" ? input.sectionId : null,
      };

      if (
        input.type === "SECTION" &&
        !["IMAGES", "SPEXFLIX_VIDEO", "SPEXGRAM", "SPEXIFY_ALBUM", "ARCHIVE_DOCUMENT"].includes(input.content)
      ) {
        throw new GraphQLFailure(
          "BAD_REQUEST",
          "Bara bildsektioner och sektioner från de andra tjänsterna kan läggas till."
        );
      }
      kind = {
        id: newId(),
        ...group,
        valueType: input.type === "FACT" ? (input.valueType ?? "TEXT") : null,
        content: input.type === "SECTION" ? input.content : null,
        retired: false,
        position: state.kinds.filter((each) => sameGroup(each, group)).length,
      };
      state.kinds.push(kind);
      // A new image section gets an image kind of its own name, as the server does
      if (kind.content === "IMAGES") {
        state.kinds.push({
          id: newId(),
          type: "IMAGE",
          use: "SECTION",
          sectionId: kind.id,
          valueType: null,
          nameSv: input.nameSv.trim(),
          nameEn: input.nameEn.trim(),
          aliases: [],
          position: 0,
          retired: false,
        });
      }
    }
    Object.assign(kind, { nameSv: input.nameSv.trim(), nameEn: input.nameEn.trim(), aliases });
    if (kind.type === "SECTION") {
      Object.assign(kind, {
        subtitleSv: input.subtitleSv?.trim() || null,
        subtitleEn: input.subtitleEn?.trim() || null,
      });
    }
    return { kindSave: { id: kind.id } };
  },
  KindsReorder: ({ ids }, persona) => {
    need(persona, "ADMIN");
    ids.forEach((id, position) => {
      const kind = state.kinds.find((each) => each.id === id);

      if (kind) {
        kind.position = position;
      }
    });
    return { kindsReorder: ids.map((id) => ({ id })) };
  },
  KindRetire: ({ id, retired }, persona) => {
    need(persona, "ADMIN");
    const kind = state.kinds.find((each) => each.id === id);

    if (!kind) {
      throw notFound();
    }
    if (retired && state.kinds.filter((each) => sameGroup(each, kind) && !each.retired).length === 1) {
      throw new GraphQLFailure("CONFLICT", "Den sista sorten i bruk kan inte deaktiveras.");
    }
    kind.retired = retired;
    return { kindRetire: { id } };
  },
  KindDelete: ({ id }, persona) => {
    need(persona, "ADMIN");
    const kind = state.kinds.find((each) => each.id === id);

    if (!kind) {
      throw notFound();
    }
    // As the server: a section's image kinds go along with it
    state.kinds = state.kinds.filter((each) => each.id !== id && each.sectionId !== id);
    return { kindDelete: true };
  },
  KindMerge: ({ id, intoId }, persona) => {
    need(persona, "ADMIN");
    const kind = state.kinds.find((each) => each.id === id);
    const into = state.kinds.find((each) => each.id === intoId);

    if (!kind || !into) {
      throw notFound();
    }
    into.aliases = [...new Set([...into.aliases, kind.nameSv, ...kind.aliases])];
    state.kinds = state.kinds.filter((each) => each.id !== id);
    return { kindMerge: { id: into.id } };
  },

  // The change log: authors see their own changes, admins everyone's
  AuditLog: ({ page, size, filter }, persona) => {
    need(persona, "AUTHOR");
    const admin = ROLE_OF.ADMIN(persona);
    const entries = state.audit.filter(
      (entry) =>
        (admin || entry.actorId === persona.sub) &&
        (!filter?.entityType || entry.entityType === filter.entityType) &&
        (!filter?.action || entry.action === filter.action) &&
        (!filter?.actorId || entry.actorId === filter.actorId) &&
        (!filter?.entityId || entry.entityId === filter.entityId) &&
        (!filter?.q || entry.summary.toLowerCase().includes(filter.q.toLowerCase()))
    );

    return {
      auditLog: {
        totalCount: entries.length,
        page,
        size,
        entries: entries
          .slice(page * size, (page + 1) * size)
          .map((entry) => ({ ...entry, __typename: "AuditLogEntry" })),
        __typename: "AuditPage",
      },
    };
  },
  AuditActors: (_, persona) => {
    need(persona, "AUTHOR");
    const actors = new Map(
      state.audit
        .filter((entry) => ROLE_OF.ADMIN(persona) || entry.actorId === persona.sub)
        .map((entry) => [entry.actorId, entry.actorName])
    );

    return { auditActors: [...actors].map(([id, name]) => ({ id, name, __typename: "AuditActor" })) };
  },
};

/** Operations that are answered here, always or (Search, SpexPage) when the recording has no answer. */
export const handles = (op) => Object.hasOwn(OPERATIONS, op);

/**
 * The answer to an operation, or null when the recording answers it. A failure set with failNext comes first.
 */
export function answerLive(op, variables, persona, recorded) {
  const failure = state.failures.get(op);

  if (failure) {
    state.failures.delete(op);
    return {
      data: null,
      errors: [
        {
          message: failure === "CONFLICT" ? "Någon annan har ändrat detta." : `Fel: ${failure}`,
          extensions: { classification: failure },
        },
      ],
    };
  }
  if (op === "Search" && recorded !== undefined) {
    return null;
  }
  if (op === "SpexPage" && recorded === undefined) {
    // A spex nobody recorded: not there (an address that never was one), unless it is in the list
    return recordedSpex.some((spex) => spex.slug === variables.id || spex.id === variables.id)
      ? null
      : { data: { spex: null } };
  }
  if (!handles(op)) {
    return null;
  }
  try {
    return { data: OPERATIONS[op](variables ?? {}, persona) };
  } catch (error) {
    if (error instanceof GraphQLFailure) {
      return { data: null, errors: [{ message: error.message, extensions: { classification: error.classification } }] };
    }
    throw error;
  }
}

/**
 * A recorded spex page as the server answers now: its sections (spec 4.2) in the section kinds' order, named in the
 * viewer's language, with the images the recording has of the scenography, the vest and the other images. Spex pages
 * were recorded before sections were data.
 */
export function patchSpexPage(json, locale) {
  const spex = json.data?.spex;

  if (!spex || spex.sections) {
    return json;
  }
  const en = locale?.toLowerCase().startsWith("en");
  const page = spex.page ?? {};
  const images = { 703: page.scenography ?? [], 708: page.vest ?? [], 711: page.other ?? [] };

  delete page.scenography;
  delete page.vest;
  delete page.other;
  spex.sections = state.kinds
    .filter((kind) => kind.type === "SECTION" && !kind.retired && !EXTERNAL.includes(kind.content))
    .sort((a, b) => a.position - b.position)
    .map((kind) => ({
      id: kind.id,
      content: kind.content,
      title: en ? kind.nameEn : kind.nameSv,
      subtitle: (en ? kind.subtitleEn : kind.subtitleSv) ?? null,
      images: images[Number(kind.id.slice(-3))] ?? [],
      video: null,
      photos: null,
      record: null,
      document: null,
    }));
  return json;
}

/** The start page's welcome text, once an admin has changed it: the members' or the visitors', in the viewer's language. */
export function patchStartPage(json, persona, locale) {
  const start = json.data?.startPage;

  if (!start || !state.settings.lastModifiedAt) {
    return json;
  }
  const en = locale?.toLowerCase().startsWith("en");
  const text = isMember(persona)
    ? en
      ? state.settings.welcomeEn
      : state.settings.welcomeSv
    : en
      ? state.settings.publicWelcomeEn
      : state.settings.publicWelcomeSv;

  if (text) {
    start.welcome = text;
  }
  return json;
}
