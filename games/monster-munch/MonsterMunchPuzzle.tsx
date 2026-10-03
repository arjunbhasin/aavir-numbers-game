"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Apple, Monster } from "@/components/math/AddArt";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeMunchPuzzle, munchSentence } from "./logic";

function AppleRow({ count, hidden = 0, size = "w-10 h-10 sm:w-12 sm:h-12" }: { count: number; hidden?: number; size?: string }) {
  return (
    <div className="flex flex-wrap gap-1 justify-center max-w-2xl">
      <AnimatePresence>
        {Array.from({ length: count - hidden }, (_, i) => (
          <motion.div key={i} className={size} exit={{ scale: 0, x: 80, y: -30, opacity: 0 }} transition={{ duration: 0.35 }}>
            <Apple />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function MonsterMunchPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeMunchPuzzle(makeRng(seed), difficulty), [seed, difficulty]);
  const [eatenSoFar, setEatenSoFar] = useState(0);
  const [ready, setReady] = useState(p.kind === "compare");
  const [covered, setCovered] = useState(false);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const later = useLater();
  const toEat = p.kind === "left" ? p.eaten : p.kind === "eaten" ? p.answer : 0;

  // the monster eats one apple at a time (or behind a cloth, when you have to work out how many)
  useEffect(() => {
    if (p.kind === "compare") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (p.kind === "eaten") {
      timers.push(setTimeout(() => setCovered(true), 1800));
      timers.push(setTimeout(() => setEatenSoFar(toEat), 2300));
      timers.push(setTimeout(() => playSound("push"), 2300));
      timers.push(setTimeout(() => setCovered(false), 3000));
      timers.push(setTimeout(() => setReady(true), 3100));
    } else {
      for (let i = 1; i <= toEat; i++) {
        timers.push(
          setTimeout(() => {
            setEatenSoFar(i);
            playSound("push");
          }, 900 + i * 450),
        );
      }
      timers.push(setTimeout(() => setReady(true), 1200 + toEat * 450));
    }
    return () => timers.forEach(clearTimeout);
  }, [p, toEat]);

  const chomping = p.kind !== "compare" && eatenSoFar > 0 && eatenSoFar < toEat;
  let question = "";
  if (p.kind === "left") question = ready ? "How many apples are left?" : `${p.start} apples... here comes the monster!`;
  if (p.kind === "eaten") question = ready ? `There were ${p.start}. Now there are ${p.left}. How many did the monster eat?` : `Look: ${p.start} apples.`;
  if (p.kind === "compare") question = `Purple has ${p.a}, Green has ${p.b}. How many more does Purple have?`;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {p.kind === "compare" ? (
        <div className="flex flex-col gap-3 w-full max-w-3xl rounded-[2rem] bg-white/60 p-4">
          {[
            { n: p.a, color: "#a678f0" },
            { n: p.b, color: "#5cc96b" },
          ].map((row, k) => (
            <div key={k} className="flex items-center gap-3">
              <div className="w-16 h-16 shrink-0">
                <Monster color={row.color} />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: row.n }, (_, i) => (
                  <div key={i} className={`w-7 h-7 sm:w-9 sm:h-9 ${k === 0 && i >= p.b && solved ? "rounded-full ring-4 ring-sun" : ""}`}>
                    <Apple />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative flex items-center gap-4 w-full max-w-3xl rounded-[2rem] bg-white/60 p-5 min-h-44">
          <div className="flex-1">
            <AppleRow count={p.start} hidden={eatenSoFar} size={p.start <= 10 ? "w-14 h-14 sm:w-16 sm:h-16" : undefined} />
          </div>
          <motion.div className="w-28 h-28 shrink-0" animate={chomping ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: chomping ? Infinity : 0, duration: 0.3 }}>
            <Monster chomping={chomping} />
          </motion.div>
          <AnimatePresence>
            {covered && (
              <motion.div
                className="absolute inset-0 rounded-[2rem] bg-berry grid place-items-center text-white text-3xl font-bold"
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
              >
                Munch munch...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      <p className={`text-2xl font-semibold min-h-8 text-center ${solved ? "text-grass-dark" : "text-ink"}`}>
        {solved ? `Yes! ${munchSentence(p)}` : question}
      </p>
      <Choices
        choices={p.options.map((o) => ({ value: o, label: o }))}
        wrong={wrong}
        disabled={!ready || solved}
        accent="#ff6fae"
        shadow="#e04b8e"
        onPick={(v, i) => {
          if (v === p.answer) {
            setSolved(true);
            playSound("correct");
            later(() => onSolved(wrong.length), 1600);
          } else {
            playSound("wrong");
            setWrong((w) => [...w, i]);
          }
        }}
      />
    </div>
  );
}
