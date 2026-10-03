"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { LetterBox, PictureCard } from "@/components/words/LetterTile";
import { pictureFor } from "@/components/words/WordPictures";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { changedIndex, ladderOptions, makeLadder } from "./logic";

export default function WordLadderPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeLadder(makeRng(seed), difficulty), [seed, difficulty]);
  const options = useMemo(() => {
    const rng = makeRng(seed + 1);
    return p.words.slice(1).map((w, i) => ladderOptions(rng, p.words[i], w));
  }, [p, seed]);
  const [step, setStep] = useState(0); // words made so far
  const [wrong, setWrong] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const later = useLater();
  const solved = step === p.words.length - 1;
  const current = p.words[step];
  const next = p.words[step + 1];
  const gap = next ? changedIndex(current, next) : -1;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* the ladder so far */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {p.words.slice(0, step + 1).map((w, i) => (
          <div key={w} className="flex items-center gap-2">
            {i > 0 && <span className="text-2xl text-ink-soft font-bold">→</span>}
            <div className="flex flex-col items-center px-2 py-1 rounded-2xl bg-white/80">
              <span className="w-12 h-12">{pictureFor(w)}</span>
              <span className="text-lg font-bold uppercase text-ink">{w}</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {solved ? (
          <motion.p key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-3xl font-bold text-grass-dark text-center">
            {p.words.map((w) => w.toUpperCase()).join(" → ")}
          </motion.p>
        ) : (
          <motion.div key={step} className="flex flex-col items-center gap-4" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {current.split("").map((ch, i) => (
                  <LetterBox key={i} size="lg" ch={i === gap ? "?" : ch} state={i === gap ? "empty" : "filled"} active={i === gap} />
                ))}
              </div>
              <span className="text-4xl font-bold text-ink-soft">→</span>
              <PictureCard size="w-28 h-28 sm:w-32 sm:h-32" label={next}>
                {pictureFor(next)}
              </PictureCard>
            </div>
            <p className="text-2xl font-semibold text-ink text-center">
              Change one letter of {current.toUpperCase()} to make the picture.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!solved && (
        <Choices
          key={step}
          choices={options[step].map((o) => ({ value: o, label: <span className="uppercase text-4xl">{o}</span>, aria: o }))}
          wrong={wrong}
          accent="#ff7a6b"
          shadow="#e35a4a"
          onPick={(v, i) => {
            if (v === next[gap]) {
              playSound(step + 2 === p.words.length ? "correct" : "pick");
              setWrong([]);
              setStep(step + 1);
              if (step + 2 === p.words.length) later(() => onSolved(mistakes), 1600);
            } else {
              playSound("wrong");
              setMistakes((m) => m + 1);
              setWrong((w) => [...w, i]);
            }
          }}
        />
      )}
    </div>
  );
}
