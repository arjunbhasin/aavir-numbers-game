import { describe, expect, it } from "vitest";
import { digitToRod, formula, fromRods, methodFor, moves, toRods, type Rod } from "./abacus";

/** Bead-level move on one rod; returns null if the beads aren't there to move. */
function apply(rod: Rod, amount: number): Rod | null {
  const r = { ...rod };
  if (amount === 5) return r.heaven ? null : { ...r, heaven: true };
  if (amount === -5) return r.heaven ? { ...r, heaven: false } : null;
  if (amount > 0 && amount < 5) return r.earth + amount <= 4 ? { ...r, earth: r.earth + amount } : null;
  if (amount < 0 && amount > -5) return r.earth + amount >= 0 ? { ...r, earth: r.earth + amount } : null;
  if (amount >= 6 && amount <= 9) return r.heaven || r.earth + amount - 5 > 4 ? null : { heaven: true, earth: r.earth + amount - 5 };
  if (amount <= -6) return r.heaven && r.earth >= -amount - 5 ? { heaven: false, earth: r.earth + amount + 5 } : null;
  return null;
}

describe("abacus rods", () => {
  it("converts numbers to beads and back", () => {
    expect(digitToRod(7)).toEqual({ heaven: true, earth: 2 });
    expect(toRods(305, 3).map((r) => (r.heaven ? 5 : 0) + r.earth)).toEqual([3, 0, 5]);
    for (let n = 0; n < 1000; n++) expect(fromRods(toRods(n, 3))).toBe(n);
  });
});

describe("abacus methods", () => {
  it("every formula adds up to d", () => {
    for (let a = 0; a <= 9; a++)
      for (let d = 1; d <= 9; d++) expect(moves(methodFor(a, d), d).reduce((x, y) => x + y, 0)).toBe(d);
  });

  it("every method can really be done with the beads on the rod", () => {
    for (let a = 0; a <= 9; a++)
      for (let d = 1; d <= 9; d++) {
        const m = methodFor(a, d);
        let rod: Rod | null = digitToRod(a);
        for (const step of moves(m, d)) {
          if (step === 10) continue; // +10 goes on the next rod
          rod = rod && apply(rod, step);
        }
        expect(rod, `${a} + ${d} by ${m}`).not.toBeNull();
        expect((rod!.heaven ? 5 : 0) + rod!.earth).toBe((a + d) % 10);
      }
  });

  it("uses the simplest method that works", () => {
    for (let a = 0; a <= 9; a++)
      for (let d = 1; d <= 9; d++) {
        const m = methodFor(a, d);
        const direct = a + d < 10 && apply(digitToRod(a), d) !== null;
        if (direct) expect(m).toBe("direct");
        if (m === "combo") expect(apply(digitToRod(a), -(10 - d))).toBeNull();
      }
  });

  it("matches the classic examples", () => {
    expect([methodFor(3, 4), formula("little", 4)]).toEqual(["little", "+5 − 1"]);
    expect([methodFor(8, 7), formula("big", 7)]).toEqual(["big", "+10 − 3"]);
    expect([methodFor(6, 7), formula("combo", 7)]).toEqual(["combo", "+10 − 5 + 2"]);
    expect([methodFor(5, 6), formula("combo", 6)]).toEqual(["combo", "+10 − 5 + 1"]);
    expect(methodFor(1, 3)).toBe("direct");
    expect(methodFor(2, 6)).toBe("direct");
  });
});
