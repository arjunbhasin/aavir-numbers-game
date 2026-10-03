"use client";

import { useEffect, useMemo, useState } from "react";
import Board from "@/components/grid/Board";
import { Grass, Robot } from "@/components/grid/Sprites";
import DPad from "@/components/ui/DPad";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { samePos, step, type Dir } from "@/lib/grid";
import { useGameKeys, useIsTouch, useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { makePath, pathCells } from "./logic";

type Phase = "watch" | "play" | "oops" | "solved";

const Print = ({ n, faded }: { n: number; faded?: boolean }) => (
  <div className={`absolute inset-[18%] rounded-full grid place-items-center text-white font-bold text-xl ${faded ? "bg-mint/40" : "bg-mint-dark"}`}>{n}</div>
);

export default function FootprintsPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makePath(makeRng(seed), difficulty), [seed, difficulty]);
  const cells = useMemo(() => pathCells(p), [p]);
  const [phase, setPhase] = useState<Phase>("watch");
  const [shown, setShown] = useState(0); // footprints visible while watching
  const [done, setDone] = useState(0); // correct steps taken by the player
  const [robot, setRobot] = useState(p.start);
  const [shake, setShake] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const touch = useIsTouch();
  const cell = useCellSize(p.size, p.size, touch, 60);
  const later = useLater();

  const watch = () => {
    setPhase("watch");
    setRobot(p.start);
    setShown(0);
    setDone(0);
    p.dirs.forEach((_, i) =>
      later(() => {
        setShown(i + 1);
        setRobot(cells[i + 1]);
        playSound("step");
      }, 700 + i * 650),
    );
    later(() => {
      setRobot(p.start);
      setShown(0);
      setPhase("play");
    }, 700 + p.dirs.length * 650 + 900);
  };

  useEffect(() => {
    const t = setTimeout(watch, 400);
    return () => clearTimeout(t);
    // run once when the puzzle appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMove = (d: Dir) => {
    if (phase !== "play") return;
    const next = step(robot, d);
    if (d !== p.dirs[done] || !samePos(next, cells[done + 1])) {
      playSound("wrong");
      setShake((s) => s + 1);
      setMistakes((m) => m + 1);
      setPhase("oops");
      later(watch, 1100);
      return;
    }
    setRobot(next);
    const nowDone = done + 1;
    setDone(nowDone);
    if (nowDone === p.dirs.length) {
      setPhase("solved");
      playSound("correct");
      later(() => onSolved(mistakes), 1300);
    } else playSound("step");
  };

  useGameKeys({ enabled: phase === "play", onMove });

  const printAt = (r: number, c: number) => {
    const idx = cells.findIndex((x) => x.r === r && x.c === c);
    if (idx <= 0) return null;
    if (phase === "watch" && idx <= shown) return <Print n={idx} />;
    if ((phase === "play" || phase === "solved" || phase === "oops") && idx <= done) return <Print n={idx} />;
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-2xl font-semibold text-ink min-h-8 text-center">
        {phase === "watch" && "Watch where the robot walks..."}
        {phase === "play" && `Your turn! Walk the same way. ${done} of ${p.dirs.length}`}
        {phase === "oops" && <span className="text-coral-dark">Oops, wrong way! Watch again.</span>}
        {phase === "solved" && <span className="text-grass-dark">You remembered the whole path!</span>}
      </p>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <Board
          rows={p.size}
          cols={p.size}
          cell={cell}
          shake={shake}
          onSwipe={onMove}
          frame="#1fae9e"
          sprites={[{ id: "robot", r: robot.r, c: robot.c, z: 3, duration: 0.25, node: <Robot facing="down" /> }]}
          renderCell={(r, c) => (
            <>
              <Grass alt={(r + c) % 2 === 0} />
              {samePos({ r, c }, p.start) && <div className="absolute inset-[10%] rounded-xl border-4 border-dashed border-mint-dark/60" />}
              {printAt(r, c)}
            </>
          )}
        />
        {touch && <DPad onMove={onMove} />}
      </div>
    </div>
  );
}
