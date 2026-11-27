import { acceptCookies, answerDialog, expect, test } from "./fixtures";

/**
 * The wiki (spec 4.5): visitors read public, published articles; members write and edit them (every save a revision,
 * a conflict shown as differences), restore old versions and add categories; authors publish, trash and hide
 * revisions. The mock keeps the articles, seeded from the recorded list.
 */
test.describe("Articles", () => {
  test("a visitor reads an article: contents, links to articles and to missing ones, what links here", async ({ page }) => {
    await page.goto("/articles/spexets-traditioner");
    await acceptCookies(page);

    const article = page.getByRole("article");

    await expect(article.getByRole("heading", { level: 1, name: "Spexets traditioner" })).toBeVisible();
    await expect(article.getByRole("heading", { level: 2, name: "Västen" })).toBeVisible();
    // In the text, and among the children below it
    await expect(article.getByRole("link", { name: "Västen", exact: true })).toHaveCount(2);
    await expect(article.getByRole("link", { name: "Västen", exact: true }).first()).toHaveAttribute("href", "/articles/vasten");
    await expect(article.getByRole("link", { name: "Spexets kör" })).toHaveAttribute("href", "/articles/new?title=Spexets%20k%C3%B6r");
    // Visitors are not offered editing
    await expect(article.getByRole("link", { name: "Redigera" })).toHaveCount(0);

    await article.getByRole("link", { name: "Västen", exact: true }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Västen" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Länkar hit" }).getByRole("link", { name: "Spexets traditioner" })).toBeVisible();
  });

  test("a visitor sees neither members' nor unpublished articles; a member sees both", async ({ page, loginAs }) => {
    await page.goto("/articles");
    await acceptCookies(page);
    await expect(page.getByRole("link", { name: "Spexets traditioner" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Kulissen som föll" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Repetitionerna" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ny artikel" })).toHaveCount(0);

    await page.goto("/articles/kulissen-som-foll");
    await expect(page.getByRole("heading", { name: "Logga in för att se det här" })).toBeVisible();
    await expect(page.getByText("Exempeltext om Kulissen")).toHaveCount(0);

    await loginAs("member");
    await page.goto("/articles");
    await expect(page.getByRole("link", { name: "Kulissen som föll" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Repetitionerna" })).toBeVisible();
    await page.goto("/articles/kulissen-som-foll");
    await expect(page.getByRole("heading", { level: 1, name: "Kulissen som föll" })).toBeVisible();
    await expect(page.getByRole("article").locator("header").getByText("Medlemmar", { exact: true }).filter({ visible: true })).toBeVisible();
  });

  test("a member writes a new article, previews it, and it starts unpublished", async ({ page, loginAs, mock }) => {
    await loginAs("member");
    await page.goto("/articles");
    await page.getByRole("link", { name: "Ny artikel" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Ny artikel" })).toBeVisible();

    await page.getByLabel("Titel").fill("Premiärfesten");
    await page.getByRole("radio", { name: "Bara medlemmar" }).check();
    await page.getByRole("checkbox", { name: "Traditioner" }).click();
    await page.getByLabel("Text", { exact: true }).fill("Efter premiären firar ensemblen.\n\n## Maten\n\nSe [[Tackkören]].");
    await page.getByRole("tab", { name: "Förhandsvisa" }).click();
    await expect(page.getByRole("tabpanel").getByRole("heading", { name: "Maten" })).toBeVisible();
    await expect(page.getByRole("tabpanel").getByRole("link", { name: "Tackkören" })).toHaveAttribute("href", "/articles/tackkoren");
    await page.getByRole("tab", { name: "Skriv" }).click();
    await page.getByLabel("Kommentar till historiken").fill("Första versionen");
    await page.getByRole("button", { name: "Spara" }).click();

    await expect(page).toHaveURL(/\/articles\/premiarfesten$/);
    await expect(page.getByRole("heading", { level: 1, name: "Premiärfesten" })).toBeVisible();
    await expect(page.getByRole("article").locator("header").getByText("Opublicerad").filter({ visible: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Traditioner" }).first()).toHaveAttribute("href", "/articles/categories/traditioner");
    // A member cannot publish; that is for authors
    await expect(page.getByRole("button", { name: "Publicera" })).toHaveCount(0);

    const created = (await mock.state()).articles.find(article => article.slug === "premiarfesten");

    expect(created).toMatchObject({ title: "Premiärfesten", visibility: "MEMBERS", published: false });
    expect(created?.revisions[0]).toMatchObject({ comment: "Första versionen", authorName: "Tina Tittare" });
  });

  test("a red link writes the missing article with its title, and it leaves the wanted list", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/articles/wanted");
    await expect(page.getByRole("link", { name: "Spexets kör" })).toBeVisible();
    await expect(page.getByText("1 länk").filter({ visible: true })).toBeVisible();

    await page.getByRole("link", { name: "Spexets kör" }).click();
    await expect(page.getByLabel("Titel")).toHaveValue("Spexets kör");
    await page.getByLabel("Text", { exact: true }).fill("Kören sjunger i alla spex.");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Spexets kör" })).toBeVisible();

    await page.goto("/articles/wanted");
    await expect(page.getByText("Alla länkar leder till artiklar.").filter({ visible: true })).toBeVisible();
    await page.goto("/articles/spexets-traditioner");
    await expect(page.getByRole("article").getByRole("link", { name: "Spexets kör" })).toHaveAttribute("href", "/articles/spexets-kor");
  });

  test("a member edits an article, sees the change in the history, and restores the earlier version", async ({ page, loginAs, mock }) => {
    await loginAs("member");
    await page.goto("/articles/tackkoren");
    await page.getByRole("link", { name: "Redigera" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Redigera Tackkören" })).toBeVisible();
    await page.getByLabel("Text", { exact: true }).fill("Tackkören sjungs efter sista föreställningen.");
    await page.getByLabel("Kommentar till historiken").fill("Rättade när den sjungs");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByRole("article").getByText("Tackkören sjungs efter sista föreställningen.").filter({ visible: true })).toBeVisible();

    await page.getByRole("link", { name: "Historik" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Historik för Tackkören" })).toBeVisible();

    const revisions = page.getByRole("main").getByRole("listitem");

    await expect(revisions.first()).toContainText("Tina Tittare");
    await expect(revisions.first()).toContainText("Rättade när den sjungs");
    await expect(revisions.nth(1)).toContainText("Exempeldata");
    // The latest is compared with the one before it
    await expect(page.getByText("tillagt").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("borttaget").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/Exempeltext om Tackkören/).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Återställ" })).toHaveCount(0);

    await revisions.nth(1).getByRole("link").click();
    await page.getByRole("button", { name: "Återställ" }).click();
    await answerDialog(page, "Återställ");
    await expect(page).toHaveURL(/\/articles\/tackkoren$/);
    await expect(page.getByRole("article").getByText(/Exempeltext om Tackkören/).filter({ visible: true })).toBeVisible();

    const article = (await mock.state()).articles.find(each => each.slug === "tackkoren")!;

    expect(article.revisions).toHaveLength(3);
    expect(article.revisions[0].body).toBe(article.revisions[2].body);
  });

  test("saving over a newer revision shows the differences, and the member keeps their own text", async ({ page, loginAs, mock }) => {
    await loginAs("member");
    await page.goto("/articles/adrianpokalen/edit");
    await page.getByLabel("Text", { exact: true }).fill("Adrianpokalen delas ut varje år.");
    await mock.failNext("ArticleUpdate", "CONFLICT");
    await page.getByRole("button", { name: "Spara" }).click();

    await expect(page.getByText("Någon annan har sparat en nyare version medan du skrev.").filter({ visible: true })).toBeVisible();
    await expect(page.getByText(/Exempeltext om Adrianpokalen/).filter({ visible: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Spara min över deras" }).click();

    await expect(page).toHaveURL(/\/articles\/adrianpokalen$/);
    await expect(page.getByRole("article").getByText("Adrianpokalen delas ut varje år.").filter({ visible: true })).toBeVisible();
  });

  test("an author publishes an article, which visitors then read", async ({ page, loginAs, browser }) => {
    await loginAs("author");
    await page.goto("/articles/repetitionerna");
    await expect(page.getByRole("article").locator("header").getByText("Opublicerad").filter({ visible: true })).toBeVisible();
    await page.getByRole("button", { name: "Publicera" }).click();
    await expect(page.getByText("Artikeln är publicerad").filter({ visible: true })).toBeVisible();
    await expect(page.getByRole("article").locator("header").getByText("Opublicerad")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Avpublicera" })).toBeVisible();

    const visitor = await browser.newPage();

    await visitor.goto(new URL("/articles/repetitionerna", page.url()).toString());
    await expect(visitor.getByRole("heading", { level: 1, name: "Repetitionerna" })).toBeVisible();
    await visitor.close();
  });

  test("an author trashes an article with its children, and restores it from the trash", async ({ page, loginAs }) => {
    await loginAs("author");
    await page.goto("/articles/turneer");
    await expect(page.getByRole("region", { name: "Underartiklar" }).getByRole("link", { name: "Turnén till Stockholm 1985" })).toBeVisible();
    await page.getByRole("button", { name: "Lägg i papperskorgen" }).click();
    await expect(page.getByRole("alertdialog")).toContainText("2");
    await answerDialog(page, "Lägg i papperskorgen");
    await expect(page).toHaveURL(/\/articles$/);
    await expect(page.getByRole("link", { name: "Turnéer", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Turnén till Stockholm 1985" })).toHaveCount(0);

    await page.goto("/manage/trash");
    const trashed = page.getByRole("listitem").filter({ hasText: "Turnéer" });

    await expect(page.getByRole("listitem").filter({ hasText: "Turnén till Trondheim 1994" })).toBeVisible();
    // Only an admin empties the trash
    await expect(page.getByRole("button", { name: "Töm papperskorgen" })).toHaveCount(0);
    await trashed.getByRole("button", { name: "Återställ" }).click();
    await expect(trashed).toHaveCount(0);

    await page.goto("/articles/turneer");
    await expect(page.getByRole("heading", { level: 1, name: "Turnéer" })).toBeVisible();
  });

  test("an admin empties the trash for good", async ({ page, loginAs, mock }) => {
    await loginAs("admin");
    await page.goto("/articles/anekdoter");
    await page.getByRole("button", { name: "Lägg i papperskorgen" }).click();
    await answerDialog(page, "Lägg i papperskorgen");
    await expect(page).toHaveURL(/\/articles$/);

    await page.goto("/manage/trash");
    await page.getByRole("button", { name: "Töm papperskorgen" }).click();
    await answerDialog(page, "Töm papperskorgen");
    await expect(page.getByText("Papperskorgen är tom.").filter({ visible: true })).toBeVisible();
    expect((await mock.state()).articles.some(article => article.slug === "anekdoter")).toBe(false);
  });

  test("an author hides a revision's text in the history", async ({ page, loginAs, mock }) => {
    await loginAs("author");
    await page.goto("/articles/spexikon/history");
    await page.getByRole("button", { name: "Dölj texten" }).click();
    await expect(page.getByText("Den här versionens text är dold.").filter({ visible: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Visa texten" })).toBeVisible();
    expect((await mock.state()).articles.find(article => article.slug === "spexikon")?.revisions[0].hidden).toBe(true);

    await page.goto("/articles/spexikon");
    await expect(page.getByText("Den senaste versionens text är dold.").filter({ visible: true })).toBeVisible();
  });

  test("a member adds a category, and the article tree shows parents with their children", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/articles");
    await page.getByRole("button", { name: "Ny kategori" }).click();

    const dialog = page.getByRole("dialog");

    await dialog.getByLabel("Namn").fill("Fester");
    await dialog.getByLabel("Beskrivning").fill("Om sittningar och fester.");
    await dialog.getByRole("button", { name: "Spara" }).click();
    await expect(page).toHaveURL(/\/articles\/categories\/fester$/);
    await expect(page.getByRole("heading", { level: 1, name: "Fester" })).toBeVisible();

    await page.goto("/articles?view=tree");
    const tree = page.getByRole("main");

    await expect(tree.getByRole("link", { name: "Turnéer", exact: true })).toBeVisible();
    await expect(tree.getByRole("link", { name: "Turnén till Trondheim 1994" })).toBeVisible();
  });

  test("a category page lists its articles", async ({ page }) => {
    await page.goto("/articles/categories/organisationer");
    await acceptCookies(page);
    await expect(page.getByRole("heading", { level: 1, name: "Organisationer" })).toBeVisible();
    await expect(page.getByRole("link", { name: "FGV", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Spexarkivet" })).toBeVisible();
  });
});
