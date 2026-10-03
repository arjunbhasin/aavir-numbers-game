"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import Blocks from "@/components/math/Blocks";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeBalancePuzzle, tilt } from "./logic";

const COLORS = [
  ["#ff7a6b", "#e35a4a"],
  ["#4aa3ff", "#2b7fdc"],
  ["#5cc96b", "#3aa64b"],
  ["#a678f0", "#8253d1"],
];

function Pan({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end justify-center gap-3 min-h-28 px-3">{children}</div>
      <div className="w-[clamp(9rem,28vw,15rem)] h-4 rounded-b-full bg-[#8a94a8]" />
    </div>
  );
}

export default function BalancePuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeBalancePuzzle(makeRng(seed), difficulty), [seed, difficulty]);
  const [guess, setGuess] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const later = useLater();
  const t = tilt(p, guess);
  const leftSum = p.left.reduce((a, b) => a + b, 0);

  const pick = (n: number, i: number) => {
    if (solved || guess !== null) return;
    setGuess(n);
    if (n === p.answer) {
      setSolved(true);
      playSound("correct");
      setMessage(`${p.left.join(" + ")} = ${p.right[0]} + ${n}`);
      later(() => onSolved(wrong.length), 1600);
    } else {
      playSound("wrong");
      setWrong((w) => [...w, i]);
      setMessage(tilt(p, n) === 1 ? "Too heavy! The right side went down." : "Too light! The right side is still up.");
      later(() => setGuess(null), 1300);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="relative w-full max-w-3xl h-80 select-none">
        {/* stand */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-40 h-5 rounded-full bg-[#7b8db8]" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-5 h-52 rounded-t-full bg-[#93a6d3]" />
        {/* beam with pans */}
        <motion.div
          className="absolute left-[6%] right-[6%] top-14 origin-center"
          animate={{ rotate: t * 8 }}
          transition={{ type: "spring", stiffness: 90, damping: 9 }}
        >
          <div className="h-4 rounded-full bg-[#5a6785]" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-8 h-8 rounded-full bg-sun border-4 border-sun-dark" />
          <motion.div className="absolute left-0 top-4 -translate-x-[15%]" animate={{ rotate: -t * 8 }}>
            <div className="w-1 h-10 mx-auto bg-[#8a94a8]" />
            <Pan>
              {p.left.map((n, i) => (
                <Blocks key={i} n={n} color={COLORS[i][0]} dark={COLORS[i][1]} />
              ))}
            </Pan>
          </motion.div>
          <motion.div className="absolute right-0 top-4 translate-x-[15%]" animate={{ rotate: -t * 8 }}>
            <div className="w-1 h-10 mx-auto bg-[#8a94a8]" />
            <Pan>
              <Blocks n={p.right[0]} color={COLORS[3][0]} dark={COLORS[3][1]} />
              {guess !== null ? (
                <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <Blocks n={guess} color="#ffc93c" dark="#e8a800" />
                </motion.div>
              ) : (
                <div className="w-16 h-20 rounded-xl border-4 border-dashed border-berry grid place-items-center text-3xl font-bold text-berry">?</div>
              )}
            </Pan>
          </motion.div>
        </motion.div>
      </div>
      <p className={`text-2xl font-semibold min-h-8 text-center ${solved ? "text-grass-dark" : message ? "text-coral-dark" : "text-ink"}`}>
        {message ?? `The left side has ${leftSum}. Which block makes it balance?`}
      </p>
      <Choices choices={p.options.map((o) => ({ value: o, label: o }))} wrong={wrong} disabled={solved || guess !== null} accent="#4aa3ff" shadow="#2b7fdc" onPick={pick} />
    </div>
  );
}
