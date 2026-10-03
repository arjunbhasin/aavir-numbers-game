"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import Board from "@/components/grid/Board";
import PlayArea from "@/components/grid/PlayArea";
import { Flower, Sprout } from "@/components/math/Art";
import Button from "@/components/ui/Button";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { starsForMistakes } from "@/components/shapes/PatternGame";
import type { Dir } from "@/lib/grid";
import { useIsTouch, useKeydown, useLater } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { LEVELS } from "./levels";
import { GARDEN_COLS, GARDEN_ROWS, plant, shapesFor } from "./logic";

type Shape = { rows: number; cols: number };

function MiniArray({ rows, cols }: Shape) {
  const dot = Math.max(5, Math.min(12, 70 / Math.max(rows, cols)));
  return (
    <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${cols}, ${dot}px)` }}>
      {Array.from({ length: rows * cols }, (_, i) => (
        <span key={i} className="rounded-full bg-berry" style={{ width: dot, height: dot }} />
      ))}
    </div>
  );
}

function GardenLevel({ level, onWin, onLevels }: LevelProps) {
  const n = LEVELS[level];
  const shapes = useMemo(() => shapesFor(n), [n]);
  const [size, setSize] = useState<Shape>({ rows: 1, cols: 1 });
  const [found, setFound] = useState<Shape[]>([]);
  const [blooming, setBlooming] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const [shake, setShake] = useState(0);
  const touch = useIsTouch();
  const cell = useCellSize(GARDEN_ROWS, GARDEN_COLS, false, touch ? 300 : 340, { width: 230, extraHeight: 90 });
  const later = useLater();
  const done = found.length === shapes.length;
  const count = size.rows * size.cols;

  const resize = (d: Dir) => {
    if (blooming || done) return;
    const next = { ...size };
    if (d === "right") next.cols++;
    if (d === "left") next.cols--;
    if (d === "down") next.rows++;
    if (d === "up") next.rows--;
    if (next.cols < 1 || next.rows < 1 || next.cols > GARDEN_COLS || next.rows > GARDEN_ROWS) {
      playSound("bump");
      setShake((s) => s + 1);
      return;
    }
    playSound("step");
    setMessage(null);
    setSize(next);
  };

  const turn = () => {
    if (blooming || done) return;
    if (size.cols > GARDEN_ROWS || size.rows > GARDEN_COLS) {
      playSound("bump");
      setMessage({ text: "That won't fit turned around!", good: false });
      return;
    }
    playSound("click");
    setSize({ rows: size.cols, cols: size.rows });
  };

  const doPlant = () => {
    if (blooming || done) return;
    const result = plant(n, size.rows, size.cols, found);
    if (result === "wrong") {
      playSound("wrong");
      setShake((s) => s + 1);
      setMistakes((m) => m + 1);
      setMessage({ text: count > n ? `That needs ${count} seedlings. You only have ${n}.` : `That's only ${count}. Use all ${n} seedlings!`, good: false });
      return;
    }
    if (result === "turned") {
      playSound("pick");
      setMessage({ text: `Same flowers, just turned around! ${size.rows} × ${size.cols} = ${size.cols} × ${size.rows}`, good: true });
      return;
    }
    if (result === "again") {
      playSound("bump");
      setMessage({ text: "You found that one already. Try another shape!", good: false });
      return;
    }
    playSound("correct");
    setBlooming(true);
    setMessage({ text: `${size.rows} ${size.rows === 1 ? "row" : "rows"} of ${size.cols} = ${n}`, good: true });
    const nowFound = [...found, size];
    later(() => {
      setBlooming(false);
      setFound(nowFound);
      if (nowFound.length === shapes.length) {
        const detail =
          shapes.length === 1
            ? `${n} is a lonely number: only 1 row of ${n} works!`
            : `${n} = ${shapes.map(([a, b]) => `${a} × ${b}`).join(" = ")}`;
        later(() => onWin(starsForMistakes(mistakes), detail), 300);
      } else {
        setSize({ rows: 1, cols: 1 });
      }
    }, 1500);
  };

  useKeydown((e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey) turn();
  });

  const inRect = (r: number, c: number) => r < size.rows && c < size.cols;

  return (
    <PlayArea
      locked={done || blooming}
      onMove={resize}
      onEnter={doPlant}
      onRestart={() => {
        setFound([]);
        setSize({ rows: 1, cols: 1 });
        setMessage(null);
      }}
      onLevels={onLevels}
      dpad={false}
      board={
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/85">
            <div className="w-10 h-10">
              <Sprout />
            </div>
            <span className="text-2xl font-bold text-ink">
              {n} seedlings
            </span>
            <span className={`text-2xl font-bold tabular-nums ${count === n ? "text-grass-dark" : "text-ink-soft"}`}>
              · {size.rows} {size.rows === 1 ? "row" : "rows"} of {size.cols} = {count}
            </span>
          </div>
          <Board
            rows={GARDEN_ROWS}
            cols={GARDEN_COLS}
            cell={cell}
            shake={shake}
            onSwipe={resize}
            frame="#8a5a2b"
            sprites={[]}
            renderCell={(r, c) => (
              <button
                type="button"
                tabIndex={-1}
                aria-label={`Make ${r + 1} rows of ${c + 1}`}
                onClick={() => {
                  if (blooming || done) return;
                  playSound("step");
                  setMessage(null);
                  setSize({ rows: r + 1, cols: c + 1 });
                }}
                className={`w-full h-full relative ${(r + c) % 2 ? "bg-[#a8743f]" : "bg-[#b07c47]"}`}
              >
                {inRect(r, c) && (
                  <div className={`absolute inset-[3px] rounded-lg ${blooming ? "" : "bg-white/20 border-2 border-dashed border-white/70"}`}>
                    <AnimatePresence>
                      {blooming ? (
                        <motion.div
                          key="f"
                          className="w-full h-full"
                          initial={{ scale: 0, y: 6 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: r * 0.12 + c * 0.03, type: "spring", stiffness: 300, damping: 14 }}
                        >
                          <Flower color={r} />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full opacity-80 p-[10%]">
                          <Sprout />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </button>
            )}
          />
        </div>
      }
      side={
        <div className="flex flex-col items-center gap-3 mt-2 lg:mt-14 w-full lg:w-[220px]">
          <p className={`text-xl font-semibold min-h-7 text-center ${message?.good ? "text-grass-dark" : "text-coral-dark"}`}>
            {message?.text ?? "Make a rectangle that uses every seedling."}
          </p>
          <div className="flex gap-3">
            <Button accent="grass" size="lg" onClick={doPlant} disabled={blooming || done} silent>
              Plant!
            </Button>
            <Button accent="white" size="lg" onClick={turn} disabled={blooming || done}>
              Turn
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-1 lg:max-w-[220px]">
            {shapes.map((_, i) => {
              const f = found[i];
              return (
                <motion.div
                  key={i}
                  layout
                  className={`min-w-24 min-h-24 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-2 ${f ? "bg-white shadow-[0_5px_0_#c9d6e6]" : "border-4 border-dashed border-ink-soft/25 bg-white/40"}`}
                >
                  {f ? (
                    <>
                      <MiniArray {...f} />
                      <span className="text-lg font-bold text-ink">
                        {f.rows} × {f.cols}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-ink-soft/30">?</span>
                  )}
                </motion.div>
              );
            })}
          </div>
          <p className="text-ink-soft text-center">{touch ? "Tap a square to make a rectangle that size." : "Arrows change the rows · Enter plants · T turns it around"}</p>
        </div>
      }
    />
  );
}

export default function GardenGame() {
  return <LevelGame gameId="garden" accent="grass" count={LEVELS.length} renderLevel={(p) => <GardenLevel {...p} />} />;
}
