"use client";

import { motion } from "motion/react";
import { useProgress } from "@/lib/progress";
import { playSound } from "@/lib/sound";
import { ACCENT, type Accent } from "./accents";
import Stars from "./Stars";

export type Mode = { title: string; blurb: string; accent: Accent; dots: number };

/** Three big buttons (Easy / Medium / Hard or similar) with saved stars. */
export default function ModePicker({
  gameId,
  modes,
  heading,
  onPick,
}: {
  gameId: string;
  modes: Mode[];
  heading: string;
  onPick: (index: number) => void;
}) {
  const progress = useProgress((s) => s.games[gameId]);
  return (
    <div className="w-full max-w-3xl mt-4">
      <h2 className="text-2xl font-semibold text-center mb-5 text-ink">{heading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {modes.map((m, i) => (
          <motion.button
            key={i}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => {
              playSound("click");
              onPick(i);
            }}
            className={`btn-3d rounded-[1.75rem] ${ACCENT[m.accent].bg} text-white p-6 flex flex-col items-center gap-2`}
            style={{ ["--btn-shadow" as string]: ACCENT[m.accent].shadow }}
          >
            <div className="flex gap-1.5">
              {Array.from({ length: m.dots }, (_, k) => (
                <span key={k} className="w-4 h-4 rounded-full bg-white/90" />
              ))}
            </div>
            <span className="text-3xl font-bold">{m.title}</span>
            <span className="text-lg opacity-90">{m.blurb}</span>
            <div className="bg-white/90 rounded-full px-2 py-0.5 mt-1">
              <Stars count={progress?.[i] ?? 0} size="w-6 h-6" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
