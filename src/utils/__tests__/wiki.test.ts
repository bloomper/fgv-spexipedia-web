import { describe, expect, it } from "vitest";
import { creditLabel, groupBy, personLabel } from "@/utils/wiki";
import { diffLines } from "@/utils/diff";

describe("people on pages", () => {
  it("shows members the name with the nickname, visitors the nickname, and nothing without either", () => {
    expect(personLabel({ name: "Bertil Basson", nickname: "Basen" })).toBe("Bertil Basson ”Basen”");
    expect(personLabel({ name: "David Dirigentsson", nickname: null })).toBe("David Dirigentsson");
    expect(personLabel({ name: null, nickname: "Basen" })).toBe("Basen");
    expect(personLabel({ name: null, nickname: null })).toBeNull();
    expect(personLabel(null)).toBeNull();
    expect(creditLabel({ name: "ABBA" })).toBe("ABBA");
    expect(creditLabel({ person: { nickname: "Evita" }, name: null })).toBe("Evita");
    expect(creditLabel({ person: { nickname: null } })).toBeNull();
  });

  it("groups in the order first seen", () => {
    expect(groupBy([1, 2, 3, 4], n => n % 2)).toEqual([[1, [1, 3]], [0, [2, 4]]]);
  });
});

describe("differences", () => {
  it("keeps the common lines and marks what was removed and added", () => {
    expect(diffLines("a\nb\nc", "a\nx\nc\nd")).toEqual([
      { kind: "same", text: "a" },
      { kind: "removed", text: "b" },
      { kind: "added", text: "x" },
      { kind: "same", text: "c" },
      { kind: "added", text: "d" },
    ]);
    expect(diffLines("", "a")).toEqual([{ kind: "removed", text: "" }, { kind: "added", text: "a" }]);
  });
});
