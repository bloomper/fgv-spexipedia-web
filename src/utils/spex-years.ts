type CategorySpex = {
  id: string;
  year: string;
  retired?: boolean;
  category?: { id: string } | null;
  parent?: { id: string } | null;
};

const yearsDown = (from: number, to: number, taken: Set<string>) => {
  const years: string[] = [];

  for (let year = from; year >= to; year--) {
    if (!taken.has(String(year))) {
      years.push(String(year));
    }
  }
  return years;
};

/**
 * The years an original of a category can take: from the category's first year to next year, newest first, without
 * those another original of the category has (as the server checks). Revivals and retired spex take no year. ownId is
 * the spex being edited, whose own year is free to it.
 */
export function categoryYears(
  category: { id: string; firstYear: string } | undefined,
  spex: CategorySpex[],
  ownId: string | null = null,
  now = new Date().getFullYear()
): string[] {
  const first = Number(category?.firstYear);

  if (!category || !Number.isInteger(first)) {
    return [];
  }
  const taken = new Set(
    spex.filter((s) => s.id !== ownId && !s.parent && !s.retired && s.category?.id === category.id).map((s) => s.year)
  );

  return yearsDown(now + 1, first, taken);
}

/**
 * The years a revival of an original from originalYear can take: from the year after it to two years ahead, newest
 * first, without those of its other revivals.
 */
export function revivalYears(
  originalYear: string,
  revivals: { id: string; year: string }[],
  ownId: string | null = null,
  now = new Date().getFullYear()
): string[] {
  return yearsDown(
    now + 2,
    Number(originalYear) + 1,
    new Set(revivals.filter((revival) => revival.id !== ownId).map((revival) => revival.year))
  );
}
