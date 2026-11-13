/*
 * Small helpers the wiki's pages share, for server and client alike.
 */

export type PersonLike = { id?: string | null; nickname?: string | null; name?: string | null; url?: string | null };
export type CreditLike = { name?: string | null; person?: PersonLike | null };

/**
 * How a spexare is shown: the name with the nickname for members, the nickname alone for visitors (who get nothing
 * else from the server). Null when there is nothing to show, e.g. a visitor and a spexare without a nickname.
 */
export function personLabel(person: PersonLike | null | undefined): string | null {
  if (!person) {
    return null;
  }
  if (person.name && person.nickname) {
    return `${person.name} ”${person.nickname}”`;
  }
  return person.name ?? person.nickname ?? null;
}

export function creditLabel(credit: CreditLike | null | undefined): string | null {
  return credit ? personLabel(credit.person) ?? credit.name ?? null : null;
}

/** "1984" for an original, "1984 (nyuppsättning)" style is left to the pages: here the year and title. */
export function spexLabel(spex: { year: string; title: string }): string {
  return `${spex.title} (${spex.year})`;
}

/** The address of a spex's page. */
export const spexHref = (spex: { slug: string }) => `/spex/${spex.slug}`;

/** Ids of headings and sections on a spex page, for the rail and for links from search. */
export const SECTION_IDS = [
  "overview", "group", "characters", "scenography", "manuscript", "music", "recordings", "rebus", "vest", "board",
  "tasks", "images", "links",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Groups items by a key, keeping the first appearance's order. */
export function groupBy<T, K>(items: readonly T[], key: (item: T) => K): [K, T[]][] {
  const groups = new Map<K, T[]>();

  for (const item of items) {
    const k = key(item);
    const list = groups.get(k);

    if (list) {
      list.push(item);
    } else {
      groups.set(k, [item]);
    }
  }
  return [...groups.entries()];
}
