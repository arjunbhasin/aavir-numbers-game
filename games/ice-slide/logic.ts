import { bfs, DIRS, parseRows, posKey, samePos, step, type Dir, type Pos } from "@/lib/grid";

export type Tile = "ice" | "rock" | "snow";

export type Level = {
  rows: number;
  cols: number;
  tiles: Tile[][];
  start: Pos;
  fish: Pos;
};

/**
 * Map format:  #  rock   (space) ice   _  snow (stops sliding)
 *              @  penguin start        F  fish (the goal; you must stop on it)
 */
export function parseLevel(text: string): Level {
  const grid = parseRows(text);
  let start: Pos = { r: 0, c: 0 };
  let fish: Pos = { r: 0, c: 0 };
  const tiles = grid.map((row, r) =>
    row.map((ch, c): Tile => {
      if (ch === "@") start = { r, c };
      if (ch === "F") fish = { r, c };
      if (ch === "#") return "rock";
      if (ch === "_") return "snow";
      return "ice";
    }),
  );
  return { rows: grid.length, cols: grid[0].length, tiles, start, fish };
}

function blocked(level: Level, p: Pos): boolean {
  return p.r < 0 || p.c < 0 || p.r >= level.rows || p.c >= level.cols || level.tiles[p.r][p.c] === "rock";
}

/** Slide until hitting a rock or the edge, or stopping on snow. Returns the path (excluding start). */
export function slide(level: Level, from: Pos, d: Dir): Pos[] {
  const path: Pos[] = [];
  let cur = from;
  for (;;) {
    const next = step(cur, d);
    if (blocked(level, next)) break;
    path.push(next);
    cur = next;
    if (level.tiles[cur.r][cur.c] === "snow") break;
  }
  return path;
}

export function solve(level: Level): Dir[] | null {
  return bfs<Pos, Dir>(
    level.start,
    posKey,
    (p) =>
      DIRS.flatMap((d) => {
        const path = slide(level, p, d);
        return path.length ? [[d, path[path.length - 1]] as [Dir, Pos]] : [];
      }),
    (p) => samePos(p, level.fish),
  );
}
