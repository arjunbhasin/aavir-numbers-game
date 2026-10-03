"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Figure } from "@/games/patterns/figure";
import FigureView from "./FigureView";

/** A white tile holding one figure, or a "?" gap. */
export function FigureCard({
  figure,
  active = false,
  size = "md",
  className = "",
}: {
  figure: Figure | null;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = { sm: "w-[clamp(3.5rem,13vw,5.5rem)]", md: "w-[clamp(4rem,14vw,7rem)]", lg: "w-[clamp(5rem,20vw,9rem)]" }[size];
  return (
    <div
      className={`${dims} aspect-square rounded-2xl grid place-items-center relative ${
        figure ? "bg-white shadow-[0_5px_0_#c9d6e6]" : `border-4 border-dashed ${active ? "border-berry bg-berry/10" : "border-ink-soft/30 bg-white/50"}`
      } ${className}`}
    >
      <AnimatePresence mode="popLayout">
        {figure ? (
          <motion.div key="fig" className="w-full h-full p-[10%]" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <FigureView figure={figure} />
          </motion.div>
        ) : (
          <motion.span
            key="q"
            className={`text-5xl font-bold ${active ? "text-berry" : "text-ink-soft/40"}`}
            animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={active ? { repeat: Infinity, duration: 1.2 } : undefined}
          >
            ?
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
