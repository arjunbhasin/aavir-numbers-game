import { bfs, DELTA, DIRS, type Dir } from "@/lib/grid";
import { makeRng } from "@/lib/random";

export type Board = { rows: number; cols: number; tiles: number[] }; // 0 = gap

export function solved(rows: number, cols: number): number[] {
  return [...Array.from({ length: rows * cols - 1 }, (_, i) => i + 1), 0];
}

export function isSolved(b: Board): boolean {
  return b.tiles.every((t, i) => t === (i === b.tiles.length - 1 ? 0 : i + 1));
}

/**
 * Arrow direction = the way a tile moves into the gap.
 * "left" slides the tile to the right of the gap leftwards.
 */
export function slide(b: Board, d: Dir): Board | null {
  const gap = b.tiles.indexOf(0);
  const gr = Math.floor(gap / b.cols);
  const gc = gap % b.cols;
  const fr = gr - DELTA[d].r;
  const fc = gc - DELTA[d].c;
  if (fr < 0 || fc < 0 || fr >= b.rows || fc >= b.cols) return null;
  const from = fr * b.cols + fc;
  const tiles = [...b.tiles];
  tiles[gap] = tiles[from];
  tiles[from] = 0;
  return { ...b, tiles };
}

/** Which direction moves the tile at `index` into the gap, if it is next to it. */
export function dirForTile(b: Board, index: number): Dir | null {
  for (const d of DIRS) {
    const n = slide(b, d);
    if (n && n.tiles[index] === 0) return d;
  }
  return null;
}

/** Random walk from the solved board: always solvable. */
export function shuffled(rows: number, cols: number, moves: number, seed: number): Board {
  const rng = makeRng(seed);
  let b: Board = { rows, cols, tiles: solved(rows, cols) };
  let last: Dir | null = null;
  const opposite: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };
  for (let i = 0; i < moves; i++) {
    const options = DIRS.filter((d) => d !== (last && opposite[last]) && slide(b, d));
    const d = options[Math.floor(rng() * options.length)];
    b = slide(b, d)!;
    last = d;
  }
  if (isSolved(b)) return shuffled(rows, cols, moves, seed + 1);
  return b;
}

export function solve(b: Board): Dir[] | null {
  return bfs<Board, Dir>(
    b,
    (x) => x.tiles.join(","),
    (x) => DIRS.flatMap((d) => {
      const n = slide(x, d);
      return n ? [[d, n] as [Dir, Board]] : [];
    }),
    isSolved,
  );
}
