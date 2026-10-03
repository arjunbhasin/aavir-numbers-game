"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useGameKeys } from "@/lib/input";

/**
 * Big answer buttons. Tap/click, press 1-6, or use ← → and Enter.
 * Wrong answers shake and fade, and can't be picked again.
 */
export default function Choices<T>({
  choices,
  onPick,
  wrong,
  disabled = false,
  accent = "#4aa3ff",
  shadow = "#2b7fdc",
}: {
  choices: { value: T; label: ReactNode; aria?: string }[];
  onPick: (value: T, index: number) => void;
  wrong: number[];
  disabled?: boolean;
  accent?: string;
  shadow?: string;
}) {
  const [focus, setFocus] = useState(-1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled || e.metaKey || e.ctrlKey || !/^[1-6]$/.test(e.key)) return;
      const i = Number(e.key) - 1;
      if (i < choices.length && !wrong.includes(i)) {
        e.preventDefault();
        onPick(choices[i].value, i);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices, onPick, disabled, wrong]);

  useGameKeys({
    enabled: !disabled,
    onMove: (d) =>
      setFocus((f) => (d === "left" || d === "up" ? (f <= 0 ? choices.length - 1 : f - 1) : (f + 1) % choices.length)),
    onEnter: () => {
      if (focus >= 0 && !wrong.includes(focus)) onPick(choices[focus].value, focus);
    },
  });

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {choices.map((c, i) => {
        const isWrong = wrong.includes(i);
        return (
          <motion.button
            key={i}
            type="button"
            disabled={disabled || isWrong}
            onClick={() => onPick(c.value, i)}
            aria-label={c.aria}
            animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className={`btn-3d min-w-24 min-h-20 px-5 rounded-2xl text-white text-3xl font-bold flex items-center justify-center gap-2
              ${isWrong ? "opacity-35" : ""} ${focus === i ? "ring-4 ring-white outline-4 outline-ocean" : ""}`}
            style={{ background: accent, ["--btn-shadow" as string]: shadow }}
          >
            {c.label}
          </motion.button>
        );
      })}
    </div>
  );
}
