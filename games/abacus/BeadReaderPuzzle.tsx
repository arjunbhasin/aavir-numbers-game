"use client";

import { useMemo, useState } from "react";
import Abacus, { useAbacusKeys } from "@/components/abacus/Abacus";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import Button from "@/components/ui/Button";
import { useGameKeys, useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeBeadPuzzle } from "./logic";

export default function BeadReaderPuzzle({ seed, difficulty, onSolved, index }: PuzzleProps) {
  const p = useMemo(() => makeBeadPuzzle(makeRng(seed), difficulty, index), [seed, difficulty, index]);
  const [value, setValue] = useState(0);
  const [selected, setSelected] = useState(p.rods - 1);
  const [wrong, setWrong] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const [solved, setSolved] = useState(false);
  const later = useLater();

  const win = (text: string, m: number) => {
    setSolved(true);
    playSound("correct");
    setMessage({ text, good: true });
    later(() => onSolved(m), 1400);
  };

  const check = () => {
    if (solved) return;
    if (value === p.value) win(`Yes! That shows ${p.value}.`, mistakes);
    else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setMessage({ text: `Your abacus shows ${value}. We need ${p.value}.`, good: false });
    }
  };

  useAbacusKeys({ enabled: p.mode === "set" && !solved, value, rods: p.rods, selected, setSelected, onChange: setValue });
  useGameKeys({ enabled: p.mode === "set" && !solved, onEnter: check });

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {p.mode === "read" ? (
        <>
          <p className="text-2xl font-semibold text-ink">What number does the abacus show?</p>
          <div className="w-[min(90vw,calc(var(--rods)*7rem+2rem))]" style={{ ["--rods" as string]: p.rods }}>
            <Abacus value={p.value} rods={p.rods} />
          </div>
          <p className={`text-xl font-semibold min-h-7 ${message?.good ? "text-grass-dark" : "text-coral-dark"}`}>{message?.text}</p>
          <Choices
            choices={p.options.map((o) => ({ value: o, label: o }))}
            wrong={wrong}
            disabled={solved}
            accent="#5cc96b"
            shadow="#3aa64b"
            onPick={(v, i) => {
              if (v === p.value) win(`Yes! ${p.value}.`, wrong.length);
              else {
                playSound("wrong");
                setWrong((w) => [...w, i]);
                setMessage({ text: "Count again: the top bead is 5, each bottom bead is 1.", good: false });
              }
            }}
          />
        </>
      ) : (
        <>
          <p className="text-2xl font-semibold text-ink">
            Show <span className="text-4xl font-bold text-grass-dark">{p.value}</span> on the abacus
          </p>
          <div className="w-[min(90vw,calc(var(--rods)*7rem+2rem))]" style={{ ["--rods" as string]: p.rods }}>
            <Abacus value={value} rods={p.rods} onChange={solved ? undefined : setValue} selected={selected} onSelect={setSelected} />
          </div>
          <p className={`text-xl font-semibold min-h-7 text-center ${message?.good ? "text-grass-dark" : message ? "text-coral-dark" : "text-ink-soft"}`}>
            {message?.text ?? "Tap the beads to move them."}
          </p>
          <div className="flex gap-3">
            <Button accent="grass" size="lg" onClick={check} disabled={solved} silent>
              Check
            </Button>
            <Button accent="white" size="lg" onClick={() => setValue(0)} disabled={solved}>
              Clear
            </Button>
          </div>
          <p className="hidden md:block text-ink-soft">← → pick a rod · ↑ ↓ move a bottom bead · Space moves the top bead · Enter checks</p>
        </>
      )}
    </div>
  );
}
