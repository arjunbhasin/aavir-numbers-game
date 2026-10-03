import { pick, randInt, shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";

export const ALL_COINS = [1, 2, 5, 10];
export const TOYS = ["ball", "teddy", "kite", "car", "duck", "rocket", "drum", "yoyo"] as const;
export type Toy = (typeof TOYS)[number];

export type ShopPuzzle =
  | { kind: "pay"; toy: Toy; price: number; coins: number[] }
  | { kind: "change"; toy: Toy; price: number; paid: number; answer: number; options: number[] };

export function makeShopPuzzle(rng: Rng, d: Difficulty): ShopPuzzle {
  const toy = pick(rng, TOYS);
  if (d === 0) return { kind: "pay", toy, price: randInt(rng, 3, 10), coins: [1, 2, 5] };
  if (d === 1) return { kind: "pay", toy, price: randInt(rng, 6, 20), coins: ALL_COINS };
  if (rng() < 0.5) return { kind: "pay", toy, price: randInt(rng, 11, 30), coins: ALL_COINS };
  const paid = pick(rng, [10, 20]);
  const price = randInt(rng, paid === 10 ? 2 : 11, paid - 1);
  const answer = paid - price;
  const near = [answer + 1, answer - 1, answer + 2, price].filter((n) => n > 0 && n !== answer && n <= paid);
  return { kind: "change", toy, price, paid, answer, options: shuffle(rng, [answer, ...shuffle(rng, [...new Set(near)]).slice(0, 2)]) };
}

export function payResult(price: number, tray: number[]): "exact" | "over" | "under" {
  const total = tray.reduce((a, b) => a + b, 0);
  return total === price ? "exact" : total > price ? "over" : "under";
}

/** "5 + 2 + 1 = 8" */
export function coinSentence(tray: number[]): string {
  const sorted = [...tray].sort((a, b) => b - a);
  return `${sorted.join(" + ")} = ${sorted.reduce((a, b) => a + b, 0)}`;
}
