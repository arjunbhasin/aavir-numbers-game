import { expect, test, type Page } from "@playwright/test";
import { GAMES } from "../lib/catalog";

const SIZES = [
  { name: "portrait", width: 768, height: 1024 },
  { name: "landscape", width: 1024, height: 768 },
];

async function openFirst(page: Page, slug: string) {
  await page.goto(`/games/${slug}`);
  const level = page.getByRole("button", { name: "Level 1", exact: true });
  if (await level.count()) await level.click({ force: true });
  else await page.getByRole("button", { name: /Easy|1 to 20/ }).first().click();
  await page.waitForTimeout(900);
}

for (const size of SIZES) {
  test.describe(`tablet ${size.name}`, () => {
    test.use({ viewport: { width: size.width, height: size.height }, hasTouch: true, isMobile: true });

    test("no game scrolls sideways", async ({ page }) => {
      test.setTimeout(120_000);
      for (const g of GAMES) {
        await openFirst(page, g.id);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, g.id).toBeLessThanOrEqual(1);
      }
    });

    test("main controls are on screen without scrolling", async ({ page }) => {
      const checks: [string, RegExp][] = [
        ["abacus-sums", /^Check$/],
        ["garden", /^Plant!$/],
        ["coin-shop", /^Pay!$/],
        ["robot-path", /^Go!$/],
      ];
      for (const [slug, name] of checks) {
        await openFirst(page, slug);
        await expect(page.getByRole("button", { name }).first(), slug).toBeInViewport();
      }
    });

    test("arrow pad shows on touch and garden uses tapping instead", async ({ page }) => {
      await openFirst(page, "box-push");
      await expect(page.getByRole("button", { name: "Move up" }).first()).toBeInViewport();
      await openFirst(page, "garden");
      await expect(page.getByRole("button", { name: "Move up" })).toHaveCount(0);
      await page.getByRole("button", { name: "Make 2 rows of 2" }).click();
      await expect(page.getByText("2 rows of 2 = 4").first()).toBeVisible();
    });
  });
}

test("site can be installed on a tablet home screen", async ({ request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  expect((await request.get("/apple-icon")).headers()["content-type"]).toContain("image/png");
});
