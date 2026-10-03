import type { Level } from "./logic";

export const LEVELS: Level[] = [
  { kind: "share", cookies: 6, plates: 2 },
  { kind: "share", cookies: 8, plates: 4 },
  { kind: "share", cookies: 9, plates: 3 },
  { kind: "share", cookies: 7, plates: 2 },
  { kind: "share", cookies: 12, plates: 3 },
  { kind: "share", cookies: 10, plates: 4 },
  { kind: "reverse", plates: 3, each: 3, leftover: 2, choices: [9, 11, 12] },
  { kind: "plates", cookies: 10, choices: [3, 4, 5] },
  { kind: "share", cookies: 15, plates: 4, dealButton: true },
  { kind: "reverse", plates: 4, each: 4, leftover: 1, choices: [16, 17, 20] },
  { kind: "plates", cookies: 12, choices: [5, 4, 7] },
  { kind: "share", cookies: 20, plates: 6, dealButton: true },
];
