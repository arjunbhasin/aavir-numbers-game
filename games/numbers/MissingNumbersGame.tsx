"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { GridIcon } from "@/components/ui/Icons";
import ModePicker from "@/components/ui/ModePicker";
import WinOverlay from "@/components/ui/WinOverlay";
import { starsForMistakes } from "@/components/shapes/PatternGame";
import { useProgress } from "@/lib/progress";
import { makeRng, randomSeed } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeNumberGrid, type NumberGrid } from "./logic";

const MODES = [
  { title: "1 to 20", blurb: "4 lost numbers", accent: "grass" as const, dots: 1, max: 20, width: 5 },
  { title: "1 to 50", blurb: "5 lost numbers", accent: "sun" as const, dots: 2, max: 50, width: 10 },
  { title: "1 to 100", blurb: "10 lost numbers", accent: "coral" as const, dots: 3, max: 100, width: 10 },
];

export default function MissingNumbersGame() {
  const [mode, setMode] = useState<number | null>(null);
  const [grid, setGrid] = useState<NumberGrid | null>(null);
  const [row, setRow] = useState(0);
  const [left, setLeft] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [won, setWon] = useState<number | null>(null);
  const record = useProgress((s) => s.recordStars);

  const start = (m: number) => {
    const g = makeNumberGrid(makeRng(randomSeed()), MODES[m].max, MODES[m].width);
    setMode(m);
    setGrid(g);
    setLeft(g.choices);
    setRow(0);
    setMistakes(0);
    setWrong(null);
    setWon(null);
  };

  if (mode === null || !grid) {
    return <ModePicker gameId="missing-numbers" heading="Which numbers?" modes={MODES} onPick={start} />;
  }

  const pick = (n: number) => {
    if (won !== null) return;
    if (n === grid.answers[row]) {
      const rest = left.filter((x) => x !== n);
      setLeft(rest);
      setWrong(null);
      if (rest.length === 0) {
        playSound("correct");
        const stars = starsForMistakes(mistakes);
        record("missing-numbers", mode, stars);
        setRow(row + 1);
        setTimeout(() => setWon(stars), 400);
      } else {
        playSound("pick");
        setRow(row + 1);
      }
    } else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setWrong(n);
    }
  };

  const wide = MODES[mode].width === 10;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-3xl bg-white/60">
        {grid.rows.map((cells, r) => (
          <div key={r} className={`flex gap-1.5 sm:gap-2 rounded-2xl p-1 ${r === row ? "bg-sun/30" : ""}`}>
            {cells.map((n, c) => {
              const filled = n === null && r < row;
              const value = n ?? (filled ? grid.answers[r] : null);
              return (
                <motion.div
                  key={c}
                  initial={false}
                  animate={filled ? { scale: [1.3, 1] } : {}}
                  className={`grid place-items-center rounded-xl font-bold aspect-square
                    ${wide ? "w-[clamp(1.9rem,8vw,3.6rem)] text-[clamp(.9rem,3.2vw,1.6rem)]" : "w-[clamp(3rem,15vw,5.5rem)] text-[clamp(1.4rem,5vw,2.4rem)]"}
                    ${value === null ? (r === row ? "border-4 border-dashed border-berry bg-white text-berry" : "border-4 border-dashed border-ink-soft/25 bg-white/60 text-ink-soft/30") : filled ? "bg-grass text-white" : "bg-white text-ink shadow-[0_3px_0_#c9d6e6]"}`}
                >
                  {value ?? "?"}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <div>
        <p className="text-center text-xl font-semibold text-ink-soft mb-3">Which number is lost in the yellow row?</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
          {left.map((n) => (
            <motion.button
              key={n}
              layout
              type="button"
              onClick={() => pick(n)}
              animate={wrong === n ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="btn-3d w-20 h-20 rounded-2xl bg-ocean text-white text-4xl font-bold"
              style={{ ["--btn-shadow" as string]: "#2b7fdc" }}
            >
              {n}
            </motion.button>
          ))}
        </div>
      </div>

      <Button accent="white" onClick={() => setMode(null)} icon={<GridIcon className="w-7 h-7" />}>
        Change level
      </Button>

      <WinOverlay open={won !== null} stars={won ?? 0} onAgain={() => start(mode)} onLevels={() => setMode(null)} />
    </div>
  );
}
