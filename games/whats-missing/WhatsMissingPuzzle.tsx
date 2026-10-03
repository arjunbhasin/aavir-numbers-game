"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { PICTURES } from "@/components/memory/Pictures";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeMissingPuzzle } from "./logic";

type Phase = "look" | "cover" | "guess" | "solved";

function Tray({ items, highlight }: { items: number[]; highlight?: number }) {
  const cols = items.length <= 4 ? 4 : items.length <= 6 ? 3 : 4;
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((p, i) => (
        <motion.div
          key={`${p}-${i}`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className={`w-[clamp(4.5rem,15vw,7.5rem)] aspect-square rounded-2xl p-2 ${
            p === -1 ? "border-4 border-dashed border-ink-soft/25" : p === highlight ? "bg-white ring-8 ring-grass" : "bg-white shadow-[0_5px_0_#c9d6e6]"
          }`}
        >
          {p !== -1 && PICTURES[p].node}
        </motion.div>
      ))}
    </div>
  );
}

export default function WhatsMissingPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeMissingPuzzle(makeRng(seed), difficulty, PICTURES.length), [seed, difficulty]);
  const [phase, setPhase] = useState<Phase>("look");
  const [wrong, setWrong] = useState<number[]>([]);
  const later = useLater();

  useEffect(() => {
    const a = setTimeout(() => setPhase("cover"), p.showMs);
    const b = setTimeout(() => setPhase("guess"), p.showMs + 1000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [p]);

  const solvedTray = difficulty === 2 ? [...p.after, p.missing] : p.after.map((x) => (x === -1 ? p.missing : x));

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="relative rounded-[2rem] bg-[#fff1dc] shadow-[inset_0_0_0_6px_#fff] p-5 min-h-60 grid place-items-center overflow-hidden">
        {phase === "look" && <Tray items={p.shown} />}
        {phase === "guess" && <Tray items={p.after} />}
        {phase === "solved" && <Tray items={solvedTray} highlight={p.missing} />}
        <AnimatePresence>
          {phase === "cover" && (
            <motion.div
              className="absolute inset-0 bg-berry grid place-items-center text-white text-3xl font-bold"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
            >
              Shh... one toy is hiding!
            </motion.div>
          )}
        </AnimatePresence>
        {phase === "look" && (
          <motion.div
            className="absolute bottom-0 left-0 h-2 bg-sun"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: p.showMs / 1000, ease: "linear" }}
          />
        )}
      </div>
      <p className={`text-2xl font-semibold min-h-8 text-center ${phase === "solved" ? "text-grass-dark" : "text-ink"}`}>
        {phase === "look" && "Look at all the toys. Remember them!"}
        {phase === "cover" && " "}
        {phase === "guess" && (wrong.length ? "Not that one. Look again!" : "Which toy is missing?")}
        {phase === "solved" && `Yes! The ${PICTURES[p.missing].label} was missing.`}
      </p>
      {(phase === "guess" || phase === "solved") && (
        <Choices
          choices={p.options.map((o) => ({ value: o, aria: PICTURES[o].label, label: <span className="block w-16 h-16 sm:w-20 sm:h-20">{PICTURES[o].node}</span> }))}
          wrong={wrong}
          disabled={phase !== "guess"}
          accent="#ffffff"
          shadow="#c9d6e6"
          onPick={(v, i) => {
            if (v === p.missing) {
              setPhase("solved");
              playSound("correct");
              later(() => onSolved(wrong.length), 1800);
            } else {
              playSound("wrong");
              setWrong((w) => [...w, i]);
            }
          }}
        />
      )}
    </div>
  );
}
