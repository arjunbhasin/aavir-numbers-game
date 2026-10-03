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
import { makeWhatsNext } from "./generators";

export default function WhatsNextPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeWhatsNext(makeRng(seed), difficulty), [seed, difficulty]);
  const [wrong, setWrong] = useState<number[]>([]);
  const later = useLater();
  const [solved, setSolved] = useState(false);

  const pick = (i: number) => {
    if (solved) return;
    if (sameFigure(p.options[i], p.answers[0])) {
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
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 p-4 rounded-3xl bg-white/60">
        {p.items.map((f, i) => (
          <FigureCard key={i} figure={f ?? (solved ? p.answers[0] : null)} active={!f && !solved} />
        ))}
      </div>
      <p className={`text-2xl font-semibold h-8 ${solved ? "text-grass-dark" : "text-coral-dark"}`}>
        {solved ? line(NICE, seed) : wrong.length ? line(TRY_AGAIN, wrong.length) : ""}
      </p>
      <OptionRow options={p.options} onPick={pick} wrong={wrong} disabled={solved} />
    </div>
  );
}
