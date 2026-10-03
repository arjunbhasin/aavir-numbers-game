import { describe, expect, it } from "vitest";
import { makeRng } from "@/lib/random";
import { GAMES } from "@/lib/catalog";
import { plant, shapesFor } from "./garden/logic";
import { LEVELS as GARDEN } from "./garden/levels";
import { addSentence, hop, validSizes } from "./bunny-hops/logic";
import { LEVELS as BUNNY } from "./bunny-hops/levels";
import { canGive, isDone, reverseAnswer, shareSentence } from "./cookie-party/logic";
import { LEVELS as COOKIES } from "./cookie-party/levels";
import { makeBugPuzzle } from "./bug-flash/logic";
import { apply, consistent, makeMachinePuzzle } from "./magic-machine/logic";
import type { Difficulty } from "./patterns/generators";
import { isSolved as packSolved, move as packMove, packSentence, parseLevel as parsePacking, solve as solvePacking } from "./packing/logic";
import { LEVELS as PACKING } from "./packing/levels";

const count = (id: string) => GAMES.find((g) => g.id === id)!.levels;
const DIFFS: Difficulty[] = [0, 1, 2];

describe("Garden Builder", () => {
  it("has as many levels as the home page says", () => expect(GARDEN.length).toBe(count("garden")));
  it("finds every rectangle that fits", () => {
    expect(shapesFor(12)).toEqual([[1, 12], [2, 6], [3, 4]]);
    expect(shapesFor(7)).toEqual([[1, 7]]);
    expect(shapesFor(16)).toEqual([[1, 16], [2, 8], [4, 4]]);
  });
  it.each(GARDEN)("level with %i seedlings has every shape fit in the garden", (n) => {
    const shapes = shapesFor(n);
    const all = shapesFor(n, 99, 99);
    expect(shapes).toEqual(all);
  });
  it("knows a turned rectangle is the same flowers", () => {
    const found = [{ rows: 3, cols: 4 }];
    expect(plant(12, 4, 3, found)).toBe("turned");
    expect(plant(12, 3, 4, found)).toBe("again");
    expect(plant(12, 2, 6, found)).toBe("new");
    expect(plant(12, 3, 5, found)).toBe("wrong");
  });
});

describe("Bunny Hops", () => {
  it("has as many levels as the home page says", () => expect(BUNNY.length).toBe(count("bunny-hops")));
  it.each(BUNNY.map((l, i) => [i + 1, l] as const))("level %i has exactly one right answer", (_, l) => {
    if (l.kind === "hop") {
      expect(validSizes(l)).toHaveLength(1);
      expect(Math.max(...l.carrots)).toBeLessThanOrEqual(l.length);
    } else {
      expect(l.carrot % l.size).toBe(0);
      expect(l.choices.filter((c) => c * l.size === l.carrot)).toHaveLength(1);
      expect(l.carrot).toBeLessThanOrEqual(l.length);
    }
  });
  it("hops land on puddles and stop at the edge", () => {
    const l = { kind: "hop" as const, length: 10, carrots: [10], puddles: [4], size: null, choices: [2, 5] };
    expect(hop(l, 2, 2, 1).result).toBe("puddle");
    expect(hop(l, 10, 5, 1).result).toBe("edge");
    expect(addSentence(3, 4)).toBe("3 + 3 + 3 + 3 = 12");
  });
});

describe("Cookie Party", () => {
  it("has as many levels as the home page says", () => expect(COOKIES.length).toBe(count("cookie-party")));
  it.each(COOKIES.map((l, i) => [i + 1, l] as const))("level %i has exactly one right answer", (_, l) => {
    if (l.kind === "reverse") expect(l.choices.filter((c) => c === reverseAnswer(l))).toHaveLength(1);
    if (l.kind === "plates") expect(l.choices.filter((p) => l.cookies % p === 0)).toHaveLength(1);
    if (l.kind === "share") expect(l.plates).toBeLessThanOrEqual(6);
  });
  it("only allows fair giving, and finishes with leftovers for the dog", () => {
    expect(canGive([1, 0], 0)).toBe(false);
    expect(canGive([1, 0], 1)).toBe(true);
    expect(isDone([3, 3], 1)).toBe(true);
    expect(isDone([3, 2], 1)).toBe(false);
    expect(isDone([3, 3], 2)).toBe(false);
    expect(shareSentence(13, 3)).toBe("13 ÷ 3 = 4, with 1 left for the dog");
    expect(shareSentence(12, 3)).toBe("12 ÷ 3 = 4 each");
  });
});

describe.each(DIFFS)("generated puzzles, difficulty %i", (d) => {
  it("Bug Count Flash has three different choices including the total", () => {
    for (let s = 0; s < 2000; s++) {
      const p = makeBugPuzzle(makeRng(s * 3 + d), d);
      expect(p.total).toBe(p.groups * p.each);
      expect(new Set(p.options).size).toBe(3);
      expect(p.options.filter((o) => o === p.total)).toHaveLength(1);
      expect(p.options.every((o) => o > 0)).toBe(true);
      expect(p.total).toBeLessThanOrEqual(30);
    }
  });

  it("Magic Machine always has exactly one right option", () => {
    for (let s = 0; s < 2000; s++) {
      const p = makeMachinePuzzle(makeRng(s * 11 + d), d);
      switch (p.kind) {
        case "rule":
          expect(p.options.filter((r) => consistent(r, p.examples))).toEqual([p.answer]);
          break;
        case "combine":
          for (const x of [1, 2, 3, 5]) expect(apply(p.answer, x)).toBe(apply(p.rules[1], apply(p.rules[0], x)));
          expect(p.options.filter((r) => [1, 2, 3].every((x) => apply(r, x) === apply(p.rules[1], apply(p.rules[0], x))))).toHaveLength(1);
          break;
        case "output":
          expect(p.answer).toBe(apply(p.rule, p.input));
          break;
        case "undo":
          expect(apply(p.rule, p.answer)).toBe(p.output);
          break;
        case "chain":
          expect(p.answer).toBe(apply(p.rules[1], apply(p.rules[0], p.input)));
          break;
      }
      if ("options" in p && typeof p.options[0] === "number") {
        const nums = p.options as number[];
        expect(new Set(nums).size).toBe(nums.length);
        expect(nums.filter((n) => n === p.answer)).toHaveLength(1);
        expect(nums.every((n) => n > 0)).toBe(true);
      }
      expect(p.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("Packing Day", () => {
  it("has as many levels as the home page says", () => expect(PACKING.length).toBe(count("packing")));
  it.each(PACKING.map((l, i) => [i + 1, l] as const))("level %i is solvable in exactly par moves", (_, l) => {
    const level = parsePacking(l.map);
    const sol = solvePacking(level)!;
    expect(sol.length).toBe(l.par);
    let s = level.start;
    for (const d of sol) s = packMove(level, s, d)!.state;
    expect(packSolved(level, s)).toBe(true);
    expect(packSentence(level, s)).toMatch(/=/);
  });
  it("needs every used box full", () => {
    const level = parsePacking("@o3");
    const s = packMove(level, level.start, "right")!.state;
    expect(s.fills).toEqual([1]);
    expect(packSolved(level, s)).toBe(false);
  });
});
