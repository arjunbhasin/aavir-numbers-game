import { randInt, shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";

export type BalancePuzzle = { left: number[]; right: number[]; answer: number; options: number[] };

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Left pan is full; the right pan is missing one block. Which block makes them balance? */
export function makeBalancePuzzle(rng: Rng, d: Difficulty): BalancePuzzle {
  for (;;) {
    const max = [10, 15, 20][d];
    const leftCount = d + 1;
    const left = Array.from({ length: leftCount }, () => randInt(rng, 1, Math.floor(max / leftCount)));
    const total = sum(left);
    if (total < 3 || total > max) continue;
    const known = randInt(rng, 1, total - 1);
    const answer = total - known;
    const near = [answer - 1, answer + 1, answer + 2, answer - 2, known].filter((n) => n > 0 && n !== answer);
    const wrong = shuffle(rng, [...new Set(near)]).slice(0, d === 0 ? 2 : 3);
    return { left, right: [known], answer, options: shuffle(rng, [answer, ...wrong]) };
  }
}

export function tilt(p: BalancePuzzle, guess: number | null): -1 | 0 | 1 {
  const l = sum(p.left);
  const r = sum(p.right) + (guess ?? 0);
  return l === r ? 0 : l > r ? -1 : 1;
}
