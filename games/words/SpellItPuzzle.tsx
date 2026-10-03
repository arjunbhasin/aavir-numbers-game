"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { LetterBox, PictureCard } from "@/components/words/LetterTile";
import { pictureFor } from "@/components/words/WordPictures";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeSpell } from "./logic";

export default function SpellItPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeSpell(makeRng(seed), difficulty), [seed, difficulty]);
  // the first `given` letters are already in place, using up a matching tile
  const [used, setUsed] = useState<number[]>(() => {
    const u: number[] = [];
    for (let k = 0; k < p.given; k++) u.push(p.tiles.findIndex((t, i) => t === p.word[k] && !u.includes(i)));
    return u;
  });
  const [shake, setShake] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const later = useLater();
  const filled = used.length;
  const solved = filled === p.word.length;

  const tap = (i: number) => {
    if (solved || used.includes(i)) return;
    if (p.tiles[i] === p.word[filled]) {
      const now = [...used, i];
      setUsed(now);
      if (now.length === p.word.length) {
        playSound("correct");
        later(() => onSolved(mistakes), 1300);
      } else playSound("pick");
    } else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setShake(i);
      later(() => setShake(null), 450);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || !/^[a-zA-Z]$/.test(e.key)) return;
      const ch = e.key.toLowerCase();
      // prefer a tile with the right letter; otherwise any unused tile with that letter (it will shake)
      const i = p.tiles.findIndex((t, k) => t === ch && !used.includes(k));
      if (i !== -1) tap(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <PictureCard label={p.word}>{pictureFor(p.word)}</PictureCard>
      <div className="flex gap-2">
        {p.word.split("").map((ch, i) => (
          <LetterBox key={i} size="lg" ch={i < filled ? ch : undefined} state={i < filled ? (solved ? "right" : i < p.given ? "given" : "filled") : "empty"} active={i === filled && !solved} />
        ))}
      </div>
      <p className="text-2xl font-semibold text-ink min-h-8">
        {solved ? <span className="text-grass-dark">You spelled {p.word.toUpperCase()}!</span> : "Tap the letters in order."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {p.tiles.map((t, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => tap(i)}
            disabled={used.includes(i) || solved}
            aria-label={`Letter ${t}`}
            animate={shake === i ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0, opacity: used.includes(i) ? 0.2 : 1 }}
            className="btn-3d w-[clamp(3.5rem,13vw,5rem)] aspect-square rounded-2xl bg-ocean text-white text-4xl font-bold uppercase"
            style={{ ["--btn-shadow" as string]: "#2b7fdc" }}
          >
            {t}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
