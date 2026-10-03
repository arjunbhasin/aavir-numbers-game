export const GARDEN_ROWS = 8;
export const GARDEN_COLS = 16;

/** Every rectangle shape for n flowers, as [short side, long side], that fits in the garden. */
export function shapesFor(n: number, maxRows = GARDEN_ROWS, maxCols = GARDEN_COLS): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 1; a * a <= n; a++) {
    if (n % a) continue;
    const b = n / a;
    if ((a <= maxRows && b <= maxCols) || (b <= maxRows && a <= maxCols)) out.push([a, b]);
  }
  return out;
}

/** Same key for 3x4 and 4x3: they hold the same flowers, just turned. */
export function shapeKey(rows: number, cols: number): string {
  return `${Math.min(rows, cols)}x${Math.max(rows, cols)}`;
}

export type PlantResult = "new" | "turned" | "again" | "wrong";

export function plant(n: number, rows: number, cols: number, found: { rows: number; cols: number }[]): PlantResult {
  if (rows * cols !== n) return "wrong";
  const same = found.find((f) => shapeKey(f.rows, f.cols) === shapeKey(rows, cols));
  if (!same) return "new";
  return same.rows === rows ? "again" : "turned";
}
