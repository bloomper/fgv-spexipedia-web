import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "@/utils/csp";

describe("contentSecurityPolicy", () => {
  it("allows Spexipedia's and Spexgram's media origins for video, images and fetches", () => {
    const policy = contentSecurityPolicy(
      ["https://spexipedia.example.org", "https://media.spexgram.example.org"],
      false
    );

    expect(policy).toContain(
      "media-src 'self' blob: https://spexipedia.example.org https://media.spexgram.example.org"
    );
    expect(policy).toContain(
      "img-src 'self' blob: data: https: https://spexipedia.example.org https://media.spexgram.example.org"
    );
    expect(policy).toContain("connect-src 'self' https://spexipedia.example.org https://media.spexgram.example.org");
    expect(policy).not.toContain("unsafe-eval");
  });

  it("allows no third-party scripts or frames", () => {
    const policy = contentSecurityPolicy(["https://spexipedia.example.org"], false);

    expect(policy).toMatch(/script-src 'self' 'unsafe-inline';/);
    expect(policy).toContain("frame-src 'none'");
    expect(policy).not.toContain("challenges.cloudflare.com");
  });

  it("ignores origins that are not ones, and missing ones", () => {
    const policy = contentSecurityPolicy(["https://x.org; script-src *", undefined, ""], false);

    expect(policy).toContain("media-src 'self' blob:;");
  });
});
