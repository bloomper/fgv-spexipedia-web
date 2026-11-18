/**
 * Addresses of the old MediaWiki that Spexipedia replaced: `/<Title>` and `/index.php?title=<Title>`. The proxy answers
 * them with a real HTTP redirect (permanent to the page that replaced the title, else temporary to a search), which a
 * page cannot once it has started streaming.
 */

/** The first path segments that are Spexipedia's own, which are never old titles. */
const OWN = new Set([
  "", "spex", "books", "categories", "recordings", "articles", "search", "recent-changes", "manage", "admin", "about",
  "support", "api", "stats", "login-error", "no-access", "sitemap.xml", "robots.txt", "manifest.webmanifest",
  "favicon.ico", "icon.svg", "_next",
]);

/**
 * Addresses that scanners try (files, dot folders, WordPress), which were never wiki titles: they get no lookup in the
 * server. Titles with dots ("H.C. Andersen") still are titles; only these endings are left out.
 */
const PROBE = /(^|\/)(\.|wp-)|\.(php\d?|aspx?|jsp|cgi|env|ini|conf|sql|bak|old|zip|t?gz|rar|xml|json|js|css|map|txt|ico|png|jpe?g|gif|svg|webp|ya?ml|log|git)$/i;

/**
 * The old title an address asks for, or null when the address is one of Spexipedia's own.
 */
export function oldWikiTitle(pathname: string, search: URLSearchParams): string | null {
  const segments = pathname.split("/").slice(1);

  if (OWN.has(segments[0] ?? "")) {
    return null;
  }
  let raw: string;

  try {
    raw = segments[0] === "index.php" ? search.get("title") ?? "" : segments.map(decodeURIComponent).join("/");
  } catch {
    return null;
  }
  if (segments[0] !== "index.php" && PROBE.test(raw)) {
    return null;
  }
  const title = raw.replace(/_/g, " ").trim();

  return title && title.length <= 255 ? title : null;
}

/**
 * Asks the server for the page that replaced the title, as a visitor. Null when there is none or the server cannot be
 * reached; only a path in this site is accepted.
 */
export async function lookupRedirect(title: string, endpoint: string | undefined): Promise<string | null> {
  if (!endpoint) {
    return null;
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "query RedirectLookup($title: String!) { redirect(title: $title) }", variables: { title } }),
      signal: AbortSignal.timeout(3000),
    });
    const target = (await response.json() as { data?: { redirect?: string | null } }).data?.redirect;

    return typeof target === "string" && /^\/(?!\/)[^\s\\]*$/.test(target) ? target : null;
  } catch {
    return null;
  }
}

const SPEX_BY_ID = /^\/spex\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i;

/**
 * The other applications link to a spex by its id; the page lives at its slug. The id's spex address, or null when the
 * path is not one or the server does not know the id (the page then says not found).
 */
export async function spexAddressById(pathname: string, endpoint: string | undefined): Promise<string | null> {
  const id = SPEX_BY_ID.exec(pathname)?.[1];

  if (!id || !endpoint) {
    return null;
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "query SpexSlug($id: ID!) { spex(id: $id) { slug } }", variables: { id } }),
      signal: AbortSignal.timeout(3000),
    });
    const slug = (await response.json() as { data?: { spex?: { slug?: string } | null } }).data?.spex?.slug;

    return typeof slug === "string" && /^[a-z0-9-]+$/.test(slug) ? `/spex/${slug}` : null;
  } catch {
    return null;
  }
}
