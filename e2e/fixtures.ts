import { expect, type Page, test as base } from "@playwright/test";
import { MOCK_URL } from "./constants";

type Persona = "admin" | "member" | "noaccess";

export const test = base.extend<{
  resetBackend: void;
  loginAs: (persona: Persona) => Promise<void>;
}>({
  resetBackend: [async ({ request }, provide) => {
    await request.post(`${MOCK_URL}/__reset`);
    await provide();
  }, { auto: true }],
  loginAs: async ({ page, request }, provide) => {
    await provide(async (persona: Persona) => {
      expect((await request.post(`${MOCK_URL}/__persona`, { data: { persona } })).status(), "persona set").toBe(204);
      await page.context().clearCookies();
      await page.goto("/api/auth/login");
      await page.waitForURL(url => !url.pathname.startsWith("/api/auth"));
      await acceptCookies(page);
    });
  },
});

/**
 * Dismisses the cookie notice, once per browser context.
 */
export async function acceptCookies(page: Page) {
  const button = page.getByRole("button", { name: "Jag förstår" });

  if (await button.isVisible().catch(() => false)) {
    await button.click();
    await expect.poll(async () => (await page.context().cookies()).some(cookie => cookie.name === "c15t-notice")).toBe(true);
  }
}

/**
 * The addresses of the links on the page whose path starts with the prefix, without duplicates.
 */
export async function linksTo(page: Page, prefix: string): Promise<string[]> {
  const hrefs = await page.locator(`a[href^="${prefix}"]`).evaluateAll(links => links.map(link => link.getAttribute("href") ?? ""));

  return [...new Set(hrefs.map(href => href.split("#")[0]).filter(href => href.length > prefix.length))];
}

export { expect };
