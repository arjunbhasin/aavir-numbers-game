"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { pictureFor } from "@/components/words/WordPictures";
import { useGameKeys, useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeSearch, type Placement } from "./logic";

const FOUND_COLORS = ["#ff9f43", "#4aa3ff", "#a678f0", "#ff6fae"];
type Cell = { r: number; c: number };

function cellsOf(w: Placement): Cell[] {
  return w.word.split("").map((_, k) => ({ r: w.r + (w.dir === "down" ? k : 0), c: w.c + (w.dir === "across" ? k : 0) }));
}

/** Cells in a straight line from a to b (across or down), or null. */
function line(a: Cell, b: Cell): Cell[] | null {
  if (a.r !== b.r && a.c !== b.c) return null;
  const n = Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c));
  const dr = Math.sign(b.r - a.r);
  const dc = Math.sign(b.c - a.c);
  return Array.from({ length: n + 1 }, (_, k) => ({ r: a.r + dr * k, c: a.c + dc * k }));
}

export default function WordSearchPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeSearch(makeRng(seed), difficulty), [seed, difficulty]);
  const [found, setFound] = useState<number[]>([]);
  const [start, setStart] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const [cursor, setCursor] = useState<Cell>({ r: 0, c: 0 });
  const [flash, setFlash] = useState<Cell[] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [dragging, setDragging] = useState(false);
  const later = useLater();
  const solved = found.length === p.words.length;

  const finish = (a: Cell, b: Cell) => {
    setStart(null);
    setHover(null);
    const sel = line(a, b);
    if (!sel || sel.length < 2) return;
    const key = (cs: Cell[]) => cs.map((x) => `${x.r},${x.c}`).join("|");
    const i = p.words.findIndex((w, k) => !found.includes(k) && (key(cellsOf(w)) === key(sel) || key(cellsOf(w)) === key([...sel].reverse())));
    if (i !== -1) {
      const now = [...found, i];
      setFound(now);
      if (now.length === p.words.length) {
        playSound("correct");
        later(() => onSolved(mistakes), 1400);
      } else playSound("pick");
    } else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setFlash(sel);
      later(() => setFlash(null), 500);
    }
  };

  const choose = (cell: Cell) => {
    if (solved) return;
    if (!start) {
      playSound("click");
      setStart(cell);
    } else finish(start, cell);
  };

  useGameKeys({
    enabled: !solved,
    onMove: (d) => {
      const next = {
        r: Math.max(0, Math.min(p.size - 1, cursor.r + (d === "down" ? 1 : d === "up" ? -1 : 0))),
        c: Math.max(0, Math.min(p.size - 1, cursor.c + (d === "right" ? 1 : d === "left" ? -1 : 0))),
      };
      setCursor(next);
      if (start) setHover(next);
    },
    onEnter: () => choose(cursor),
  });

  const preview = start && hover ? line(start, hover) : start ? [start] : null;
  const colorAt = (r: number, c: number) => {
    const i = found.find((k) => cellsOf(p.words[k]).some((x) => x.r === r && x.c === c));
    return i === undefined ? null : FOUND_COLORS[found.indexOf(i) % FOUND_COLORS.length];
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6 w-full justify-center">
      <div
        className="grid gap-1.5 p-3 rounded-3xl bg-white/80 select-none touch-none"
        style={{ gridTemplateColumns: `repeat(${p.size}, minmax(0, 1fr))` }}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        {p.grid.flatMap((row, r) =>
          row.map((ch, c) => {
            const color = colorAt(r, c);
            const inPreview = preview?.some((x) => x.r === r && x.c === c);
            const inFlash = flash?.some((x) => x.r === r && x.c === c);
            const isCursor = cursor.r === r && cursor.c === c;
            return (
              <motion.button
                key={`${r}-${c}`}
                type="button"
                tabIndex={-1}
                aria-label={`${ch}, row ${r + 1} column ${c + 1}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDragging(true);
                  setCursor({ r, c });
                  choose({ r, c });
                }}
                onPointerEnter={() => dragging && start && setHover({ r, c })}
                onPointerUp={() => {
                  if (dragging && start && (start.r !== r || start.c !== c)) finish(start, { r, c });
                  setDragging(false);
                }}
                animate={inFlash ? { x: [0, -4, 4, 0] } : { x: 0 }}
                className={`w-[clamp(2.6rem,11vw,4rem)] aspect-square rounded-xl grid place-items-center text-3xl font-bold uppercase
                  ${isCursor ? "ring-4 ring-ocean" : ""} ${inFlash ? "bg-coral text-white" : inPreview ? "bg-sun text-white" : color ? "text-white" : "bg-white text-ink"}`}
                style={color && !inPreview && !inFlash ? { background: color } : undefined}
              >
                {ch}
              </motion.button>
            );
          }),
        )}
      </div>
      <div className="flex lg:flex-col flex-wrap justify-center gap-3">
        {p.words.map((w, i) => {
          const isFound = found.includes(i);
          return (
            <div key={w.word} className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${isFound ? "bg-grass/20" : "bg-white/80"}`}>
              <span className="w-12 h-12">{pictureFor(w.word)}</span>
              <span className={`text-xl font-bold uppercase ${isFound ? "text-grass-dark line-through" : "text-ink-soft"}`}>{isFound ? w.word : "?".repeat(w.word.length)}</span>
            </div>
          );
        })}
        <p className="hidden lg:block text-ink-soft max-w-48">Tap the first letter, then the last. Or drag across the word.</p>
      </div>
    </div>
  );
}
