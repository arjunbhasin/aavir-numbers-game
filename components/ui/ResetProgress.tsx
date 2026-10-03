"use client";

import { useRef, useState } from "react";
import { useProgress } from "@/lib/progress";

/** Small grown-up control: hold for two seconds to clear all saved stars. */
export default function ResetProgress() {
  const reset = useProgress((s) => s.resetAll);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      reset();
      setHolding(false);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    }, 2000);
  };
  const stop = () => {
    setHolding(false);
    if (timer.current) clearTimeout(timer.current);
  };
  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      className="text-sm text-ink-soft/70 underline-offset-4 hover:underline select-none"
    >
      {done ? "Progress cleared" : holding ? "Keep holding..." : "Grown-ups: hold to reset stars"}
    </button>
  );
}
