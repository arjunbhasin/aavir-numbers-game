import { bfs, DIRS, parseRows, posKey, samePos, step, type Dir, type Pos } from "@/lib/grid";

export type Stone = { pos: Pos; value: number };

export type Level = {
  rows: number;
  cols: number;
  walls: boolean[][];
  stones: Stone[];
  start: Pos;
  flag: Pos;
  target: number;
};

export type State = { pos: Pos; used: number[]; total: number; facing: Dir };

/**
 * Map format:  #  bush   (space) grass   @  robot   F  flag
 *              1-9  stone that adds   a-e  stone that takes away 1-5
 */
export function parseLevel(text: string, target: number): Level {
  const grid = parseRows(text);
  const stones: Stone[] = [];
  let start: Pos = { r: 0, c: 0 };
  let flag: Pos = { r: 0, c: 0 };
  const walls = grid.map((row, r) =>
    row.map((ch, c) => {
      if (ch === "@") start = { r, c };
      if (ch === "F") flag = { r, c };
      if (/[1-9]/.test(ch)) stones.push({ pos: { r, c }, value: Number(ch) });
      if (/[a-e]/.test(ch)) stones.push({ pos: { r, c }, value: -(ch.charCodeAt(0) - 96) });
      return ch === "#";
    }),
  );
  return { rows: grid.length, cols: grid[0].length, walls, stones, start, flag, target };
}

export const startState = (l: Level): State => ({ pos: l.start, used: [], total: 0, facing: "down" });

export type MoveResult =
  | { state: State; event: "step" | "stone" | "flag" }
  | { state: null; event: "wall" | "wrong-total" };

export function move(level: Level, s: State, d: Dir): MoveResult {
  const next = step(s.pos, d);
  if (next.r < 0 || next.c < 0 || next.r >= level.rows || next.c >= level.cols || level.walls[next.r][next.c]) {
    return { state: null, event: "wall" };
  }
  if (samePos(next, level.flag)) {
    if (s.total !== level.target) return { state: null, event: "wrong-total" };
    return { state: { ...s, pos: next, facing: d }, event: "flag" };
  }
  const i = level.stones.findIndex((st) => samePos(st.pos, next));
  if (i !== -1 && !s.used.includes(i)) {
    return { state: { pos: next, facing: d, used: [...s.used, i], total: s.total + level.stones[i].value }, event: "stone" };
  }
  return { state: { ...s, pos: next, facing: d }, event: "step" };
}

export const isSolved = (level: Level, s: State) => samePos(s.pos, level.flag);

export function solve(level: Level, limit?: number): Dir[] | null {
  return bfs<State, Dir>(
    startState(level),
    (s) => `${posKey(s.pos)}|${[...s.used].sort((a, b) => a - b).join(",")}`,
    (s) =>
      DIRS.flatMap((d) => {
        const r = move(level, s, d);
        return r.state ? [[d, r.state] as [Dir, State]] : [];
      }),
    (s) => isSolved(level, s),
    limit,
  );
}

/** "3 + 4 − 2 = 5" */
export function pathSentence(level: Level, used: number[]): string {
  if (!used.length) return "0";
  const parts = used.map((i, k) => {
    const v = level.stones[i].value;
    return k === 0 ? (v < 0 ? `0 − ${-v}` : `${v}`) : v < 0 ? `− ${-v}` : `+ ${v}`;
  });
  const total = used.reduce((a, i) => a + level.stones[i].value, 0);
  return `${parts.join(" ")} = ${total}`;
}
