"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import Board, { type Sprite } from "@/components/grid/Board";
import PlayArea from "@/components/grid/PlayArea";
import { Chest, Door, Grass, Hedge, KeySprite, Robot } from "@/components/grid/Sprites";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { samePos, starsForMoves, type Dir } from "@/lib/grid";
import { useHistory, useIsTouch } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { LEVELS } from "./levels";
import { move, parseLevel, startState } from "./logic";

function KeyMazeLevel({ level: index, onWin, onLevels }: LevelProps) {
  const level = useMemo(() => parseLevel(LEVELS[index].map), [index]);
  const par = LEVELS[index].par;
  const history = useHistory(startState(level));
  const [shake, setShake] = useState(0);
  const [done, setDone] = useState(false);
  const touch = useIsTouch();
  const cell = useCellSize(level.rows, level.cols, touch, 70);
  const s = history.state;

  const onMove = (d: Dir) => {
    if (done) return;
    const res = move(level, s, d);
    if (!res.state) {
      playSound(res.event === "locked" ? "wrong" : "bump");
      setShake((n) => n + 1);
      return;
    }
    history.push(res.state);
    playSound(res.event === "key" ? "pick" : res.event === "door" ? "unlock" : "step");
    if (samePos(res.state.pos, level.treasure)) {
      setDone(true);
      playSound("correct");
      setTimeout(() => onWin(starsForMoves(history.moves + 1, par)), 450);
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
      onUndo={history.undo}
      canUndo={history.canUndo}
      onRestart={() => {
        history.reset(startState(level));
        setDone(false);
      }}
      onLevels={onLevels}
      moves={history.moves}
      par={par}
      extra={
        <div className="flex items-center gap-3 mt-4 px-5 py-2 rounded-2xl bg-white/80 min-h-16">
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
