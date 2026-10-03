"use client";

import { useMemo, useState } from "react";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { LetterBox, PictureCard } from "@/components/words/LetterTile";
import { pictureFor } from "@/components/words/WordPictures";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeMissingLetter } from "./logic";

export default function MissingLetterPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeMissingLetter(makeRng(seed), difficulty), [seed, difficulty]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const later = useLater();
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <PictureCard label={p.word}>{pictureFor(p.word)}</PictureCard>
      <div className="flex gap-2">
        {p.word.split("").map((ch, i) => (
          <LetterBox key={i} size="lg" ch={i === p.gap ? (solved ? ch : "?") : ch} state={i === p.gap ? (solved ? "right" : "empty") : "filled"} />
        ))}
      </div>
      <p className="text-2xl font-semibold text-ink min-h-8">{solved ? <span className="text-grass-dark">Yes! {p.word.toUpperCase()}</span> : "Which letter is missing?"}</p>
      <Choices
        choices={p.options.map((o) => ({ value: o, label: <span className="uppercase text-4xl">{o}</span>, aria: o }))}
        wrong={wrong}
        disabled={solved}
        accent="#ff6fae"
        shadow="#e04b8e"
        onPick={(v, i) => {
          if (v === p.word[p.gap]) {
            setSolved(true);
            playSound("correct");
            later(() => onSolved(wrong.length), 1300);
          } else {
            playSound("wrong");
            setWrong((w) => [...w, i]);
          }
        }}
      />
    </div>
  );
}
