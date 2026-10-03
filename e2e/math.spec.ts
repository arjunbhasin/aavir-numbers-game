import { expect, test, type Page } from "@playwright/test";
import { LEVELS as PACKING } from "../games/packing/levels";
import { parseLevel, solve } from "../games/packing/logic";

const KEY = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" } as const;

async function openLevel(page: Page, slug: string, n = 1) {
  await page.goto(`/games/${slug}`);
  await page.getByRole("button", { name: `Level ${n}`, exact: true }).click({ force: true });
}

const winDialog = (page: Page) => page.getByRole("dialog", { name: "Level complete" });

test("Garden Builder: find both rectangles for 4", async ({ page }) => {
  await openLevel(page, "garden");
  for (let i = 0; i < 2; i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter"); // 1 row of 3: wrong
  await expect(page.getByText("That's only 3. Use all 4 seedlings!")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter"); // 1 row of 4
  await expect(page.getByText("1 row of 4 = 4").first()).toBeVisible();
  await page.waitForTimeout(1700);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter"); // 2 rows of 2
  await expect(winDialog(page)).toBeVisible({ timeout: 4000 });
  await expect(winDialog(page)).toContainText("4 = 1 × 4 = 2 × 2");
});

test("Bunny Hops: three hops of 2 reach the carrot at 6", async ({ page }) => {
  await openLevel(page, "bunny-hops");
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
  }
  await expect(winDialog(page)).toBeVisible({ timeout: 4000 });
  await expect(winDialog(page)).toContainText("3 hops of 2 = 6");
});

test("Cookie Party: unfair giving is stopped, fair sharing wins", async ({ page }) => {
  await openLevel(page, "cookie-party");
  await page.keyboard.press("1");
  await page.keyboard.press("1");
  await expect(page.getByText(/has fewer/)).toBeVisible();
  for (const k of ["2", "1", "2", "1", "2"]) {
    await page.keyboard.press(k);
    await page.waitForTimeout(120);
  }
  await expect(winDialog(page)).toBeVisible({ timeout: 4000 });
  await expect(winDialog(page)).toContainText("6 ÷ 2 = 3 each");
});

test("Packing Day: the solver's moves pack every egg", async ({ page }) => {
  await openLevel(page, "packing");
  for (const d of solve(parseLevel(PACKING[0].map))!) await page.keyboard.press(KEY[d]);
  await expect(winDialog(page)).toBeVisible({ timeout: 4000 });
  await expect(winDialog(page)).toContainText("2 eggs ÷ 2 = 1 box");
});

for (const [slug, accent] of [
  ["bug-flash", "Easy"],
  ["magic-machine", "Easy"],
] as const) {
  test(`${slug}: answering moves on to the next puzzle`, async ({ page }) => {
    await page.goto(`/games/${slug}`);
    await page.getByRole("button", { name: new RegExp(accent) }).click();
    await expect(page.getByLabel("Puzzle 1 of 5")).toBeVisible();
    // keep trying answers (wrong ones get disabled) until the round moves on
    for (let tries = 0; tries < 20; tries++) {
      if (await page.getByLabel("Puzzle 2 of 5").isVisible()) break;
      const enabled = page.locator("main button:not([disabled])").filter({ hasText: /^\s*[×+]?\s*\d+\s*$/ });
      if (await enabled.count()) await enabled.first().click({ timeout: 1000 }).catch(() => {});
      await page.waitForTimeout(700);
    }
    await expect(page.getByLabel("Puzzle 2 of 5")).toBeVisible({ timeout: 8000 });
  });
}
