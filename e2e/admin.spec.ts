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
    await expect(page.getByText("Inställningarna är sparade")).toBeVisible();
    expect((await mock.state()).settings).toMatchObject({ welcomeSv: "Välkommen, spexare!", contactEmail: "info@example.org" });

    await page.goto("/");
    await expect(page.getByRole("main").getByText("Välkommen, spexare!")).toBeVisible();

    const visitor = await browser.newPage();

    await visitor.goto(new URL("/", page.url()).toString());
    await expect(visitor.getByRole("main").getByText("Välkommen, besökare!")).toBeVisible();
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
    await expect(page.getByText("Fel: BAD_REQUEST")).toBeVisible();
    await expect(page.getByText("Inställningarna är sparade")).toHaveCount(0);
  });

  test("lists the maintenance jobs with their latest runs, and runs one", async ({ page }) => {
    await page.goto("/admin/maintenance");

    const linkCheck = page.getByRole("listitem").filter({ hasText: "Länkkontroll" });
    const search = page.getByRole("listitem").filter({ hasText: "Sökindex" });

    await expect(linkCheck.getByText(/^Misslyckades, startade/)).toBeVisible();
    await expect(search.getByText("Inte schemalagt")).toBeVisible();
    await expect(search.getByText("Inte sedan servern startade")).toBeVisible();

    await search.getByRole("button", { name: "Kör nu" }).click();
    await expect(page.getByText("Sökindex har startat. Det körs i bakgrunden.")).toBeVisible();
    await expect(search.getByText(/^Lyckades/)).toBeVisible();
  });

  test("adds, changes and removes a redirect, and the old address follows it", async ({ page, mock }) => {
    await page.goto("/admin/redirects");
    await expect(page.getByText("Bojan 1948")).toBeVisible();

    await page.getByRole("button", { name: "Ny omdirigering" }).click();
    await page.getByLabel("Gammal titel").fill("Napoleon (spex)");
    await page.getByLabel("Sida, t.ex. /spex/1984-lasse-maja").fill("/spex/1956-napoleon");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByText("Sparat").first()).toBeVisible();

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

    await expect(spexify.getByText("14 olästa ändringar")).toBeVisible();
    await expect(spexify.getByText("Connection refused")).toBeVisible();
    await expect(spexify.getByText("Hämtar själv")).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "fgv-spexregister-service" }).getByText("I fas")).toBeVisible();

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
    await expect(page.getByText("Tjänstekontot har redan en mottagare.")).toBeVisible();
  });

  test("adds a number kind with aliases, moves it first, and retires another", async ({ page, mock }) => {
    await page.goto("/admin/kinds?type=NUMBER");
    await expect(page.getByText("Sång / Song")).toBeVisible();
    await expect(page.getByText("även: Låt")).toBeVisible();

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
    await expect(page.getByRole("listitem").filter({ hasText: "Final / Finale" }).getByText("Inaktiv")).toBeVisible();

    const numbers = (await mock.state()).kinds.filter(kind => kind.type === "NUMBER").sort((a, b) => a.position - b.position);

    expect(numbers.map(kind => kind.nameSv)).toEqual(["Duett", "Sång", "Ouvertyr", "Final"]);
    expect(numbers.find(kind => kind.nameSv === "Final")?.retired).toBe(true);
  });

  test("image kinds are kept per use", async ({ page }) => {
    await page.goto("/admin/kinds?type=IMAGE");
    for (const use of ["Roller", "Scenografi", "Övriga bilder"]) {
      await expect(page.getByRole("heading", { level: 2, name: use })).toBeVisible();
    }
    await page.getByRole("region", { name: "Scenografi" }).getByRole("button", { name: "Ny sort" }).click();
    await page.getByRole("region", { name: "Scenografi" }).getByLabel("Namn på svenska").fill("Fond");
    await page.getByRole("region", { name: "Scenografi" }).getByLabel("Namn på engelska").fill("Backdrop");
    await page.getByRole("region", { name: "Scenografi" }).getByRole("button", { name: "Spara" }).click();
    await expect(page.getByRole("region", { name: "Scenografi" }).getByText("Fond / Backdrop")).toBeVisible();
    await expect(page.getByRole("region", { name: "Roller" }).getByText("Fond / Backdrop")).toHaveCount(0);
  });

  test("the change log lists everyone's changes for an admin, and only the author's own for an author", async ({ page, loginAs }) => {
    await page.goto("/admin/settings");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByText("Inställningarna är sparade")).toBeVisible();

    await loginAs("author");
    await page.goto("/articles/repetitionerna");
    await page.getByRole("button", { name: "Publicera" }).click();
    await expect(page.getByText("Artikeln är publicerad")).toBeVisible();
    await page.goto("/manage/audit");
    await expect(page.getByText("Dina egna ändringar.")).toBeVisible();
    await expect(page.getByText("Publicerade artikeln Repetitionerna").first()).toBeVisible();
    await expect(page.getByText("Ändrade inställningarna")).toHaveCount(0);

    await loginAs("admin");
    await page.goto("/manage/audit");
    await expect(page.getByText("Alla ändringar av sidor, basdata och inställningar.")).toBeVisible();
    await expect(page.getByText("Publicerade artikeln Repetitionerna").first()).toBeVisible();
    await expect(page.getByText("Ändrade inställningarna").first()).toBeVisible();
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
    for (const path of ["/admin/settings", "/admin/kinds", "/admin/redirects", "/admin/consumers", "/admin/maintenance"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: "Du har inte behörighet" }), path).toBeVisible();
    }
  });
});
