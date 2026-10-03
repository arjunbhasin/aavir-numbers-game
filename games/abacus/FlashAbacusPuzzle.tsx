"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import Abacus from "@/components/abacus/Abacus";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import Button from "@/components/ui/Button";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeFlashPuzzle } from "./logic";

export default function FlashAbacusPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeFlashPuzzle(makeRng(seed), difficulty), [seed, difficulty]);
  const [showing, setShowing] = useState<number | null>(null); // index of the number on screen
  const [answering, setAnswering] = useState(false);
  const [wrong, setWrong] = useState<number[]>([]);
  const [peeks, setPeeks] = useState(0);
  const [solved, setSolved] = useState(false);
  const later = useLater();

  const flash = () => {
    setAnswering(false);
    p.numbers.forEach((_, i) => {
      later(() => {
        setShowing(i);
        playSound("click");
      }, 500 + i * (p.ms + 250));
      later(() => setShowing(null), 500 + i * (p.ms + 250) + p.ms);
    });
    later(() => setAnswering(true), 500 + p.numbers.length * (p.ms + 250));
  };

  useEffect(() => {
    const t = setTimeout(flash, 600);
    return () => clearTimeout(t);
    // run once when the puzzle appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="relative w-full max-w-md h-64 rounded-[2rem] bg-white/70 grid place-items-center overflow-hidden">
        <AnimatePresence mode="wait">
          {showing !== null ? (
            <motion.div
              key={showing}
              className="flex items-center gap-5"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span className="text-8xl font-bold text-grape-dark tabular-nums">{p.numbers[showing]}</span>
              <div className="w-20">
                <Abacus value={p.numbers[showing]} rods={1} labels={false} />
              </div>
            </motion.div>
          ) : solved ? (
            <motion.p key="sum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-grass-dark tabular-nums px-4 text-center">
              {p.numbers.join(" + ")} = {p.total}
            </motion.p>
          ) : (
            <motion.span key="blank" className="text-3xl font-semibold text-ink-soft/50">
              {answering ? "Total?" : "Get ready..."}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p className="text-2xl font-semibold text-ink min-h-8 text-center">
        {answering && !solved && (wrong.length ? "Not quite. Try another, or watch again!" : `What do all ${p.numbers.length} numbers add up to?`)}
      </p>
      <Choices
        choices={p.options.map((o) => ({ value: o, label: o }))}
        wrong={wrong}
        disabled={!answering || solved}
        accent="#a678f0"
        shadow="#8253d1"
        onPick={(v, i) => {
          if (v === p.total) {
            setSolved(true);
            playSound("correct");
            later(() => onSolved(wrong.length + peeks), 1800);
          } else {
            playSound("wrong");
            setWrong((w) => [...w, i]);
          }
        }}
      />
      {answering && !solved && (
        <Button
          accent="white"
          onClick={() => {
            setPeeks((n) => n + 1);
            flash();
          }}
        >
          Watch again
        </Button>
      )}
    </div>
  );
}
