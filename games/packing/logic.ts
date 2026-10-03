import { bfs, DIRS, parseRows, posKey, samePos, step, type Dir, type Pos } from "@/lib/grid";

export type Box = { pos: Pos; capacity: number };

export type Level = {
  rows: number;
  cols: number;
  walls: boolean[][];
  boxes: Box[];
  start: State;
};

export type EggPos = Pos & { id: number };

export type State = {
  player: Pos;
  eggs: EggPos[];
  /** eggs inside each box, same order as level.boxes */
  fills: number[];
  facing: Dir;
};

/**
 * Map format:  #  wall   (space) floor   @  robot   o  egg
 *              2-6  an egg box holding that many eggs
 * Win: every egg is packed and no box is left half full.
 */
export function parseLevel(text: string): Level {
  const grid = parseRows(text);
  const boxes: Box[] = [];
  const eggs: EggPos[] = [];
  let player: Pos = { r: 0, c: 0 };
  const walls = grid.map((row, r) =>
    row.map((ch, c) => {
      if (ch === "@") player = { r, c };
      if (ch === "o") eggs.push({ r, c, id: eggs.length });
      if (/[2-6]/.test(ch)) boxes.push({ pos: { r, c }, capacity: Number(ch) });
      return ch === "#";
    }),
  );
  return {
    rows: grid.length,
    cols: grid[0].length,
    walls,
    boxes,
    start: { player, eggs, fills: boxes.map(() => 0), facing: "down" },
  };
}

function inside(level: Level, p: Pos) {
  return p.r >= 0 && p.c >= 0 && p.r < level.rows && p.c < level.cols;
}

export type MoveResult = { state: State; event: "step" | "push" | "pack" | "full" } | null;

export function move(level: Level, s: State, d: Dir): MoveResult {
  const next = step(s.player, d);
  if (!inside(level, next) || level.walls[next.r][next.c]) return null;
  if (level.boxes.some((b) => samePos(b.pos, next))) return null; // boxes are solid
  const eggIdx = s.eggs.findIndex((e) => samePos(e, next));
  if (eggIdx === -1) return { state: { ...s, player: next, facing: d }, event: "step" };

  const beyond = step(next, d);
  if (!inside(level, beyond) || level.walls[beyond.r][beyond.c]) return null;
  if (s.eggs.some((e) => samePos(e, beyond))) return null;
  const boxIdx = level.boxes.findIndex((b) => samePos(b.pos, beyond));
  if (boxIdx !== -1) {
    if (s.fills[boxIdx] >= level.boxes[boxIdx].capacity) return null;
    const fills = s.fills.map((f, i) => (i === boxIdx ? f + 1 : f));
    const eggs = s.eggs.filter((_, i) => i !== eggIdx);
    const full = fills[boxIdx] === level.boxes[boxIdx].capacity;
    return { state: { player: next, eggs, fills, facing: d }, event: full ? "full" : "pack" };
  }
  const eggs = s.eggs.map((e, i) => (i === eggIdx ? { ...beyond, id: e.id } : e));
  return { state: { ...s, player: next, eggs, facing: d }, event: "push" };
}

export function isSolved(level: Level, s: State): boolean {
  return s.eggs.length === 0 && s.fills.every((f, i) => f === 0 || f === level.boxes[i].capacity);
}

/** True when the level can no longer be won: a box is half full and no eggs are left. */
export function isStuck(level: Level, s: State): boolean {
  return s.eggs.length === 0 && !isSolved(level, s);
}

export function solve(level: Level): Dir[] | null {
  const key = (s: State) => `${posKey(s.player)}|${s.eggs.map(posKey).sort().join(";")}|${s.fills.join(",")}`;
  return bfs<State, Dir>(
    level.start,
    key,
    (s) =>
      DIRS.flatMap((d) => {
        const r = move(level, s, d);
        return r ? [[d, r.state] as [Dir, State]] : [];
      }),
    (s) => isSolved(level, s),
  );
}

/** "3 + 3 + 3 + 2 = 11" for the boxes that were filled. */
export function packSentence(level: Level, s: State): string {
  const used = level.boxes.filter((_, i) => s.fills[i] > 0).map((b) => b.capacity);
  const total = used.reduce((a, b) => a + b, 0);
  if (used.every((c) => c === used[0])) return `${total} eggs ÷ ${used[0]} = ${used.length} ${used.length === 1 ? "box" : "boxes"}`;
  return `${used.join(" + ")} = ${total} eggs`;
}
