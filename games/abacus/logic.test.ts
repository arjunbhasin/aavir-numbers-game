import { describe, expect, it } from "vitest";
import { methodFor } from "@/lib/abacus";
import { makeRng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";
import { isPairable } from "@/games/make-ten/logic";
import { GAMES } from "@/lib/catalog";
import { SUM_LEVELS, makeBeadPuzzle, makeFlashPuzzle, makeFormulaPuzzle, makeFriendDeck, makeFriendPuzzle, makeSum } from "./logic";

const DIFFS: Difficulty[] = [0, 1, 2];
const distinctWithAnswer = (options: number[], answer: number) => {
  expect(new Set(options).size).toBe(options.length);
  expect(options.filter((o) => o === answer)).toHaveLength(1);
};

describe.each(DIFFS)("difficulty %i", (d) => {
  it("Bead Reader numbers fit the rods", () => {
    for (let s = 0; s < 1000; s++) {
      const p = makeBeadPuzzle(makeRng(s + d * 7777), d, s);
      expect(p.value).toBeGreaterThan(0);
      expect(p.value).toBeLessThan(10 ** p.rods);
      distinctWithAnswer(p.options, p.value);
      expect(p.options.every((o) => o >= 0 && o < 10 ** p.rods)).toBe(true);
    }
  });

  it("Friend Finder answers are the right friend", () => {
    for (let s = 0; s < 1000; s++) {
      const p = makeFriendPuzzle(makeRng(s + d * 7777), d);
      expect(p.n + p.answer).toBe(p.kind.startsWith("little") ? 5 : 10);
      distinctWithAnswer(p.options, p.answer);
      expect(p.options.length).toBeGreaterThanOrEqual(3);
      expect(p.options.every((o) => o >= 1 && o <= 9)).toBe(true);
    }
  });

  it("Which Formula? always offers the right method", () => {
    const seen = new Set<string>();
    for (let s = 0; s < 1000; s++) {
      const p = makeFormulaPuzzle(makeRng(s + d * 7777), d);
      expect(methodFor(p.a, p.d)).toBe(p.answer);
      expect(p.options).toContain(p.answer);
      seen.add(p.answer);
    }
    expect([...seen].sort()).toEqual(([["direct", "little"], ["big", "direct", "little"], ["big", "combo", "direct", "little"]] as const)[d].slice().sort());
  });

  it("Flash Abacus totals are right", () => {
    for (let s = 0; s < 1000; s++) {
      const p = makeFlashPuzzle(makeRng(s + d * 7777), d);
      expect(p.total).toBe(p.numbers.reduce((a, b) => a + b, 0));
      distinctWithAnswer(p.options, p.total);
    }
  });
});

describe("Abacus Sums", () => {
  it("has as many levels as the home page says", () => {
    expect(SUM_LEVELS.length).toBe(GAMES.find((g) => g.id === "abacus-sums")!.levels);
  });
  it.each(SUM_LEVELS.map((l, i) => [i, l.title] as const))("level %i (%s) makes sums that fit and match the level", (level) => {
    for (let s = 0; s < 500; s++) {
      const p = makeSum(makeRng(s * 3 + level), level);
      expect(p.answer).toBe(p.terms.reduce((a, b) => a + b, 0));
      expect(p.answer).toBeLessThan(10 ** p.rods);
      const want = ["direct", "little", "big", "combo"][level];
      if (want) expect(p.method).toBe(want);
    }
  });
});

describe("Friend Pairs", () => {
  it("decks always pair up", () => {
    for (let s = 0; s < 300; s++) {
      expect(isPairable(makeFriendDeck(makeRng(s), 5, 4).map((c) => c.n), 5)).toBe(true);
      expect(isPairable(makeFriendDeck(makeRng(s), 10, 6).map((c) => c.n), 10)).toBe(true);
    }
  });
});
