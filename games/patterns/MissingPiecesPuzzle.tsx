"use client";

import { useMemo, useState } from "react";
import { FigureCard } from "@/components/shapes/FigureCard";
import OptionRow from "@/components/shapes/OptionRow";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { sameFigure } from "./figure";
import { line, NICE, TRY_AGAIN } from "./feedback";
import { makeMissingPieces } from "./generators";

export default function MissingPiecesPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeMissingPieces(makeRng(seed), difficulty), [seed, difficulty]);
  const gaps = p.items.map((f, i) => (f ? -1 : i)).filter((i) => i >= 0);
  const [filled, setFilled] = useState(0); // how many gaps are done
  const [used, setUsed] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const solved = filled === 2;

  const pick = (i: number) => {
    if (solved) return;
    if (sameFigure(p.options[i], p.answers[filled])) {
      const nowFilled = filled + 1;
      setFilled(nowFilled);
      setUsed((u) => [...u, i]);
      setWrong([]);
      if (nowFilled === 2) {
        playSound("correct");
        setTimeout(() => onSolved(mistakes), 1100);
      } else {
        playSound("pick");
      }
    } else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setWrong((w) => [...w, i]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 p-4 rounded-3xl bg-white/60">
        {p.items.map((f, i) => {
          const gapNo = gaps.indexOf(i);
          const shown = f ?? (gapNo !== -1 && gapNo < filled ? p.answers[gapNo] : null);
          return <FigureCard key={i} figure={shown} active={gapNo === filled} size={p.items.length > 5 ? "sm" : "md"} />;
        })}
      </div>
      <p className={`text-2xl font-semibold h-8 ${solved ? "text-grass-dark" : wrong.length ? "text-coral-dark" : "text-ink-soft"}`}>
        {solved ? line(NICE, seed) : wrong.length ? line(TRY_AGAIN, mistakes) : filled === 0 ? "What goes in the first box?" : "Now the second box!"}
      </p>
      <OptionRow options={p.options} onPick={pick} wrong={wrong} used={used} disabled={solved} />
    </div>
  );
}
