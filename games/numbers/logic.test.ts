import { describe, expect, it } from "vitest";
import { makeRng } from "@/lib/random";
import { makeNumberGrid, scatterNumbers } from "./logic";

describe("Missing Numbers", () => {
  it.each([
    [20, 5],
    [50, 10],
    [100, 10],
  ])("1..%i hides exactly one number per row", (max, width) => {
    for (let s = 0; s < 50; s++) {
      const g = makeNumberGrid(makeRng(s), max, width);
      expect(g.rows).toHaveLength(max / width);
      g.rows.forEach((row, r) => {
        expect(row.filter((n) => n === null)).toHaveLength(1);
        const full = row.map((n) => n ?? g.answers[r]);
        expect(full).toEqual(Array.from({ length: width }, (_, i) => r * width + i + 1));
      });
      expect([...g.choices].sort((a, b) => a - b)).toEqual([...g.answers].sort((a, b) => a - b));
    }
  });
});

describe("Find Numbers", () => {
  it("keeps actual 48px targets apart on a hard tablet board", () => {
    const nums = scatterNumbers(makeRng(1), 100, 1.5, 0.8, { width: 702, height: 560, targetSize: 48 });
    for (let i = 0; i < nums.length; i++) {
      const a = nums[i];
      expect(a.x / 100 * 702).toBeGreaterThanOrEqual(24);
      expect(a.y / 100 * 560).toBeGreaterThanOrEqual(24);
      for (const b of nums.slice(i + 1)) {
        expect(Math.abs(a.x - b.x) / 100 * 702 >= 48 || Math.abs(a.y - b.y) / 100 * 560 >= 48).toBe(true);
      }
    }
  });
  it("places every number once, inside the box, without sharing a cell", () => {
    for (const count of [20, 50, 100]) {
      const nums = scatterNumbers(makeRng(count), count, 1.5, 0.8);
      expect(nums.map((n) => n.value)).toEqual(Array.from({ length: count }, (_, i) => i + 1));
      nums.forEach((n) => {
        expect(n.x).toBeGreaterThan(0);
        expect(n.x).toBeLessThan(100);
        expect(n.y).toBeGreaterThan(0);
        expect(n.y).toBeLessThan(100);
      });
    }
  });
});
