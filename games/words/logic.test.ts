import { describe, expect, it } from "vitest";
import { makeRng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";
import { WORDS, WORD_LIST, rhymeOf } from "./words";
import {
  changedIndex,
  countInGrid,
  crosswordTiles,
  ladderOptions,
  makeCrossword,
  makeLadder,
  makeMissingLetter,
  makeRhyme,
  makeSearch,
  makeSpell,
  oneApart,
  validCrossword,
} from "./logic";

const DIFFS: Difficulty[] = [0, 1, 2];
const N = 400;

// every word having a picture is checked by the type of WORD_PICTURES
it("has no duplicate words", () => {
  expect(new Set(WORD_LIST).size).toBe(WORD_LIST.length);
});

describe.each(DIFFS)("difficulty %i", (d) => {
  it("Missing Letter has one right letter, and wrong letters don't make picture words", () => {
    for (let s = 0; s < N; s++) {
      const p = makeMissingLetter(makeRng(s + d * 5555), d);
      expect(p.options).toContain(p.word[p.gap]);
      expect(new Set(p.options).size).toBe(3);
      for (const o of p.options) if (o !== p.word[p.gap]) expect(WORD_LIST).not.toContain(p.word.slice(0, p.gap) + o + p.word.slice(p.gap + 1));
    }
  });

  it("Spell It tiles hold every letter and start scrambled", () => {
    for (let s = 0; s < N; s++) {
      const p = makeSpell(makeRng(s + d * 5555), d);
      const left = [...p.tiles];
      for (const ch of p.word) left.splice(left.indexOf(ch), 1);
      expect(left).toHaveLength(d === 2 ? 1 : 0);
      expect(p.tiles.slice(0, p.word.length).join("")).not.toBe(p.word + (d === 2 ? "" : ""));
    }
  });

  it("Rhyme Time: the rhymes rhyme and the others don't", () => {
    for (let s = 0; s < N; s++) {
      const p = makeRhyme(makeRng(s + d * 5555), d);
      for (const c of p.choices) expect(rhymeOf(c) === rhymeOf(p.target)).toBe(p.rhymes.includes(c));
      expect(p.rhymes).toHaveLength(d === 2 ? 2 : 1);
      expect(p.choices).not.toContain(p.target);
    }
  });

  it("Change One Letter ladders change exactly one letter at a time", () => {
    for (let s = 0; s < N; s++) {
      const rng = makeRng(s + d * 5555);
      const p = makeLadder(rng, d);
      expect(p.words).toHaveLength(d + 2);
      expect(new Set(p.words).size).toBe(p.words.length);
      for (let i = 1; i < p.words.length; i++) {
        expect(oneApart(p.words[i - 1], p.words[i])).toBe(true);
        const opts = ladderOptions(rng, p.words[i - 1], p.words[i]);
        expect(opts).toContain(p.words[i][changedIndex(p.words[i - 1], p.words[i])]);
        expect(new Set(opts).size).toBe(opts.length);
      }
    }
  });

  it("Word Search hides each word exactly once", () => {
    for (let s = 0; s < N; s++) {
      const p = makeSearch(makeRng(s + d * 5555), d);
      expect(p.words).toHaveLength(d === 2 ? 4 : 3);
      const dirs = d === 0 ? (["across"] as const) : (["across", "down"] as const);
      for (const w of p.words) {
        expect(countInGrid(p.grid, w.word, [...dirs])).toBe(1);
        if (d === 0) expect(w.dir).toBe("across");
      }
      expect(p.grid.every((row) => row.length === p.size && row.every((ch) => /^[a-z]$/.test(ch)))).toBe(true);
    }
  });

  it("Mini Crosswords are valid grids that fit", () => {
    for (let s = 0; s < N; s++) {
      const rng = makeRng(s + d * 5555);
      const cw = makeCrossword(rng, d);
      expect(cw.entries).toHaveLength(d + 2);
      expect(validCrossword(cw.entries)).toBe(true);
      expect(Math.max(cw.rows, cw.cols)).toBeLessThanOrEqual(d === 2 ? 6 : 5);
      expect(cw.entries.some((e) => e.dir === "across") && cw.entries.some((e) => e.dir === "down")).toBe(true);
      const tiles = crosswordTiles(rng, cw);
      for (const e of cw.entries) for (const ch of e.word) expect(tiles).toContain(ch);
    }
  });
});

it("crossword checker rejects accidental extra words", () => {
  // "cat" across with "cup" down from c makes no stray words
  expect(validCrossword([{ word: "cat", r: 0, c: 0, dir: "across" }, { word: "cup", r: 0, c: 0, dir: "down" }])).toBe(true);
  // two across words stacked directly make two-letter columns
  expect(validCrossword([{ word: "cat", r: 0, c: 0, dir: "across" }, { word: "hat", r: 1, c: 0, dir: "across" }])).toBe(false);
  expect(WORDS.length).toBeGreaterThan(40);
});
