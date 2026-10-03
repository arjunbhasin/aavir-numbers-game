export type HopLevel = {
  kind: "hop";
  length: number;
  carrots: number[];
  puddles: number[];
  /** fixed hop size, or null when the child picks one of `choices` */
  size: number | null;
  choices: number[];
};

export type PredictLevel = {
  kind: "predict";
  length: number;
  size: number;
  carrot: number;
  choices: number[];
};

export type Level = HopLevel | PredictLevel;

/** A hop size works if every carrot is a landing spot and no puddle is landed on before the last carrot. */
export function sizeWorks(level: HopLevel, size: number): boolean {
  const last = Math.max(...level.carrots);
  if (last > level.length) return false;
  if (!level.carrots.every((c) => c % size === 0)) return false;
  return !level.puddles.some((p) => p % size === 0 && p < last);
}

export function validSizes(level: HopLevel): number[] {
  const options = level.size !== null ? [level.size] : level.choices;
  return options.filter((s) => sizeWorks(level, s));
}

/** Where a hop from `pos` lands, and whether it is allowed. */
export function hop(level: HopLevel, pos: number, size: number, dir: 1 | -1): { to: number; result: "ok" | "edge" | "puddle" } {
  const to = pos + size * dir;
  if (to < 0 || to > level.length) return { to: pos, result: "edge" };
  if (level.puddles.includes(to)) return { to, result: "puddle" };
  return { to, result: "ok" };
}

/** "3 + 3 + 3 = 9" */
export function addSentence(size: number, hops: number): string {
  if (hops === 0) return "0";
  return `${Array.from({ length: hops }, () => size).join(" + ")} = ${size * hops}`;
}
