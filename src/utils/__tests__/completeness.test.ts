import { describe, expect, it } from "vitest";
import { spexCompleteness } from "@/utils/completeness";
import type { SpexEditData } from "@/lib/wiki/edit.server";

const empty = { itemIds: [] as string[] };
const page = (values: Record<string, unknown> = {}) => ({
  premiere: null, introduction: null, shortDescription: null, description: null, synopsis: null, vestDescription: null, vestWornBy: null,
  facts: [], rebus: null, rebusSolution: null, scenography: [], vest: [], other: [], groupPhotos: empty, boardPhotos: empty, ...values,
});
const spex = (values: Record<string, unknown> = {}) => ({
  id: "s1", revival: false, poster: null, page: page(), characters: [], scenes: [], numbers: [], ...values,
}) as unknown as SpexEditData;
const section = (result: ReturnType<typeof spexCompleteness>, name: string) => result.sections.find(s => s.section === name)!;

describe("spexCompleteness", () => {
  it("is nothing for an empty spex and counts each item alike", () => {
    expect(spexCompleteness(spex(), []).share).toBe(0);

    const result = spexCompleteness(spex({ poster: { id: "i1" }, page: page({ introduction: "Hej", synopsis: "  " }) }), []);

    expect(section(result, "base").share).toBe(1);
    expect(section(result, "texts").share).toBeCloseTo(1 / 7);
    expect(result.sections.some(s => s.section === "facts")).toBe(false);
  });

  it("counts lists by the share of their rows that have a value, and facts by the kinds in use", () => {
    const result = spexCompleteness(spex({
      characters: [
        { description: "Kung", images: [], retired: false },
        { description: null, images: [], retired: false },
        { description: null, images: [], retired: true },
      ],
      page: page({ facts: [{ kind: { id: "f1" }, value: "x" }] }),
    }), [{ id: "f1" }, { id: "f2" }, { id: "f3", retired: true }]);

    expect(section(result, "characters").items).toEqual([
      { key: "characters", filled: 1 },
      { key: "characterDescriptions", filled: 0.5 },
      { key: "characterImages", filled: 0 },
    ]);
    expect(section(result, "facts").share).toBe(0.5);
  });

  it("measures a revival by what belongs to the production itself", () => {
    const result = spexCompleteness(spex({ revival: true, page: page({ premiere: "2010-04-01", groupPhotos: { itemIds: ["p1"] } }) }), []);

    expect(result.sections.map(s => s.section)).toEqual(["base", "texts", "media"]);
    expect(result.share).toBe(0.5);
  });
});
