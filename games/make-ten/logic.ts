import { randInt, shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";

export type TenPuzzle = { target: number; cards: number[]; dots: boolean };

/** Cards come in pairs that add up to the target, so any correct pair leaves a board that can still be cleared. */
export function makeTenPuzzle(rng: Rng, d: Difficulty): TenPuzzle {
  const target = d === 2 ? 20 : 10;
  const pairs = d === 0 ? 3 : d === 1 ? 5 : 4;
  const cards: number[] = [];
  const used = new Set<number>();
  while (cards.length < pairs * 2) {
    const a = d === 2 ? randInt(rng, 3, 17) : randInt(rng, 1, 9);
    const key = Math.min(a, target - a);
    // keep pairs different on small boards so each one is a new fact
    if (used.has(key) && used.size < (d === 2 ? 7 : 5)) continue;
    used.add(key);
    cards.push(a, target - a);
  }
  return { target, cards: shuffle(rng, cards), dots: d === 0 };
}

/** Every number has as many partners as copies of itself. */
export function isPairable(cards: number[], target: number): boolean {
  const count = new Map<number, number>();
  cards.forEach((c) => count.set(c, (count.get(c) ?? 0) + 1));
  for (const [n, k] of count) {
    if (n * 2 === target ? k % 2 !== 0 : count.get(target - n) !== k) return false;
  }
  return true;
}
