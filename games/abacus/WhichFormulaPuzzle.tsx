"use client";

import { useMemo, useState } from "react";
import Abacus from "@/components/abacus/Abacus";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { METHOD_NAMES, formula, methodFor, moves, type Method } from "@/lib/abacus";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeFormulaPuzzle } from "./logic";

function whyNot(a: number, d: number, picked: Method, right: Method): string {
  if (picked === "direct") return a + d >= 10 ? "That goes past 9 on this rod, so you need a big friend." : "There aren't enough free beads to just push them.";
  if (picked === "little") return a + d >= 10 ? "That goes past 9, so a little friend can't do it." : "The beads are free here, so try something simpler.";
  if (picked === "big") return a + d < 10 ? "It stays under 10, so no big friend is needed." : "You can't take that big friend off directly here.";
  return right === "big" ? "You can take the big friend off directly, so the simpler one works." : "Try a simpler way.";
}

export default function WhichFormulaPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeFormulaPuzzle(makeRng(seed), difficulty), [seed, difficulty]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [shown, setShown] = useState(p.a);
  const [step, setStep] = useState(-1);
  const [solved, setSolved] = useState(false);
  const later = useLater();
  const steps = moves(p.answer, p.d);

  const pick = (m: Method, i: number) => {
    if (solved) return;
    if (m === p.answer) {
      setSolved(true);
      setHint(null);
      playSound("correct");
      // play the formula on the beads, one move at a time
      let v = p.a;
      steps.forEach((s, k) => {
        v += s;
        const now = v;
        later(() => {
          setShown(now);
          setStep(k);
          playSound("step");
        }, 700 + k * 1000);
      });
      later(() => onSolved(wrong.length), 700 + steps.length * 1000 + 900);
    } else {
      playSound("wrong");
      setWrong((w) => [...w, i]);
      setHint(whyNot(p.a, p.d, m, methodFor(p.a, p.d)));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-4xl font-bold text-ink tabular-nums">
        {p.a} + {p.d} {solved && step === steps.length - 1 ? `= ${p.a + p.d}` : ""}
      </p>
      <div className="w-[min(70vw,16rem)]">
        <Abacus value={shown} rods={2} reserve={430} />
      </div>
      <div className="flex gap-2 min-h-12">
        {solved &&
          steps.map((s, k) => (
            <span key={k} className={`px-4 py-2 rounded-xl text-2xl font-bold tabular-nums ${k <= step ? "bg-grass text-white" : "bg-white/70 text-ink-soft"}`}>
              {s > 0 ? `+${s}` : `− ${-s}`}
            </span>
          ))}
      </div>
      <p className={`text-xl font-semibold min-h-7 text-center ${solved ? "text-grass-dark" : "text-coral-dark"}`}>
        {solved ? `${METHOD_NAMES[p.answer]}: +${p.d} = ${formula(p.answer, p.d)}` : (hint ?? `How do you add ${p.d} to ${p.a} on the abacus?`)}
      </p>
      <Choices
        choices={p.options.map((m) => ({
          value: m,
          aria: METHOD_NAMES[m],
          label: (
            <span className="flex flex-col items-center leading-tight py-1">
              <span className="text-lg font-semibold">{METHOD_NAMES[m]}</span>
              <span className="text-2xl">{formula(m, p.d)}</span>
            </span>
          ),
        }))}
        wrong={wrong}
        disabled={solved}
        accent="#4aa3ff"
        shadow="#2b7fdc"
        onPick={pick}
      />
    </div>
  );
}
