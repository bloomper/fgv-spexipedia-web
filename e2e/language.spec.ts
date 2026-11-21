import { acceptCookies, expect, test } from "./fixtures";

test.describe("Language", () => {
  test("switches to English and back, for visitors too", async ({ page }) => {
    await page.goto("/spex/1948-bojan");
    await acceptCookies(page);
    await page.getByRole("button", { name: "Byt språk" }).click();
    await page.getByRole("menuitem", { name: "English" }).click();

    await expect(page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Characters" })).toBeVisible();

    // The choice is kept for the next page
    await page.goto("/");
    await expect(page.getByText("This day in history")).toBeVisible();

    await page.getByRole("button", { name: "Change language" }).click();
    await page.getByRole("menuitem", { name: "Svenska" }).click();
    await expect(page.getByRole("link", { name: "Logga in" }).first()).toBeVisible();
    await expect(page.getByText("Den här dagen i historien")).toBeVisible();
  });

  test("an admin's English welcome text is shown to members reading in English", async ({ page, loginAs }) => {
    await loginAs("admin");
    await page.goto("/admin/settings");
    await page.getByLabel("Text för medlemmar, på engelska").fill("Welcome, spexare!");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByText("Inställningarna är sparade")).toBeVisible();

    await page.goto("/");
    await page.getByRole("button", { name: "Byt språk" }).click();
    await page.getByRole("menuitem", { name: "English" }).click();
    await expect(page.getByRole("main").getByText("Welcome, spexare!")).toBeVisible();
  });
});

test.describe("Visitor statistics", () => {
  test("no tracker is loaded without Umami's address and website", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("script[src='/stats/script.js']")).toHaveCount(0);
  });
});
