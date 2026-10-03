import { randInt, shuffle, type Rng } from "@/lib/random";

export type NumberGrid = {
  rows: (number | null)[][];
  /** missing number for each row, in row order */
  answers: number[];
  /** the buttons to pick from */
  choices: number[];
};

/** Numbers 1..max laid out in rows of `width`, one hidden in each row. */
export function makeNumberGrid(rng: Rng, max: number, width: number): NumberGrid {
  const rows: (number | null)[][] = [];
  const answers: number[] = [];
  for (let start = 1; start <= max; start += width) {
    const row = Array.from({ length: Math.min(width, max - start + 1) }, (_, i) => start + i);
    const hide = randInt(rng, 0, row.length - 1);
    answers.push(row[hide]);
    rows.push(row.map((n, i) => (i === hide ? null : n)));
  }
  return { rows, answers, choices: shuffle(rng, answers) };
}

export type Scatter = { value: number; x: number; y: number; rotate: number; size: number; color: number }[];

/**
 * Numbers 1..count spread over a box without overlapping:
 * each number gets its own cell of a grid, then a little random wiggle inside it.
 */
export function scatterNumbers(rng: Rng, count: number, aspect: number, wiggle: number): Scatter {
  const cols = Math.ceil(Math.sqrt(count * aspect));
  const rows = Math.ceil(count / cols);
  const cells = shuffle(
    rng,
    Array.from({ length: cols * rows }, (_, i) => i),
  ).slice(0, count);
  return cells.map((cell, i) => {
    const r = Math.floor(cell / cols);
    const c = cell % cols;
    return {
      value: i + 1,
      x: ((c + 0.5 + (rng() - 0.5) * wiggle) / cols) * 100,
      y: ((r + 0.5 + (rng() - 0.5) * wiggle) / rows) * 100,
      rotate: (rng() - 0.5) * 40 * wiggle,
      size: 0.85 + rng() * 0.4 * wiggle,
      color: randInt(rng, 0, 5),
    };
  });
}
