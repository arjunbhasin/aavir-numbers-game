"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { ArrowIcon, GridIcon, RestartIcon, StarIcon } from "@/components/ui/Icons";
import KeyboardHint from "@/components/ui/KeyboardHint";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { createEngineSound, playSound, playTone } from "@/lib/sound";
import { drawRace } from "./draw";
import {
  LAPS,
  MAX_SPEED,
  RANK_NAMES,
  THEMES,
  carDistance,
  createRace,
  currentRank,
  playerDistance,
  starsForRank,
  update,
  type Input,
  type Race,
  type RacerKind,
} from "./engine";
import { makeSprites, type SpriteSet } from "./sprites";

const RACER_COLORS: Record<RacerKind, string> = { robot: "#ff5a5a", bear: "#a678f0", cat: "#4cc35d", bunny: "#4aa3ff" };

type Hud = {
  rank: number;
  lap: number;
  stars: number;
  countdown: number;
  clock: number;
  progress: { kind: RacerKind; pct: number }[];
  boost: boolean;
};

function hudOf(race: Race): Hud {
  const total = LAPS * race.trackLength;
  const clamp = (d: number) => Math.max(0, Math.min(1, d / total));
  return {
    rank: currentRank(race),
    lap: Math.min(LAPS, race.lap + 1),
    stars: race.stars,
    countdown: race.countdown,
    clock: race.clock,
    progress: [
      ...race.cars.map((c) => ({ kind: c.kind, pct: c.finishTime !== null ? 1 : clamp(carDistance(race, c)) })),
      { kind: "robot" as RacerKind, pct: clamp(playerDistance(race)) },
    ],
    boost: race.boost > 0,
  };
}

function RaceView({ level, onWin, onLevels }: LevelProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef<Input>({ left: false, right: false });
  const [attempt, setAttempt] = useState(0);
  const [hud, setHud] = useState<Hud | null>(null);
  const onWinRef = useRef(onWin);
  useEffect(() => {
    onWinRef.current = onWin;
  });

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return;
    const ctx = el.getContext("2d", { alpha: false });
    if (!ctx) return;
    const race = createRace(level);
    const sprites: SpriteSet = makeSprites();
    const engine = createEngineSound();
    let size = { w: 0, h: 0 };
    let raf = 0;
    let last = performance.now();
    let lastHud = 0;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;

    const resize = () => {
      const w = Math.min(box.clientWidth, 1000);
      // taller view on portrait screens (tablets held upright), wide view otherwise
      const portrait = window.innerHeight > window.innerWidth;
      const h = Math.max(240, Math.min(w * (portrait ? 0.95 : 0.62), window.innerHeight - 250));
      // cap the pixel density: sharper isn't worth a slower frame on big tablet screens
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      el.width = Math.round(w * scale);
      el.height = Math.round(h * scale);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      size = { w, h };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    window.addEventListener("resize", resize);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = (now - last) / 1000;
      last = now;
      if (document.hidden) {
        engine.setSpeed(0); // no humming from a background tab
        return;
      }
      update(race, input.current, dt);
      for (const e of race.events) {
        if (e === "star") playSound("pick");
        else if (e === "boost") playSound("unlock");
        else if (e === "bump") playSound("bump");
        else if (e === "lap") playSound("correct");
        else if (e === "beep") playTone(440, 0.2);
        else if (e === "go") playTone(880, 0.4);
        else if (e === "finish") {
          playSound("win");
          const { rank } = race.finished!;
          finishTimer = setTimeout(
            () => onWinRef.current(starsForRank(rank), `${RANK_NAMES[rank - 1]} place! You collected ${race.stars} stars.`),
            1600,
          );
        }
      }
      // the hum fades out once you've crossed the line
      engine.setSpeed(race.finished ? 0 : race.speed / MAX_SPEED);
      drawRace(ctx, race, sprites, size.w, size.h, now / 1000);
      if (now - lastHud > 100) {
        lastHud = now;
        setHud(hudOf(race));
      }
    };
    raf = requestAnimationFrame(frame);

    // when the tab comes back, don't treat the time away as one giant step
    const onVisible = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(finishTimer);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisible);
      engine.stop();
    };
  }, [level, attempt]);

  // keyboard: hold ← → (or A D) to steer
  useEffect(() => {
    const set = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") input.current.left = down;
      else if (k === "arrowright" || k === "d") input.current.right = down;
      else return;
      e.preventDefault();
    };
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    const blur = () => (input.current = { left: false, right: false });
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // touch: press and hold either half of the road
  const hold = (side: "left" | "right", on: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    input.current[side] = on;
  };
  const steerZone = (side: "left" | "right") => (
    <button
      type="button"
      aria-label={`Steer ${side}`}
      tabIndex={-1}
      className={`absolute bottom-0 top-0 ${side === "left" ? "left-0" : "right-0"} w-1/2 flex items-end ${side === "left" ? "justify-start" : "justify-end"} p-3`}
      onPointerDown={hold(side, true)}
      onPointerUp={hold(side, false)}
      onPointerLeave={hold(side, false)}
      onPointerCancel={hold(side, false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/45 text-ink/80 backdrop-blur-sm">
        <ArrowIcon dir={side} className="w-9 h-9" />
      </span>
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* race progress: everyone's place on the way to the finish */}
      <div className="relative w-full max-w-[1000px] h-8 rounded-full bg-white/70" aria-hidden>
        <div className="absolute right-3 top-1 bottom-1 w-2 rounded bg-[repeating-linear-gradient(0deg,#26324a_0_4px,#fff_4px_8px)]" />
        {hud?.progress.map((p) => (
          <span
            key={p.kind}
            className={`absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-white ${p.kind === "robot" ? "w-6 h-6 z-10" : "w-4 h-4"}`}
            style={{ left: `calc(${p.pct * 100}% * 0.94 + 4px)`, background: RACER_COLORS[p.kind] }}
          />
        ))}
      </div>

      <div ref={wrap} className="relative w-full max-w-[1000px] rounded-3xl overflow-hidden shadow-[0_10px_0_rgba(0,0,0,.12)] touch-none select-none">
        <canvas ref={canvas} className="block mx-auto" role="img" aria-label="Race track" />
        {steerZone("left")}
        {steerZone("right")}
        {hud && (
          <div className="pointer-events-none absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex items-baseline gap-1 px-4 py-1 rounded-2xl bg-white/85">
              <span className="text-4xl font-bold text-berry-dark">{RANK_NAMES[hud.rank - 1]}</span>
              <span className="text-lg font-semibold text-ink-soft">/ 4</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/85 text-xl font-bold text-ink">
              Lap {hud.lap} of {LAPS}
            </div>
            <div className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white/85 text-xl font-bold text-ink tabular-nums">
              <StarIcon className="w-7 h-7" /> {hud.stars}
            </div>
          </div>
        )}
        <AnimatePresence>
          {hud && hud.countdown > 0 && (
            <motion.div
              key={Math.ceil(hud.countdown)}
              className="pointer-events-none absolute inset-x-0 top-[14%] flex justify-center"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <span className="text-9xl font-bold text-white drop-shadow-[0_6px_0_rgba(0,0,0,.25)]">{Math.ceil(hud.countdown)}</span>
            </motion.div>
          )}
          {hud && hud.countdown <= 0 && hud.clock < 0.8 && (
            <motion.div key="go" className="pointer-events-none absolute inset-x-0 top-[16%] flex justify-center" initial={{ scale: 0.5 }} animate={{ scale: 1.2 }} exit={{ opacity: 0 }}>
              <span className="text-8xl font-bold text-sun drop-shadow-[0_6px_0_rgba(0,0,0,.25)]">GO!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button accent="white" onClick={() => setAttempt((a) => a + 1)} icon={<RestartIcon className="w-6 h-6" />}>
          Restart race
        </Button>
        <Button accent="white" onClick={onLevels} icon={<GridIcon className="w-6 h-6" />}>
          Tracks
        </Button>
      </div>
      <KeyboardHint touch="Press and hold the left or right side of the road to steer.">
        Hold ← or → to steer · the car drives by itself · grab stars and rainbow pads
      </KeyboardHint>
    </div>
  );
}

export default function RainbowRallyGame() {
  return (
    <LevelGame
      gameId="rainbow-rally"
      accent="berry"
      count={THEMES.length}
      labels={THEMES.map((t) => t.name)}
      renderLevel={(p) => <RaceView {...p} />}
    />
  );
}
