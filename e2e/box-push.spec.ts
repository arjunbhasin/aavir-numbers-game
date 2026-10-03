import { expect, test } from "@playwright/test";
import { LEVELS } from "../games/box-push/levels";
import { parseLevel, solve } from "../games/box-push/logic";

const KEY = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" } as const;

test("Box Push has 30 levels and the hardest can be won", async ({ page }) => {
  await page.goto("/games/box-push");
  await page.evaluate(() => {
    const games = { "box-push": Object.fromEntries(Array.from({ length: 29 }, (_, i) => [i, 3])) };
    localStorage.setItem("aavir-games-v1", JSON.stringify({ state: { muted: true, games, recent: [] }, version: 1 }));
  });
  await page.reload();
  await page.getByRole("button", { name: "Level 30", exact: true }).click({ force: true });
  await expect(page.getByText("Level 30")).toBeVisible();
  for (const d of solve(parseLevel(LEVELS[29].map))!) await page.keyboard.press(KEY[d]);
  await expect(page.getByRole("dialog", { name: "Level complete" })).toBeVisible({ timeout: 5000 });
});
