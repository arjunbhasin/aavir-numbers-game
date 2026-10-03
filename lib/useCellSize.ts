"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("resize", cb);
  window.addEventListener("orientationchange", cb);
  return () => {
    window.removeEventListener("resize", cb);
    window.removeEventListener("orientationchange", cb);
  };
}

const getSize = () => `${window.innerWidth}x${window.innerHeight}`;

/** Width/height of the window; the server assumes a small laptop. */
export function useWindowSize(): [number, number] {
  const size = useSyncExternalStore(subscribe, getSize, () => "1024x768");
  const [w, h] = size.split("x").map(Number);
  return [w, h];
}

/**
 * Pixel size of one board cell so the whole board fits on screen.
 * `touch`: an arrow pad is shown (beside the board when wide, below it otherwise).
 * `extraHeight`: other things stacked above/below the board.
 * `side`: on wide screens, a panel this wide sits beside the board instead of below it.
 */
export function useCellSize(
  rows: number,
  cols: number,
  touch: boolean,
  extraHeight = 0,
  side?: { width: number; extraHeight: number },
): number {
  const [w, h] = useWindowSize();
  const wide = w >= 1024;
  const besideWidth = wide ? (side?.width ?? 0) + (touch ? 280 : 0) : 0;
  const availW = Math.min(w, 1024) - 48 - besideWidth;
  const stacked = wide && side ? side.extraHeight : extraHeight;
  const availH = h - 250 - stacked - (touch && !wide ? 260 : 0);
  const cell = Math.floor(Math.min(availW / cols, availH / rows));
  // bigger cells on tablets: easier to see and to tap
  const max = w >= 700 && h >= 700 ? 112 : 84;
  return Math.max(34, Math.min(max, cell));
}
