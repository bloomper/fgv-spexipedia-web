import type { SpexEditData } from "@/lib/wiki/edit.server";

/**
 * One thing the page can have: filled is from 0 to 1, as a list is counted by the share of its rows that have a
 * value (characters with a description, numbers with credits).
 */
export type CompletenessItem = { key: string; filled: number };
export type CompletenessSection = { section: string; items: CompletenessItem[]; share: number };
export type Completeness = { sections: CompletenessSection[]; share: number };

type Kind = { id: string; retired?: boolean | null };

const has = (value: unknown) => (typeof value === "string" ? value.trim().length > 0 : value != null);
const any = (list: readonly unknown[] | null | undefined) => (list && list.length > 0 ? 1 : 0);
const share = <T,>(rows: readonly T[], test: (row: T) => boolean) => (rows.length === 0 ? 0 : rows.filter(test).length / rows.length);
const sum = (items: CompletenessItem[]) => items.reduce((total, item) => total + item.filled, 0);

const section = (name: string, items: CompletenessItem[]): CompletenessSection =>
  ({ section: name, items, share: items.length === 0 ? 1 : sum(items) / items.length });

/**
 * How much of a spex's page is filled in, by section of its editing page. Every item weighs the same, so the whole is
 * the share of all items. A revival falls back to its original for what it leaves empty (spec 5.6), so it is
 * measured by what belongs to the production itself: poster, premiere, facts and photos.
 */
export function spexCompleteness(spex: SpexEditData, factKinds: readonly Kind[]): Completeness {
  const page = spex.page;
  const facts = factKinds.filter(kind => !kind.retired);
  const filledFacts = new Set((page?.facts ?? []).filter(fact => has(fact.value)).map(fact => fact.kind.id));
  const factItems = facts.length === 0 ? [] : [{ key: "facts", filled: share(facts, kind => filledFacts.has(kind.id)) }];
  const photos = [
    { key: "groupPhotos", filled: any(page?.groupPhotos.itemIds) },
    { key: "boardPhotos", filled: any(page?.boardPhotos.itemIds) },
  ];

  if (spex.revival) {
    return whole([
      section("base", [{ key: "poster", filled: has(spex.poster) ? 1 : 0 }]),
      section("texts", [{ key: "premiere", filled: has(page?.premiere) ? 1 : 0 }]),
      ...(factItems.length > 0 ? [section("facts", factItems)] : []),
      section("media", photos),
    ]);
  }
  const characters = spex.characters.filter(character => !character.retired);
  const scenes = spex.scenes;
  const numbers = spex.numbers.filter(number => !number.retired);

  return whole([
    section("base", [{ key: "poster", filled: has(spex.poster) ? 1 : 0 }]),
    section("texts", (["premiere", "introduction", "shortDescription", "description", "synopsis", "vestDescription", "vestWornBy"] as const)
      .map(key => ({ key, filled: has(page?.[key]) ? 1 : 0 }))),
    ...(factItems.length > 0 ? [section("facts", factItems)] : []),
    section("media", [
      { key: "scenography", filled: any(page?.scenography) },
      { key: "vest", filled: any(page?.vest) },
      { key: "rebus", filled: has(page?.rebus) ? 1 : 0 },
      { key: "rebusSolution", filled: has(page?.rebusSolution) ? 1 : 0 },
      ...photos,
    ]),
    section("characters", [
      { key: "characters", filled: any(characters) },
      { key: "characterDescriptions", filled: share(characters, character => has(character.description)) },
      { key: "characterImages", filled: share(characters, character => character.images.length > 0) },
    ]),
    section("scenes", [
      { key: "scenes", filled: any(scenes) },
      { key: "scenePlaces", filled: share(scenes, scene => has(scene.place)) },
    ]),
    section("numbers", [
      { key: "numbers", filled: any(numbers) },
      { key: "numberOriginals", filled: share(numbers, number => has(number.originalTitle)) },
      { key: "numberCredits", filled: share(numbers, number => number.credits.length > 0) },
      { key: "numberCharacters", filled: share(numbers, number => number.characters.length > 0) },
    ]),
  ]);
}

function whole(sections: CompletenessSection[]): Completeness {
  const items = sections.flatMap(s => s.items);

  return { sections, share: items.length === 0 ? 1 : sum(items) / items.length };
}
