import { randInt, shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";

export type MunchPuzzle =
  | { kind: "left"; start: number; eaten: number; answer: number; options: number[] }
  | { kind: "eaten"; start: number; left: number; answer: number; options: number[] }
  | { kind: "compare"; a: number; b: number; answer: number; options: number[] };

function options(rng: Rng, answer: number, extra: number[]): number[] {
  const near = [...new Set([answer + 1, answer - 1, answer + 2, ...extra])].filter((n) => n >= 0 && n !== answer);
  return shuffle(rng, [answer, ...shuffle(rng, near).slice(0, 2)]);
}

export function makeMunchPuzzle(rng: Rng, d: Difficulty): MunchPuzzle {
  const kind = d === 0 ? "left" : d === 1 ? (rng() < 0.5 ? "left" : "eaten") : rng() < 0.5 ? "compare" : "eaten";
  const max = [10, 15, 20][d];
  if (kind === "compare") {
    const a = randInt(rng, 6, max);
    const b = randInt(rng, 2, a - 1);
    return { kind, a, b, answer: a - b, options: options(rng, a - b, [a + b, b]) };
  }
  const start = randInt(rng, d === 0 ? 3 : 6, max);
  const eaten = randInt(rng, 1, start - 1);
  if (kind === "left") return { kind, start, eaten, answer: start - eaten, options: options(rng, start - eaten, [start + eaten, eaten]) };
  return { kind, start, left: start - eaten, answer: eaten, options: options(rng, eaten, [start, start - eaten]) };
}

export function munchSentence(p: MunchPuzzle): string {
  if (p.kind === "left") return `${p.start} − ${p.eaten} = ${p.answer}`;
  if (p.kind === "eaten") return `${p.start} − ${p.answer} = ${p.left}`;
  return `${p.a} − ${p.b} = ${p.answer}`;
}
