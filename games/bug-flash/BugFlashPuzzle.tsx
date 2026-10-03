"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Ladybug, Leaf } from "@/components/math/Art";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import Button from "@/components/ui/Button";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { bugSentence, makeBugPuzzle, type BugPuzzle } from "./logic";

type Phase = "ready" | "show" | "guess" | "replay" | "solved";

/** The bugs, in groups (leaves) or rows. `lit` = how many groups are highlighted while counting. */
function Bugs({ p, lit }: { p: BugPuzzle; lit: number }) {
  const bug = p.total > 20 ? "w-8 h-8 sm:w-11 sm:h-11" : "w-11 h-11 sm:w-14 sm:h-14";
  const group = (g: number) => (
    <motion.div
      key={g}
      animate={g < lit ? { scale: [1, 1.12, 1] } : {}}
      transition={{ duration: 0.4 }}
      className={`relative grid gap-1 p-2 rounded-[1.5rem] transition-colors ${
        p.layout === "groups" ? (g < lit ? "bg-sun/50 ring-4 ring-sun" : "bg-[#d6f5d0]") : g < lit ? "bg-sun/50 ring-4 ring-sun" : ""
      }`}
      style={{ gridTemplateColumns: `repeat(${p.layout === "array" ? p.each : Math.min(p.each, p.each === 10 ? 5 : 3)}, auto)` }}
    >
      {Array.from({ length: p.each }, (_, i) => (
        <div key={i} className={bug}>
          <Ladybug />
        </div>
      ))}
      {g < lit && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-3 -top-3 bg-sun-dark text-white text-lg font-bold rounded-full w-10 h-10 grid place-items-center shadow"
        >
          {(g + 1) * p.each}
        </motion.span>
      )}
    </motion.div>
  );
  return (
    <div className={p.layout === "array" ? "flex flex-col gap-1 items-center" : "flex flex-wrap gap-4 justify-center items-center"}>
      {Array.from({ length: p.groups }, (_, g) => group(g))}
    </div>
  );
}

export default function BugFlashPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeBugPuzzle(makeRng(seed), difficulty), [seed, difficulty]);
  const [phase, setPhase] = useState<Phase>("ready");
  const [wrong, setWrong] = useState<number[]>([]);
  const [peeks, setPeeks] = useState(0);
  const [lit, setLit] = useState(0);
  const later = useLater();

  const show = () => {
    setPhase("show");
    later(() => setPhase("guess"), p.showMs);
  };

  /** count the groups one at a time: 5, 10, 15 */
  const countUp = (then: Phase) => {
    setLit(0);
    for (let g = 1; g <= p.groups; g++) {
      later(() => {
        setLit(g);
        playSound("step");
      }, g * 650);
    }
    later(() => setPhase(then), p.groups * 650 + 900);
  };

  useEffect(() => {
    const t = setTimeout(show, 700);
    return () => clearTimeout(t);
    // only once, when the puzzle appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (n: number, i: number) => {
    if (phase !== "guess") return;
    if (n === p.total) {
      playSound("correct");
      setPhase("solved");
      countUp("solved");
      later(() => onSolved(wrong.length + peeks), p.groups * 650 + 1600);
    } else {
      playSound("wrong");
      setWrong((w) => [...w, i]);
      setPhase("replay");
      countUp("guess");
    }
  };

  const visible = phase === "show" || phase === "replay" || phase === "solved";

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="relative w-full max-w-3xl min-h-72 rounded-[2rem] bg-[#eafbe6] shadow-[inset_0_0_0_6px_#fff] grid place-items-center p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {visible ? (
            <motion.div key="bugs" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Bugs p={p} lit={lit} />
            </motion.div>
          ) : (
            <motion.div
              key="leaf"
              className="w-48 h-48"
              initial={{ rotate: -30, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 30, scale: 0.5, opacity: 0 }}
            >
              <Leaf />
            </motion.div>
          )}
        </AnimatePresence>
        {phase === "show" && (
          <motion.div
            className="absolute bottom-0 left-0 h-2 bg-sun"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: p.showMs / 1000, ease: "linear" }}
          />
        )}
      </div>

      <p className="text-2xl font-semibold text-ink min-h-8 text-center">
        {phase === "ready" && "Get ready to peek!"}
        {phase === "show" && "Look! Can you see the groups?"}
        {phase === "guess" && (wrong.length ? "Now you know the groups. How many?" : "How many ladybugs were there?")}
        {phase === "replay" && "Let's count them in groups..."}
        {phase === "solved" && <span className="text-grass-dark">Yes! {bugSentence(p)}</span>}
      </p>

      <Choices choices={p.options.map((o) => ({ value: o, label: o }))} wrong={wrong} disabled={phase !== "guess"} accent="#ff7a6b" shadow="#e35a4a" onPick={pick} />

      {phase === "guess" && (
        <Button
          accent="white"
          onClick={() => {
            setPeeks((n) => n + 1);
            show();
          }}
        >
          Peek again
        </Button>
      )}
    </div>
  );
}
