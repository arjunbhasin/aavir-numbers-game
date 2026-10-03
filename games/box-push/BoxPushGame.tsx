"use client";

import { useMemo, useState } from "react";
import Board, { type Sprite } from "@/components/grid/Board";
import PlayArea from "@/components/grid/PlayArea";
import { Crate, Floor, Goal, Robot, Wall } from "@/components/grid/Sprites";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { starsForMoves, type Dir } from "@/lib/grid";
import { useHistory, useIsTouch, useLater } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { LEVELS } from "./levels";
import { boxStuckInCorner, isGoal, isSolved, move, parseLevel } from "./logic";

function BoxPushLevel({ level: index, onWin, onLevels }: LevelProps) {
  const level = useMemo(() => parseLevel(LEVELS[index].map), [index]);
  const par = LEVELS[index].par;
  const history = useHistory(level.start);
  const [shake, setShake] = useState(0);
  const later = useLater();
  const [done, setDone] = useState(false);
  const touch = useIsTouch();
  const cell = useCellSize(level.rows, level.cols, touch, 40);
  const s = history.state;

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
      later(() => onWin(starsForMoves(history.moves + 1, par)), 450);
    } else if (res.pushed) {
      const landed = res.state.boxes.some((b, i) => isGoal(level, b) && !isGoal(level, s.boxes[i]));
      playSound(landed ? "pick" : "push");
    } else {
      playSound("step");
    }
  };

  const sprites: Sprite[] = [
    ...s.boxes.map((b, i) => ({ id: `box${i}`, r: b.r, c: b.c, node: <Crate onGoal={isGoal(level, b)} /> })),
    { id: "player", r: s.player.r, c: s.player.c, z: 3, node: <Robot facing={s.facing} /> },
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
      extra={
        <p className={`text-lg font-semibold text-center min-h-7 mt-3 ${boxStuckInCorner(level, s) ? "text-coral-dark" : "text-transparent"}`} role="status">
          {boxStuckInCorner(level, s) ? "Oh no, a box is stuck in a corner! Press Undo to take that push back." : "."}
        </p>
      }
      par={par}
      board={
        <Board
          rows={level.rows}
          cols={level.cols}
          cell={cell}
          shake={shake}
          onSwipe={onMove}
          frame="#9fb0d8"
          sprites={sprites}
          renderCell={(r, c) => {
            const kind = level.cells[r][c];
            if (kind === "wall") return <Wall />;
            if (kind === "void") return <div className="w-full h-full bg-[#9fb0d8]" />;
            return (
              <>
                <Floor alt={(r + c) % 2 === 0} />
                {isGoal(level, { r, c }) && (
                  <div className="absolute inset-[12%]">
                    <Goal />
                  </div>
                )}
              </>
            );
          }}
        />
      }
    />
  );
}

export default function BoxPushGame() {
  return <LevelGame gameId="box-push" accent="coral" count={LEVELS.length} renderLevel={(p) => <BoxPushLevel {...p} />} />;
}
