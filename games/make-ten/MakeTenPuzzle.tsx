"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { TenFrame } from "@/components/math/AddArt";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { useGameKeys, useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeTenPuzzle } from "./logic";

export default function MakeTenPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeTenPuzzle(makeRng(seed), difficulty), [seed, difficulty]);
  const cols = p.cards.length === 6 ? 3 : p.cards.length === 8 ? 4 : 5;
  const [gone, setGone] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [shaking, setShaking] = useState<number[]>([]);
  const [focus, setFocus] = useState(-1);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const later = useLater();
  const done = gone.length === p.cards.length;

  const tap = (i: number) => {
    if (done || gone.includes(i)) return;
    if (selected === null) {
      playSound("click");
      setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    const a = p.cards[selected];
    const b = p.cards[i];
    if (a + b === p.target) {
      const nowGone = [...gone, selected, i];
      setGone(nowGone);
      setSelected(null);
      setMessage({ text: `${a} + ${b} = ${p.target}`, good: true });
      if (nowGone.length === p.cards.length) {
        playSound("correct");
        later(() => onSolved(mistakes), 1000);
      } else playSound("pick");
    } else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setShaking([selected, i]);
      setMessage({ text: `${a} + ${b} = ${a + b}. That's not ${p.target}!`, good: false });
      later(() => setShaking([]), 450);
      setSelected(null);
    }
  };

  useGameKeys({
    enabled: !done,
    onMove: (d) => {
      const n = p.cards.length;
      const delta = d === "left" ? -1 : d === "right" ? 1 : d === "up" ? -cols : cols;
      let next = focus < 0 ? 0 : (focus + delta + n) % n;
      for (let tries = 0; tries < n; tries++) {
        if (!(gone.includes(next))) {
          buttons.current[next]?.focus();
          setFocus(next);
          break;
        }
        next = (next + (delta < 0 ? -1 : 1) + n) % n;
      }
    },
    onEnter: () => focus >= 0 && tap(focus),
  });

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="flex items-center gap-3 px-6 py-2 rounded-3xl bg-white shadow-[0_5px_0_#c9d6e6]">
        <span className="text-2xl font-semibold text-ink-soft">Make</span>
        <span className="text-5xl font-bold text-sun-dark">{p.target}</span>
      </div>
      <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {p.cards.map((n, i) => (
          <AnimatePresence key={i}>
            {!gone.includes(i) ? (
              <motion.button
                ref={(button) => { buttons.current[i] = button; }}
                onFocus={() => setFocus(i)}
                type="button"
                onClick={() => tap(i)}
                exit={{ scale: 0, rotate: 20, opacity: 0 }}
                animate={shaking.includes(i) ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0, scale: selected === i ? 1.08 : 1 }}
                transition={{ duration: 0.35 }}
                aria-label={`Card ${n}`}
                className={`btn-3d w-[clamp(4.5rem,15vw,7.5rem)] aspect-[4/5] rounded-2xl flex flex-col items-center justify-center gap-1 p-2
                  ${selected === i ? "bg-sun text-white" : "bg-white text-ink"} ${focus === i ? "ring-4 ring-ocean" : ""}`}
                style={{ ["--btn-shadow" as string]: selected === i ? "#e8a800" : "#c9d6e6" }}
              >
                <span className="text-4xl sm:text-5xl font-bold leading-none">{n}</span>
                {p.dots && <TenFrame n={n} className="w-full" />}
              </motion.button>
            ) : (
              <div className="w-[clamp(4.5rem,15vw,7.5rem)] aspect-[4/5]" />
            )}
          </AnimatePresence>
        ))}
      </div>
      <p className={`text-2xl font-semibold min-h-8 ${message?.good ? "text-grass-dark" : "text-coral-dark"}`}>
        {message?.text ?? `Tap two numbers that add up to ${p.target}.`}
      </p>
    </div>
  );
}
