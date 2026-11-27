import { expect, type Page, test as base } from "@playwright/test";
import { MOCK_URL } from "./constants";

/** The mock backend's users: roles USER+AUTHOR+EDITOR+ADMIN, USER+EDITOR, USER+AUTHOR, USER, and none. */
export type Persona = "admin" | "editor" | "author" | "member" | "noaccess";

let logins = 0;

/** A documentation address (RFC 5737) per login: 192.0.2.1, 192.0.2.2, … */
function nextClientIp() {
  logins = logins % 254 + 1;
  return `192.0.2.${logins}`;
}

type MockArticle = {
  id: string;
  slug: string;
  title: string;
  visibility: "PUBLIC" | "MEMBERS";
  published: boolean;
  trashedAt: string | null;
  parentId: string | null;
  categoryIds: string[];
  revisions: { id: string; comment: string | null; hidden: boolean; authorName: string; body: string }[];
};

type MockState = {
  articles: MockArticle[];
  categories: { id: string; slug: string; name: string; parentIds: string[] }[];
  settings: Record<string, string | null>;
  jobs: { job: string; lastSucceeded: boolean | null }[];
  consumers: { id: string; name: string; clientId: string; notifyUrl: string | null; enabled: boolean }[];
  redirects: { id: string; oldTitle: string; target: string }[];
  kinds: { id: string; type: string; use: string | null; nameSv: string; nameEn: string; aliases: string[]; retired: boolean; position: number }[];
  audit: { actorId: string; action: string; entityType: string; summary: string }[];
};

type Mock = {
  /** Makes the next call of a GraphQL operation, e.g. "ArticleUpdate", fail with the classification, e.g. "CONFLICT". */
  failNext: (operation: string, classification: string) => Promise<void>;
  /** What the backend holds, for checking what the web sent. */
  state: () => Promise<MockState>;
};

export const test = base.extend<{
  resetBackend: void;
  noNativeDialogs: void;
  loginAs: (persona: Persona) => Promise<void>;
  mock: Mock;
}>({
  resetBackend: [async ({ request }, provide) => {
    await request.post(`${MOCK_URL}/__reset`);
    await provide();
  }, { auto: true }],
  // The application asks in its own dialogs; a native confirm or prompt fails the test
  noNativeDialogs: [async ({ page }, provide) => {
    const native: string[] = [];

    page.on("dialog", dialog => {
      native.push(`${dialog.type()}: ${dialog.message()}`);
      void dialog.dismiss();
    });
    await provide();
    expect(native, "native dialogs").toEqual([]);
  }, { auto: true }],
  loginAs: async ({ page, request }, provide) => {
    await provide(async (persona: Persona) => {
      expect((await request.post(`${MOCK_URL}/__persona`, { data: { persona } })).status(), "persona set").toBe(204);
      // Better Auth limits requests per client IP; every test comes from the same machine, so each login gets its own
      await page.setExtraHTTPHeaders({ "x-forwarded-for": nextClientIp() });
      // A second login in one test leaves the page first: its own requests would otherwise start logins of their own
      // once the cookies are gone, and theirs replace this login's state cookie
      if (page.url().startsWith("http")) {
        // c15t also remembers the dismissed notice in local storage
        await page.evaluate(() => localStorage.clear());
        await page.goto("about:blank");
      }
      await page.context().clearCookies();
      await page.goto("/api/auth/login");
      await page.waitForURL(url => !url.pathname.startsWith("/api/auth"));
      await acceptCookies(page);
    });
  },
  mock: async ({ request }, provide) => {
    await provide({
      failNext: async (operation: string, classification: string) => {
        expect((await request.post(`${MOCK_URL}/__fail`, { data: { operation, classification } })).status()).toBe(204);
      },
      state: async () => (await request.get(`${MOCK_URL}/__state`)).json() as Promise<MockState>,
    });
  },
});

/**
 * Dismisses the cookie notice, once per browser context. The notice comes up after hydration, so it is waited for; left
 * up, it covers the bottom of the page and takes the clicks meant for what is there.
 */
export async function acceptCookies(page: Page) {
  const button = page.getByRole("button", { name: "Jag förstår" });

  if (await button.waitFor({ timeout: 5_000 }).then(() => true, () => false)) {
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

/**
 * Answers the application's own confirm dialog by clicking its button.
 */
export async function answerDialog(page: Page, button: string) {
  // A confirmation is an alert dialog, a prompt or a choice a plain one
  const dialog = page.getByRole("alertdialog").or(page.getByRole("dialog"));

  await dialog.getByRole("button", { name: button, exact: true }).click();
  await expect(dialog).toBeHidden();
}

/** The sidebar as shown, on desktop. */
export const sidebar = (page: Page) => page.locator("[data-slot=\"sidebar\"]:visible");

export { expect };
