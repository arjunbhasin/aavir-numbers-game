import { KEY_COLORS, type KeyColor } from "@/components/grid/Sprites";
import { bfs, DIRS, parseRows, posKey, samePos, step, type Dir, type Pos } from "@/lib/grid";

export type Tile = "wall" | "path";
export type Item = { kind: "key" | "door"; color: KeyColor; pos: Pos; id: number };

export type Level = {
  rows: number;
  cols: number;
  tiles: Tile[][];
  items: Item[];
  start: Pos;
  treasure: Pos;
  /** one-way tiles: you may only step onto them moving in this direction */
  arrows: (Dir | null)[][];
};

export type State = {
  pos: Pos;
  facing: Dir;
  /** ids of keys picked up and doors opened */
  used: number[];
  /** keys in the backpack (each key opens one door of its color) */
  bag: KeyColor[];
};

const COLORS = Object.keys(KEY_COLORS) as KeyColor[];

const ARROWS: Record<string, Dir> = { "^": "up", v: "down", "<": "left", ">": "right" };

/**
 * Map format:  #  hedge   (space) path   @  start   T  treasure
 *              r b y  keys (red, blue, yellow)   R B Y  matching doors
 *              ^ v < >  one-way path: you can only walk onto it going that way
 */
export function parseLevel(text: string): Level {
  const grid = parseRows(text);
  const items: Item[] = [];
  let start: Pos = { r: 0, c: 0 };
  let treasure: Pos = { r: 0, c: 0 };
  const tiles = grid.map((row, r) =>
    row.map((ch, c): Tile => {
      if (ch === "#") return "wall";
      if (ch === "@") start = { r, c };
      if (ch === "T") treasure = { r, c };
      const lower = ch.toLowerCase() as KeyColor;
      if (COLORS.includes(lower)) items.push({ kind: ch === lower ? "key" : "door", color: lower, pos: { r, c }, id: items.length });
      return "path";
    }),
  );
  const arrows = grid.map((row) => row.map((ch) => ARROWS[ch] ?? null));
  return { rows: grid.length, cols: grid[0].length, tiles, items, start, treasure, arrows };
}

export type MoveResult = { state: State; event: "step" | "key" | "door" } | { state: null; event: "wall" | "locked" | "oneway" };

export function move(level: Level, s: State, d: Dir): MoveResult {
  const next = step(s.pos, d);
  if (next.r < 0 || next.c < 0 || next.r >= level.rows || next.c >= level.cols || level.tiles[next.r][next.c] === "wall") {
    return { state: null, event: "wall" };
  }
  const arrow = level.arrows[next.r][next.c];
  if (arrow && arrow !== d) return { state: null, event: "oneway" };
  const item = level.items.find((it) => samePos(it.pos, next) && !s.used.includes(it.id));
  if (!item) return { state: { ...s, pos: next, facing: d }, event: "step" };
  if (item.kind === "key") {
    return { state: { pos: next, facing: d, used: [...s.used, item.id], bag: [...s.bag, item.color] }, event: "key" };
  }
  const k = s.bag.indexOf(item.color);
  if (k === -1) return { state: null, event: "locked" };
  const bag = s.bag.filter((_, i) => i !== k);
  return { state: { pos: next, facing: d, used: [...s.used, item.id], bag }, event: "door" };
}

export function startState(level: Level): State {
  return { pos: level.start, facing: "down", used: [], bag: [] };
}

/** Fewest moves to the treasure from `from` (the start by default), or null if it can't be reached. */
export function solve(level: Level, from: State = startState(level)): Dir[] | null {
  const key = (s: State) => posKey(s.pos) + "|" + [...s.used].sort((a, b) => a - b).join(",");
  return bfs<State, Dir>(
    from,
    key,
    (s) =>
      DIRS.flatMap((d) => {
        const res = move(level, s, d);
        return res.state ? [[d, res.state] as [Dir, State]] : [];
      }),
    (s) => samePos(s.pos, level.treasure),
  );
}
