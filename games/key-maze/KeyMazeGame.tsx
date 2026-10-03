"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import Board, { type Sprite } from "@/components/grid/Board";
import PlayArea from "@/components/grid/PlayArea";
import { Chest, Door, Grass, Hedge, KEY_COLORS, KeySprite, Robot } from "@/components/grid/Sprites";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { samePos, starsForMoves, type Dir } from "@/lib/grid";
import { useHistory, useIsTouch, useLater } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { LEVELS } from "./levels";
import { ArrowIcon } from "@/components/ui/Icons";
import { move, parseLevel, solve, startState } from "./logic";

function KeyMazeLevel({ level: index, onWin, onLevels }: LevelProps) {
  const level = useMemo(() => parseLevel(LEVELS[index].map), [index]);
  const par = LEVELS[index].par;
  const history = useHistory(startState(level));
  const [shake, setShake] = useState(0);
  const later = useLater();
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasArrows = level.arrows.some((row) => row.some(Boolean));
  const touch = useIsTouch();
  const cell = useCellSize(level.rows, level.cols, touch, 120);
  const s = history.state;

  const onMove = (d: Dir) => {
    if (done) return;
    const res = move(level, s, d);
    if (!res.state) {
      playSound(res.event === "locked" ? "wrong" : "bump");
      setShake((n) => n + 1);
      if (res.event === "locked") {
        const next = { r: s.pos.r + (d === "down" ? 1 : d === "up" ? -1 : 0), c: s.pos.c + (d === "right" ? 1 : d === "left" ? -1 : 0) };
        const door = level.items.find((it) => it.kind === "door" && samePos(it.pos, next));
        if (door) setMessage(`You need a ${KEY_COLORS[door.color].name} key for this door.`);
      } else if (res.event === "oneway") setMessage("That path only goes one way. Follow the arrow!");
      return;
    }
    history.push(res.state);
    playSound(res.event === "key" ? "pick" : res.event === "door" ? "unlock" : "step");
    // after opening a door, check the treasure can still be reached (a key may have been used on the wrong door)
    if (res.event === "door" && !samePos(res.state.pos, level.treasure) && solve(level, res.state) === null) {
      setMessage("Oh no, that door used up the key you needed! Press Undo to try another door.");
    } else setMessage(null);
    if (samePos(res.state.pos, level.treasure)) {
      setDone(true);
      playSound("correct");
      later(() => onWin(starsForMoves(history.moves + 1, par)), 450);
    }
  };

  const sprites: Sprite[] = [
    ...level.items
      .filter((it) => it.kind === "key" && !s.used.includes(it.id))
      .map((it) => ({
        id: `key${it.id}`,
        r: it.pos.r,
        c: it.pos.c,
        z: 1,
        node: (
          <div className="w-full h-full p-[14%] animate-float">
            <KeySprite color={it.color} />
          </div>
        ),
      })),
    { id: "chest", r: level.treasure.r, c: level.treasure.c, z: 1, node: <div className="w-full h-full p-[6%]"><Chest /></div> },
    { id: "hero", r: s.pos.r, c: s.pos.c, z: 3, node: <Robot facing={s.facing} /> },
  ];

  return (
    <PlayArea
      locked={done}
      onMove={onMove}
      onUndo={() => {
        setMessage(null);
        history.undo();
      }}
      canUndo={history.canUndo}
      onRestart={() => {
        history.reset(startState(level));
        setDone(false);
        setMessage(null);
      }}
      onLevels={onLevels}
      moves={history.moves}
      par={par}
      extra={
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className={`text-lg font-semibold text-center min-h-7 ${message ? "text-coral-dark" : "text-ink-soft"}`} role="status">
            {message ?? (hasArrows ? "Arrow paths are one-way: you can only walk the way they point." : "")}
          </p>
          <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/80 min-h-16">
            <span className="text-xl font-semibold text-ink-soft">Backpack:</span>
            <div className="flex gap-1 min-w-12">
              <AnimatePresence>
                {s.bag.map((color, i) => (
                  <motion.div key={`${color}${i}`} className="w-12 h-12" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <KeySprite color={color} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {s.bag.length === 0 && <span className="text-lg text-ink-soft/60">empty</span>}
            </div>
          </div>
        </div>
      }
      board={
        <Board
          rows={level.rows}
          cols={level.cols}
          cell={cell}
          shake={shake}
          onSwipe={onMove}
          frame="#2f7d42"
          sprites={sprites}
          renderCell={(r, c) => {
            if (level.tiles[r][c] === "wall") return <Hedge />;
            const arrow = level.arrows[r][c];
            if (arrow)
              return (
                <div className="w-full h-full relative">
                  <Grass alt={(r + c) % 2 === 0} />
                  <div className="absolute inset-[14%] rounded-xl bg-white/70 grid place-items-center text-grass-dark">
                    <ArrowIcon dir={arrow} className="w-[70%] h-[70%]" />
                  </div>
                </div>
              );
            const door = level.items.find((it) => it.kind === "door" && samePos(it.pos, { r, c }));
            if (door && !s.used.includes(door.id)) return <Door color={door.color} />;
            return <Grass alt={(r + c) % 2 === 0} />;
          }}
        />
      }
    />
  );
}

export default function KeyMazeGame() {
  return <LevelGame gameId="key-maze" accent="grass" count={LEVELS.length} renderLevel={(p) => <KeyMazeLevel {...p} />} />;
}
