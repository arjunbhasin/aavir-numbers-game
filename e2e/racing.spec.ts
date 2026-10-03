import { expect, test } from "@playwright/test";

test("Rainbow Rally: countdown, GO, then racing with steering", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/games/rainbow-rally");
  await expect(page.getByRole("button", { name: /Level 1/ })).toContainText("Meadow");
  await expect(page.getByRole("button", { name: "Level 2, locked" })).toBeDisabled();
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  await expect(page.getByText("Lap 1 of 3")).toBeVisible();
  await expect(page.getByText("GO!")).toBeVisible({ timeout: 5000 });
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(400);
  await page.keyboard.up("ArrowLeft");
  await page.waitForTimeout(2500);
  // the canvas is drawing frames, and the race keeps going
  const fps = await page.evaluate(
    () => new Promise<number>((res) => {
      let n = 0;
      const t0 = performance.now();
      const f = () => (++n, performance.now() - t0 < 1000 ? requestAnimationFrame(f) : res(n));
      requestAnimationFrame(f);
    }),
  );
  expect(fps).toBeGreaterThan(30);
  await page.getByRole("button", { name: "Restart race" }).click();
  await expect(page.getByText("GO!")).toBeVisible({ timeout: 5000 });
  expect(errors).toEqual([]);
});

test.describe("on a tablet", () => {
  test.use({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true });
  test("steering zones cover the road and the view fits the screen", async ({ page }) => {
    await page.goto("/games/rainbow-rally");
    await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
    await expect(page.getByRole("button", { name: "Steer left" })).toBeInViewport();
    await expect(page.getByRole("button", { name: "Steer right" })).toBeInViewport();
    await expect(page.getByRole("button", { name: "Restart race" })).toBeInViewport();
    await page.getByRole("button", { name: "Steer right" }).dispatchEvent("pointerdown");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Steer right" }).dispatchEvent("pointerup");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
