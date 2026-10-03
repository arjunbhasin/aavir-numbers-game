"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Board, { type Sprite } from "@/components/grid/Board";
import { Battery, Grass, Puddle, Robot } from "@/components/grid/Sprites";
import Button from "@/components/ui/Button";
import { ArrowIcon, GridIcon, PlayIcon, RestartIcon, StarIcon, UndoIcon } from "@/components/ui/Icons";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { starsForMoves, type Dir, type Pos } from "@/lib/grid";
import { useGameKeys, useIsTouch } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { useCellSize } from "@/lib/useCellSize";
import { LEVELS } from "./levels";
import { parseLevel, run } from "./logic";

const SLACK = 4;

function RobotPathLevel({ level: index, onWin, onLevels }: LevelProps) {
  const level = useMemo(() => parseLevel(LEVELS[index].map), [index]);
  const par = LEVELS[index].par;
  const maxSteps = par + SLACK;
  const [program, setProgram] = useState<Dir[]>([]);
  const [robot, setRobot] = useState<{ pos: Pos; facing: Dir; got: number[] }>({ pos: level.start, facing: "down", got: [] });
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [tries, setTries] = useState(0);
  const [shake, setShake] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const touch = useIsTouch();
  const cell = useCellSize(level.rows, level.cols, touch, 140);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const resetRobot = () => {
    setRobot({ pos: level.start, facing: "down", got: [] });
    setActiveStep(-1);
  };

  const add = (d: Dir) => {
    if (running) return;
    if (program.length >= maxSteps) {
      playSound("bump");
      setShake((n) => n + 1);
      return;
    }
    playSound("click");
    setMessage(null);
    resetRobot();
    setProgram((p) => [...p, d]);
  };
  const removeLast = () => {
    if (running || !program.length) return;
    playSound("click");
    setMessage(null);
    resetRobot();
    setProgram((p) => p.slice(0, -1));
  };
  const clear = () => {
    if (running) return;
    setMessage(null);
    resetRobot();
    setProgram([]);
  };

  const go = () => {
    if (running || !program.length) return;
    const result = run(level, program);
    const attempt = tries + 1;
    setTries(attempt);
    setRunning(true);
    setMessage(null);
    resetRobot();
    const STEP = 380;
    result.steps.forEach((s, i) => {
      timers.current.push(
        setTimeout(() => {
          setActiveStep(i);
          if (s.ok) {
            setRobot({ pos: s.pos, facing: s.dir, got: s.got });
            playSound(s.got.length > (result.steps[i - 1]?.got.length ?? 0) ? "pick" : "step");
          } else {
            setRobot((r) => ({ ...r, facing: s.dir }));
            playSound("bump");
            setShake((n) => n + 1);
          }
        }, (i + 1) * STEP),
      );
    });
    timers.current.push(
      setTimeout(() => {
        setRunning(false);
        if (result.success) {
          playSound("correct");
          const lengthStars = starsForMoves(program.length, par);
          onWin(Math.max(1, attempt > 2 ? lengthStars - 1 : lengthStars));
        } else {
          playSound("wrong");
          const bumped = result.steps.some((s) => !s.ok);
          const missedGem = level.gems.length > 0 && result.steps.at(-1)!.got.length < level.gems.length;
          setMessage(bumped ? "Oops, a puddle! Fix the steps and try again." : missedGem ? "Grab all the gems first!" : "Not quite! Change the steps and try again.");
        }
      }, (result.steps.length + 1) * STEP + 200),
    );
  };

  useGameKeys({
    enabled: true,
    onMove: add,
    onUndo: removeLast,
    onRestart: clear,
    onEnter: go,
  });

  const sprites: Sprite[] = [
    ...level.gems.flatMap((g, i) =>
      robot.got.includes(i)
        ? []
        : [{ id: `gem${i}`, r: g.r, c: g.c, z: 1, node: <div className="w-full h-full p-[18%] animate-float"><StarIcon className="w-full h-full" /></div> }],
    ),
    { id: "battery", r: level.battery.r, c: level.battery.c, z: 1, node: <div className="w-full h-full p-[8%]"><Battery /></div> },
    { id: "robot", r: robot.pos.r, c: robot.pos.c, z: 3, duration: 0.3, node: <Robot facing={robot.facing} /> },
  ];

  const arrowBtn = (d: Dir) => (
    <button
      key={d}
      type="button"
      aria-label={`Add ${d} step`}
      disabled={running}
      onClick={() => add(d)}
      className="btn-3d grid place-items-center w-[72px] h-[72px] rounded-2xl bg-mint text-white disabled:opacity-40"
      style={{ ["--btn-shadow" as string]: "#1fae9e" }}
    >
      <ArrowIcon dir={d} className="w-10 h-10" />
    </button>
  );

  return (
    <div className="flex flex-col items-center w-full">
      <Board
        rows={level.rows}
        cols={level.cols}
        cell={cell}
        shake={shake}
        frame="#1fae9e"
        sprites={sprites}
        renderCell={(r, c) => (level.blocked[r][c] ? <div className="w-full h-full bg-[#c9f0c2] p-[8%]"><Puddle /></div> : <Grass alt={(r + c) % 2 === 0} />)}
      />

      <div className="mt-4 w-full max-w-3xl rounded-3xl bg-white/85 p-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xl font-semibold text-ink">Robot&apos;s plan</span>
          <span className="text-lg text-ink-soft tabular-nums">
            {program.length} / {maxSteps} steps
          </span>
        </div>
        <div className="flex flex-wrap gap-2 min-h-14">
          <AnimatePresence initial={false}>
            {program.map((d, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: i === activeStep ? 1.18 : 1 }}
                exit={{ scale: 0 }}
                className={`grid place-items-center w-12 h-12 rounded-xl text-white ${i === activeStep ? "bg-sun" : i < activeStep ? "bg-mint-dark" : "bg-mint"}`}
              >
                <ArrowIcon dir={d} className="w-7 h-7" />
              </motion.div>
            ))}
          </AnimatePresence>
          {program.length === 0 && <span className="text-lg text-ink-soft/70 self-center px-1">Press the arrows to add steps</span>}
        </div>
      </div>

      {message && <p className="mt-3 text-xl font-semibold text-coral-dark animate-wobble">{message}</p>}

      <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
        <div className="grid gap-2" style={{ gridTemplateAreas: `". up ." "left . right" ". down ."` }}>
          {(["up", "left", "right", "down"] as Dir[]).map((d) => (
            <div key={d} style={{ gridArea: d }}>
              {arrowBtn(d)}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <Button accent="grass" size="lg" onClick={go} disabled={running || !program.length} icon={<PlayIcon className="w-7 h-7" />} silent>
            Go!
          </Button>
          <div className="flex gap-2">
            <Button accent="white" onClick={removeLast} disabled={running || !program.length} icon={<UndoIcon className="w-6 h-6" />}>
              Back
            </Button>
            <Button accent="white" onClick={clear} disabled={running} icon={<RestartIcon className="w-6 h-6" />}>
              Clear
            </Button>
          </div>
          <Button accent="white" onClick={onLevels} icon={<GridIcon className="w-6 h-6" />}>
            Levels
          </Button>
        </div>
      </div>
      {!touch && <p className="hidden md:block text-ink-soft mt-3">Arrow keys add steps · Backspace removes · Enter runs</p>}
    </div>
  );
}

export default function RobotPathGame() {
  return <LevelGame gameId="robot-path" accent="mint" count={LEVELS.length} renderLevel={(p) => <RobotPathLevel {...p} />} />;
}
