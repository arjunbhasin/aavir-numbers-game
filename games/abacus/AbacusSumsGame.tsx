"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import Abacus, { useAbacusKeys } from "@/components/abacus/Abacus";
import Button from "@/components/ui/Button";
import { GridIcon } from "@/components/ui/Icons";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { starsForMistakes } from "@/components/shapes/PatternGame";
import { METHOD_NAMES, formula, methodFor } from "@/lib/abacus";
import { useGameKeys, useLater } from "@/lib/input";
import { makeRng, randomSeed } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { SUMS_PER_LEVEL, SUM_LEVELS, makeSum } from "./logic";

function SumsLevel({ level, onWin, onLevels }: LevelProps) {
  const [seed] = useState(randomSeed);
  const sums = useMemo(() => {
    const rng = makeRng(seed);
    return Array.from({ length: SUMS_PER_LEVEL }, () => makeSum(rng, level));
  }, [seed, level]);
  const [index, setIndex] = useState(0);
  const sum = sums[index];
  const [value, setValue] = useState(sum.terms[0]);
  const [selected, setSelected] = useState(sum.rods - 1);
  const [mistakes, setMistakes] = useState(0);
  const [hint, setHint] = useState(false);
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const later = useLater();

  // the next number still to add, for the hint
  const added = sum.terms.slice(1).findIndex((_, k) => value < sum.terms.slice(0, k + 2).reduce((a, b) => a + b, 0));
  const nextTerm = added === -1 ? null : sum.terms[added + 1];
  const before = added === -1 ? value : sum.terms.slice(0, added + 1).reduce((a, b) => a + b, 0);

  const check = () => {
    if (busy) return;
    if (value !== sum.answer) {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setMessage({ text: `Your abacus shows ${value}. Keep going!`, good: false });
      return;
    }
    playSound("correct");
    setBusy(true);
    setMessage({ text: `${sum.terms.join(" + ")} = ${sum.answer}`, good: true });
    later(() => {
      if (index + 1 >= sums.length) {
        onWin(starsForMistakes(mistakes), `${SUMS_PER_LEVEL} abacus sums done!`);
        return;
      }
      const next = sums[index + 1];
      setIndex(index + 1);
      setValue(next.terms[0]);
      setSelected(next.rods - 1);
      setHint(false);
      setMessage(null);
      setBusy(false);
    }, 1400);
  };

  useAbacusKeys({ enabled: !busy, value, rods: sum.rods, selected, setSelected, onChange: setValue });
  useGameKeys({ enabled: !busy, onEnter: check });

  const hintText = () => {
    if (nextTerm === null) return "You've added everything. Press Check!";
    const ones = nextTerm % 10;
    const tens = Math.floor(nextTerm / 10);
    const parts: string[] = [];
    if (ones) {
      const m = methodFor(before % 10, ones);
      parts.push(`Ones rod: +${ones} is ${METHOD_NAMES[m].toLowerCase()}: ${formula(m, ones)}`);
    }
    if (tens) parts.push(`Tens rod: add ${tens}`);
    return parts.join(" · ");
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <span className="px-4 py-1 rounded-full bg-white/80 text-lg font-semibold text-ink-soft">{SUM_LEVELS[level].title}</span>
        <div className="flex gap-1.5" role="img" aria-label={`Sum ${index + 1} of ${sums.length}`}>
          {sums.map((_, i) => (
            <span key={i} className={`w-4 h-4 rounded-full border-4 ${i < index ? "bg-grass border-grass" : i === index ? "bg-white border-sun" : "bg-white/60 border-white"}`} />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={index} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl font-bold text-ink tabular-nums">
          {sum.terms.join(" + ")} = ?
        </motion.p>
      </AnimatePresence>
      <div className="w-[min(90vw,calc(var(--rods)*7rem+2rem))]" style={{ ["--rods" as string]: sum.rods }}>
        <Abacus value={value} rods={sum.rods} onChange={busy ? undefined : setValue} selected={selected} onSelect={setSelected} />
      </div>
      <p className={`text-xl font-semibold min-h-7 text-center ${message?.good ? "text-grass-dark" : message ? "text-coral-dark" : "text-ink-soft"}`}>
        {message?.text ?? (hint ? hintText() : `Start with ${sum.terms[0]}, then add ${sum.terms.slice(1).join(", then ")}.`)}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button accent="coral" size="lg" onClick={check} disabled={busy} silent>
          Check
        </Button>
        <Button accent="white" size="lg" onClick={() => setHint(true)} disabled={busy || hint}>
          Hint
        </Button>
        <Button accent="white" size="lg" onClick={() => setValue(sum.terms[0])} disabled={busy}>
          Start again
        </Button>
        <Button accent="white" size="lg" onClick={onLevels} icon={<GridIcon className="w-6 h-6" />}>
          Levels
        </Button>
      </div>
      <p className="hidden md:block text-ink-soft">← → pick a rod · ↑ ↓ move a bottom bead · Space moves the top bead · Enter checks</p>
    </div>
  );
}

export default function AbacusSumsGame() {
  return <LevelGame gameId="abacus-sums" accent="coral" count={SUM_LEVELS.length} renderLevel={(p) => <SumsLevel {...p} />} />;
}
