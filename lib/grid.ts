export type Dir = "up" | "down" | "left" | "right";
export type Pos = { r: number; c: number };

export const DIRS: Dir[] = ["up", "down", "left", "right"];

export const DELTA: Record<Dir, Pos> = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
};

export function step(p: Pos, d: Dir, n = 1): Pos {
  return { r: p.r + DELTA[d].r * n, c: p.c + DELTA[d].c * n };
}

export function samePos(a: Pos, b: Pos): boolean {
  return a.r === b.r && a.c === b.c;
}

export function posKey(p: Pos): string {
  return `${p.r},${p.c}`;
}

/** Split a level drawing into equal-width rows (pads short rows with spaces). */
export function parseRows(text: string): string[][] {
  const lines = text.replace(/^\n+/, "").replace(/\n+$/, "").split("\n");
  const width = Math.max(...lines.map((l) => l.length));
  return lines.map((l) => l.padEnd(width, " ").split(""));
}

/**
 * Breadth-first search over game states. Returns the shortest list of moves
 * from `start` to a goal state, or null if unsolvable within `limit` states.
 */
export function bfs<S, M>(
  start: S,
  key: (s: S) => string,
  next: (s: S) => Array<[M, S]>,
  isGoal: (s: S) => boolean,
  limit = 2_000_000,
): M[] | null {
  if (isGoal(start)) return [];
  const seen = new Map<string, { prev: string | null; move: M | null }>();
  const startKey = key(start);
  seen.set(startKey, { prev: null, move: null });
  let frontier: Array<[S, string]> = [[start, startKey]];
  while (frontier.length && seen.size < limit) {
    const nextFrontier: Array<[S, string]> = [];
    for (const [s, k] of frontier) {
      for (const [m, ns] of next(s)) {
        const nk = key(ns);
        if (seen.has(nk)) continue;
        seen.set(nk, { prev: k, move: m });
        if (isGoal(ns)) {
          const path: M[] = [];
          let cur: string | null = nk;
          while (cur) {
            const node: { prev: string | null; move: M | null } = seen.get(cur)!;
            if (node.move !== null) path.push(node.move);
            cur = node.prev;
          }
          return path.reverse();
        }
        nextFrontier.push([ns, nk]);
      }
    }
    frontier = nextFrontier;
  }
  return null;
}

/** 3 stars at or under par, 2 within 1.5x par, otherwise 1. */
export function starsForMoves(moves: number, par: number): number {
  if (moves <= par) return 3;
  if (moves <= Math.ceil(par * 1.5)) return 2;
  return 1;
}
