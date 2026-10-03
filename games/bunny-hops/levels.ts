import type { Level } from "./logic";

/** Easiest first. Tests check every hop level has exactly one hop size that works. */
export const LEVELS: Level[] = [
  { kind: "hop", length: 10, carrots: [6], puddles: [], size: 2, choices: [] },
  { kind: "hop", length: 20, carrots: [15], puddles: [], size: 5, choices: [] },
  { kind: "hop", length: 30, carrots: [30], puddles: [], size: 10, choices: [] },
  { kind: "hop", length: 15, carrots: [12], puddles: [], size: 3, choices: [] },
  { kind: "predict", length: 10, size: 2, carrot: 8, choices: [3, 4, 5] },
  { kind: "hop", length: 12, carrots: [10], puddles: [4], size: null, choices: [2, 3, 5] },
  { kind: "predict", length: 20, size: 5, carrot: 20, choices: [3, 4, 5] },
  { kind: "hop", length: 14, carrots: [12], puddles: [8], size: null, choices: [2, 3, 4] },
  { kind: "hop", length: 12, carrots: [6, 9], puddles: [], size: null, choices: [2, 3, 4] },
  { kind: "predict", length: 20, size: 3, carrot: 18, choices: [5, 6, 7] },
  { kind: "hop", length: 14, carrots: [8, 12], puddles: [6], size: null, choices: [2, 3, 4] },
  { kind: "hop", length: 20, carrots: [12, 18], puddles: [4, 15], size: null, choices: [2, 3, 4, 6] },
];
