"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { useCancellableLater } from "@/lib/input";

/** Small grown-up control: hold for two seconds to clear all saved stars. */
export default function ResetProgress() {
  const reset = useProgress((s) => s.resetAll);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const { schedule: later, cancel: cancelLater } = useCancellableLater();
  const start = () => {
    cancelLater();
    setHolding(true);
    later(() => {
      reset();
      setHolding(false);
      setDone(true);
      later(() => setDone(false), 2000);
    }, 2000);
  };
  const stop = () => {
    setHolding(false);
    if (holding) cancelLater();
  };
  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none", touchAction: "manipulation" }}
      className="text-sm text-ink-soft/70 underline-offset-4 hover:underline select-none"
    >
      {done ? "Progress cleared" : holding ? "Keep holding..." : "Grown-ups: hold to reset stars"}
    </button>
  );
}
