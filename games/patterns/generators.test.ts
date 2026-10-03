import { describe, expect, it } from "vitest";
import { makeRng } from "@/lib/random";
import { figureKey, sameFigure, type Figure } from "./figure";
import { makeMagicSquare, makeMissingPieces, makeOddOneOut, makeWhatsNext, oddOnes, type Difficulty } from "./generators";

const DIFFS: Difficulty[] = [0, 1, 2];
const SEEDS = 1500;

function distinctOptions(options: Figure[]) {
  expect(new Set(options.map(figureKey)).size).toBe(options.length);
}

function validFigure(f: Figure) {
  expect(f.count).toBeGreaterThanOrEqual(1);
  expect(f.count).toBeLessThanOrEqual(6);
  expect([1, 2, 3]).toContain(f.size);
}

describe.each(DIFFS)("difficulty %i", (d) => {
  it("What's Next has exactly one matching option", () => {
    for (let s = 0; s < SEEDS; s++) {
      const p = makeWhatsNext(makeRng(s * 7 + d), d);
      distinctOptions(p.options);
      expect(p.options.filter((o) => sameFigure(o, p.answers[0]))).toHaveLength(1);
      expect(p.options.length).toBe(d === 0 ? 3 : 4);
      [...p.options, ...(p.items.filter(Boolean) as Figure[])].forEach(validFigure);
      // the sequence is not just the same figure repeated
      const shown = p.items.filter(Boolean) as Figure[];
      expect(new Set(shown.map(figureKey)).size).toBeGreaterThan(1);
    }
  });

  it("Missing Pieces has two different answers, each present once", () => {
    for (let s = 0; s < SEEDS; s++) {
      const p = makeMissingPieces(makeRng(s * 13 + d), d);
      distinctOptions(p.options);
      expect(p.items.filter((x) => x === null)).toHaveLength(2);
      expect(sameFigure(p.answers[0], p.answers[1])).toBe(false);
      for (const a of p.answers) expect(p.options.filter((o) => sameFigure(o, a))).toHaveLength(1);
      p.options.forEach(validFigure);
    }
  });

  it("Odd One Out has exactly one odd figure", () => {
    for (let s = 0; s < SEEDS; s++) {
      const p = makeOddOneOut(makeRng(s * 31 + d), d);
      expect(oddOnes(p.items)).toEqual([p.odd]);
      p.items.forEach(validFigure);
    }
  });

  it("Magic Square has exactly one matching option", () => {
    for (let s = 0; s < SEEDS; s++) {
      const p = makeMagicSquare(makeRng(s * 17 + d), d);
      distinctOptions(p.options);
      expect(p.cells.filter((c) => c === null)).toHaveLength(1);
      expect(p.options.filter((o) => sameFigure(o, p.answer))).toHaveLength(1);
      expect(p.cells.length).toBe(p.size * p.size);
    }
  });
});
