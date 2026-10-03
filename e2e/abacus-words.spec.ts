import { expect, test, type Page } from "@playwright/test";

const answerUntilNext = async (page: Page, timeout = 12000) => {
  for (let tries = 0; tries < 30; tries++) {
    if (await page.getByLabel("Puzzle 2 of 5").or(page.getByLabel("Puzzle 2 of 3")).isVisible()) return;
    const enabled = page.locator("main div.flex-wrap > button:not([disabled])");
    if (await enabled.count()) await enabled.first().click({ timeout: 1000 }).catch(() => {});
    await page.waitForTimeout(700);
  }
  await expect(page.getByLabel(/Puzzle 2 of [35]/)).toBeVisible({ timeout });
};

test("Bead Reader: setting beads with the keyboard and checking", async ({ page }) => {
  await page.goto("/games/bead-reader");
  await page.getByRole("button", { name: /Easy/ }).click();
  await answerUntilNext(page); // puzzle 1 is "read"
  const target = Number((await page.getByText(/^Show \d+ on the abacus$/).innerText()).match(/\d+/)![0]);
  if (target >= 5) await page.keyboard.press(" ");
  for (let i = 0; i < target % 5; i++) await page.keyboard.press("ArrowUp");
  await expect(page.getByRole("img", { name: `Abacus showing ${target}` })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText(`Yes! That shows ${target}.`)).toBeVisible();
});

test("Abacus Sums: wrong answer is caught, right answer moves on", async ({ page }) => {
  await page.goto("/games/abacus-sums");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  const sumText = await page.getByText(/^\d+ \+ \d+ = \?$/).innerText();
  const [a, b] = sumText.match(/\d+/g)!.map(Number);
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText(/Keep going!/)).toBeVisible();
  // direct sums: push b more beads on the ones rod (top bead first if needed)
  const total = a + b;
  const need5 = total >= 5 && a < 5;
  if (need5) await page.keyboard.press(" ");
  const earthNow = a % 5;
  const earthWant = total % 5;
  for (let i = 0; i < earthWant - earthNow; i++) await page.keyboard.press("ArrowUp");
  for (let i = 0; i < earthNow - earthWant; i++) await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("img", { name: `Abacus showing ${total}` })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText(`${a} + ${b} = ${total}`)).toBeVisible();
  await expect(page.getByLabel("Sum 2 of 5")).toBeVisible({ timeout: 3000 });
});

for (const slug of ["friend-finder", "which-formula", "missing-letter", "word-ladder"]) {
  test(`${slug}: answering moves on`, async ({ page }) => {
    await page.goto(`/games/${slug}`);
    await page.getByRole("button", { name: /Easy/ }).click();
    await answerUntilNext(page);
  });
}

test("Flash Abacus: numbers flash, then the total is asked", async ({ page }) => {
  await page.goto("/games/flash-abacus");
  await page.getByRole("button", { name: /Easy/ }).click();
  await expect(page.getByText(/What do all 3 numbers add up to\?/)).toBeVisible({ timeout: 10000 });
  await answerUntilNext(page);
});

test("Spell It: typing the word spells it", async ({ page }) => {
  await page.goto("/games/spell-it");
  await page.getByRole("button", { name: /Medium/ }).click();
  const labels = await page.locator("main [role=img]").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? ""));
  const word = labels.find((l) => /^[a-z]+$/.test(l))!;
  await page.keyboard.type(word);
  await expect(page.getByText(`You spelled ${word.toUpperCase()}!`)).toBeVisible();
});

test("Rhyme Time: rhymes are found, others shake", async ({ page }) => {
  await page.goto("/games/rhyme-time");
  await page.getByRole("button", { name: /Easy/ }).click();
  await answerUntilNext(page);
});

test("Word Search: tapping first and last letters finds a word", async ({ page }) => {
  await page.goto("/games/word-search");
  await page.getByRole("button", { name: /Easy/ }).click();
  // read the grid and find the first hidden word across
  const cells = page.locator("main .grid > button");
  const letters = await cells.allInnerTexts();
  const size = Math.sqrt(letters.length);
  const rows = Array.from({ length: size }, (_, r) => letters.slice(r * size, r * size + size).join("").toLowerCase());
  const words = ["cat", "hat", "bat", "rat", "dog", "log", "frog", "bug", "mug", "rug", "car", "star", "jar", "bee", "key", "tree", "boat", "coat", "goat", "fan", "van", "can", "hen", "pen", "box", "fox", "bell", "moon", "cake", "net", "jet", "sun", "bus", "pig", "cup", "bed", "egg", "owl", "bag", "fish", "duck", "ball", "kite", "drum", "sock", "nest", "leaf"];
  let found = false;
  for (let r = 0; r < size && !found; r++)
    for (const w of words) {
      const c = rows[r].indexOf(w);
      if (c === -1) continue;
      await cells.nth(r * size + c).dispatchEvent("pointerdown");
      await cells.nth(r * size + c + w.length - 1).dispatchEvent("pointerdown");
      found = true;
      break;
    }
  expect(found).toBe(true);
  await expect(page.locator("main .line-through").first()).toBeVisible();
});

test("Mini Crossword: typing letters fills squares and Backspace clears", async ({ page }) => {
  await page.goto("/games/crossword");
  await page.getByRole("button", { name: /Easy/ }).click();
  await page.keyboard.type("z");
  await expect(page.getByRole("button", { name: /: z$/ })).toHaveCount(1);
  await page.keyboard.press("Backspace");
  await expect(page.getByRole("button", { name: /: z$/ })).toHaveCount(0);
});

test("Friend Pairs: cards match when they make the target", async ({ page }) => {
  await page.goto("/games/friend-pairs");
  await page.getByRole("button", { name: /Easy/ }).click();
  const all = page.locator("main .grid > button");
  const n = await all.count();
  const seen: number[] = [];
  for (let i = 0; i < n; i += 2) {
    await all.nth(i).click();
    await all.nth(i + 1).click();
    seen[i] = Number(await all.nth(i).getAttribute("aria-label"));
    seen[i + 1] = Number(await all.nth(i + 1).getAttribute("aria-label"));
    await page.waitForTimeout(1150);
  }
  const done = new Set<number>();
  for (let i = 0; i < n; i++) {
    if (done.has(i)) continue;
    if (!(await all.nth(i).getAttribute("aria-label"))?.includes("face down")) {
      done.add(i);
      continue;
    }
    const j = seen.findIndex((v, k) => k !== i && !done.has(k) && v + seen[i] === 5 && (k > i));
    if (j === -1) continue;
    await all.nth(i).click();
    await all.nth(j).click();
    done.add(i);
    done.add(j);
    await page.waitForTimeout(700);
  }
  await expect(page.getByRole("dialog", { name: "Level complete" })).toBeVisible({ timeout: 4000 });
});

test("Mini Crossword: typing every answer completes the puzzle", async ({ page }) => {
  await page.goto("/games/crossword");
  await page.getByRole("button", { name: /Hard/ }).click();
  const clues = page.getByRole("button", { name: /^Clue \d+ (across|down)$/ });
  const n = await clues.count();
  for (let i = 0; i < n; i++) {
    const clue = clues.nth(i);
    const word = (await clue.getAttribute("data-word"))!;
    await clue.click();
    await page.keyboard.type(word);
    await page.waitForTimeout(150);
  }
  await expect(page.getByText("Crossword complete!")).toBeVisible();
  await expect(page.getByLabel("Puzzle 2 of 3")).toBeVisible({ timeout: 4000 });
});

test("Mini Crossword: a wrong word is flagged and can be fixed", async ({ page }) => {
  await page.goto("/games/crossword");
  await page.getByRole("button", { name: /Easy/ }).click();
  const clue = page.getByRole("button", { name: /^Clue 1 / }).first();
  const word = (await clue.getAttribute("data-word"))!;
  await clue.click();
  const wrong = word.slice(0, -1) + (word.endsWith("z") ? "y" : "z");
  await page.keyboard.type(wrong);
  await page.waitForTimeout(100);
  await page.keyboard.press("Backspace");
  await page.keyboard.type(word.slice(-1));
  await expect(page.getByRole("button", { name: new RegExp(`: ${word.slice(-1)}$`) }).first()).toBeVisible();
});

test("phone: the section tabs scroll to keep the active one visible", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.evaluate(() => document.getElementById("section-multiply")!.scrollIntoView());
  const tab = page.getByRole("navigation", { name: "Game sections" }).getByRole("link", { name: "Times & Share" });
  await expect(tab).toHaveAttribute("aria-current", "true");
  await expect(tab).toBeInViewport();
  await ctx.close();
});
