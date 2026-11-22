import { describe, expect, it } from "vitest";
import { creatableContents, defaultKindId, imagesByKind, isExternal, isKindType, isKindUse, isSectionContent, KIND_TYPES, kindTypes, offeredKinds } from "@/utils/kinds";

const kinds = [{ id: "a", name: "A", retired: true }, { id: "b", name: "B" }, { id: "c", name: "C", retired: false }];

describe("kinds", () => {
  it("offer the kinds in use, and a retired one only when it is the current choice", () => {
    expect(offeredKinds(kinds).map(kind => kind.id)).toEqual(["b", "c"]);
    expect(offeredKinds(kinds, "a").map(kind => kind.id)).toEqual(["a", "b", "c"]);
    expect(defaultKindId(kinds)).toBe("b");
    expect(defaultKindId([])).toBeNull();
  });

  it("know the schema's types and uses, and only image kinds have uses", () => {
    expect(kindTypes()).toEqual(["NUMBER", "CREDIT", "IMAGE", "FACT", "SECTION"]);
    expect(kindTypes().filter(type => KIND_TYPES[type].length > 0)).toEqual(["IMAGE"]);
    expect(isKindType("FACT")).toBe(true);
    expect(isKindType("fact")).toBe(false);
    expect(isKindType(undefined)).toBe(false);
    expect(isKindUse("SECTION")).toBe(true);
    expect(isKindUse("SCENOGRAPHY")).toBe(false);
  });

  it("know which section contents admins create and which show other applications' material", () => {
    expect(creatableContents()).toEqual(["IMAGES", "SPEXFLIX_VIDEO", "SPEXGRAM", "SPEXIFY_ALBUM", "ARCHIVE_DOCUMENT"]);
    expect(isExternal("SPEXFLIX_VIDEO")).toBe(true);
    expect(isExternal("IMAGES")).toBe(false);
    expect(isExternal(null)).toBe(false);
    expect(isSectionContent("VEST")).toBe(true);
    expect(isSectionContent("SCENOGRAPHY")).toBe(false);
  });

  it("group images by kind in the kinds' order, with unknown kinds last", () => {
    const images = [{ id: 1, kind: { id: "c" } }, { id: 2, kind: { id: "b" } }, { id: 3, kind: null }, { id: 4, kind: { id: "x" } }, { id: 5, kind: { id: "c" } }];

    expect(imagesByKind(images, kinds).map(group => [group.kind?.id ?? null, group.images.map(image => image.id)]))
      .toEqual([["b", [2]], ["c", [1, 5]], [null, [3, 4]]]);
    expect(imagesByKind([], kinds, true).map(group => group.kind?.id)).toEqual(["a", "b", "c"]);
  });
});
