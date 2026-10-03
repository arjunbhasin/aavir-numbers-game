/** Each level is a seeded shuffle of the solved board. `par` = fewest moves (checked by tests). */
export const LEVELS = [
  { rows: 2, cols: 2, shuffle: 3, seed: 100, par: 3 },
  { rows: 2, cols: 3, shuffle: 6, seed: 101, par: 6 },
  { rows: 2, cols: 3, shuffle: 12, seed: 102, par: 12 },
  { rows: 3, cols: 3, shuffle: 8, seed: 103, par: 8 },
  { rows: 3, cols: 3, shuffle: 14, seed: 106, par: 10 },
  { rows: 3, cols: 3, shuffle: 20, seed: 105, par: 12 },
  { rows: 3, cols: 3, shuffle: 30, seed: 106, par: 16 },
  { rows: 3, cols: 3, shuffle: 45, seed: 107, par: 25 },
  { rows: 3, cols: 3, shuffle: 70, seed: 108, par: 26 },
];
