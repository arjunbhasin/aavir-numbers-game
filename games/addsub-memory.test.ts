import { describe, expect, it } from "vitest";
import { makeRng } from "@/lib/random";
import { GAMES, SECTIONS } from "@/lib/catalog";
import { PICTURE_COUNT } from "./picture-count";
import type { Difficulty } from "./patterns/generators";
import { isPairable, makeTenPuzzle } from "./make-ten/logic";
import { makeBalancePuzzle, tilt } from "./balance/logic";
import { coinSentence, makeShopPuzzle, payResult } from "./coin-shop/logic";
import { makeMunchPuzzle, munchSentence } from "./monster-munch/logic";
import { isSolved, move, parseLevel, pathSentence, solve, startState } from "./sum-path/logic";
import { LEVELS as SUM } from "./sum-path/levels";
import { makeDeck, matchStars } from "./pair-match/logic";
import { extendSequence } from "./copy-lights/logic";
import { makeMissingPuzzle } from "./whats-missing/logic";
import { makePath, pathCells } from "./footprints/logic";

const DIFFS: Difficulty[] = [0, 1, 2];
const N = 1500;

describe("catalog", () => {
  it("every game belongs to a section, and every section has games", () => {
    for (const g of GAMES) expect(SECTIONS.map((s) => s.id)).toContain(g.section);
    for (const s of SECTIONS) expect(GAMES.some((g) => g.section === s.id)).toBe(true);
    expect(new Set(GAMES.map((g) => g.id)).size).toBe(GAMES.length);
  });
});

describe.each(DIFFS)("difficulty %i", (d) => {
  it("Make Ten boards can always be cleared", () => {
    for (let s = 0; s < N; s++) {
      const p = makeTenPuzzle(makeRng(s + d * 9999), d);
      expect(isPairable(p.cards, p.target)).toBe(true);
      expect(p.cards.every((c) => c > 0 && c < p.target)).toBe(true);
    }
  });

  it("Balance Scale has one right block, and only it balances", () => {
    for (let s = 0; s < N; s++) {
      const p = makeBalancePuzzle(makeRng(s + d * 9999), d);
      expect(p.answer).toBeGreaterThan(0);
      expect(new Set(p.options).size).toBe(p.options.length);
      expect(p.options.filter((o) => tilt(p, o) === 0)).toEqual([p.answer]);
      expect(p.left.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual([10, 15, 20][d]);
    }
  });

  it("Coin Shop prices can be paid, change questions have one answer", () => {
    for (let s = 0; s < N; s++) {
      const p = makeShopPuzzle(makeRng(s + d * 9999), d);
      expect(p.price).toBeGreaterThan(0);
      if (p.kind === "pay") expect(p.coins).toContain(1);
      else {
        expect(p.answer).toBe(p.paid - p.price);
        expect(p.options.filter((o) => o === p.answer)).toHaveLength(1);
        expect(new Set(p.options).size).toBe(p.options.length);
      }
    }
  });

  it("Monster Munch answers are correct and options distinct", () => {
    for (let s = 0; s < N; s++) {
      const p = makeMunchPuzzle(makeRng(s + d * 9999), d);
      expect(p.answer).toBeGreaterThan(0);
      expect(new Set(p.options).size).toBe(3);
      expect(p.options.filter((o) => o === p.answer)).toHaveLength(1);
      const [l, r] = munchSentence(p).split(" = ");
      const [a, b] = l.split(" − ").map(Number);
      expect(a - b).toBe(Number(r));
    }
  });

  it("What's Missing has one right answer among options", () => {
    for (let s = 0; s < N; s++) {
      const p = makeMissingPuzzle(makeRng(s + d * 9999), d, PICTURE_COUNT);
      expect(p.after).not.toContain(p.missing);
      expect(new Set(p.options).size).toBe(p.options.length);
      expect(p.options.filter((o) => o === p.missing)).toHaveLength(1);
      expect(p.shown).toHaveLength([4, 6, 8][d]);
    }
  });

  it("Footprints paths stay on the grid and never cross", () => {
    for (let s = 0; s < N; s++) {
      const p = makePath(makeRng(s + d * 9999), d);
      const cells = pathCells(p);
      expect(cells).toHaveLength([3, 5, 7][d] + 1);
      expect(new Set(cells.map((c) => `${c.r},${c.c}`)).size).toBe(cells.length);
      for (const c of cells) expect(c.r >= 0 && c.c >= 0 && c.r < p.size && c.c < p.size).toBe(true);
    }
  });
});

describe("Coin Shop helpers", () => {
  it("checks payments", () => {
    expect(payResult(8, [5, 2, 1])).toBe("exact");
    expect(payResult(8, [5, 5])).toBe("over");
    expect(payResult(8, [5])).toBe("under");
    expect(coinSentence([1, 5, 2])).toBe("5 + 2 + 1 = 8");
  });
});

describe("Sum Path", () => {
  it("has as many levels as the home page says", () => expect(SUM.length).toBe(GAMES.find((g) => g.id === "sum-path")!.levels));
  it.each(SUM.map((l, i) => [i + 1, l] as const))("level %i is solvable in exactly par moves", (i, l) => {
    const level = parseLevel(l.map, l.target);
    const sol = solve(level)!;
    expect(sol.length).toBe(l.par);
    let s = startState(level);
    for (const d of sol) s = move(level, s, d).state!;
    expect(isSolved(level, s)).toBe(true);
    expect(s.total).toBe(l.target);
    if (i >= 8) {
      // the later levels can only be solved by using a take-away stone
      const noMinus = { ...level, stones: level.stones.filter((st) => st.value > 0) };
      expect(solve(noMinus)).toBeNull();
    }
  });
  it("blocks the flag until the total is right, and writes the sum", () => {
    const level = parseLevel("@2F", 2);
    expect(move(level, startState(level), "right").event).toBe("stone");
    const lvl = parseLevel("@F2", 2);
    expect(move(lvl, startState(lvl), "right")).toEqual({ state: null, event: "wrong-total" });
    const minus = parseLevel("@4bF", 2);
    expect(pathSentence(minus, [0, 1])).toBe("4 − 2 = 2");
  });
});

describe("memory helpers", () => {
  it("Pair Match decks have exactly two of each", () => {
    for (const mode of ["pictures", "numbers"] as const) {
      const deck = makeDeck(makeRng(3), 8, mode, PICTURE_COUNT);
      const counts = new Map<number, number>();
      deck.forEach((c) => counts.set(c.key, (counts.get(c.key) ?? 0) + 1));
      expect([...counts.values()].every((v) => v === 2)).toBe(true);
      expect(counts.size).toBe(8);
    }
    expect(matchStars(6, 4)).toBe(3);
    expect(matchStars(20, 4)).toBe(1);
  });
  it("Copy the Lights never repeats a pad three times in a row", () => {
    let seq: number[] = [];
    const rng = makeRng(7);
    for (let i = 0; i < 500; i++) seq = extendSequence(rng, seq);
    for (let i = 2; i < seq.length; i++) expect(seq[i] === seq[i - 1] && seq[i] === seq[i - 2]).toBe(false);
  });
});
