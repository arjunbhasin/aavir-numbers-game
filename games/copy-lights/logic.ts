import { randInt, type Rng } from "@/lib/random";

/** Pads are 0 up, 1 right, 2 down, 3 left. Never three of the same pad in a row. */
export function extendSequence(rng: Rng, seq: number[]): number[] {
  for (;;) {
    const n = randInt(rng, 0, 3);
    const k = seq.length;
    if (k >= 2 && seq[k - 1] === n && seq[k - 2] === n) continue;
    return [...seq, n];
  }
}
