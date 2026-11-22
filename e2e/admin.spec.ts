import { acceptCookies, answerDialog, expect, test } from "./fixtures";

/**
 * Administration: settings (the start page's texts), maintenance jobs, redirects from the old MediaWiki, the
 * recipients of the change feed, and kinds. Each change shows in the change log.
 */
test.describe("Administration", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs("admin");
  });

  test("the start page's texts for members and visitors are set in the settings", async ({ page, browser, mock }) => {
    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { level: 1, name: "Inställningar" })).toBeVisible();
    await page.getByLabel("Text för medlemmar, på svenska").fill("Välkommen, spexare!");
    await page.getByLabel("Text för besökare, på svenska").fill("Välkommen, besökare!");
    await page.getByLabel("Kontaktadress som visas för besökare").fill("info@example.org");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByText("Inställningarna är sparade").filter({ visible: true })).toBeVisible();
    expect((await mock.state()).settings).toMatchObject({ welcomeSv: "Välkommen, spexare!", contactEmail: "info@example.org" });

    await page.goto("/");
    await expect(page.getByRole("main").getByText("Välkommen, spexare!").filter({ visible: true })).toBeVisible();

    const visitor = await browser.newPage();

    await visitor.goto(new URL("/", page.url()).toString());
    await expect(visitor.getByRole("main").getByText("Välkommen, besökare!").filter({ visible: true })).toBeVisible();
    await expect(visitor.getByText("Välkommen, spexare!")).toHaveCount(0);
    await visitor.close();

    // The form keeps what was saved
    await page.goto("/admin/settings");
    await expect(page.getByLabel("Text för besökare, på svenska")).toHaveValue("Välkommen, besökare!");
  });

  test("a refused save shows the server's message", async ({ page, mock }) => {
    await page.goto("/admin/settings");
    await mock.failNext("SettingsUpdate", "BAD_REQUEST");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByText("Fel: BAD_REQUEST").filter({ visible: true })).toBeVisible();
    await expect(page.getByText("Inställningarna är sparade")).toHaveCount(0);
  });

  test("lists the maintenance jobs with their latest runs, and runs one", async ({ page }) => {
    await page.goto("/admin/maintenance");

    const linkCheck = page.getByRole("listitem").filter({ hasText: "Länkkontroll" });
    const search = page.getByRole("listitem").filter({ hasText: "Sökindex" });

    await expect(linkCheck.getByText(/^Misslyckades, startade/).filter({ visible: true })).toBeVisible();
    await expect(search.getByText("Inte schemalagt").filter({ visible: true })).toBeVisible();
    await expect(search.getByText("Inte sedan servern startade").filter({ visible: true })).toBeVisible();

    await search.getByRole("button", { name: "Kör nu" }).click();
    await expect(page.getByText("Sökindex har startat. Det körs i bakgrunden.").filter({ visible: true })).toBeVisible();
    await expect(search.getByText(/^Lyckades/).filter({ visible: true })).toBeVisible();
  });

  test("adds, changes and removes a redirect, and the old address follows it", async ({ page, mock }) => {
    await page.goto("/admin/redirects");
    await expect(page.getByText("Bojan 1948").filter({ visible: true })).toBeVisible();

    await page.getByRole("button", { name: "Ny omdirigering" }).click();
    await page.getByLabel("Gammal titel").fill("Napoleon (spex)");
    await page.getByLabel("Sida, t.ex. /spex/1984-lasse-maja").fill("/spex/1956-napoleon");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByText("Sparat").filter({ visible: true }).first()).toBeVisible();

    const row = page.getByRole("listitem").filter({ hasText: "Napoleon (spex)" });

    await expect(row.getByRole("link", { name: "/spex/1956-napoleon" })).toBeVisible();

    await page.goto("/Napoleon_(spex)");
    await expect(page).toHaveURL(/\/spex\/1956-napoleon$/);

    await page.goto("/admin/redirects");
    await page.getByRole("searchbox", { name: "Filtrera…" }).fill("Bojan");
    await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(1);
    await page.getByRole("main").getByRole("listitem").getByRole("button", { name: "Ta bort" }).click();
    await answerDialog(page, "Ta bort");
    await expect(page.getByText("Bojan 1948")).toHaveCount(0);
    expect((await mock.state()).redirects.map(redirect => redirect.oldTitle)).toEqual(["Traditioner", "Napoleon (spex)"]);
  });

  test("shows how far each recipient has read the change feed, and adds one", async ({ page, mock }) => {
    await page.goto("/admin/consumers");

    const spexify = page.getByRole("listitem").filter({ hasText: "fgv-spexify-service" });

    await expect(spexify.getByText("14 olästa ändringar").filter({ visible: true })).toBeVisible();
    await expect(spexify.getByText("Connection refused").filter({ visible: true })).toBeVisible();
    await expect(spexify.getByText("Hämtar själv").filter({ visible: true })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "fgv-spexregister-service" }).getByText("I fas").filter({ visible: true })).toBeVisible();

    await page.getByRole("button", { name: "Ny mottagare" }).click();
    await page.getByLabel("Namn").fill("Spexflix");
    await page.getByLabel("Tjänstekonto").fill("fgv-spexflix-service");
    await page.getByLabel("Meddelas på").fill("http://spexflix-api:8080/api/sync/notify");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByRole("listitem").filter({ hasText: "fgv-spexflix-service" })).toBeVisible();
    expect((await mock.state()).consumers.at(-1)).toMatchObject({ name: "Spexflix", enabled: true, notifyUrl: "http://spexflix-api:8080/api/sync/notify" });

    // One service account has one recipient
    await page.getByRole("button", { name: "Ny mottagare" }).click();
    await page.getByLabel("Namn").fill("Spexflix igen");
    await page.getByLabel("Tjänstekonto").fill("fgv-spexflix-service");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByText("Tjänstekontot har redan en mottagare.").filter({ visible: true })).toBeVisible();
  });

  test("adds a number kind with aliases, moves it first, and retires another", async ({ page, mock }) => {
    await page.goto("/admin/kinds?type=NUMBER");
    await expect(page.getByText("Sång / Song").filter({ visible: true })).toBeVisible();
    await expect(page.getByText("även: Låt").filter({ visible: true })).toBeVisible();

    await page.getByRole("button", { name: "Ny sort" }).click();
    await page.getByLabel("Namn på svenska").fill("Duett");
    await page.getByLabel("Namn på engelska").fill("Duet");
    await page.getByLabel("Alias").fill("Tvåsång\nDuo");
    await page.getByRole("button", { name: "Spara" }).click();

    const duet = page.getByRole("listitem").filter({ hasText: "Duett / Duet" });

    await expect(duet).toContainText("även: Tvåsång, Duo");
    await expect(duet).toContainText("4");

    for (let i = 0; i < 3; i++) {
      await page.getByRole("listitem").filter({ hasText: "Duett / Duet" }).getByRole("button", { name: "Flytta upp" }).click();
      await expect(page.getByRole("listitem").filter({ hasText: "Duett / Duet" })).toContainText(String(3 - i));
    }
    await page.getByRole("listitem").filter({ hasText: "Final / Finale" }).getByRole("button", { name: "Deaktivera" }).click();
    await expect(page.getByRole("listitem").filter({ hasText: "Final / Finale" }).getByText("Inaktiv").filter({ visible: true })).toBeVisible();

    const numbers = (await mock.state()).kinds.filter(kind => kind.type === "NUMBER").sort((a, b) => a.position - b.position);

    expect(numbers.map(kind => kind.nameSv)).toEqual(["Duett", "Sång", "Ouvertyr", "Final"]);
    expect(numbers.find(kind => kind.nameSv === "Final")?.retired).toBe(true);
  });

  test("image kinds are kept together: those of characters and each image section's own", async ({ page }) => {
    await page.goto("/admin/kinds?type=IMAGE");
    const scenography = page.getByRole("region", { name: "Bildsektionen Scenografi" });

    await expect(page.getByRole("region", { name: "Roller" })).toBeVisible();
    await expect(scenography.getByText("Fond / Backdrop").filter({ visible: true })).toBeVisible();
    await scenography.getByRole("button", { name: "Ny sort" }).click();
    await scenography.getByLabel("Namn på svenska").fill("Ljus");
    await scenography.getByLabel("Namn på engelska").fill("Lighting");
    await scenography.getByRole("button", { name: "Spara" }).click();
    await expect(scenography.getByText("Ljus / Lighting").filter({ visible: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Bildsektionen Övriga bilder" }).getByText("Ljus / Lighting")).toHaveCount(0);
  });

  test("sections have a page of their own, where an image section is added and deleted", async ({ page, mock }) => {
    await page.goto("/admin/sections");
    const sections = page.getByRole("region", { name: "Sektioner" });

    // A new image section, with its own image kind of the same name under Kinds
    await sections.getByRole("button", { name: "Ny sektion" }).click();
    await sections.getByLabel("Namn på svenska").fill("Kostymer");
    await sections.getByLabel("Namn på engelska").fill("Costumes");
    await sections.getByLabel("Underrubrik på svenska").fill("Kläderna");
    await sections.getByRole("button", { name: "Spara" }).click();
    const costumes = sections.getByRole("listitem").filter({ hasText: "Kostymer / Costumes" });

    await expect(costumes).toBeVisible();
    expect((await mock.state()).kinds.find(kind => kind.nameSv === "Kostymer" && kind.type === "SECTION")).toMatchObject({ content: "IMAGES", subtitleSv: "Kläderna" });
    await costumes.getByRole("link", { name: "Bildsorter" }).click();
    await expect(page.getByRole("region", { name: "Bildsektionen Kostymer" }).getByText("Kostymer / Costumes").filter({ visible: true })).toBeVisible();

    await page.goto("/admin/sections");
    await expect(sections.getByRole("listitem").filter({ hasText: "Spexvästen" }).getByRole("button", { name: "Ta bort" })).toHaveCount(0);
    await costumes.getByRole("button", { name: "Ta bort" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Ta bort" }).click();
    await expect(page.getByText("Sektionen är borttagen").filter({ visible: true })).toBeVisible();
    await expect(costumes).toHaveCount(0);
    expect((await mock.state()).kinds.filter(kind => kind.nameSv === "Kostymer")).toEqual([]);
  });

  test("the change log lists everyone's changes for an admin, and only the author's own for an author", async ({ page, loginAs }) => {
    await page.goto("/admin/settings");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByText("Inställningarna är sparade").filter({ visible: true })).toBeVisible();

    await loginAs("author");
    await page.goto("/articles/repetitionerna");
    await page.getByRole("button", { name: "Publicera" }).click();
    await expect(page.getByText("Artikeln är publicerad").filter({ visible: true })).toBeVisible();
    await page.goto("/manage/audit");
    await expect(page.getByText("Dina egna ändringar.").filter({ visible: true })).toBeVisible();
    await expect(page.getByText("Publicerade artikeln Repetitionerna").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Ändrade inställningarna")).toHaveCount(0);

    await loginAs("admin");
    await page.goto("/manage/audit");
    await expect(page.getByText("Alla ändringar av sidor, basdata och inställningar.").filter({ visible: true })).toBeVisible();
    await expect(page.getByText("Publicerade artikeln Repetitionerna").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Ändrade inställningarna").filter({ visible: true }).first()).toBeVisible();
  });
});

test.describe("Administration for others", () => {
  test("a visitor is asked to log in on the admin pages", async ({ page }) => {
    await page.goto("/admin/settings");
    await acceptCookies(page);
    await expect(page.getByRole("heading", { name: "Bara för medlemmar" })).toBeVisible();
    await expect(page.getByLabel("Text för besökare, på svenska")).toHaveCount(0);
  });

  test("an editor is refused the admin pages", async ({ page, loginAs }) => {
    await loginAs("editor");
    for (const path of ["/admin/settings", "/admin/kinds", "/admin/sections", "/admin/redirects", "/admin/consumers", "/admin/maintenance"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: "Du har inte behörighet" }), path).toBeVisible();
    }
  });
});
