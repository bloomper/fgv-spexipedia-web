import { acceptCookies, expect, linksTo, test } from "./fixtures";

/**
 * Reading Spexipedia as a visitor: the start page, the spex by category and decade, a spex page with its sections,
 * search, and the addresses other applications and the old MediaWiki use.
 */
test.describe("Reading", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
  });

  test("the start page welcomes, features the spex of the year, and links this day's premiere", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Spexipedia" })).toBeVisible();
    await expect(page.getByText(/FGV:s uppslagsverk om Chalmersspexet/)).toBeVisible();
    await expect(page.getByText("Årets spex")).toBeVisible();
    await expect(page.getByRole("link", { name: "Premiär för Bojan (1948)" })).toHaveAttribute("href", "/spex/1948-bojan");
    await expect(page.getByRole("link", { name: "Gamla Chalmersspexet" }).first()).toHaveAttribute("href", /^\/categories\//);
  });

  test("the spex list goes by decade, and a category page lists its spex", async ({ page }) => {
    await page.goto("/spex");
    await expect(page.getByRole("heading", { level: 1, name: "Spex" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "1940-talet" })).toBeVisible();
    expect(await linksTo(page, "/spex/")).toContain("/spex/1948-bojan");

    await page.goto("/categories/e9bd2ef4-af0e-376a-91a4-9b20a1fd67c8");
    await expect(page.getByRole("heading", { level: 1, name: "Gamla Chalmersspexet" })).toBeVisible();
    await expect(page.getByText("Sedan 1948")).toBeVisible();
    expect(await linksTo(page, "/spex/")).toEqual(expect.arrayContaining(["/spex/1948-bojan", "/spex/1956-napoleon"]));
  });

  test("a spex page shows its sections, with the rail to them", async ({ page }) => {
    await page.goto("/spex/1948-bojan");
    await expect(page.getByRole("heading", { level: 1, name: /Bojan/ })).toBeVisible();
    await expect(page.getByText("Bojan – ett spex om makt, kärlek").first()).toBeVisible();

    for (const section of ["Roller", "Manus och program", "Musik", "Programrebus", "Spexvästen"]) {
      await expect(page.getByRole("heading", { level: 2, name: section }), section).toBeVisible();
    }
    const roles = page.getByRole("region", { name: "Roller" });

    await expect(roles.getByText("Drottningen").first()).toBeVisible();
    await expect(page.getByRole("region", { name: "Musik" }).getByText("Kärleksduett i månsken").first()).toBeVisible();
    await expect(page.getByRole("region", { name: "Manus och program" }).getByText("Hovet samlas i tronsalen")).toBeVisible();

    const rail = page.getByRole("navigation", { name: "På sidan" });

    await rail.getByRole("link", { name: "Musik" }).click();
    await expect(page).toHaveURL(/#music$/);
    await expect(page.getByRole("heading", { level: 2, name: "Musik" })).toBeInViewport();
  });

  test("a spex page leads to the next spex and to its revivals", async ({ page }) => {
    await page.goto("/spex/1948-bojan");

    const pager = page.getByRole("navigation", { name: "Föregående och nästa spex" });

    await expect(pager.getByRole("link", { name: /Föregående spex/ })).toHaveCount(0);
    await pager.getByRole("link", { name: /Nästa spex/ }).click();
    await expect(page).toHaveURL(/\/spex\/1949-erik-xiv$/);
    await expect(page.getByRole("heading", { level: 1, name: /Erik XIV/ })).toBeVisible();

    await page.goto("/spex/1956-napoleon");
    await expect(page.getByRole("link", { name: "1985", exact: true })).toHaveAttribute("href", "/spex/1985-napoleon");
    await expect(page.getByRole("navigation", { name: "Föregående och nästa spex" }).getByRole("link", { name: /Henrik 8 \(1954\)/ })).toBeVisible();
  });

  test("the other applications' address by id leads to the spex page", async ({ page }) => {
    await page.goto("/spex/c733337b-1a27-3264-a00f-dac3ab13e661");
    await expect(page).toHaveURL(/\/spex\/1948-bojan$/);
  });

  test("a spex that is not there says so", async ({ page }) => {
    // The page streams, so the status is sent before the spex is looked up; the page itself says not found
    await page.goto("/spex/1900-finns-inte");
    await expect(page.getByRole("heading", { name: "Sidan finns inte" })).toBeVisible();
  });

  test("search finds spex and articles, by kind", async ({ page }) => {
    await page.goto("/search?q=spex");
    await expect(page.getByRole("heading", { name: "Spex", exact: true }).last()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Artiklar" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Bojan (1948)" })).toHaveAttribute("href", "/spex/1948-bojan");
    await expect(page.getByRole("link", { name: "Spexets traditioner" })).toHaveAttribute("href", "/articles/spexets-traditioner");
  });

  test("search from the header, and an empty search says nothing was found", async ({ page }) => {
    await page.goto("/search");
    await page.getByRole("main").getByRole("searchbox").fill("Napoleon");
    await page.getByRole("main").getByRole("searchbox").press("Enter");
    await expect(page).toHaveURL(/\/search\?q=Napoleon$/);
    await expect(page.getByRole("link", { name: "Napoleon (1956)" })).toBeVisible();

    await page.goto("/search?q=xyzzy");
    await expect(page.getByText("Inget hittades för ”xyzzy”.")).toBeVisible();
    // Only members are offered to write the article
    await expect(page.getByRole("link", { name: "Skriv en artikel om ”xyzzy”" })).toHaveCount(0);
  });

  test("an old MediaWiki address goes to the page that replaced it, or else to a search", async ({ page }) => {
    await page.goto("/Bojan_1948");
    await expect(page).toHaveURL(/\/spex\/1948-bojan$/);

    await page.goto("/index.php?title=Traditioner");
    await expect(page).toHaveURL(/\/articles\/spexets-traditioner$/);

    await page.goto("/Gyldene_Freden");
    await expect(page).toHaveURL(/\/search\?q=Gyldene\+Freden$/);
    await expect(page.getByText("Inget hittades för ”Gyldene Freden”.")).toBeVisible();
  });

  test("the about and support pages give the addresses to write to", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "Om Spexipedia" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Skicka ett e-postmeddelande" })).toHaveAttribute("href", /^mailto:feedback\.spexipedia@example\.org/);

    await page.goto("/support");
    await expect(page.getByRole("link", { name: "Skicka ett supportärende" })).toHaveAttribute("href", /^mailto:support\.spexipedia@example\.org/);
  });
});
