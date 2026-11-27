import { describe, expect, it } from "vitest";
import { categoryYears, revivalYears } from "@/utils/spex-years";

const k1 = { id: "k1", firstYear: "1948" };
const spex = [
  { id: "s1", year: "1984", category: { id: "k1" }, parent: null },
  { id: "s2", year: "2010", category: null, parent: { id: "s1" } },
  { id: "s5", year: "1990", category: { id: "k2" }, parent: null },
  { id: "s6", year: "1991", category: { id: "k1" }, parent: null, retired: true },
];

describe("categoryYears", () => {
  it("offers the years no other active original of the category has, from its first year to next year, newest first", () => {
    const years = categoryYears(k1, spex, null, 2026);

    expect(years[0]).toBe("2027");
    expect(years.at(-1)).toBe("1948");
    expect(years).not.toContain("1984");
    expect(years).toContain("2010");
    expect(years).toContain("1990");
    expect(years).toContain("1991");
    expect(categoryYears(undefined, spex, null, 2026)).toEqual([]);
  });

  it("leaves the edited spex its own year", () => {
    expect(categoryYears(k1, spex, "s1", 2026)).toContain("1984");
  });
});

describe("revivalYears", () => {
  it("offers the years after the original, up to two years ahead, but not its siblings'", () => {
    expect(
      revivalYears(
        "2020",
        [
          { id: "a", year: "2022" },
          { id: "b", year: "2024" },
        ],
        "b",
        2026
      )
    ).toEqual(["2028", "2027", "2026", "2025", "2024", "2023", "2021"]);
  });
});
