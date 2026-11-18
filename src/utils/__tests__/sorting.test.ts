import { describe, expect, it } from "vitest";
import { parseSort, sortHref, sortItems } from "@/utils/sorting";

const FIELDS = ["year", "title"] as const;
const DEFAULT = { field: "year", dir: "asc" } as const;

describe("parseSort", () => {
  it("takes the field and direction from the address", () => {
    expect(parseSort({ sort: "title", dir: "desc" }, FIELDS, DEFAULT)).toEqual({ field: "title", dir: "desc" });
  });

  it("falls back to the list's own order for unknown values", () => {
    expect(parseSort({ sort: "nope", dir: "up" }, FIELDS, DEFAULT)).toEqual(DEFAULT);
    expect(parseSort({}, FIELDS, DEFAULT)).toEqual(DEFAULT);
  });
});

describe("sortHref", () => {
  it("leaves the address bare for the list's own order and keeps other parameters", () => {
    expect(sortHref("/articles", { view: "list", sort: "title" }, DEFAULT, DEFAULT)).toBe("/articles?view=list");
    expect(sortHref("/spex", {}, { field: "title", dir: "desc" }, DEFAULT)).toBe("/spex?sort=title&dir=desc");
  });
});

describe("sortItems", () => {
  const items = [
    { title: "Örnen", year: "1990", volume: null },
    { title: "Anna", year: "1950", volume: 2 },
    { title: "Ärlig", year: "1970", volume: 10 },
  ];

  it("sorts text the Swedish way, either direction", () => {
    expect(sortItems(items, "asc", i => i.title).map(i => i.title)).toEqual(["Anna", "Ärlig", "Örnen"]);
    expect(sortItems(items, "desc", i => i.title).map(i => i.title)).toEqual(["Örnen", "Ärlig", "Anna"]);
  });

  it("sorts numbers as numbers and puts missing keys last both ways", () => {
    expect(sortItems(items, "asc", i => i.volume).map(i => i.volume)).toEqual([2, 10, null]);
    expect(sortItems(items, "desc", i => i.volume).map(i => i.volume)).toEqual([10, 2, null]);
  });

  it("breaks ties ascending by the next key", () => {
    const tied = [{ year: "1980", title: "B" }, { year: "1980", title: "A" }, { year: "1990", title: "C" }];

    expect(sortItems(tied, "desc", i => i.year, i => i.title).map(i => i.title)).toEqual(["C", "A", "B"]);
  });

  it("compares numbers inside text as numbers, e.g. catalogue numbers", () => {
    const records = [{ c: "FGV 10" }, { c: "FGV 9" }];

    expect(sortItems(records, "asc", r => r.c).map(r => r.c)).toEqual(["FGV 9", "FGV 10"]);
  });
});
