import { BASE_URL, PEOPLE } from "./constants";
import { acceptCookies, expect, linksTo, test } from "./fixtures";

const NAMES = PEOPLE.map((person) => person.name);

/**
 * The spec's rule for people on public pages (5.3): visitors see published spexare by nickname only, and nothing of
 * one without a nickname; members see names. Every public page is read as a visitor and must hold none of the sample
 * spexare's names, not even in the HTML the browser is sent.
 */
test.describe("People on public pages", () => {
  async function expectNoNames(page: import("@playwright/test").Page, path: string) {
    const response = await page.goto(path);

    expect(response?.status(), path).toBeLessThan(400);
    const html = await page.content();

    for (const name of NAMES) {
      expect(html, `${name} on ${path}`).not.toContain(name);
    }
  }

  test("a visitor sees nicknames on a spex page, never names", async ({ page }) => {
    await page.goto("/spex");
    await acceptCookies(page);

    const spex = (await linksTo(page, "/spex/"))[0];

    expect(spex, "a spex in the list").toBeTruthy();
    await expectNoNames(page, spex);
    await expect(page.getByText("Kalle Kula").filter({ visible: true }).first()).toBeVisible();
  });

  test("a visitor finds no names on any public page", async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);

    const pages = new Set<string>(["/", "/spex", "/articles", "/search?q=spex"]);

    await page.goto("/spex");
    (await linksTo(page, "/spex/")).slice(0, 5).forEach((path) => pages.add(path));
    await page.goto((await linksTo(page, "/spex/"))[0]);
    (await linksTo(page, "/categories/")).forEach((path) => pages.add(path));
    await page.goto("/articles");
    (await linksTo(page, "/articles/"))
      .filter((path) => !path.startsWith("/articles/new"))
      .slice(0, 3)
      .forEach((path) => pages.add(path));

    expect(pages.size, "pages read").toBeGreaterThan(8);
    for (const path of pages) {
      await expectNoNames(page, path);
    }
  });

  test("a member sees names, and a visitor afterwards still does not", async ({ page, loginAs, browser }) => {
    await page.goto("/spex");
    const spex = (await linksTo(page, "/spex/"))[0];

    await loginAs("member");
    await page.goto(spex);
    await expect(page.getByText("Karl Kulsson").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Hemlig Hemligsson").filter({ visible: true }).first()).toBeVisible();

    // A page rendered for a member must not be served to the next visitor
    const visitor = await browser.newPage();

    await visitor.goto(new URL(spex, BASE_URL).toString());
    const html = await visitor.content();

    for (const name of NAMES) {
      expect(html, `${name} for a visitor after a member`).not.toContain(name);
    }
    await visitor.close();
  });
});
