import { expect, test, type Page } from "@playwright/test";
import { LEVELS } from "../games/key-maze/levels";
import { move, parseLevel, solve, startState, type State } from "../games/key-maze/logic";
import type { Dir } from "../lib/grid";

const KEY = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" } as const;

async function openLevel(page: Page, n: number) {
  await page.goto("/games/key-maze");
  await page.evaluate((count) => {
    const games = { "key-maze": Object.fromEntries(Array.from({ length: count }, (_, i) => [i, 3])) };
    localStorage.setItem("aavir-games-v1", JSON.stringify({ state: { muted: true, games, recent: [] }, version: 1 }));
  }, n - 1);
  await page.reload();
  await page.getByRole("button", { name: `Level ${n}`, exact: true }).click({ force: true });
}

test("Key Maze has 24 levels and an arrow level can be won", async ({ page }) => {
  await openLevel(page, 16);
  await expect(page.getByText("Arrow paths are one-way")).toBeVisible();
  for (const d of solve(parseLevel(LEVELS[15].map))!) await page.keyboard.press(KEY[d]);
  await expect(page.getByRole("dialog", { name: "Level complete" })).toBeVisible({ timeout: 4000 });
});

test("Key Maze: using the key on a decoy door is noticed, and Undo fixes it", async ({ page }) => {
  const level = parseLevel(LEVELS[12].map);
  // find moves that open a door and leave the treasure unreachable
  const seen = new Set<string>();
  const queue: { s: State; path: Dir[] }[] = [{ s: startState(level), path: [] }];
  let trap: Dir[] | null = null;
  while (queue.length && !trap) {
    const { s, path } = queue.shift()!;
    for (const d of ["up", "down", "left", "right"] as const) {
      const r = move(level, s, d);
      if (!r.state) continue;
      const k = `${r.state.pos.r},${r.state.pos.c}|${r.state.used.join(",")}`;
      if (seen.has(k)) continue;
      seen.add(k);
      if (r.event === "door" && solve(level, r.state) === null) {
        trap = [...path, d];
        break;
      }
      queue.push({ s: r.state, path: [...path, d] });
    }
  }
  expect(trap).not.toBeNull();
  await openLevel(page, 13);
  for (const d of trap!) await page.keyboard.press(KEY[d]);
  await expect(page.getByText(/used up the key you needed/)).toBeVisible();
  await page.keyboard.press("u");
  await expect(page.getByText(/used up the key you needed/)).toHaveCount(0);
});
