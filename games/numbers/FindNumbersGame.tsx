"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { GridIcon } from "@/components/ui/Icons";
import ModePicker from "@/components/ui/ModePicker";
import WinOverlay from "@/components/ui/WinOverlay";
import { starsForMistakes } from "@/components/shapes/PatternGame";
import { useProgress } from "@/lib/progress";
import { makeRng, randomSeed } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { scatterNumbers, type Scatter } from "./logic";

const MODES = [
  { title: "1 to 20", blurb: "Big, colorful numbers", accent: "grass" as const, dots: 1, count: 20, wiggle: 0.3, colorful: true },
  { title: "1 to 50", blurb: "A bit more hiding", accent: "sun" as const, dots: 2, count: 50, wiggle: 0.6, colorful: true },
  { title: "1 to 100", blurb: "Super search!", accent: "coral" as const, dots: 3, count: 100, wiggle: 0.8, colorful: false },
];
const COLORS = ["#e35a4a", "#2b7fdc", "#3aa64b", "#d98a00", "#8253d1", "#e04b8e"];

export default function FindNumbersGame() {
  const [mode, setMode] = useState<number | null>(null);
  const [nums, setNums] = useState<Scatter>([]);
  const [next, setNext] = useState(1);
  const [wrong, setWrong] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [won, setWon] = useState<number | null>(null);
  const record = useProgress((s) => s.recordStars);

  const start = (m: number) => {
    setMode(m);
    setNums(scatterNumbers(makeRng(randomSeed()), MODES[m].count, 1.5, MODES[m].wiggle));
    setNext(1);
    setMistakes(0);
    setWrong(null);
    setWon(null);
  };

  if (mode === null) return <ModePicker gameId="find-numbers" heading="How many numbers?" modes={MODES} onPick={start} />;

  const spec = MODES[mode];
  const pick = (n: number) => {
    if (won !== null || n < next) return;
    if (n === next) {
      setWrong(null);
      if (n === spec.count) {
        playSound("correct");
        const stars = starsForMistakes(Math.floor(mistakes / 2));
        record("find-numbers", mode, stars);
        setNext(n + 1);
        setWon(stars);
      } else {
        playSound("pick");
        setNext(n + 1);
      }
    } else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setWrong(n);
    }
  };

  const fontBase = spec.count <= 20 ? "clamp(1.6rem,4.5vw,2.8rem)" : spec.count <= 50 ? "clamp(1.1rem,3vw,2rem)" : "clamp(.85rem,2.2vw,1.45rem)";

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 px-6 py-3 rounded-3xl bg-white shadow-[0_5px_0_#c9d6e6]">
        <span className="text-2xl font-semibold text-ink-soft">Find</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={next}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-5xl font-bold text-mint-dark tabular-nums min-w-16 text-center"
          >
            {Math.min(next, spec.count)}
          </motion.span>
        </AnimatePresence>
        <span className="text-lg text-ink-soft tabular-nums">
          ({next - 1} / {spec.count})
        </span>
      </div>

      <div className="relative w-full max-w-4xl aspect-[3/2] rounded-[2rem] bg-cream shadow-[inset_0_0_0_6px_#fff,0_8px_0_rgba(0,0,0,.08)]">
        {nums.map((n) => {
          const found = n.value < next;
          return (
            <motion.button
              key={n.value}
              type="button"
              onClick={() => pick(n.value)}
              animate={wrong === n.value ? { x: [0, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 font-bold leading-none rounded-full px-1.5 py-1
                ${found ? "bg-grass text-white" : "hover:bg-white/70"}`}
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                fontSize: `calc(${fontBase} * ${n.size})`,
                rotate: found ? "0deg" : `${n.rotate}deg`,
                color: found ? undefined : spec.colorful ? COLORS[n.color] : "#26324a",
              }}
              aria-label={`Number ${n.value}`}
            >
              {n.value}
            </motion.button>
          );
        })}
      </div>

      <Button accent="white" onClick={() => setMode(null)} icon={<GridIcon className="w-7 h-7" />}>
        Change level
      </Button>
      <WinOverlay open={won !== null} stars={won ?? 0} onAgain={() => start(mode)} onLevels={() => setMode(null)} />
    </div>
  );
}
