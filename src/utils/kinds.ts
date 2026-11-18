import type { FactValueType, KindType, KindUse } from "@/gql/graphql";

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
  MEDIUM: [],
  IMAGE: ["CHARACTER", "SCENOGRAPHY", "PAGE"],
  FACT: [],
};

/** Every use of image kinds, checked against the schema's enum the same way. */
const USES: Record<KindUse, true> = { CHARACTER: true, SCENOGRAPHY: true, PAGE: true };

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
