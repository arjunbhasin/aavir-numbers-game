import { bfs, DIRS, parseRows, posKey, samePos, step, type Dir, type Pos } from "@/lib/grid";

export type Level = {
  rows: number;
  cols: number;
  blocked: boolean[][];
  start: Pos;
  battery: Pos;
  gems: Pos[];
};

/** Map format:  #  puddle (can't walk)   @  robot   B  battery   *  gem to collect first */
export function parseLevel(text: string): Level {
  const grid = parseRows(text);
  let start: Pos = { r: 0, c: 0 };
  let battery: Pos = { r: 0, c: 0 };
  const gems: Pos[] = [];
  const blocked = grid.map((row, r) =>
    row.map((ch, c) => {
      if (ch === "@") start = { r, c };
      if (ch === "B") battery = { r, c };
      if (ch === "*") gems.push({ r, c });
      return ch === "#";
    }),
  );
  return { rows: grid.length, cols: grid[0].length, blocked, start, battery, gems };
}

export function canEnter(level: Level, p: Pos): boolean {
  return p.r >= 0 && p.c >= 0 && p.r < level.rows && p.c < level.cols && !level.blocked[p.r][p.c];
}

export type RunStep = { pos: Pos; dir: Dir; ok: boolean; got: number[] };

/** Play a program step by step. Stops at the first bump. */
export function run(level: Level, program: Dir[]): { steps: RunStep[]; success: boolean } {
  let pos = level.start;
  const got = new Set<number>();
  const steps: RunStep[] = [];
  for (const d of program) {
    const next = step(pos, d);
    if (!canEnter(level, next)) {
      steps.push({ pos, dir: d, ok: false, got: [...got] });
      return { steps, success: false };
    }
    pos = next;
    level.gems.forEach((g, i) => samePos(g, pos) && got.add(i));
    steps.push({ pos, dir: d, ok: true, got: [...got] });
  }
  return { steps, success: samePos(pos, level.battery) && got.size === level.gems.length };
}

export function solve(level: Level): Dir[] | null {
  type S = { pos: Pos; mask: number };
  const gemMask = (p: Pos, mask: number) => level.gems.reduce((m, g, i) => (samePos(g, p) ? m | (1 << i) : m), mask);
  const all = (1 << level.gems.length) - 1;
  return bfs<S, Dir>(
    { pos: level.start, mask: 0 },
    (s) => posKey(s.pos) + "|" + s.mask,
    (s) =>
      DIRS.flatMap((d) => {
        const n = step(s.pos, d);
        return canEnter(level, n) ? [[d, { pos: n, mask: gemMask(n, s.mask) }] as [Dir, S]] : [];
      }),
    (s) => s.mask === all && samePos(s.pos, level.battery),
  );
}
