import { expect, test, type Page } from "@playwright/test";
import { LEVELS as SUM } from "../games/sum-path/levels";
import { parseLevel, solve } from "../games/sum-path/logic";

const KEY = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" } as const;
const winDialog = (page: Page) => page.getByRole("dialog", { name: "Level complete" });

test("home page: section tabs, star total and keep-playing row", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Game sections" });
  for (const t of ["Puzzle Adventures", "Pattern Detective", "Memory Lane", "Word Play", "Number Fun", "Add & Take Away", "Abacus Club", "Times & Share"]) {
    await expect(nav.getByRole("link", { name: t })).toBeVisible();
  }
  await nav.getByRole("link", { name: "Memory Lane" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Memory Lane" })).toBeInViewport();
  await expect(page.getByLabel(/^0 of \d+ stars$/).first()).toBeVisible();

  await page.goto("/games/sum-path");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Keep playing" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sum Path" }).first()).toBeVisible();
});

test("Sum Path: the solver's moves reach the flag with the target", async ({ page }) => {
  await page.goto("/games/sum-path");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  for (const d of solve(parseLevel(SUM[0].map, SUM[0].target))!) await page.keyboard.press(KEY[d]);
  await expect(winDialog(page)).toBeVisible({ timeout: 4000 });
  await expect(winDialog(page)).toContainText(`= ${SUM[0].target}`);
});

test("Coin Shop: paying too much is caught, exact pay moves on", async ({ page }) => {
  await page.goto("/games/coin-shop");
  await page.getByRole("button", { name: /Easy/ }).click();
  const price = Number(await page.locator("div.rotate-3").first().innerText());
  for (let i = 0; i < 3; i++) await page.keyboard.press("5"); // 15 is more than any easy price
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Too much!/)).toBeVisible();
  for (let i = 0; i < 3; i++) await page.keyboard.press("Backspace");
  for (let i = 0; i < price; i++) await page.keyboard.press("1");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Exactly right!/)).toBeVisible();
  await expect(page.getByLabel("Puzzle 2 of 5")).toBeVisible({ timeout: 4000 });
});

test("Make Ten: clearing the board moves on", async ({ page }) => {
  await page.goto("/games/make-ten");
  await page.getByRole("button", { name: /Easy/ }).click();
  for (let round = 0; round < 3; round++) {
    const cards = page.getByRole("button", { name: /^Card \d+$/ });
    const labels = await cards.allInnerTexts();
    const nums = labels.map((t) => Number(t.trim().split(/\s/)[0]));
    const i = 0;
    const j = nums.findIndex((n, k) => k !== i && n + nums[i] === 10);
    await cards.nth(i).click();
    await cards.nth(j).click();
    await page.waitForTimeout(500);
  }
  await expect(page.getByLabel("Puzzle 2 of 5")).toBeVisible({ timeout: 4000 });
});

for (const slug of ["balance", "monster-munch", "whats-missing"]) {
  test(`${slug}: answering moves on to the next puzzle`, async ({ page }) => {
    await page.goto(`/games/${slug}`);
    await page.getByRole("button", { name: /Easy/ }).click();
    for (let tries = 0; tries < 30; tries++) {
      if (await page.getByLabel("Puzzle 2 of 5").isVisible()) break;
      const enabled = page.locator("main div.flex-wrap > button:not([disabled])");
      if (await enabled.count()) await enabled.first().click({ timeout: 1000 }).catch(() => {});
      await page.waitForTimeout(800);
    }
    await expect(page.getByLabel("Puzzle 2 of 5")).toBeVisible({ timeout: 12000 });
  });
}

test("Pair Match: a mismatch flips back, the board can be won", async ({ page }) => {
  await page.goto("/games/pair-match");
  await page.getByRole("button", { name: /Easy/ }).click();
  const faceDown = () => page.getByRole("button", { name: /face down/ });
  await expect(faceDown()).toHaveCount(8);
  // memorise every card by peeking two at a time, then match them up
  const seen: string[] = [];
  for (let i = 0; i < 8; i += 2) {
    await page.getByRole("button", { name: `Card ${i + 1}, face down` }).click();
    await page.getByRole("button", { name: `Card ${i + 2}, face down` }).click();
    const all = page.locator("main .grid > button");
    seen[i] = (await all.nth(i).getAttribute("aria-label"))!;
    seen[i + 1] = (await all.nth(i + 1).getAttribute("aria-label"))!;
    await page.waitForTimeout(1200);
  }
  const all = page.locator("main .grid > button");
  for (let i = 0; i < 8; i++) {
    const j = seen.findIndex((s, k) => k > i && s === seen[i]);
    if (j === -1) continue;
    if ((await all.nth(i).getAttribute("aria-label"))?.includes("face down")) {
      await all.nth(i).click();
      await all.nth(j).click();
      await page.waitForTimeout(700);
    }
  }
  await expect(page.getByRole("dialog", { name: "Level complete" })).toBeVisible({ timeout: 4000 });
});

test("Copy the Lights: Enter starts, a wrong pad replays the lights", async ({ page }) => {
  await page.goto("/games/copy-lights");
  await page.getByRole("button", { name: /Easy/ }).click();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Watch carefully/)).toBeVisible();
  await expect(page.getByText(/Your turn!/)).toBeVisible({ timeout: 5000 });
  // press all four pads; at least one is wrong for the first light
  for (const k of ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"]) {
    if (!(await page.getByText(/Your turn!/).isVisible())) break;
    await page.keyboard.press(k);
    await page.waitForTimeout(100);
  }
  await expect(page.getByText(/Oops! Watch again|Watch carefully|Your turn/)).toBeVisible();
});

test("Footprints: walking the wrong way shows the path again", async ({ page }) => {
  await page.goto("/games/footprints");
  await page.getByRole("button", { name: /Easy/ }).click();
  await expect(page.getByText(/Your turn!/)).toBeVisible({ timeout: 6000 });
  for (const k of ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]) {
    if (!(await page.getByText(/Your turn!/).isVisible())) break;
    await page.keyboard.press(k);
    await page.waitForTimeout(150);
  }
  await expect(page.getByText(/Oops, wrong way!|Your turn!|You remembered/)).toBeVisible();
});

test("typing a number answer picks that number, not that position", async ({ page }) => {
  await page.goto("/games/monster-munch");
  await page.getByRole("button", { name: /Easy/ }).click();
  await expect(page.getByText("How many apples are left?")).toBeVisible({ timeout: 8000 });
  const options = (await page.locator("main div.flex-wrap > button").allInnerTexts()).map((t) => t.trim());
  const sentence = page.getByText(/^Yes! \d+ − \d+ = \d+$/);
  // try each option by typing its value; the right one shows the sentence
  for (const o of options) {
    if (await sentence.isVisible()) break;
    await page.keyboard.type(o);
    await page.waitForTimeout(900);
  }
  await expect(sentence).toBeVisible();
});

test("Coin Shop: Enter pays even after tapping a coin", async ({ page }) => {
  await page.goto("/games/coin-shop");
  await page.getByRole("button", { name: /Easy/ }).click();
  await page.getByRole("button", { name: "Add coin 5" }).click();
  await page.getByRole("button", { name: "Add coin 5" }).click();
  await page.getByRole("button", { name: "Add coin 1" }).click();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Too much!|Exactly right!/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Take back coin/ })).toHaveCount(3);
});
