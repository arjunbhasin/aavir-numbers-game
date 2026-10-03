import { DIRS, step, type Dir, type Pos } from "@/lib/grid";
import { randInt, shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";

export type PathPuzzle = { size: number; start: Pos; dirs: Dir[] };

/** A random walk that never leaves the grid or crosses itself. */
export function makePath(rng: Rng, d: Difficulty): PathPuzzle {
  const size = [4, 5, 6][d];
  const steps = [3, 5, 7][d];
  for (;;) {
    const start = { r: randInt(rng, 0, size - 1), c: randInt(rng, 0, size - 1) };
    const seen = new Set([`${start.r},${start.c}`]);
    const dirs: Dir[] = [];
    let cur = start;
    while (dirs.length < steps) {
      const options = shuffle(rng, DIRS).filter((dd) => {
        const n = step(cur, dd);
        return n.r >= 0 && n.c >= 0 && n.r < size && n.c < size && !seen.has(`${n.r},${n.c}`);
      });
      if (!options.length) break;
      cur = step(cur, options[0]);
      seen.add(`${cur.r},${cur.c}`);
      dirs.push(options[0]);
    }
    if (dirs.length === steps) return { size, start, dirs };
  }
}

export function pathCells(p: PathPuzzle): Pos[] {
  const cells = [p.start];
  for (const d of p.dirs) cells.push(step(cells[cells.length - 1], d));
  return cells;
}
