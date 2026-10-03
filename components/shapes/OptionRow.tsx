"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { Figure } from "@/games/patterns/figure";
import { useGameKeys, useKeydown } from "@/lib/input";
import FigureView from "./FigureView";

const LETTERS = "ABCDEF";

/**
 * Answer choices. Tap/click, or use ← → and Enter, or press A-E / 1-5.
 * `wrong` holds indices that were tried and were wrong (they shake and fade).
 */
export default function OptionRow({
  options,
  onPick,
  wrong,
  used = [],
  disabled = false,
}: {
  options: Figure[];
  onPick: (index: number) => void;
  wrong: number[];
  used?: number[];
  disabled?: boolean;
}) {
  const [focus, setFocus] = useState(-1);

  useKeydown((e: KeyboardEvent) => {
    if (disabled || e.metaKey || e.ctrlKey) return;
    const k = e.key.toUpperCase();
    let idx = LETTERS.indexOf(k);
    if (idx === -1 && /^[1-6]$/.test(k)) idx = Number(k) - 1;
    if (idx >= 0 && idx < options.length && !used.includes(idx) && !wrong.includes(idx)) {
      e.preventDefault();
      onPick(idx);
    }
  });

  useGameKeys({
    enabled: !disabled,
    onMove: (d) => {
      if (d === "left" || d === "up") setFocus((f) => (f <= 0 ? options.length - 1 : f - 1));
      else setFocus((f) => (f + 1) % options.length);
    },
    onEnter: () => {
      if (focus >= 0 && !used.includes(focus) && !wrong.includes(focus)) onPick(focus);
    },
  });

  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {options.map((f, i) => {
        const isWrong = wrong.includes(i);
        const isUsed = used.includes(i);
        return (
          <motion.button
            key={i}
            type="button"
            disabled={disabled || isUsed || isWrong}
            onClick={() => onPick(i)}
            aria-label={`Answer ${LETTERS[i]}`}
            animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className={`btn-3d flex flex-col items-center gap-1 rounded-2xl bg-white p-2 pb-1 w-[clamp(4.5rem,15vw,7.5rem)]
              ${focus === i ? "ring-4 ring-ocean" : ""} ${isWrong ? "opacity-45" : ""} ${isUsed ? "opacity-20" : ""}`}
            style={{ ["--btn-shadow" as string]: "#c9d6e6" }}
          >
            <div className="w-full aspect-square">
              <FigureView figure={f} />
            </div>
            <span className="text-lg font-bold text-ink-soft">{LETTERS[i]}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
