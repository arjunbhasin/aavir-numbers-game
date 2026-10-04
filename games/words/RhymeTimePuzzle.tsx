"use client";

import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { PictureCard } from "@/components/words/LetterTile";
import { pictureFor } from "@/components/words/WordPictures";
import { useGameKeys, useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeRhyme } from "./logic";

export default function RhymeTimePuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeRhyme(makeRng(seed), difficulty), [seed, difficulty]);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [focus, setFocus] = useState(-1);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const later = useLater();
  const solved = found.length === p.rhymes.length;

  const tap = (w: string) => {
    if (solved || found.includes(w) || wrong.includes(w)) return;
    if (p.rhymes.includes(w)) {
      const now = [...found, w];
      setFound(now);
      if (now.length === p.rhymes.length) {
        playSound("correct");
        later(() => onSolved(wrong.length), 1400);
      } else playSound("pick");
    } else {
      playSound("wrong");
      setWrong((x) => [...x, w]);
    }
  };

  useGameKeys({
    enabled: !solved,
    onMove: (d) => {
      const direction = d === "left" || d === "up" ? -1 : 1;
      let next = focus;
      for (let tries = 0; tries < p.choices.length; tries++) {
        next = direction < 0 ? (next <= 0 ? p.choices.length - 1 : next - 1) : (next + 1) % p.choices.length;
        if (found.includes(p.choices[next]) || wrong.includes(p.choices[next])) continue;
        buttons.current[next]?.focus();
        setFocus(next);
        break;
      }
    },
    onEnter: () => focus >= 0 && tap(p.choices[focus]),
  });

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="flex flex-col items-center gap-2">
        <PictureCard label={p.target}>{pictureFor(p.target)}</PictureCard>
        <span className="text-4xl font-bold text-grape-dark uppercase tracking-wide">{p.target}</span>
      </div>
      <p className="text-2xl font-semibold text-ink min-h-8 text-center">
        {solved ? (
          <span className="text-grass-dark">
            {[p.target, ...p.rhymes].map((w) => w.toUpperCase()).join(", ")} all rhyme!
          </span>
        ) : p.rhymes.length > 1 ? (
          `Find the ${p.rhymes.length} pictures that rhyme with ${p.target.toUpperCase()}.`
        ) : (
          `Which picture rhymes with ${p.target.toUpperCase()}?`
        )}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {p.choices.map((w, i) => {
          const isFound = found.includes(w);
          const isWrong = wrong.includes(w);
          return (
            <motion.button
              key={w}
              ref={(button) => { buttons.current[i] = button; }}
              onFocus={() => setFocus(i)}
              type="button"
              onClick={() => tap(w)}
              disabled={solved || isFound || isWrong}
              aria-label={w}
              animate={isWrong ? { x: [0, -8, 8, -5, 5, 0] } : isFound ? { scale: [1, 1.1, 1] } : {}}
              className={`btn-3d flex flex-col items-center gap-1 rounded-3xl bg-white p-3 w-[clamp(7rem,22vw,10rem)]
                ${isFound ? "ring-8 ring-grass" : ""} ${isWrong ? "opacity-40" : ""} ${focus === i ? "ring-4 ring-ocean" : ""}`}
              style={{ ["--btn-shadow" as string]: isFound ? "#3aa64b" : "#c9d6e6" }}
            >
              <span className="w-full aspect-square p-2">{pictureFor(w)}</span>
              <span className="text-2xl font-bold text-ink uppercase">{w}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
