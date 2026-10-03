"use client";

import KeyboardHint from "@/components/ui/KeyboardHint";
import { motion } from "motion/react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { ArrowIcon, GridIcon, PlayIcon } from "@/components/ui/Icons";
import ModePicker from "@/components/ui/ModePicker";
import WinOverlay from "@/components/ui/WinOverlay";
import { starsForMistakes } from "@/components/shapes/PatternGame";
import type { Dir } from "@/lib/grid";
import { useGameKeys, useLater } from "@/lib/input";
import { useProgress } from "@/lib/progress";
import { makeRng, randomSeed, type Rng } from "@/lib/random";
import { playSound, playTone } from "@/lib/sound";
import { extendSequence } from "./logic";

const MODES = [
  { title: "Easy", blurb: "Remember 4 lights", accent: "grass" as const, dots: 1, goal: 4, speed: 750 },
  { title: "Medium", blurb: "Remember 6 lights", accent: "sun" as const, dots: 2, goal: 6, speed: 650 },
  { title: "Hard", blurb: "Remember 8 lights", accent: "coral" as const, dots: 3, goal: 8, speed: 550 },
];

const PADS: { dir: Dir; color: string; lit: string; freq: number; area: string }[] = [
  { dir: "up", color: "#ffc93c", lit: "#fff1a8", freq: 523, area: "up" },
  { dir: "right", color: "#4aa3ff", lit: "#bfe2ff", freq: 659, area: "right" },
  { dir: "down", color: "#5cc96b", lit: "#c9f5cf", freq: 784, area: "down" },
  { dir: "left", color: "#ff6b6b", lit: "#ffc9c9", freq: 440, area: "left" },
];

type Phase = "idle" | "watch" | "play" | "oops" | "done";

export default function CopyLightsGame() {
  const [mode, setMode] = useState<number | null>(null);
  const [rng, setRng] = useState<Rng | null>(null);
  const [seq, setSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState<number | null>(null);
  const [input, setInput] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [won, setWon] = useState<number | null>(null);
  const record = useProgress((s) => s.recordStars);
  const later = useLater();

  const flash = (pad: number, ms: number) => {
    setLit(pad);
    playTone(PADS[pad].freq, ms / 1000);
    later(() => setLit(null), ms * 0.7);
  };

  const playBack = (s: number[], m: number) => {
    setPhase("watch");
    setInput(0);
    const speed = MODES[m].speed;
    s.forEach((pad, i) => later(() => flash(pad, speed), 600 + i * speed));
    later(() => setPhase("play"), 600 + s.length * speed);
  };

  const start = (m: number) => {
    const r = makeRng(randomSeed());
    const first = extendSequence(r, extendSequence(r, []));
    setMode(m);
    setRng(() => r);
    setSeq(first);
    setMistakes(0);
    setWon(null);
    setPhase("idle");
  };

  const press = (pad: number) => {
    if (phase !== "play" || mode === null || !rng) return;
    flash(pad, 300);
    if (pad !== seq[input]) {
      playSound("wrong");
      setMistakes((x) => x + 1);
      setPhase("oops");
      later(() => playBack(seq, mode), 1200);
      return;
    }
    const next = input + 1;
    setInput(next);
    if (next < seq.length) return;
    if (seq.length >= MODES[mode].goal) {
      setPhase("done");
      playSound("correct");
      const stars = starsForMistakes(mistakes);
      record("copy-lights", mode, stars);
      later(() => setWon(stars), 700);
    } else {
      const longer = extendSequence(rng, seq);
      setSeq(longer);
      setPhase("watch");
      later(() => playSound("pick"), 350);
      later(() => playBack(longer, mode), 900);
    }
  };

  useGameKeys({
    enabled: phase === "play" || phase === "idle",
    onMove: (d) => press(PADS.findIndex((p) => p.dir === d)),
    onEnter: () => {
      if (phase === "idle" && mode !== null) playBack(seq, mode);
    },
  });

  if (mode === null) return <ModePicker gameId="copy-lights" heading="How many lights?" modes={MODES} onPick={start} />;

  const goal = MODES[mode].goal;
  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="flex items-center gap-2" role="img" aria-label={`${seq.length} of ${goal} lights`}>
        {Array.from({ length: goal - 1 }, (_, i) => (
          <span key={i} className={`w-5 h-5 rounded-full border-4 ${i + 2 <= seq.length ? "bg-coral border-coral" : "bg-white/60 border-white"}`} />
        ))}
      </div>
      <p className="text-2xl font-semibold text-ink min-h-8 text-center">
        {phase === "idle" && "Press Start, then watch the lights!"}
        {phase === "watch" && `Watch carefully... (${seq.length} lights)`}
        {phase === "play" && `Your turn! ${input} of ${seq.length}`}
        {phase === "oops" && <span className="text-coral-dark">Oops! Watch again.</span>}
        {phase === "done" && <span className="text-grass-dark">You remembered them all!</span>}
      </p>
      <div className="grid gap-3" style={{ gridTemplateAreas: `". up ." "left mid right" ". down ."` }}>
        {PADS.map((pad, i) => (
          <motion.button
            key={pad.dir}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              press(i);
            }}
            aria-label={`${pad.dir} light`}
            disabled={phase !== "play"}
            animate={{ scale: lit === i ? 1.1 : 1 }}
            transition={{ duration: 0.12 }}
            className="w-[clamp(5.5rem,20vw,8.5rem)] aspect-square rounded-[1.75rem] grid place-items-center disabled:cursor-default"
            style={{
              gridArea: pad.area,
              background: lit === i ? pad.lit : pad.color,
              boxShadow: lit === i ? `0 0 40px 10px ${pad.lit}` : "0 6px 0 rgba(0,0,0,.18)",
            }}
          >
            <ArrowIcon dir={pad.dir} className="w-12 h-12 text-white/90" />
          </motion.button>
        ))}
        <div style={{ gridArea: "mid" }} className="grid place-items-center">
          <div className="w-14 h-14 rounded-full bg-white/70" />
        </div>
      </div>
      <div className="flex gap-3">
        {phase === "idle" && (
          <Button accent="grass" size="lg" onClick={() => playBack(seq, mode)} icon={<PlayIcon className="w-7 h-7" />}>
            Start
          </Button>
        )}
        <Button accent="white" onClick={() => setMode(null)} icon={<GridIcon className="w-6 h-6" />}>
          Change level
        </Button>
      </div>
      <KeyboardHint touch="Tap the lights in the same order.">Enter starts · use the arrow keys, or tap the lights</KeyboardHint>
      <WinOverlay open={won !== null} stars={won ?? 0} detail={`${goal} lights in a row!`} onAgain={() => start(mode)} onLevels={() => setMode(null)} />
    </div>
  );
}
