"use client";

import { useMemo, useState } from "react";
import Abacus from "@/components/abacus/Abacus";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeFriendPuzzle } from "./logic";

/** A row of 5 or 10 dots, `n` of them filled: shows what the friend fills in. */
function FriendBar({ n, total, solved }: { n: number; total: number; solved: boolean }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 ${i < n ? "bg-coral border-coral-dark" : solved ? "bg-sun border-sun-dark" : "bg-white border-ink-soft/25"}`}
        />
      ))}
    </div>
  );
}

export default function FriendFinderPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeFriendPuzzle(makeRng(seed), difficulty), [seed, difficulty]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const later = useLater();
  const little = p.kind.startsWith("little");
  const total = little ? 5 : 10;
  const isFormula = p.kind.endsWith("formula");

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <span className={`px-4 py-1 rounded-full text-lg font-bold text-white ${little ? "bg-sun-dark" : "bg-ocean-dark"}`}>
        {little ? "Little friends make 5" : "Big friends make 10"}
      </span>
      {isFormula ? (
        <p className="text-5xl font-bold text-ink tabular-nums">
          +{p.n} = {little ? "+5" : "+10"} − <span className={solved ? "text-grass-dark" : "text-berry"}>{solved ? p.answer : "?"}</span>
        </p>
      ) : (
        <>
          <div className="flex items-center gap-6">
            <div className="w-28">
              <Abacus value={p.n} rods={1} labels={false} />
            </div>
            <p className="text-3xl font-semibold text-ink">
              Who is <span className="text-5xl font-bold text-coral-dark">{p.n}</span>&apos;s {little ? "little" : "big"} friend?
            </p>
          </div>
          <FriendBar n={p.n} total={total} solved={solved} />
        </>
      )}
      <p className="text-2xl font-semibold min-h-8 text-grass-dark">
        {solved ? (isFormula ? `${p.answer} is ${p.n}'s ${little ? "little" : "big"} friend!` : `${p.n} + ${p.answer} = ${total}`) : ""}
      </p>
      <Choices
        choices={p.options.map((o) => ({ value: o, label: o }))}
        wrong={wrong}
        disabled={solved}
        accent={little ? "#ffc93c" : "#4aa3ff"}
        shadow={little ? "#e8a800" : "#2b7fdc"}
        onPick={(v, i) => {
          if (v === p.answer) {
            setSolved(true);
            playSound("correct");
            later(() => onSolved(wrong.length), 1400);
          } else {
            playSound("wrong");
            setWrong((w) => [...w, i]);
          }
        }}
      />
    </div>
  );
}
