import { MOCK_URL } from "./constants";
import { acceptCookies, expect, sidebar, test } from "./fixtures";

/**
 * The shell and who sees which part of it: visitors read, members write articles, authors and editors get Redigera
 * (editors with base data), admins Administration too. Pages a role lacks say so; the server decides the rest.
 */
test.describe("The application shell", () => {
  test("a visitor gets reading only, and a login button", async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);

    const nav = sidebar(page);

    await expect(nav.getByRole("link", { name: "Hem" })).toHaveAttribute("href", "/");
    await expect(nav.getByRole("link", { name: "Sök" })).toHaveAttribute("href", "/search");
    await expect(nav.getByRole("link", { name: "Spex" })).toHaveAttribute("href", "/spex");
    await expect(nav.getByRole("link", { name: "Artiklar" })).toHaveAttribute("href", "/articles");
    await expect(nav.getByRole("button", { name: "Redigera", exact: true })).toHaveCount(0);
    await expect(nav.getByRole("button", { name: "Administration", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Logga in" }).first()).toBeVisible();
  });

  test("an admin sees editing and administration", async ({ page, loginAs }) => {
    await loginAs("admin");

    const nav = sidebar(page);

    await expect(nav.getByRole("button", { name: "Redigera", exact: true })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Administration", exact: true })).toBeVisible();
  });

  test("an author edits but neither keeps base data nor administers", async ({ page, loginAs }) => {
    await loginAs("author");

    const nav = sidebar(page);

    await nav.getByRole("button", { name: "Redigera", exact: true }).click();
    await expect(nav.getByRole("link", { name: "Papperskorgen" })).toHaveAttribute("href", "/manage/trash");
    await expect(nav.getByRole("link", { name: "Basdata" })).toHaveCount(0);
    await expect(nav.getByRole("button", { name: "Administration", exact: true })).toHaveCount(0);
    await page.goto("/manage/base-data");
    await expect(page.getByRole("heading", { name: "Du har inte behörighet" })).toBeVisible();
    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: "Du har inte behörighet" })).toBeVisible();
  });

  test("an editor's Redigera has the base data", async ({ page, loginAs }) => {
    await loginAs("editor");
    await sidebar(page).getByRole("button", { name: "Redigera", exact: true }).click();
    await expect(sidebar(page).getByRole("link", { name: "Basdata" })).toHaveAttribute("href", "/manage/base-data");
    await expect(sidebar(page).getByRole("button", { name: "Administration", exact: true })).toHaveCount(0);
  });

  test("a member gets no editing, and is refused its pages", async ({ page, loginAs }) => {
    await loginAs("member");

    await expect(sidebar(page).getByRole("button", { name: "Redigera", exact: true })).toHaveCount(0);
    for (const path of ["/manage/trash", "/manage/audit", "/admin/settings", "/admin/maintenance"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: "Du har inte behörighet" }), path).toBeVisible();
    }
  });

  test("a visitor is asked to log in on members' pages, and comes back after logging in", async ({ page, request }) => {
    await page.goto("/articles/new");
    await acceptCookies(page);
    await expect(page.getByRole("heading", { name: "Bara för medlemmar" })).toBeVisible();

    await request.post(`${MOCK_URL}/__persona`, { data: { persona: "member" } });
    await page.getByRole("main").getByRole("link", { name: "Logga in" }).click();
    await expect(page).toHaveURL(/\/articles\/new$/);
    await expect(page.getByRole("heading", { level: 1, name: "Ny artikel" })).toBeVisible();
  });

  test("someone without access to Spexipedia reads as a visitor and is told why", async ({ page, loginAs }) => {
    await loginAs("noaccess");
    await expect(
      page
        .getByText(/nils@example\.org/)
        .filter({ visible: true })
        .first()
    ).toBeVisible();
    await expect(sidebar(page).getByRole("button", { name: "Redigera", exact: true })).toHaveCount(0);

    await page.goto("/articles/new");
    await expect(page.getByRole("heading", { name: "Du har inte åtkomst till Spexipedia" })).toBeVisible();
  });

  test("the tokens stay on the server: Better Auth's token routes answer 404, the session still works", async ({
    page,
    loginAs,
  }) => {
    await loginAs("member");
    for (const path of ["/api/auth/get-access-token", "/api/auth/refresh-token"]) {
      expect((await page.request.post(path, { data: { providerId: "keycloak" } })).status(), path).toBe(404);
    }
    expect((await page.request.get("/api/auth/account-info")).status()).toBe(404);
    await page.goto("/articles/new");
    await expect(page.getByRole("heading", { level: 1, name: "Ny artikel" })).toBeVisible();
  });

  test("without the session, a members' article asks to log in again", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/articles/kulissen-som-foll");
    await expect(page.getByRole("heading", { level: 1, name: "Kulissen som föll" })).toBeVisible();

    await page.context().clearCookies();
    await page.goto("/articles/kulissen-som-foll");
    await expect(page.getByRole("heading", { name: "Logga in för att se det här" })).toBeVisible();
  });
});
