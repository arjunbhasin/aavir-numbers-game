import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 810, height: 1080 }, hasTouch: true, isMobile: true });

test("tablet shows the on-screen arrow pad and it moves the penguin", async ({ page }) => {
  await page.goto("/games/ice-slide");
  await page.getByRole("button", { name: "Level 1", exact: true }).click({ force: true });
  await expect(page.getByRole("button", { name: "Move up" })).toBeVisible();
  await page.getByRole("button", { name: "Move left" }).dispatchEvent("pointerdown");
  await expect(page.getByText("Moves: 1")).toBeVisible();
  await page.screenshot({ path: "test-results/tablet-ice.png" });
});
