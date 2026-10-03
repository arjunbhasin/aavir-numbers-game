"use client";

import { useMemo, useState } from "react";
import Board from "@/components/grid/Board";
import PlayArea from "@/components/grid/PlayArea";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { starsForMoves, type Dir } from "@/lib/grid";
import { useHistory, useIsTouch } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { LEVELS } from "./levels";
import { dirForTile, isSolved, shuffled, slide, solved, type Board as TileBoard } from "./logic";

const TILE_COLORS = ["#ff7a6b", "#ffc93c", "#5cc96b", "#4aa3ff", "#a678f0", "#ff6fae", "#3fd1c0", "#ff9f43"];

function Tile({ n, size, onClick, home }: { n: number; size: number; onClick?: () => void; home?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      className="w-full h-full p-[5%]"
      aria-label={`Tile ${n}`}
    >
      <div
        className="w-full h-full rounded-2xl grid place-items-center font-bold text-white transition-shadow"
        style={{
          background: TILE_COLORS[(n - 1) % TILE_COLORS.length],
          fontSize: size * 0.45,
          boxShadow: home ? "inset 0 -6px 0 rgba(0,0,0,.18), 0 0 0 4px #fff" : "inset 0 -6px 0 rgba(0,0,0,.18)",
          textShadow: "0 2px 0 rgba(0,0,0,.15)",
        }}
      >
        {n}
      </div>
    </button>
  );
}

function SlideTilesLevel({ level: index, onWin, onLevels }: LevelProps) {
  const spec = LEVELS[index];
  const start = useMemo(() => shuffled(spec.rows, spec.cols, spec.shuffle, spec.seed), [spec]);
  const history = useHistory<TileBoard>(start);
  const [shake, setShake] = useState(0);
  const [done, setDone] = useState(false);
  const touch = useIsTouch();
  const cell = Math.min(120, useCellSize(spec.rows, spec.cols, touch) * 1.4);
  const b = history.state;
  const goal = solved(spec.rows, spec.cols);

  const onMove = (d: Dir) => {
    if (done) return;
    const next = slide(b, d);
    if (!next) {
      playSound("bump");
      setShake((n) => n + 1);
      return;
    }
    history.push(next);
    playSound("push");
    if (isSolved(next)) {
      setDone(true);
      playSound("correct");
      setTimeout(() => onWin(starsForMoves(history.moves + 1, spec.par)), 500);
    }
  };

  const sprites = b.tiles.flatMap((n, i) =>
    n === 0
      ? []
      : [
          {
            id: `t${n}`,
            r: Math.floor(i / spec.cols),
            c: i % spec.cols,
            node: (
              <Tile
                n={n}
                size={cell}
                home={goal[i] === n}
                onClick={() => {
                  const d = dirForTile(b, i);
                  if (d) onMove(d);
                  else {
                    playSound("bump");
                    setShake((x) => x + 1);
                  }
                }}
              />
            ),
          },
        ],
  );

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
      par={spec.par}
      extra={
        <div className="flex items-center gap-3 mt-4 px-4 py-2 rounded-2xl bg-white/80">
          <span className="text-lg font-semibold text-ink-soft">Make it look like this:</span>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${spec.cols}, 28px)` }}>
            {goal.map((n, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-md grid place-items-center text-sm font-bold text-white"
                style={{ background: n ? TILE_COLORS[(n - 1) % TILE_COLORS.length] : "transparent" }}
              >
                {n || ""}
              </div>
            ))}
          </div>
        </div>
      }
      board={
        <Board
          rows={spec.rows}
          cols={spec.cols}
          cell={cell}
          shake={shake}
          onSwipe={onMove}
          frame="#8253d1"
          sprites={sprites}
          renderCell={() => <div className="w-full h-full bg-[#efe6ff]" />}
        />
      }
    />
  );
}

export default function SlideTilesGame() {
  return <LevelGame gameId="slide-tiles" accent="grape" count={LEVELS.length} renderLevel={(p) => <SlideTilesLevel {...p} />} />;
}
