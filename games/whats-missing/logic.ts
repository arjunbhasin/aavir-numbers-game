import { shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";

export type MissingPuzzle = {
  shown: number[]; // picture ids on the tray
  missing: number; // the one that goes away
  after: number[]; // the tray afterwards
  options: number[];
  showMs: number;
};

export function makeMissingPuzzle(rng: Rng, d: Difficulty, pictureCount: number): MissingPuzzle {
  const k = [4, 6, 8][d];
  const pool = shuffle(rng, Array.from({ length: pictureCount }, (_, i) => i));
  const shown = pool.slice(0, k);
  const missing = shown[Math.floor(rng() * k)];
  const rest = shown.filter((p) => p !== missing);
  // hard: the toys also get mixed up, so position doesn't give it away
  const after = d === 2 ? shuffle(rng, rest) : shown.map((p) => (p === missing ? -1 : p));
  // wrong options: toys that are still there, and one that was never there
  const wrong = [...shuffle(rng, rest).slice(0, d === 0 ? 1 : 2), pool[k]];
  return { shown, missing, after, options: shuffle(rng, [missing, ...wrong]), showMs: [5000, 6000, 7000][d] };
}
