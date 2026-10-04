"use client";

const COLORS = ["#ff7a6b", "#ffc93c", "#5cc96b", "#4aa3ff", "#a678f0", "#ff6fae"];

export function celebrate(canvas?: HTMLCanvasElement | null) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const base = { zIndex: 999, particleCount: 90, spread: 70, colors: COLORS, disableForReducedMotion: true };
  let cancelled = false;
  let reset: (() => void) | undefined;
  void import("canvas-confetti").then(({ default: confetti }) => {
    if (cancelled || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const fire = canvas ? confetti.create(canvas, { resize: true }) : confetti;
    reset = () => fire.reset();
    fire({ ...base, angle: 60, origin: { x: 0, y: 0.7 } });
    fire({ ...base, angle: 120, origin: { x: 1, y: 0.7 } });
  }).catch(() => {
    // A celebration should never interrupt a completed game.
  });
  return () => {
    cancelled = true;
    reset?.();
  };
}
