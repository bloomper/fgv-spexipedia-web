import type { FactValueType, KindType, KindUse, SectionContent } from "@/gql/graphql";

/*
 * Kinds are data that admins keep (spec 4.6): the web never lists them, it reads them from the server. Only the types
 * and uses, which the schema's enums fix, are known here.
 */

export type KindOption = { id: string; name: string; retired?: boolean | null; valueType?: string | null };

/**
 * The kinds to offer for a choice: those in use, in their order, and a retired one only when it is the current choice,
 * so that a record keeps showing what it has.
 */
export function offeredKinds<K extends KindOption>(kinds: readonly K[], current?: string | null): K[] {
  return kinds.filter(kind => !kind.retired || kind.id === current);
}

/** The id of the default kind: the first one in use. */
export const defaultKindId = (kinds: readonly KindOption[]) => offeredKinds(kinds)[0]?.id ?? null;

/**
 * Every type of kind, with the uses its kinds are kept per (only image kinds have uses). A Record, so that a type the
 * schema adds is a type error here until it is shown.
 */
export const KIND_TYPES: Record<KindType, readonly KindUse[]> = {
  NUMBER: [],
  CREDIT: [],
  // The image kinds of image sections are kept with their section, under SECTION
  IMAGE: ["CHARACTER"],
  FACT: [],
  SECTION: [],
};

/** Every use of image kinds, checked against the schema's enum the same way. */
const USES: Record<KindUse, true> = { CHARACTER: true, SECTION: true };

/**
 * What each content of a section shows (spec 4.2): whether it has exactly one section kind, which admins never create
 * or merge, and whether it shows material of another application, which an author picks per spex.
 */
export const SECTION_CONTENTS: Record<SectionContent, { single: boolean; external: boolean }> = {
  GROUP: { single: true, external: false },
  CHARACTERS: { single: true, external: false },
  IMAGES: { single: false, external: false },
  MANUSCRIPT: { single: true, external: false },
  MUSIC: { single: true, external: false },
  RECORDS: { single: true, external: false },
  REBUS: { single: true, external: false },
  VEST: { single: true, external: false },
  BOARD: { single: true, external: false },
  TASKS: { single: true, external: false },
  LINKS: { single: true, external: false },
  SPEXFLIX_VIDEO: { single: false, external: true },
  SPEXGRAM: { single: false, external: true },
  SPEXIFY_ALBUM: { single: false, external: true },
  ARCHIVE_DOCUMENT: { single: false, external: true },
};

/** The contents admins create section kinds of: image sections and those of the other applications. */
export const creatableContents = () => (Object.keys(SECTION_CONTENTS) as SectionContent[]).filter(content => !SECTION_CONTENTS[content].single);

export const isExternal = (content: SectionContent | null | undefined) => !!content && SECTION_CONTENTS[content].external;

export function isSectionContent(value: string | null | undefined): value is SectionContent {
  return !!value && value in SECTION_CONTENTS;
}

export const kindTypes = () => Object.keys(KIND_TYPES) as KindType[];

export function isKindType(value: string | null | undefined): value is KindType {
  return !!value && value in KIND_TYPES;
}

export function isKindUse(value: string | null | undefined): value is KindUse {
  return !!value && value in USES;
}

/**
 * Images grouped by their kind, in the kinds' order; kinds without images are left out unless `all`, and images of a
 * kind not in the list come last.
 */
export function imagesByKind<I extends { kind?: { id: string } | null }, K extends { id: string }>(
  images: readonly I[], kinds: readonly K[], all = false,
): { kind: K | null; images: I[] }[] {
  const known = new Set(kinds.map(kind => kind.id));
  const groups = kinds.map(kind => ({ kind: kind as K | null, images: images.filter(image => image.kind?.id === kind.id) }));
  const rest = images.filter(image => !image.kind || !known.has(image.kind.id));

  return [...groups.filter(group => all || group.images.length > 0), ...(rest.length > 0 ? [{ kind: null, images: rest }] : [])];
}

/** What a fact's value is, from the schema's enum; TEXT is the default. */
const VALUE_TYPES: Record<FactValueType, true> = { TEXT: true, DATE: true };

export const factValueTypes = () => Object.keys(VALUE_TYPES) as FactValueType[];
