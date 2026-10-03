"use client";

import { useProgress } from "./progress";

export type SoundName = "step" | "push" | "bump" | "pick" | "correct" | "wrong" | "win" | "click" | "unlock";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.15, slideTo?: number) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const SOUNDS: Record<SoundName, () => void> = {
  step: () => tone(520, 0, 0.06, "triangle", 0.06),
  push: () => tone(180, 0, 0.12, "square", 0.05, 120),
  bump: () => tone(140, 0, 0.1, "sine", 0.12, 90),
  click: () => tone(700, 0, 0.05, "triangle", 0.07),
  pick: () => {
    tone(660, 0, 0.08, "triangle", 0.08);
    tone(990, 0.06, 0.1, "triangle", 0.08);
  },
  unlock: () => {
    tone(440, 0, 0.08, "square", 0.05);
    tone(660, 0.08, 0.12, "square", 0.05);
  },
  correct: () => {
    tone(784, 0, 0.12, "sine", 0.14);
    tone(1046, 0.1, 0.2, "sine", 0.14);
  },
  wrong: () => tone(300, 0, 0.18, "sine", 0.1, 220),
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.22, "triangle", 0.12));
    tone(1318, 0.5, 0.4, "sine", 0.1);
  },
};

export function playSound(name: SoundName) {
  if (useProgress.getState().muted) return;
  SOUNDS[name]();
}

/** A single musical note (Copy the Lights pads). */
export function playTone(freq: number, seconds = 0.35) {
  if (useProgress.getState().muted) return;
  tone(freq, 0, seconds, "triangle", 0.14);
}

/** A soft engine hum whose pitch follows the car's speed. Call stop() when the race ends. */
export function createEngineSound() {
  const ac = audio();
  if (!ac) return { setSpeed: () => {}, stop: () => {} };
  const osc = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  osc.type = "sawtooth";
  filter.type = "lowpass";
  filter.frequency.value = 500;
  gain.gain.value = 0;
  osc.connect(filter).connect(gain).connect(ac.destination);
  osc.start();
  return {
    setSpeed(pct: number) {
      const muted = useProgress.getState().muted;
      const t = ac.currentTime;
      osc.frequency.setTargetAtTime(55 + 110 * pct, t, 0.1);
      gain.gain.setTargetAtTime(muted || pct <= 0.01 ? 0 : 0.035, t, 0.15);
    },
    stop() {
      gain.gain.setTargetAtTime(0, ac.currentTime, 0.05);
      osc.stop(ac.currentTime + 0.3);
    },
  };
}
