import { bfs, DIRS, parseRows, posKey, step, type Dir, type Pos } from "@/lib/grid";

export type Cell = "wall" | "floor" | "void";

export type Level = {
  rows: number;
  cols: number;
  cells: Cell[][];
  goals: Pos[];
  start: State;
};

export type State = {
  player: Pos;
  boxes: Pos[];
  facing: Dir;
};

/**
 * Sokoban text format:
 *   #  wall      .  goal      $  box      *  box on goal
 *   @  player    +  player on goal        space  floor
 * Spaces not reachable by the player are drawn as empty background.
 */
export function parseLevel(text: string): Level {
  const grid = parseRows(text);
  const rows = grid.length;
  const cols = grid[0].length;
  const goals: Pos[] = [];
  const boxes: Pos[] = [];
  let player: Pos = { r: 0, c: 0 };
  const cells: Cell[][] = grid.map((row, r) =>
    row.map((ch, c) => {
      if (ch === "#") return "wall";
      if (ch === "." || ch === "*" || ch === "+") goals.push({ r, c });
      if (ch === "$" || ch === "*") boxes.push({ r, c });
      if (ch === "@" || ch === "+") player = { r, c };
      return "void";
    }),
  );
  // flood fill from the player to find the inside floor
  const stack = [player];
  while (stack.length) {
    const p = stack.pop()!;
    if (p.r < 0 || p.c < 0 || p.r >= rows || p.c >= cols) continue;
    if (cells[p.r][p.c] !== "void") continue;
    cells[p.r][p.c] = "floor";
    for (const d of DIRS) stack.push(step(p, d));
  }
  return { rows, cols, cells, goals, start: { player, boxes, facing: "down" } };
}

function isOpen(level: Level, p: Pos): boolean {
  return p.r >= 0 && p.c >= 0 && p.r < level.rows && p.c < level.cols && level.cells[p.r][p.c] === "floor";
}

export type MoveResult = { state: State; pushed: boolean } | null;

export function move(level: Level, s: State, d: Dir): MoveResult {
  const next = step(s.player, d);
  if (!isOpen(level, next)) return null;
  const boxIdx = s.boxes.findIndex((b) => b.r === next.r && b.c === next.c);
  if (boxIdx === -1) return { state: { ...s, player: next, facing: d }, pushed: false };
  const beyond = step(next, d);
  if (!isOpen(level, beyond) || s.boxes.some((b) => b.r === beyond.r && b.c === beyond.c)) return null;
  const boxes = s.boxes.map((b, i) => (i === boxIdx ? beyond : b));
  return { state: { player: next, boxes, facing: d }, pushed: true };
}

export function isGoal(level: Level, p: Pos): boolean {
  return level.goals.some((g) => g.r === p.r && g.c === p.c);
}

export function isSolved(level: Level, s: State): boolean {
  return s.boxes.every((b) => isGoal(level, b));
}

/** Fewest moves to solve, or null if impossible. */
export function solve(level: Level): Dir[] | null {
  const key = (s: State) => posKey(s.player) + "|" + s.boxes.map(posKey).sort().join(";");
  return bfs<State, Dir>(
    level.start,
    key,
    (s) =>
      DIRS.flatMap((d) => {
        const res = move(level, s, d);
        return res ? [[d, res.state] as [Dir, State]] : [];
      }),
    (s) => isSolved(level, s),
  );
}
