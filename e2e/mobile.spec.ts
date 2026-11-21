import { acceptCookies, expect, linksTo, test } from "./fixtures";

/**
 * Phones (the "mobile" project): no page is wider than the screen, down to 320 pixels, nothing sticks out of a spex
 * tile, and a spex page offers its sections in a bar under the header, as the rail beside it has no room.
 */
test.describe("On a phone", () => {
  async function expectNoSidewaysScroll(page: import("@playwright/test").Page, path: string) {
    const response = await page.goto(path);

    expect(response?.status(), path).toBeLessThan(400);
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));

    expect(scroll, `${path} is no wider than the screen`).toBeLessThanOrEqual(client);
  }

  for (const width of [320, 412]) {
    test(`no public page scrolls sideways at ${width} pixels`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/spex");
      await acceptCookies(page);

      const pages = ["/", "/spex", "/articles", "/about", "/support",
        ...(await linksTo(page, "/spex/")).slice(0, 3)];

      for (const path of pages) {
        await expectNoSidewaysScroll(page, path);
      }
    });
  }

  test("a spex tile's badges stay within it", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/spex");
    await acceptCookies(page);

    const outside = await page.evaluate(() => [...document.querySelectorAll("a[href^='/spex/']")].flatMap(tile => {
      const box = tile.getBoundingClientRect();

      return [...tile.querySelectorAll("[data-slot=badge]")]
        .filter(badge => badge.getBoundingClientRect().right > box.right + 0.5)
        .map(badge => badge.textContent);
    }));

    expect(outside).toEqual([]);
  });

  test("a spex page offers its sections in a bar under the header", async ({ page }) => {
    await page.goto("/spex");
    await acceptCookies(page);
    await page.goto((await linksTo(page, "/spex/"))[0]);

    const bar = page.getByRole("navigation", { name: "På sidan" });

    await expect(bar).toBeVisible();

    const second = bar.getByRole("link").nth(1);
    const target = (await second.getAttribute("href"))!;

    await second.click();
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    // Still there, under the header, once the page has scrolled
    await expect(bar).toBeInViewport();
    // Next.js keeps pages it navigated away from hidden in the document (React's Activity), so an id can be there twice
    await expect(page.locator(target).filter({ visible: true })).toBeInViewport();
  });
});
