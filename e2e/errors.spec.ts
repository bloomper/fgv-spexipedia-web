import { acceptCookies, expect, test } from "./fixtures";

/**
 * What the pages do when the server fails or something is not there: an error page that can try again, not found, and
 * the server's own message when it refuses an action.
 */
test.describe("Errors", () => {
  test("a failing server shows the error page, and trying again loads the page", async ({ page, mock }) => {
    await page.goto("/");
    await acceptCookies(page);
    await mock.failNext("Article", "INTERNAL_ERROR");
    await page.goto("/articles/spexikon");
    await expect(page.getByRole("heading", { name: "Något gick fel" })).toBeVisible();

    await page.getByRole("button", { name: "Försök igen" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Spexikon" })).toBeVisible();
  });

  test("a member gets not found for an article that is not there; a visitor is asked to log in", async ({
    page,
    loginAs,
  }) => {
    await page.goto("/articles/finns-inte");
    await acceptCookies(page);
    await expect(page.getByRole("heading", { name: "Logga in för att se det här" })).toBeVisible();

    await loginAs("member");
    await page.goto("/articles/finns-inte");
    await expect(page.getByRole("heading", { name: "Sidan finns inte" })).toBeVisible();
  });

  test("an address nobody knows is searched for", async ({ page }) => {
    await page.goto("/Ingen_sådan_sida");
    await expect(page).toHaveURL(/\/search\?q=Ingen\+s%C3%A5dan\+sida$/);
  });

  test("a refused action tells the user why, and nothing changes", async ({ page, loginAs, mock }) => {
    await loginAs("author");
    await page.goto("/articles/repetitionerna");
    await mock.failNext("ArticleSetPublished", "FORBIDDEN");
    await page.getByRole("button", { name: "Publicera" }).click();
    await expect(page.getByText("Fel: FORBIDDEN").filter({ visible: true })).toBeVisible();
    await expect(
      page.getByRole("article").locator("header").getByText("Opublicerad").filter({ visible: true })
    ).toBeVisible();
    expect((await mock.state()).articles.find((article) => article.slug === "repetitionerna")?.published).toBe(false);
  });
});
