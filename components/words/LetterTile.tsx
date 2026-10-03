"use client";

import { motion } from "motion/react";

/** A big letter square used for word slots and tiles. */
export function LetterBox({ ch, state = "empty", active = false, size = "md" }: { ch?: string; state?: "empty" | "filled" | "right" | "wrong" | "given"; active?: boolean; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "w-[clamp(3.5rem,13vw,5.5rem)] text-5xl" : "w-[clamp(2.75rem,10vw,4rem)] text-4xl";
  const colors = {
    empty: "bg-white/60 border-4 border-dashed border-ink-soft/30 text-ink",
    filled: "bg-white text-ink shadow-[0_4px_0_#c9d6e6]",
    given: "bg-white text-ink-soft shadow-[0_4px_0_#c9d6e6]",
    right: "bg-grass text-white shadow-[0_4px_0_#3aa64b]",
    wrong: "bg-coral text-white shadow-[0_4px_0_#e35a4a]",
  }[state];
  return (
    <motion.div
      animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      className={`${dims} aspect-square rounded-xl grid place-items-center font-bold uppercase ${colors} ${active ? "ring-4 ring-ocean" : ""}`}
    >
      {ch ?? ""}
    </motion.div>
  );
}

export function PictureCard({ children, size = "w-36 h-36 sm:w-44 sm:h-44", label }: { children: React.ReactNode; size?: string; label?: string }) {
  return (
    <div className={`${size} rounded-[1.75rem] bg-white shadow-[0_6px_0_#c9d6e6] p-4 grid place-items-center`} role="img" aria-label={label}>
      {children}
    </div>
  );
}
