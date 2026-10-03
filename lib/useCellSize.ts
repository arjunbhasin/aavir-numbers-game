"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

const getSize = () => `${window.innerWidth}x${window.innerHeight}`;

/** Pixel size of one board cell so the whole board fits on screen. */
export function useCellSize(rows: number, cols: number, touch: boolean, extraHeight = 0): number {
  const size = useSyncExternalStore(subscribe, getSize, () => "1024x768");
  const [w, h] = size.split("x").map(Number);
  const wide = w >= 1024;
  const availW = Math.min(w, 1024) - 48 - (touch && wide ? 280 : 0);
  const availH = h - 250 - extraHeight - (touch && !wide ? 260 : 0);
  const cell = Math.floor(Math.min(availW / cols, availH / rows));
  return Math.max(34, Math.min(84, cell));
}
