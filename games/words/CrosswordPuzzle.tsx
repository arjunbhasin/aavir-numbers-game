"use client";

import KeyboardHint from "@/components/ui/KeyboardHint";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { pictureFor } from "@/components/words/WordPictures";
import { ArrowIcon } from "@/components/ui/Icons";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { crosswordTiles, makeCrossword, type Entry } from "./logic";

const key = (r: number, c: number) => `${r},${c}`;
const cellsOf = (e: Entry) => e.word.split("").map((_, k) => ({ r: e.r + (e.dir === "down" ? k : 0), c: e.c + (e.dir === "across" ? k : 0) }));

export default function CrosswordPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const { cw, tiles } = useMemo(() => {
    const rng = makeRng(seed);
    const grid = makeCrossword(rng, difficulty);
    return { cw: grid, tiles: crosswordTiles(rng, grid) };
  }, [seed, difficulty]);
  const solution = useMemo(() => {
    const m = new Map<string, string>();
    cw.entries.forEach((e) => cellsOf(e).forEach((x, k) => m.set(key(x.r, x.c), e.word[k])));
    return m;
  }, [cw]);
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [active, setActive] = useState(0); // entry index
  const [pos, setPos] = useState(0); // letter index in the active entry
  const [done, setDone] = useState<number[]>([]);
  const [bad, setBad] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const later = useLater();
  const solved = done.length === cw.entries.length;
  const entry = cw.entries[active];
  const cur = cellsOf(entry)[pos];

  const lockedCell = (r: number, c: number) => done.some((i) => cellsOf(cw.entries[i]).some((x) => x.r === r && x.c === c));

  const checkEntries = (next: Record<string, string>) => {
    let nowDone = [...done];
    cw.entries.forEach((e, i) => {
      if (nowDone.includes(i)) return;
      const cells = cellsOf(e);
      if (!cells.every((x) => next[key(x.r, x.c)])) return;
      if (cells.every((x, k) => next[key(x.r, x.c)] === e.word[k])) {
        nowDone = [...nowDone, i];
        playSound(nowDone.length === cw.entries.length ? "correct" : "pick");
      } else if (i === active) {
        playSound("wrong");
        setMistakes((m) => m + 1);
        setBad(i);
        later(() => setBad(null), 600);
      }
    });
    setDone(nowDone);
    if (nowDone.length === cw.entries.length) later(() => onSolved(mistakes), 1500);
    return nowDone;
  };

  const goToNextOpen = (fromDone: number[]) => {
    const order = cw.entries.map((_, i) => (active + 1 + i) % cw.entries.length);
    const next = order.find((i) => !fromDone.includes(i));
    if (next === undefined) return;
    setActive(next);
    const firstEmpty = cellsOf(cw.entries[next]).findIndex((x) => !typed[key(x.r, x.c)] || !lockedCell(x.r, x.c));
    setPos(Math.max(0, firstEmpty));
  };

  const type = (ch: string) => {
    if (solved) return;
    const cells = cellsOf(entry);
    let p = pos;
    // a solved square shared with another word: typing its own letter just steps over it
    while (p < cells.length && lockedCell(cells[p].r, cells[p].c)) {
      if (solution.get(key(cells[p].r, cells[p].c)) === ch) {
        setPos(Math.min(p + 1, cells.length - 1));
        return;
      }
      p++;
    }
    if (p >= cells.length) return;
    const next = { ...typed, [key(cells[p].r, cells[p].c)]: ch };
    setTyped(next);
    let q = p + 1;
    while (q < cells.length && lockedCell(cells[q].r, cells[q].c)) q++;
    const nowDone = checkEntries(next);
    if (q < cells.length) setPos(q);
    else if (nowDone.includes(active)) goToNextOpen(nowDone);
    else setPos(cells.length - 1);
  };

  const erase = () => {
    const cells = cellsOf(entry);
    let p = pos;
    if (!typed[key(cells[p].r, cells[p].c)] || lockedCell(cells[p].r, cells[p].c)) p = Math.max(0, p - 1);
    while (p > 0 && lockedCell(cells[p].r, cells[p].c)) p--;
    if (lockedCell(cells[p].r, cells[p].c)) return;
    const next = { ...typed };
    delete next[key(cells[p].r, cells[p].c)];
    setTyped(next);
    setPos(p);
  };

  const selectCell = (r: number, c: number) => {
    // prefer the entry we're in; tapping the same cell again switches across/down
    const owners = cw.entries.map((e, i) => ({ i, k: cellsOf(e).findIndex((x) => x.r === r && x.c === c) })).filter((o) => o.k !== -1);
    if (!owners.length) return;
    const sameCell = cur.r === r && cur.c === c;
    const pick = sameCell && owners.length > 1 ? owners.find((o) => o.i !== active)! : (owners.find((o) => o.i === active) ?? owners[0]);
    setActive(pick.i);
    setPos(pick.k);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || solved) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        type(e.key.toLowerCase());
      } else if (e.key === "Backspace") {
        e.preventDefault();
        erase();
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const dr = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        const dc = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        for (let k = 1; k < 7; k++) {
          const r = cur.r + dr * k;
          const c = cur.c + dc * k;
          if (r < 0 || c < 0 || r >= cw.rows || c >= cw.cols) break;
          if (solution.has(key(r, c))) {
            selectCell(r, c);
            break;
          }
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        goToNextOpen(done.filter((i) => i !== active).concat(active));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const numberAt = new Map(cw.entries.map((e) => [key(e.r, e.c), e.num]));
  const activeCells = new Set(cellsOf(entry).map((x) => key(x.r, x.c)));

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="grid gap-1 p-2 rounded-2xl bg-ink/80" style={{ gridTemplateColumns: `repeat(${cw.cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cw.rows * cw.cols }, (_, n) => {
            const r = Math.floor(n / cw.cols);
            const c = n % cw.cols;
            const k = key(r, c);
            if (!solution.has(k)) return <div key={k} className="w-[clamp(2.6rem,11vw,4rem)] aspect-square" />;
            const locked = lockedCell(r, c);
            const isCur = cur.r === r && cur.c === c && !solved;
            const inBad = bad !== null && cellsOf(cw.entries[bad]).some((x) => x.r === r && x.c === c);
            return (
              <motion.button
                key={k}
                type="button"
                tabIndex={-1}
                onClick={() => selectCell(r, c)}
                aria-label={`Square ${r + 1}, ${c + 1}${typed[k] ? `: ${typed[k]}` : ""}`}
                animate={inBad ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
                className={`relative w-[clamp(2.6rem,11vw,4rem)] aspect-square rounded-lg grid place-items-center text-3xl font-bold uppercase
                  ${locked ? "bg-grass text-white" : inBad ? "bg-coral text-white" : activeCells.has(k) && !solved ? "bg-[#fff1a8] text-ink" : "bg-white text-ink"}
                  ${isCur ? "ring-4 ring-ocean z-10" : ""}`}
              >
                {numberAt.has(k) && <span className="absolute left-1 top-0.5 text-xs font-bold opacity-70">{numberAt.get(k)}</span>}
                {typed[k] ?? ""}
              </motion.button>
            );
          })}
        </div>
        <div className="flex md:flex-col flex-wrap justify-center gap-2">
          {cw.entries.map((e, i) => (
            <button
              key={`${e.num}-${e.dir}`}
              type="button"
              onClick={() => {
                setActive(i);
                setPos(0);
              }}
              aria-label={`Clue ${e.num} ${e.dir}`}
              data-word={e.word}
              className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${done.includes(i) ? "bg-grass/25" : i === active ? "bg-[#fff1a8] ring-4 ring-sun" : "bg-white/85"}`}
            >
              <span className="text-lg font-bold text-ink w-5">{e.num}</span>
              <ArrowIcon dir={e.dir === "across" ? "right" : "down"} className="w-5 h-5 text-ink-soft" />
              <span className="w-12 h-12">{pictureFor(e.word)}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-xl font-semibold text-ink min-h-7 text-center">
        {solved ? <span className="text-grass-dark">Crossword complete!</span> : "Tap a square, then tap or type the letters."}
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {tiles.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => type(t)}
            disabled={solved}
            aria-label={`Letter ${t}`}
            className="btn-3d w-[clamp(3rem,11vw,4rem)] aspect-square rounded-xl bg-tangerine text-white text-3xl font-bold uppercase"
            style={{ ["--btn-shadow" as string]: "#e57f1a" }}
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          onClick={erase}
          disabled={solved}
          aria-label="Delete letter"
          className="btn-3d h-[clamp(3rem,11vw,4rem)] px-4 rounded-xl bg-white text-ink text-xl font-bold"
          style={{ ["--btn-shadow" as string]: "#c9d6e6" }}
        >
          ⌫
        </button>
      </div>
      <KeyboardHint touch="Tap a square, then tap the letters. ⌫ deletes.">Type letters · Backspace deletes · arrows move · Tab goes to the next word</KeyboardHint>
    </div>
  );
}
