"use client";

import confetti from "canvas-confetti";

const COLORS = ["#ff7a6b", "#ffc93c", "#5cc96b", "#4aa3ff", "#a678f0", "#ff6fae"];

export function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const base = { zIndex: 999, particleCount: 90, spread: 70, colors: COLORS, disableForReducedMotion: true };
  confetti({ ...base, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, angle: 120, origin: { x: 1, y: 0.7 } });
}
