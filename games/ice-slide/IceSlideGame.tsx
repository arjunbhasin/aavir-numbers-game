"use client";

import { useMemo, useState } from "react";
import Board from "@/components/grid/Board";
import PlayArea from "@/components/grid/PlayArea";
import { Fish, Ice, Penguin, Rock, Snow } from "@/components/grid/Sprites";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { samePos, starsForMoves, type Dir, type Pos } from "@/lib/grid";
import { useHistory, useIsTouch } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { LEVELS } from "./levels";
import { parseLevel, slide } from "./logic";

type State = { pos: Pos; facing: Dir; dist: number };

function IceSlideLevel({ level: index, onWin, onLevels }: LevelProps) {
  const level = useMemo(() => parseLevel(LEVELS[index].map), [index]);
  const par = LEVELS[index].par;
  const start: State = { pos: level.start, facing: "down", dist: 0 };
  const history = useHistory(start);
  const [shake, setShake] = useState(0);
  const [done, setDone] = useState(false);
  const touch = useIsTouch();
  const cell = useCellSize(level.rows, level.cols, touch);
  const s = history.state;

  const onMove = (d: Dir) => {
    if (done) return;
    const path = slide(level, s.pos, d);
    if (!path.length) {
      playSound("bump");
      setShake((n) => n + 1);
      return;
    }
    const end = path[path.length - 1];
    history.push({ pos: end, facing: d, dist: path.length });
    playSound("push");
    if (samePos(end, level.fish)) {
      setDone(true);
      setTimeout(() => playSound("correct"), path.length * 70);
      setTimeout(() => onWin(starsForMoves(history.moves + 1, par)), path.length * 70 + 500);
    }
  };

  return (
    <PlayArea
      locked={done}
      onMove={onMove}
      onUndo={history.undo}
      canUndo={history.canUndo}
      onRestart={() => {
        history.reset(start);
        setDone(false);
      }}
      onLevels={onLevels}
      moves={history.moves}
      par={par}
      board={
        <Board
          rows={level.rows}
          cols={level.cols}
          cell={cell}
          shake={shake}
          onSwipe={onMove}
          frame="#7cc4f2"
          sprites={[
            ...([{ id: "fish", r: level.fish.r, c: level.fish.c, z: 1, node: <div className="p-[12%] w-full h-full animate-float"><Fish /></div> }]),
            {
              id: "penguin",
              r: s.pos.r,
              c: s.pos.c,
              z: 3,
              duration: Math.max(0.12, s.dist * 0.07),
              node: <Penguin facing={s.facing} />,
            },
          ]}
          renderCell={(r, c) => {
            const t = level.tiles[r][c];
            if (t === "rock") return <Rock />;
            if (t === "snow") return <Snow />;
            return <Ice alt={(r + c) % 2 === 0} />;
          }}
        />
      }
    />
  );
}

export default function IceSlideGame() {
  return <LevelGame gameId="ice-slide" accent="ocean" count={LEVELS.length} renderLevel={(p) => <IceSlideLevel {...p} />} />;
}
