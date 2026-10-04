"use client";

import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import FigureView from "@/components/shapes/FigureView";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { useGameKeys, useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { line, NICE, TRY_AGAIN } from "./feedback";
import { makeOddOneOut } from "./generators";

const WHY: Record<string, string> = {
  shape: "It's a different shape!",
  color: "It's a different color!",
  fill: "It's filled in differently!",
  count: "It has a different number!",
  size: "It's a different size!",
  rotation: "It's turned a different way!",
};

export default function OddOneOutPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeOddOneOut(makeRng(seed), difficulty), [seed, difficulty]);
  const [wrong, setWrong] = useState<number[]>([]);
  const later = useLater();
  const [solved, setSolved] = useState(false);
  const [focus, setFocus] = useState(-1);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (i: number) => {
    if (solved || wrong.includes(i)) return;
    if (i === p.odd) {
      setSolved(true);
      playSound("correct");
      later(() => onSolved(wrong.length), 1400);
    } else {
      playSound("wrong");
      setWrong((w) => [...w, i]);
    }
  };

  useGameKeys({
    enabled: !solved,
    onMove: (d) => {
      const direction = d === "left" || d === "up" ? -1 : 1;
      let next = focus;
      for (let tries = 0; tries < p.items.length; tries++) {
        next = direction < 0 ? (next <= 0 ? p.items.length - 1 : next - 1) : (next + 1) % p.items.length;
        if (wrong.includes(next)) continue;
        buttons.current[next]?.focus();
        setFocus(next);
        break;
      }
    },
    onEnter: () => focus >= 0 && pick(focus),
  });

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
        {p.items.map((f, i) => {
          const isOdd = solved && i === p.odd;
          const isWrong = wrong.includes(i);
          return (
            <motion.button
              key={i}
              ref={(button) => { buttons.current[i] = button; }}
              onFocus={() => setFocus(i)}
              type="button"
              onClick={() => pick(i)}
              disabled={solved || isWrong}
              aria-label={`Shape ${i + 1}`}
              animate={isOdd ? { scale: [1, 1.15, 1.08], rotate: [0, -4, 4, 0] } : isWrong ? { x: [0, -10, 10, -6, 6, 0] } : {}}
              transition={{ duration: 0.5 }}
              className={`btn-3d rounded-3xl bg-white p-3 w-[clamp(5.5rem,22vw,9.5rem)] aspect-square
                ${isOdd ? "ring-8 ring-grass" : ""} ${isWrong ? "opacity-40" : ""} ${focus === i ? "ring-4 ring-ocean" : ""}
                ${solved && !isOdd ? "opacity-60" : ""}`}
              style={{ ["--btn-shadow" as string]: isOdd ? "#3aa64b" : "#c9d6e6" }}
            >
              <FigureView figure={f} />
            </motion.button>
          );
        })}
      </div>
      <p className={`text-2xl font-semibold h-8 text-center ${solved ? "text-grass-dark" : "text-coral-dark"}`}>
        {solved ? `${line(NICE, seed)} ${WHY[p.rule]}` : wrong.length ? line(TRY_AGAIN, wrong.length) : ""}
      </p>
    </div>
  );
}
