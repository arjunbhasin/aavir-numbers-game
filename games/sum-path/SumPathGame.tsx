"use client";

import { useMemo, useState } from "react";
import Board, { type Sprite } from "@/components/grid/Board";
import PlayArea from "@/components/grid/PlayArea";
import { Grass, Hedge, Robot } from "@/components/grid/Sprites";
import { Flag, Stone } from "@/components/math/AddArt";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { starsForMoves, type Dir } from "@/lib/grid";
import { useHistory, useIsTouch, useLater } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { LEVELS } from "./levels";
import { isSolved, move, parseLevel, pathSentence, startState } from "./logic";

function SumPathLevel({ level: index, onWin, onLevels }: LevelProps) {
  const { map, target, par } = LEVELS[index];
  const level = useMemo(() => parseLevel(map, target), [map, target]);
  const history = useHistory(startState(level));
  const [shake, setShake] = useState(0);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const touch = useIsTouch();
  const cell = useCellSize(level.rows, level.cols, touch, 110);
  const later = useLater();
  const s = history.state;
  const hasMinus = level.stones.some((st) => st.value < 0);

  const onMove = (d: Dir) => {
    if (done) return;
    const res = move(level, s, d);
    if (!res.state) {
      playSound(res.event === "wrong-total" ? "wrong" : "bump");
      setShake((n) => n + 1);
      if (res.event === "wrong-total") {
        setMessage(s.total > target ? `You have ${s.total}. That's too many! Undo and try another way.` : `You have ${s.total}. You need ${target}. Find more stones!`);
      }
      return;
    }
    setMessage(null);
    history.push(res.state);
    if (isSolved(level, res.state)) {
      setDone(true);
      playSound("correct");
      later(() => onWin(starsForMoves(history.moves + 1, par), pathSentence(level, res.state!.used)), 600);
    } else playSound(res.event === "stone" ? "pick" : "step");
  };

  const sprites: Sprite[] = [
    ...level.stones.flatMap((st, i) =>
      s.used.includes(i)
        ? []
        : [{ id: `stone${i}`, r: st.pos.r, c: st.pos.c, z: 1, node: <div className="w-full h-full p-[10%]"><Stone value={st.value} /></div> }],
    ),
    { id: "flag", r: level.flag.r, c: level.flag.c, z: 1, node: <div className="w-full h-full p-[6%]"><Flag /></div> },
    { id: "robot", r: s.pos.r, c: s.pos.c, z: 3, node: <Robot facing={s.facing} /> },
  ];

  const tooMany = s.total > target;
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
        <div className="flex flex-col items-center gap-1 mt-4 px-5 py-3 rounded-2xl bg-white/85 min-w-72">
          <div className="flex items-center gap-4 text-2xl font-bold">
            <span className="text-ink-soft">Target</span>
            <span className="text-coral-dark text-3xl">{target}</span>
            <span className="text-ink-soft">·</span>
            <span className={`tabular-nums ${s.total === target ? "text-grass-dark" : tooMany ? "text-coral-dark" : "text-ink"}`}>
              {pathSentence(level, s.used)}
            </span>
          </div>
          <p className={`text-lg font-semibold ${message ? "text-coral-dark" : "text-ink-soft"}`}>
            {message ?? (hasMinus ? "Blue stones add, red stones take away. Reach the flag with exactly the target." : "Step on stones to add them up. Reach the flag with exactly the target.")}
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
          frame="#2f7d42"
          sprites={sprites}
          renderCell={(r, c) => (level.walls[r][c] ? <Hedge /> : <Grass alt={(r + c) % 2 === 0} />)}
        />
      }
    />
  );
}

export default function SumPathGame() {
  return <LevelGame gameId="sum-path" accent="coral" count={LEVELS.length} renderLevel={(p) => <SumPathLevel {...p} />} />;
}
