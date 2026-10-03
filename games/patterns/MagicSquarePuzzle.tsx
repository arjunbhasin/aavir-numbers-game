"use client";

import { useMemo, useState } from "react";
import { FigureCard } from "@/components/shapes/FigureCard";
import OptionRow from "@/components/shapes/OptionRow";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { sameFigure } from "./figure";
import { line, NICE, TRY_AGAIN } from "./feedback";
import { makeMagicSquare } from "./generators";

export default function MagicSquarePuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeMagicSquare(makeRng(seed), difficulty), [seed, difficulty]);
  const [wrong, setWrong] = useState<number[]>([]);
  const later = useLater();
  const [solved, setSolved] = useState(false);

  const pick = (i: number) => {
    if (solved) return;
    if (sameFigure(p.options[i], p.answer)) {
      setSolved(true);
      playSound("correct");
      later(() => onSolved(wrong.length), 1100);
    } else {
      playSound("wrong");
      setWrong((w) => [...w, i]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div
        className="grid gap-2 sm:gap-3 p-4 rounded-3xl bg-white/60"
        style={{ gridTemplateColumns: `repeat(${p.size}, auto)` }}
      >
        {p.cells.map((f, i) => (
          <FigureCard key={i} figure={f ?? (solved ? p.answer : null)} active={!f && !solved} size={p.size === 2 ? "lg" : "md"} />
        ))}
      </div>
      <p className={`text-2xl font-semibold h-8 ${solved ? "text-grass-dark" : wrong.length ? "text-coral-dark" : "text-ink-soft"}`}>
        {solved ? line(NICE, seed) : wrong.length ? line(TRY_AGAIN, wrong.length) : "Look across the rows and down the columns."}
      </p>
      <OptionRow options={p.options} onPick={pick} wrong={wrong} disabled={solved} />
    </div>
  );
}
