"use client";

import { useMemo, useState } from "react";
import Board, { type Sprite } from "@/components/grid/Board";
import PlayArea from "@/components/grid/PlayArea";
import { Robot, Wall } from "@/components/grid/Sprites";
import { Carton, Egg } from "@/components/math/Art";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { starsForMoves, type Dir } from "@/lib/grid";
import { useHistory, useIsTouch, useLater } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { LEVELS } from "./levels";
import { isSolved, isStuck, move, packSentence, parseLevel } from "./logic";

function PackingLevel({ level: index, onWin, onLevels }: LevelProps) {
  const level = useMemo(() => parseLevel(LEVELS[index].map), [index]);
  const par = LEVELS[index].par;
  const history = useHistory(level.start);
  const [shake, setShake] = useState(0);
  const [done, setDone] = useState(false);
  const touch = useIsTouch();
  const cell = useCellSize(level.rows, level.cols, touch, 60);
  const later = useLater();
  const s = history.state;
  const stuck = isStuck(level, s);
  const sizes = [...new Set(level.boxes.map((b) => b.capacity))].sort();

  const onMove = (d: Dir) => {
    if (done) return;
    const res = move(level, s, d);
    if (!res) {
      playSound("bump");
      setShake((n) => n + 1);
      return;
    }
    history.push(res.state);
    if (isSolved(level, res.state)) {
      setDone(true);
      playSound("correct");
      later(() => onWin(starsForMoves(history.moves + 1, par), packSentence(level, res.state)), 600);
    } else {
      playSound(res.event === "full" ? "correct" : res.event === "pack" ? "pick" : res.event === "push" ? "push" : "step");
    }
  };

  const sprites: Sprite[] = [
    ...s.eggs.map((e) => ({
      id: `egg-${e.id}`,
      r: e.r,
      c: e.c,
      node: (
        <div className="w-full h-full p-[12%]">
          <Egg />
        </div>
      ),
    })),
    { id: "robot", r: s.player.r, c: s.player.c, z: 3, node: <Robot facing={s.facing} /> },
  ];

  return (
    <PlayArea
      locked={done}
      onMove={onMove}
      onUndo={history.undo}
      canUndo={history.canUndo}
      onRestart={() => {
        history.reset(level.start);
        setDone(false);
      }}
      onLevels={onLevels}
      moves={history.moves}
      par={par}
      extra={
        <div className="flex flex-col items-center gap-1 mt-4 px-5 py-2 rounded-2xl bg-white/85">
          <p className="text-xl font-semibold text-ink">
            {s.eggs.length} {s.eggs.length === 1 ? "egg" : "eggs"} to pack · boxes hold {sizes.join(", ")}
          </p>
          <p className={`text-lg font-semibold ${stuck ? "text-coral-dark" : "text-ink-soft"}`}>
            {stuck ? "Oh no, a box is only half full! Press Undo and try a different box." : "Every egg in a box, and every box you use must be full."}
          </p>
        </div>
      }
      board={
        <Board
          rows={level.rows}
          cols={level.cols}
          cell={cell}
          shake={shake}
          onSwipe={onMove}
          frame="#7b8db8"
          sprites={sprites}
          renderCell={(r, c) => {
            if (level.walls[r][c]) return <Wall />;
            const bi = level.boxes.findIndex((b) => b.pos.r === r && b.pos.c === c);
            return (
              <div className={`w-full h-full ${(r + c) % 2 ? "bg-[#f3ead8]" : "bg-[#efe3cc]"}`}>
                {bi !== -1 && (
                  <div className="w-full h-full p-[4%]">
                    <Carton capacity={level.boxes[bi].capacity} filled={s.fills[bi]} />
                  </div>
                )}
              </div>
            );
          }}
        />
      }
    />
  );
}

export default function PackingGame() {
  return <LevelGame gameId="packing" accent="ocean" count={LEVELS.length} renderLevel={(p) => <PackingLevel {...p} />} />;
}
