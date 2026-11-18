/*
 * The orders a visitor picks for the lists (spex, recordings, books, articles and the start page), kept in the address
 * as ?sort=<field>&dir=<asc|desc> so that the pages stay server-rendered and a sorted list can be linked to.
 */

export type SortDirection = "asc" | "desc";

export type SortChoice<F extends string> = { field: F; dir: SortDirection };

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

/**
 * The order asked for in the address, falling back to the list's own for an unknown field or direction.
 */
export function parseSort<F extends string>(params: Params, fields: readonly F[], fallback: SortChoice<F>): SortChoice<F> {
  const field = first(params.sort);
  const dir = first(params.dir);

  return {
    field: fields.includes(field as F) ? field as F : fallback.field,
    dir: dir === "asc" || dir === "desc" ? dir : fallback.dir,
  };
}

/**
 * The address of the page with another order, keeping what else is in it (e.g. the articles' view). The list's own
 * order leaves the address bare.
 */
export function sortHref(path: string, params: Params, choice: SortChoice<string>, fallback: SortChoice<string>): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const v = first(value);

    if (key !== "sort" && key !== "dir" && v !== undefined) {
      query.set(key, v);
    }
  }
  if (choice.field !== fallback.field || choice.dir !== fallback.dir) {
    query.set("sort", choice.field);
    query.set("dir", choice.dir);
  }
  const search = query.toString();

  return search ? `${path}?${search}` : path;
}

type Key = string | number | null | undefined;

const collator = new Intl.Collator("sv", { numeric: true, sensitivity: "base" });

/** Compares two keys: numbers as numbers, text the Swedish way (Å, Ä, Ö last) with numbers in it as numbers. */
export function compareKeys(a: Key, b: Key): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return collator.compare(String(a), String(b));
}

/**
 * The items by the keys in turn, the first key in the given direction and the others as ties broken ascending. Items
 * without the first key (no volume, no release date) come last either way.
 */
export function sortItems<T>(items: readonly T[], dir: SortDirection, ...keys: ((item: T) => Key)[]): T[] {
  const [primary, ...ties] = keys;

  return [...items].sort((a, b) => {
    const ka = primary(a);
    const kb = primary(b);
    const missingA = ka === null || ka === undefined || ka === "";
    const missingB = kb === null || kb === undefined || kb === "";

    if (missingA !== missingB) {
      return missingA ? 1 : -1;
    }
    const order = missingA ? 0 : compareKeys(ka, kb) * (dir === "asc" ? 1 : -1);

    if (order !== 0) {
      return order;
    }
    for (const tie of ties) {
      const next = compareKeys(tie(a), tie(b));

      if (next !== 0) {
        return next;
      }
    }
    return 0;
  });
}
