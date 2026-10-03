import { pick, randInt, shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";
import { VOWELS, WORDS, WORD_LIST, isVowel, rhymeOf } from "./words";

const CONSONANTS = "bcdfghjklmnprstvwy";
const byLength = (min: number, max: number) => WORD_LIST.filter((w) => w.length >= min && w.length <= max);

/* ---------- Missing Letter ---------- */

export type MissingLetterPuzzle = { word: string; gap: number; options: string[] };

export function makeMissingLetter(rng: Rng, d: Difficulty): MissingLetterPuzzle {
  for (;;) {
    const word = pick(rng, d === 2 ? byLength(4, 4) : byLength(3, 3));
    const gap = d === 0 ? 1 : randInt(rng, 0, word.length - 1);
    const right = word[gap];
    if (d === 0 && !isVowel(right)) continue;
    const pool = (isVowel(right) ? VOWELS : CONSONANTS).split("").filter((c) => c !== right);
    // a wrong letter must not make another picture word (b_at → hat would be confusing)
    const ok = pool.filter((c) => !WORD_LIST.includes(word.slice(0, gap) + c + word.slice(gap + 1)));
    if (ok.length < 2) continue;
    return { word, gap, options: shuffle(rng, [right, ...shuffle(rng, ok).slice(0, 2)]) };
  }
}

/* ---------- Spell It ---------- */

export type SpellPuzzle = { word: string; tiles: string[]; given: number };

export function makeSpell(rng: Rng, d: Difficulty): SpellPuzzle {
  const word = pick(rng, d === 0 ? byLength(3, 3) : byLength(4, 5));
  const extra = d === 2 ? [pick(rng, (CONSONANTS + VOWELS).split("").filter((c) => !word.includes(c)))] : [];
  const letters = [...word.split(""), ...extra];
  let tiles = shuffle(rng, letters);
  while (tiles.join("") === letters.join("")) tiles = shuffle(rng, letters);
  return { word, tiles, given: d === 0 ? 1 : 0 };
}

/* ---------- Rhyme Time ---------- */

export type RhymePuzzle = { target: string; choices: string[]; rhymes: string[] };

export function makeRhyme(rng: Rng, d: Difficulty): RhymePuzzle {
  const need = d === 2 ? 2 : 1;
  const others = d === 0 ? 2 : 2 + (d === 1 ? 1 : 0);
  const families = [...new Set(WORDS.map((w) => w.rhyme))].filter((f) => WORDS.filter((w) => w.rhyme === f).length >= need + 1);
  const family = pick(rng, families);
  const members = shuffle(rng, WORDS.filter((w) => w.rhyme === family).map((w) => w.word));
  const target = members[0];
  const rhymes = members.slice(1, 1 + need);
  const wrong = shuffle(rng, WORDS.filter((w) => w.rhyme !== family).map((w) => w.word)).slice(0, others);
  return { target, rhymes, choices: shuffle(rng, [...rhymes, ...wrong]) };
}

/* ---------- Change One Letter ---------- */

export function oneApart(a: string, b: string): boolean {
  if (a.length !== b.length || a === b) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff === 1;
}

export type LadderPuzzle = { words: string[] }; // start, then each new word

export function makeLadder(rng: Rng, d: Difficulty): LadderPuzzle {
  const steps = d + 1;
  for (;;) {
    const path = [pick(rng, WORD_LIST)];
    while (path.length <= steps) {
      const last = path[path.length - 1];
      const next = WORD_LIST.filter((w) => oneApart(last, w) && !path.includes(w));
      if (!next.length) break;
      path.push(pick(rng, next));
    }
    if (path.length === steps + 1) return { words: path };
  }
}

export function changedIndex(a: string, b: string): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return i;
  return -1;
}

export function ladderOptions(rng: Rng, from: string, to: string): string[] {
  const i = changedIndex(from, to);
  const right = to[i];
  const pool = (isVowel(right) ? VOWELS : CONSONANTS).split("").filter((c) => c !== right && c !== from[i]);
  const ok = pool.filter((c) => !WORD_LIST.includes(from.slice(0, i) + c + from.slice(i + 1)));
  return shuffle(rng, [right, ...shuffle(rng, ok).slice(0, 2)]);
}

/* ---------- Word Search ---------- */

export type Placement = { word: string; r: number; c: number; dir: "across" | "down" };
export type SearchPuzzle = { size: number; grid: string[][]; words: Placement[] };

const DELTA = { across: [0, 1], down: [1, 0] } as const;

/** How many times `word` appears in the grid in the allowed directions. */
export function countInGrid(grid: string[][], word: string, dirs: Placement["dir"][]): number {
  let n = 0;
  const size = grid.length;
  for (const dir of dirs)
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++) {
        const [dr, dc] = DELTA[dir];
        let ok = true;
        for (let k = 0; k < word.length && ok; k++) {
          const rr = r + dr * k;
          const cc = c + dc * k;
          ok = rr < size && cc < size && grid[rr][cc] === word[k];
        }
        if (ok) n++;
      }
  return n;
}

export function makeSearch(rng: Rng, d: Difficulty): SearchPuzzle {
  const size = d === 0 ? 5 : 6;
  const count = d === 2 ? 4 : 3;
  const dirs: Placement["dir"][] = d === 0 ? ["across"] : ["across", "down"];
  for (;;) {
    const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
    const words: Placement[] = [];
    for (const word of shuffle(rng, byLength(3, size === 5 ? 4 : 5))) {
      if (words.length === count) break;
      for (let t = 0; t < 30; t++) {
        const dir = pick(rng, dirs);
        const [dr, dc] = DELTA[dir];
        const r = randInt(rng, 0, size - 1 - dr * (word.length - 1));
        const c = randInt(rng, 0, size - 1 - dc * (word.length - 1));
        let fits = true;
        for (let k = 0; k < word.length && fits; k++) {
          const ch = grid[r + dr * k][c + dc * k];
          fits = ch === "" || ch === word[k];
        }
        if (!fits) continue;
        for (let k = 0; k < word.length; k++) grid[r + dr * k][c + dc * k] = word[k];
        words.push({ word, r, c, dir });
        break;
      }
    }
    if (words.length < count) continue;
    const filler = "abcdefghijklmnoprstuvwy";
    for (const row of grid) for (let c = 0; c < size; c++) if (!row[c]) row[c] = filler[Math.floor(rng() * filler.length)];
    // each hidden word must appear exactly once, so there is only one place to find it
    if (words.every((w) => countInGrid(grid, w.word, dirs) === 1)) return { size, grid, words };
  }
}

/* ---------- Mini Crossword ---------- */

export type Entry = { word: string; r: number; c: number; dir: "across" | "down"; num: number };
export type Crossword = { rows: number; cols: number; entries: Entry[] };

/** Every run of 2+ letters in the grid must be exactly one of the entries. */
export function validCrossword(entries: Omit<Entry, "num">[]): boolean {
  const cells = new Map<string, string>();
  for (const e of entries) {
    const [dr, dc] = DELTA[e.dir];
    for (let k = 0; k < e.word.length; k++) {
      const key = `${e.r + dr * k},${e.c + dc * k}`;
      const prev = cells.get(key);
      if (prev && prev !== e.word[k]) return false;
      cells.set(key, e.word[k]);
    }
  }
  const has = (r: number, c: number) => cells.has(`${r},${c}`);
  const runs: string[] = [];
  const coords = [...cells.keys()].map((k) => k.split(",").map(Number));
  for (const [r, c] of coords) {
    if (!has(r, c - 1) && has(r, c + 1)) {
      let w = "";
      let cc = c;
      while (has(r, cc)) w += cells.get(`${r},${cc++}`);
      runs.push(`across:${r},${c}:${w}`);
    }
    if (!has(r - 1, c) && has(r + 1, c)) {
      let w = "";
      let rr = r;
      while (has(rr, c)) w += cells.get(`${rr++},${c}`);
      runs.push(`down:${r},${c}:${w}`);
    }
  }
  const expected = entries.map((e) => `${e.dir}:${e.r},${e.c}:${e.word}`).sort();
  return JSON.stringify(runs.sort()) === JSON.stringify(expected);
}

export function makeCrossword(rng: Rng, d: Difficulty): Crossword {
  const count = d + 2;
  const maxSize = d === 2 ? 6 : 5;
  const pool = d === 0 ? byLength(3, 3) : byLength(3, 4);
  for (;;) {
    const first = pick(rng, pool);
    let entries: Omit<Entry, "num">[] = [{ word: first, r: 0, c: 0, dir: "across" }];
    for (let tries = 0; tries < 200 && entries.length < count; tries++) {
      const word = pick(rng, pool);
      if (entries.some((e) => e.word === word)) continue;
      const host = pick(rng, entries);
      const dir: Entry["dir"] = host.dir === "across" ? "down" : "across";
      const hostCells = host.word.split("").map((ch, k) => ({ ch, r: host.r + DELTA[host.dir][0] * k, c: host.c + DELTA[host.dir][1] * k }));
      const spots = hostCells.flatMap((h) =>
        word
          .split("")
          .map((ch, i) => (ch === h.ch ? { r: h.r - DELTA[dir][0] * i, c: h.c - DELTA[dir][1] * i } : null))
          .filter((x) => x !== null),
      );
      if (!spots.length) continue;
      const spot = pick(rng, spots);
      const next = [...entries, { word, r: spot.r, c: spot.c, dir }];
      if (!validCrossword(next)) continue;
      const rs = next.flatMap((e) => [e.r, e.r + (e.dir === "down" ? e.word.length - 1 : 0)]);
      const cs = next.flatMap((e) => [e.c, e.c + (e.dir === "across" ? e.word.length - 1 : 0)]);
      if (Math.max(...rs) - Math.min(...rs) + 1 > maxSize || Math.max(...cs) - Math.min(...cs) + 1 > maxSize) continue;
      entries = next;
    }
    if (entries.length < count) continue;
    // move to (0,0) and number the entries in reading order
    const minR = Math.min(...entries.map((e) => e.r));
    const minC = Math.min(...entries.map((e) => e.c));
    const shifted = entries.map((e) => ({ ...e, r: e.r - minR, c: e.c - minC }));
    const starts = [...new Set(shifted.map((e) => `${e.r},${e.c}`))].sort((a, b) => {
      const [ar, ac] = a.split(",").map(Number);
      const [br, bc] = b.split(",").map(Number);
      return ar - br || ac - bc;
    });
    const numbered = shifted.map((e) => ({ ...e, num: starts.indexOf(`${e.r},${e.c}`) + 1 }));
    const rows = Math.max(...numbered.map((e) => e.r + (e.dir === "down" ? e.word.length : 1)));
    const cols = Math.max(...numbered.map((e) => e.c + (e.dir === "across" ? e.word.length : 1)));
    return { rows, cols, entries: numbered.sort((a, b) => a.num - b.num || (a.dir === "across" ? -1 : 1)) };
  }
}

/** Letter tiles: every letter the crossword needs, plus two that it doesn't. */
export function crosswordTiles(rng: Rng, cw: Crossword): string[] {
  const needed = [...new Set(cw.entries.flatMap((e) => e.word.split("")))];
  const extra = shuffle(rng, "abcdefghijklmnoprstuvwy".split("").filter((c) => !needed.includes(c))).slice(0, 2);
  return shuffle(rng, [...needed, ...extra]);
}

export { rhymeOf };
