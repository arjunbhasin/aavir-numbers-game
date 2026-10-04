import { expect, test } from "@playwright/test";

test("Copy the Lights cancels old playback when changing difficulty", async ({ page }) => {
  await page.clock.install();
  await page.goto("/games/copy-lights");
  await page.getByRole("button", { name: /Easy/ }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Change level" }).click();
  await page.getByRole("button", { name: /Hard/ }).click();
  await page.clock.runFor(3500);
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "up light" })).toBeDisabled();
});

test("Enter activates Change level after navigating answer choices", async ({ page }) => {
  await page.goto("/games/whats-next");
  await page.getByRole("button", { name: /Easy/ }).click();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: "Change level" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "How tricky?" })).toBeVisible();
});

test("Tab can leave an unfinished crossword", async ({ page }) => {
  await page.goto("/games/crossword");
  await page.getByRole("button", { name: /Easy/ }).click();
  const change = page.getByRole("button", { name: "Change level" });
  await change.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(change).not.toBeFocused();
});

test("win dialog contains keyboard focus", async ({ page }) => {
  await page.goto("/games/box-push");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  await page.keyboard.press("ArrowRight");
  const dialog = page.getByRole("dialog", { name: "Level complete" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Levels" }).focus();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Next" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Levels" })).toBeFocused();
});

test("leaving home during a reset hold keeps earned stars", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("aavir-games-v1", JSON.stringify({
    version: 1, state: { games: { "box-push": { 0: 3 } }, recent: [], muted: true },
  })));
  await page.reload();
  await page.getByRole("button", { name: "Grown-ups: hold to reset stars" }).dispatchEvent("pointerdown");
  await page.locator('a[href="/games/box-push"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await page.clock.runFor(2500);
  await expect(page.getByRole("button", { name: "Level 1", exact: true }).getByLabel("3 of 3 stars")).toBeVisible();
});

test("pending numeric input cannot change feedback after an answer is locked", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 7 / 2 ** 31; });
  await page.clock.install();
  await page.goto("/games/bead-reader");
  await page.getByRole("button", { name: /Medium/ }).click();
  await expect(page.getByRole("button", { name: "11", exact: true })).toBeVisible();
  await page.keyboard.press("1");
  await page.getByRole("button", { name: "11", exact: true }).click();
  await page.clock.runFor(800);
  await expect(page.getByText("Yes! 11.")).toBeVisible();
});

test("hard Monster Munch comparison fits a portrait tablet", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.addInitScript(() => { Math.random = () => 24 / 2 ** 31; });
  await page.goto("/games/monster-munch");
  await page.getByRole("button", { name: /Hard/ }).click();
  await expect(page.getByText("Purple has 20, Green has 7. How many more does Purple have?")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
  test(`hard Find Numbers has separate targets at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/games/find-numbers");
    if (viewport.width === 390) await page.evaluate(() => { document.body.style.paddingInline = "44px"; });
    await page.getByRole("button", { name: /1 to 100/ }).click();
    const boxes = await page.getByRole("button", { name: /^Number / }).evaluateAll((buttons) =>
      buttons.map((b) => { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }),
    );
    expect(boxes).toHaveLength(100);
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i];
      expect(a.w).toBeGreaterThanOrEqual(44);
      expect(a.h).toBeGreaterThanOrEqual(44);
      for (const b of boxes.slice(i + 1)) {
        expect(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y).toBe(true);
      }
    }
  });
}

for (const slug of ["whats-next", "bead-reader", "odd-one-out", "rhyme-time", "pair-match", "make-ten"]) {
  test(`${slug}: arrows move native focus to the highlighted answer`, async ({ page }) => {
    await page.goto(`/games/${slug}`);
    await page.getByRole("button", { name: /Easy/ }).click();
    const answers = page.locator("main div.flex-wrap > button, main div.grid > button");
    await answers.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(answers.nth(1)).toBeFocused();
  });
}

test("a win keeps background controls inert and confetti inside the modal", async ({ page }) => {
  await page.goto("/games/box-push");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  await page.keyboard.press("ArrowRight");
  const dialog = page.getByRole("dialog", { name: "Level complete" });
  await expect(dialog).toBeVisible();
  await page.locator('header a[href="/"]').evaluate((link: HTMLAnchorElement) => link.focus());
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await expect(dialog.locator("canvas")).toBeAttached();
});

test("zoom is available and reduced motion suppresses win transforms and confetti", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/games/box-push");
  const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
  expect(viewport).not.toMatch(/user-scalable=no|maximum-scale=1(?:,|$)/);
  await page.getByRole("button", { name: "Level 1", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  const dialog = page.getByRole("dialog", { name: "Level complete" });
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.locator("div").first().evaluate((el) => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    return matrix.a === 1 && matrix.d === 1 && matrix.e === 0 && matrix.f === 0;
  })).toBe(true);
  const canvas = dialog.locator("canvas");
  expect(await canvas.evaluate((el: HTMLCanvasElement) => el.getContext("2d")!.getImageData(0, 0, el.width, el.height).data.some((v) => v !== 0))).toBe(false);
});


test("Cookie Party arrows focus the selected friend", async ({ page }) => {
  await page.goto("/games/cookie-party");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  const friends = page.getByRole("button", { name: /^Give a cookie to/ });
  await friends.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(friends.nth(1)).toBeFocused();
});

test("Word Search arrows focus a cell and Enter selects it", async ({ page }) => {
  await page.goto("/games/word-search");
  await page.getByRole("button", { name: /Easy/ }).click();
  const cells = page.locator("main .grid > button");
  await cells.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(cells.nth(1)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(cells.nth(1)).toHaveClass(/bg-sun/);
});


test("Word Search keeps focus with the cursor when switching from keys to touch", async ({ page }) => {
  await page.goto("/games/word-search");
  await page.getByRole("button", { name: /Easy/ }).click();
  const cells = page.locator("main .grid > button");
  await cells.first().focus();
  await cells.nth(1).click();
  await expect(cells.nth(1)).toBeFocused();
});
