import { pick, randInt, shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";

export type BugPuzzle = {
  layout: "groups" | "array";
  groups: number; // groups, or rows in an array
  each: number; // bugs per group, or per row
  total: number;
  options: number[];
  /** how long the bugs stay visible, in milliseconds */
  showMs: number;
};

export function makeBugPuzzle(rng: Rng, d: Difficulty): BugPuzzle {
  let layout: BugPuzzle["layout"];
  let groups: number;
  let each: number;
  if (d === 0) {
    layout = "groups";
    each = pick(rng, [2, 5, 10]);
    groups = randInt(rng, 2, each === 10 ? 3 : 4);
  } else if (d === 1) {
    layout = rng() < 0.5 ? "array" : "groups";
    each = pick(rng, [2, 3, 4, 5]);
    groups = randInt(rng, 2, 5);
  } else {
    layout = "array";
    each = pick(rng, [3, 4, 5, 6]);
    groups = randInt(rng, 3, each === 6 ? 4 : 5);
  }
  const total = groups * each;
  // wrong answers are one group too many or too few, or a near miss from counting
  const candidates = [total + each, total - each, total + 1, total - 1, total + 2].filter((n) => n > 0 && n !== total);
  const wrong = shuffle(rng, [...new Set(candidates)]).slice(0, 2);
  return { layout, groups, each, total, options: shuffle(rng, [total, ...wrong]), showMs: [3000, 2500, 2000][d] };
}

/** "3 groups of 5 = 15" or "3 rows of 5 = 15" */
export function bugSentence(p: BugPuzzle): string {
  return `${p.groups} ${p.layout === "array" ? "rows" : "groups"} of ${p.each} = ${p.total}`;
}
