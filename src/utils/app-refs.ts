/**
 * Links in articles to material in the other FGV applications (spec 4.5): `[[spexify:album/<id>|text]]` and the like.
 * An editor pastes the material's address from the other application; it becomes such a link, which the server shows
 * as a link to viewers with access there and as text to everyone else.
 */

export type AppWebs = Partial<Record<"spexify" | "spexflix" | "spexgram" | "archive", string>>;

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

/** The paths of each application's pages that articles may link to, and the reference each becomes. */
const PATHS: { app: keyof AppWebs; path: RegExp; ref: (id: string) => string }[] = [
  { app: "spexify", path: new RegExp(`^/albums/(${UUID})$`, "i"), ref: (id) => `spexify:album/${id}` },
  { app: "spexflix", path: new RegExp(`^/videos/(${UUID})$`, "i"), ref: (id) => `spexflix:video/${id}` },
  { app: "spexflix", path: new RegExp(`^/collections/(${UUID})$`, "i"), ref: (id) => `spexflix:collection/${id}` },
  { app: "spexgram", path: new RegExp(`^/albums/(${UUID})$`, "i"), ref: (id) => `spexgram:album/${id}` },
  { app: "spexgram", path: new RegExp(`^/items/(${UUID})$`, "i"), ref: (id) => `spexgram:item/${id}` },
  { app: "archive", path: new RegExp(`^/manuscripts/(${UUID})$`, "i"), ref: (id) => `arkiv:document/${id}` },
  { app: "archive", path: new RegExp(`^/arrangements/(${UUID})$`, "i"), ref: (id) => `arkiv:arrangement/${id}` },
];

/**
 * The reference for an address of one of the applications, e.g. `spexify:album/<id>`, or null when it is no page
 * an article can link to.
 */
export function appRef(address: string, webs: AppWebs): string | null {
  let url: URL;

  try {
    url = new URL(address.trim());
  } catch {
    return null;
  }
  for (const { app, path, ref } of PATHS) {
    const web = webs[app];

    if (!web || new URL(web).origin !== url.origin) {
      continue;
    }

    const base = new URL(web).pathname.replace(/\/+$/, "");
    const match = path.exec(url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname);

    if (match) {
      return ref(match[1].toLowerCase());
    }
  }
  return null;
}

/** The Markdown for a link to the material, with its text. */
export function appRefMarkdown(ref: string, text: string): string {
  const label = text.replace(/[[\]|]/g, "").trim();

  return label ? `[[${ref}|${label}]]` : `[[${ref}]]`;
}
