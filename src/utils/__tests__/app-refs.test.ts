import { describe, expect, it } from "vitest";
import { appRef, appRefMarkdown } from "@/utils/app-refs";

const webs = {
  spexify: "https://spexify.example",
  spexgram: "https://gram.example",
  archive: "https://arkiv.example/web",
};
const ID = "0190aaaa-0000-7000-8000-000000000001";

describe("app links in articles", () => {
  it("turn the address of a page in another application into a reference", () => {
    expect(appRef(`https://spexify.example/albums/${ID}?track=x`, webs)).toBe(`spexify:album/${ID}`);
    expect(appRef(`https://gram.example/albums/${ID}`, webs)).toBe(`spexgram:album/${ID}`);
    expect(appRef(`https://arkiv.example/web/arrangements/${ID.toUpperCase()}`, webs)).toBe(`arkiv:arrangement/${ID}`);
  });

  it("refuse other addresses", () => {
    expect(appRef(`https://elsewhere.example/albums/${ID}`, webs)).toBeNull();
    expect(appRef("https://spexify.example/albums", webs)).toBeNull();
    expect(appRef(`https://flix.example/videos/${ID}`, webs)).toBeNull();
    expect(appRef("inte en adress", webs)).toBeNull();
  });

  it("write the link with its text, without characters that would break it", () => {
    expect(appRefMarkdown(`spexify:album/${ID}`, " Skivan [1987] ")).toBe(`[[spexify:album/${ID}|Skivan 1987]]`);
    expect(appRefMarkdown(`spexify:album/${ID}`, "")).toBe(`[[spexify:album/${ID}]]`);
  });
});
