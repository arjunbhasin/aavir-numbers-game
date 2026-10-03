import { expect, test } from "@playwright/test";

const GAMES = [
  ["box-push", "Box Push"],
  ["ice-slide", "Ice Slide"],
  ["key-maze", "Key Maze"],
  ["slide-tiles", "Slide Tiles"],
  ["robot-path", "Robot Path"],
  ["missing-pieces", "Missing Pieces"],
  ["whats-next", "What's Next?"],
  ["odd-one-out", "Odd One Out"],
  ["magic-square", "Magic Square"],
  ["bug-flash", "Bug Count Flash"],
  ["bunny-hops", "Bunny Hops"],
  ["garden", "Garden Builder"],
  ["cookie-party", "Cookie Party"],
  ["packing", "Packing Day"],
  ["magic-machine", "Magic Machine"],
  ["make-ten", "Make Ten"],
  ["balance", "Balance Scale"],
  ["coin-shop", "Coin Shop"],
  ["monster-munch", "Monster Munch"],
  ["sum-path", "Sum Path"],
  ["pair-match", "Pair Match"],
  ["copy-lights", "Copy the Lights"],
  ["whats-missing", "What's Missing?"],
  ["footprints", "Footprints"],
  ["missing-numbers", "Missing Numbers"],
  ["find-numbers", "Find Numbers"],
] as const;

test("home page lists every game", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Aavir's Puzzle Park" })).toBeVisible();
  for (const [slug, title] of GAMES) {
    await expect(page.locator(`a[href="/games/${slug}"]`)).toContainText(title);
  }
});

for (const [slug, title] of GAMES) {
  test(`${title} page loads without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/games/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("Box Push level 1 can be won with the keyboard, and stars are saved", async ({ page }) => {
  await page.goto("/games/box-push");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  await expect(page.getByText("Moves: 0")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  const dialog = page.getByRole("dialog", { name: "Level complete" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("3 of 3 stars")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Level 1", exact: true }).getByLabel("3 of 3 stars")).toBeVisible();
  await expect(page.getByRole("button", { name: "Level 2", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Level 3, locked" })).toBeDisabled();
});

test("Ice Slide: bumping a wall is not a move, undo goes back", async ({ page }) => {
  await page.goto("/games/ice-slide");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("Moves: 1")).toBeVisible();
  await page.keyboard.press("ArrowRight"); // already at the edge
  await expect(page.getByText("Moves: 1")).toBeVisible();
  await page.keyboard.press("u");
  await expect(page.getByText("Moves: 0")).toBeVisible();
});

test("Robot Path runs a program", async ({ page }) => {
  await page.goto("/games/robot-path");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("3 / 7 steps")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Level complete" })).toBeVisible({ timeout: 5000 });
});

test("What's Next: wrong answers fade, the right one moves on", async ({ page }) => {
  await page.goto("/games/whats-next");
  await page.getByRole("button", { name: /Easy/ }).click();
  await expect(page.getByLabel("Puzzle 1 of 5")).toBeVisible();
  for (const letter of ["A", "B", "C"]) {
    const btn = page.getByRole("button", { name: `Answer ${letter}` });
    if (await btn.isEnabled()) await btn.click();
    if (await page.getByText(/Yes!|Correct!|Great thinking!|You got it!|Super!/).isVisible()) break;
  }
  await expect(page.getByLabel("Puzzle 2 of 5")).toBeVisible({ timeout: 4000 });
});

test("Missing Numbers accepts the right number", async ({ page }) => {
  await page.goto("/games/missing-numbers");
  await page.getByRole("button", { name: /1 to 20/ }).click();
  const choices = page.locator("button.bg-ocean");
  await expect(choices).toHaveCount(4);
  // try each choice until one is accepted
  for (let i = 0; i < 4; i++) {
    await choices.nth(i).click();
    if ((await choices.count()) === 3) break;
  }
  await expect(choices).toHaveCount(3);
});

test("win screen: Enter on a focused button runs that button, not Next", async ({ page }) => {
  await page.goto("/games/box-push");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  await page.keyboard.press("ArrowRight");
  const dialog = page.getByRole("dialog", { name: "Level complete" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Levels" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Pick a level" })).toBeVisible();
});

test("Robot Path ignores keys once the level is won", async ({ page }) => {
  await page.goto("/games/robot-path");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Level complete" })).toBeVisible({ timeout: 5000 });
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("3 / 7 steps")).toBeVisible();
});
