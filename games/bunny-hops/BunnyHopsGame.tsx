"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Carrot, HopBunny, Splash } from "@/components/math/Art";
import Choices from "@/components/math/Choices";
import Button from "@/components/ui/Button";
import DPad from "@/components/ui/DPad";
import { GridIcon, RestartIcon } from "@/components/ui/Icons";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { starsForMistakes } from "@/components/shapes/PatternGame";
import { useGameKeys, useIsTouch, useLater } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { LEVELS } from "./levels";
import { addSentence, hop, type HopLevel, type PredictLevel } from "./logic";

/** The number line with carrots, puddles, the bunny and the arcs it has hopped. */
function Track({
  length,
  pos,
  hopId,
  carrots,
  got,
  puddles,
  landings,
  splash,
}: {
  length: number;
  pos: number;
  hopId: number;
  carrots: number[];
  got: number[];
  puddles: number[];
  landings: number[];
  splash: number | null;
}) {
  const pct = (n: number) => `${4 + (n / length) * 92}%`;
  const showLabel = (n: number) => length <= 20 || n % 5 === 0 || landings.includes(n) || carrots.includes(n);
  return (
    <div className="relative w-full max-w-4xl h-56 select-none">
      {/* arcs */}
      <svg className="absolute inset-x-0 top-0 w-full h-40 overflow-visible" viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden>
        {landings.slice(1).map((to, i) => {
          const from = landings[i];
          const x1 = 40 + (from / length) * 920;
          const x2 = 40 + (to / length) * 920;
          return (
            <path
              key={`${i}-${from}-${to}`}
              d={`M ${x1} 150 Q ${(x1 + x2) / 2} ${70} ${x2} 150`}
              fill="none"
              stroke="#ff9f43"
              strokeWidth="4"
              strokeDasharray="8 7"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {/* carrots */}
      {carrots.map((c) => (
        <AnimatePresence key={c}>
          {!got.includes(c) && (
            <motion.div
              className="absolute top-[4.25rem] w-12 h-16 -translate-x-1/2"
              style={{ left: pct(c) }}
              exit={{ y: -60, opacity: 0, scale: 1.4 }}
            >
              <div className="w-full h-full animate-float">
                <Carrot />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}
      {/* the bunny */}
      <motion.div
        className="absolute top-[3.75rem] w-20 h-20 -translate-x-1/2 z-10"
        initial={false}
        animate={{ left: pct(pos) }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        <motion.div key={hopId} className="w-full h-full" initial={{ y: 0 }} animate={{ y: [0, -70, 0] }} transition={{ duration: 0.45 }}>
          <HopBunny />
        </motion.div>
      </motion.div>
      {/* line */}
      <div className="absolute top-[9.25rem] left-[3%] right-[3%] h-3 rounded-full bg-[#7bc96f]" />
      {Array.from({ length: length + 1 }, (_, n) => (
        <div key={n} className="absolute top-[8.75rem] -translate-x-1/2 flex flex-col items-center" style={{ left: pct(n) }}>
          {puddles.includes(n) && (
            <div className="absolute -top-4 w-12 h-8">
              <Splash />
            </div>
          )}
          <span className={`w-1.5 rounded-full ${showLabel(n) ? "h-7 bg-ink/60" : "h-4 bg-ink/30"}`} />
          {showLabel(n) && (
            <span
              className={`mt-1 font-bold tabular-nums text-[clamp(.8rem,2vw,1.25rem)] ${
                landings.includes(n) && n > 0 ? "text-white bg-sun-dark rounded-full px-1.5" : "text-ink"
              }`}
            >
              {n}
            </span>
          )}
        </div>
      ))}
      <AnimatePresence>
        {splash !== null && (
          <motion.div
            key="splash"
            className="absolute top-28 w-20 h-14 -translate-x-1/2 z-20"
            style={{ left: pct(splash) }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            exit={{ opacity: 0 }}
          >
            <Splash />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HopLevelView({ level, onWin, onLevels }: { level: HopLevel } & Omit<LevelProps, "level">) {
  const [size, setSize] = useState<number | null>(level.size);
  const [pos, setPos] = useState(0);
  const [hopId, setHopId] = useState(0);
  const [got, setGot] = useState<number[]>([]);
  const [splash, setSplash] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  /** true from the moment the bunny lands in a puddle until it is back on dry ground */
  const [splashing, setSplashing] = useState(false);
  const touch = useIsTouch();
  const later = useLater();
  const busy = splashing || done;

  const reset = (newSize: number | null) => {
    setSize(newSize);
    setPos(0);
    setGot([]);
    setHopId((h) => h + 1);
    setMessage(null);
  };

  const doHop = (dir: 1 | -1) => {
    if (busy || size === null) return;
    const res = hop(level, pos, size, dir);
    if (res.result === "edge") {
      playSound("bump");
      setMessage(dir === 1 ? "The track ends here!" : "Back at the start!");
      return;
    }
    setPos(res.to);
    setHopId((h) => h + 1);
    setMessage(null);
    if (res.result === "puddle") {
      playSound("wrong");
      setSplashing(true);
      setMistakes((m) => m + 1);
      later(() => setSplash(res.to), 350);
      later(() => {
        setSplash(null);
        setSplashing(false);
        setPos(pos);
        setHopId((h) => h + 1);
        setMessage(level.size === null ? "Splash! Hops of " + size + " land in the puddle. Try another hop size." : "Splash!");
      }, 1100);
      return;
    }
    playSound("step");
    if (level.carrots.includes(res.to) && !got.includes(res.to)) {
      const nowGot = [...got, res.to];
      setGot(nowGot);
      later(() => playSound("pick"), 300);
      if (nowGot.length === level.carrots.length) {
        setDone(true);
        const last = Math.max(...level.carrots);
        const hops = last / size;
        const detail =
          level.carrots.length === 1
            ? `${hops} hops of ${size} = ${last}, so ${hops} × ${size} = ${last}`
            : `Hops of ${size} land on ${level.carrots.join(" and ")}!`;
        later(() => onWin(starsForMistakes(mistakes), detail), 900);
      }
    }
  };

  useEffect(() => {
    if (level.size !== null || size === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey && !busy) reset(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useGameKeys({
    enabled: !busy && size !== null,
    onMove: (d) => (d === "right" ? doHop(1) : d === "left" ? doHop(-1) : undefined),
    onRestart: () => reset(level.size),
  });

  const hopsTaken = size ? pos / size : 0;
  const landings = size ? Array.from({ length: hopsTaken + 1 }, (_, i) => i * size) : [0];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-2xl font-semibold text-ink text-center">
        {level.carrots.length > 1 ? `Get all ${level.carrots.length} carrots with the same hop size!` : `Hop to the carrot at ${level.carrots[0]}!`}
        {level.puddles.length > 0 && " Don't land in a puddle."}
      </p>
      <Track
        length={level.length}
        pos={pos}
        hopId={hopId}
        carrots={level.carrots}
        got={got}
        puddles={level.puddles}
        landings={landings}
        splash={splash}
      />
      <div className="text-3xl font-bold text-sun-dark tabular-nums min-h-10 text-center">
        {size !== null && hopsTaken > 0 ? addSentence(size, hopsTaken) : ""}
      </div>
      <p className="text-xl font-semibold text-coral-dark min-h-7">{message}</p>

      {size === null ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xl font-semibold text-ink-soft">How big are the bunny&apos;s hops?</p>
          <Choices
            choices={level.choices.map((c) => ({ value: c, label: `hops of ${c}` }))}
            wrong={[]}
            accent="#ffc93c"
            shadow="#e8a800"
            onPick={(c) => {
              playSound("click");
              reset(c);
            }}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {touch ? (
            <DPad onMove={(d) => (d === "right" ? doHop(1) : d === "left" ? doHop(-1) : undefined)} />
          ) : (
            <p className="text-lg text-ink-soft">
              Press → to hop forward, ← to hop back{level.size === null ? " · C changes the hop size" : ""}
            </p>
          )}
          <div className="flex flex-col gap-2">
            {level.size === null && (
              <Button accent="sun" onClick={() => reset(null)} disabled={busy}>
                Hops of {size} · change
              </Button>
            )}
            <Button accent="white" onClick={() => reset(level.size)} disabled={busy} icon={<RestartIcon className="w-6 h-6" />}>
              Start again
            </Button>
          </div>
        </div>
      )}
      <Button accent="white" onClick={onLevels} icon={<GridIcon className="w-6 h-6" />}>
        Levels
      </Button>
    </div>
  );
}

function PredictLevelView({ level, onWin, onLevels }: { level: PredictLevel } & Omit<LevelProps, "level">) {
  const [pos, setPos] = useState(0);
  const [hopId, setHopId] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const later = useLater();

  const pick = (hops: number, index: number) => {
    if (running || done) return;
    setRunning(true);
    setMessage(null);
    setPos(0);
    for (let i = 1; i <= hops; i++) {
      const to = Math.min(i * level.size, level.length);
      later(() => {
        setPos(to);
        setHopId((h) => h + 1);
        playSound("step");
      }, i * 550);
    }
    later(() => {
      setRunning(false);
      if (hops * level.size === level.carrot) {
        setDone(true);
        playSound("correct");
        later(() => onWin(starsForMistakes(wrong.length), `${level.carrot} ÷ ${level.size} = ${hops} hops`), 700);
      } else {
        playSound("wrong");
        setWrong((w) => [...w, index]);
        setMessage(hops * level.size < level.carrot ? "Not there yet! The bunny needs more hops." : "Too far! That's past the carrot.");
        later(() => {
          setPos(0);
          setHopId((h) => h + 1);
        }, 900);
      }
    }, hops * 550 + 400);
  };

  const hopsShown = Math.floor(pos / level.size);
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-2xl font-semibold text-ink text-center">
        The bunny hops <span className="text-sun-dark">{level.size}</span> at a time. How many hops to reach the carrot at{" "}
        <span className="text-sun-dark">{level.carrot}</span>?
      </p>
      <Track
        length={level.length}
        pos={pos}
        hopId={hopId}
        carrots={[level.carrot]}
        got={done ? [level.carrot] : []}
        puddles={[]}
        landings={Array.from({ length: hopsShown + 1 }, (_, i) => i * level.size)}
        splash={null}
      />
      <div className="text-3xl font-bold text-sun-dark tabular-nums min-h-10">{hopsShown > 0 ? addSentence(level.size, hopsShown) : ""}</div>
      <p className="text-xl font-semibold text-coral-dark min-h-7">{message}</p>
      <Choices
        choices={level.choices.map((c) => ({ value: c, label: `${c} hops` }))}
        wrong={wrong}
        disabled={running || done}
        accent="#ffc93c"
        shadow="#e8a800"
        onPick={pick}
      />
      <Button accent="white" onClick={onLevels} icon={<GridIcon className="w-6 h-6" />}>
        Levels
      </Button>
    </div>
  );
}

export default function BunnyHopsGame() {
  return (
    <LevelGame
      gameId="bunny-hops"
      accent="sun"
      count={LEVELS.length}
      renderLevel={({ level, ...p }) => {
        const l = LEVELS[level];
        return l.kind === "hop" ? <HopLevelView level={l} {...p} /> : <PredictLevelView level={l} {...p} />;
      }}
    />
  );
}
