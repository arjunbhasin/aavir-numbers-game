import { methodFor, methodsFor, type Method } from "@/lib/abacus";
import { pick, randInt, shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";

function numberOptions(rng: Rng, answer: number, near: number[], count = 3, min = 0): number[] {
  const wrong = shuffle(rng, [...new Set(near)].filter((n) => n >= min && n !== answer));
  let k = 1;
  while (wrong.length < count - 1) {
    for (const n of [answer + k, answer - k]) if (n >= min && !wrong.includes(n) && n !== answer) wrong.push(n);
    k++;
  }
  return shuffle(rng, [answer, ...wrong.slice(0, count - 1)]);
}

/* ---------- Bead Reader ---------- */

export type BeadPuzzle = { mode: "read" | "set"; rods: number; value: number; options: number[] };

export function makeBeadPuzzle(rng: Rng, d: Difficulty, index: number): BeadPuzzle {
  const rods = d + 1;
  const value = randInt(rng, rods === 1 ? 1 : 10 ** (rods - 1), 10 ** rods - 1);
  // easily confused numbers: one bead off, or the 5-bead missing
  const near = [value + 1, value - 1, value + 5, value - 5, value + 10, value - 10];
  return { mode: index % 2 === 0 ? "read" : "set", rods, value, options: numberOptions(rng, value, near, 3, 0) };
}

/* ---------- Friend Finder ---------- */

export type FriendPuzzle = {
  kind: "little" | "big" | "little-formula" | "big-formula";
  n: number;
  answer: number;
  options: number[];
};

export function makeFriendPuzzle(rng: Rng, d: Difficulty): FriendPuzzle {
  const kind: FriendPuzzle["kind"] =
    d === 0 ? "little" : d === 1 ? "big" : pick(rng, ["little", "big", "little-formula", "big-formula"] as const);
  const little = kind.startsWith("little");
  const n = little ? randInt(rng, 1, 4) : randInt(rng, 1, 9);
  const answer = (little ? 5 : 10) - n;
  const pool = little ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // the classic mix-up is giving the other kind of friend
  const near = [n, little ? 10 - n : 5 - n, answer + 1, answer - 1].filter((x) => pool.includes(x));
  return { kind, n, answer, options: numberOptions(rng, answer, near, little ? 3 : 4, 1).filter((x) => x <= 9) };
}

/* ---------- Which Formula? ---------- */

export type FormulaPuzzle = { a: number; d: number; answer: Method; options: Method[] };

export function makeFormulaPuzzle(rng: Rng, diff: Difficulty): FormulaPuzzle {
  const allowed: Method[][] = [["direct", "little"], ["direct", "little", "big"], ["direct", "little", "big", "combo"]];
  // pick the method first so every kind comes up, then find a sum that needs it
  const want = pick(rng, diff === 2 ? ["little", "big", "combo", "combo", "direct"] : allowed[diff]) as Method;
  for (;;) {
    const a = randInt(rng, 0, 9);
    const d = randInt(rng, 1, 9);
    const m = methodFor(a, d);
    if (m !== want) continue;
    if (diff === 0 && a + d >= 10) continue;
    return { a, d, answer: m, options: methodsFor(d) };
  }
}

/* ---------- Abacus Sums ---------- */

export type SumPuzzle = { terms: number[]; rods: number; answer: number; method?: Method };

export const SUM_LEVELS: { title: string; hint: string }[] = [
  { title: "Direct", hint: "Just push the beads" },
  { title: "Little friends", hint: "+4 = +5 − 1 and friends" },
  { title: "Big friends", hint: "+9 = +10 − 1 and friends" },
  { title: "Big + little friends", hint: "+6 = +10 − 5 + 1 and friends" },
  { title: "Mixed", hint: "Any formula" },
  { title: "Three numbers", hint: "Add them one at a time" },
  { title: "Tens and ones", hint: "Two-digit plus one-digit" },
  { title: "Two-digit sums", hint: "Add the tens rod and the ones rod" },
];

export const SUMS_PER_LEVEL = 5;

export function makeSum(rng: Rng, level: number): SumPuzzle {
  const want: (Method | null)[] = ["direct", "little", "big", "combo", null];
  if (level <= 4) {
    for (;;) {
      const a = randInt(rng, level === 0 ? 0 : 1, 9);
      const d = randInt(rng, 1, 9);
      const m = methodFor(a, d);
      if (want[level] && m !== want[level]) continue;
      if (level === 4 && a + d < 3) continue;
      return { terms: [a, d], rods: 2, answer: a + d, method: m };
    }
  }
  if (level === 5) {
    const terms = [randInt(rng, 1, 9), randInt(rng, 1, 9), randInt(rng, 1, 9)];
    return { terms, rods: 2, answer: terms[0] + terms[1] + terms[2] };
  }
  if (level === 6) {
    const a = randInt(rng, 11, 89);
    const d = randInt(rng, 2, 9);
    return { terms: [a, d], rods: 2, answer: a + d, method: methodFor(a % 10, d) };
  }
  const a = randInt(rng, 11, 59);
  const b = randInt(rng, 11, 99 - a);
  return { terms: [a, b], rods: 3, answer: a + b };
}

/* ---------- Flash Abacus ---------- */

export type FlashPuzzle = { numbers: number[]; total: number; options: number[]; ms: number };

export function makeFlashPuzzle(rng: Rng, d: Difficulty): FlashPuzzle {
  const count = [3, 4, 5][d];
  const max = [4, 9, 9][d];
  const numbers = Array.from({ length: count }, () => randInt(rng, 1, max));
  const total = numbers.reduce((a, b) => a + b, 0);
  const near = [total + 1, total - 1, total + 2, total - numbers[count - 1], total + 5];
  return { numbers, total, options: numberOptions(rng, total, near, 3, 1), ms: [1600, 1300, 1000][d] };
}

/* ---------- Friend Pairs ---------- */

export type FriendCard = { id: number; n: number };

/** Cards whose numbers pair up into friends of `target` (5 or 10). */
export function makeFriendDeck(rng: Rng, target: 5 | 10, pairs: number): FriendCard[] {
  const firsts = target === 5 ? [1, 2, 1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const chosen = shuffle(rng, firsts).slice(0, pairs);
  const nums = chosen.flatMap((n) => [n, target - n]);
  return shuffle(rng, nums).map((n, id) => ({ id, n }));
}
