"use client";

import { motion } from "motion/react";
import { useProgress, unlockedUpTo } from "@/lib/progress";
import { playSound } from "@/lib/sound";
import { ACCENT, type Accent } from "./accents";
import { LockIcon } from "./Icons";
import Stars from "./Stars";

export default function LevelPicker({
  gameId,
  count,
  accent,
  onPick,
}: {
  gameId: string;
  count: number;
  accent: Accent;
  onPick: (level: number) => void;
}) {
  const progress = useProgress((s) => s.games[gameId]);
  const unlocked = unlockedUpTo(progress, count);
  const a = ACCENT[accent];
  return (
    <div className="w-full max-w-3xl mt-4">
      <h2 className="text-2xl font-semibold text-center mb-4 text-ink">Pick a level</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {Array.from({ length: count }, (_, i) => {
          const locked = i > unlocked;
          const stars = progress?.[i] ?? 0;
          const isNext = i === unlocked && !stars;
          return (
            <motion.button
              key={i}
              type="button"
              disabled={locked}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              onClick={() => {
                playSound("click");
                onPick(i);
              }}
              aria-label={locked ? `Level ${i + 1}, locked` : `Level ${i + 1}`}
              className={`btn-3d relative aspect-square rounded-3xl flex flex-col items-center justify-center gap-1 font-bold
                ${locked ? "bg-white/60 text-ink-soft/50 cursor-not-allowed" : stars ? "bg-white text-ink" : `${a.bg} text-white`}
                ${isNext ? "ring-4 ring-white animate-[float_2.5s_ease-in-out_infinite]" : ""}`}
              style={{ ["--btn-shadow" as string]: locked ? "#d5dde8" : stars ? "#c9d6e6" : a.shadow }}
            >
              {locked ? <LockIcon className="w-9 h-9" /> : <span className="text-4xl leading-none">{i + 1}</span>}
              {!locked && stars > 0 && <Stars count={stars} size="w-5 h-5" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
