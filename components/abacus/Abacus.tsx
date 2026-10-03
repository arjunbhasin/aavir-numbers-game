"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { fromRods, toRods, type Rod } from "@/lib/abacus";
import { useGameKeys } from "@/lib/input";
import { playSound } from "@/lib/sound";

const COL = 72;
const PAD = 14;
const H = 262;
const BEAM = 82;
const HEAVEN_UP = 30;
const HEAVEN_DOWN = 64;
const EARTH_TOP = 104;
const EARTH_STEP = 28;
const EARTH_BOTTOM = H - 26;
const BEAD = "M -27 0 Q -24 -7 -12 -13 L 12 -13 Q 24 -7 27 0 Q 24 7 12 13 L -12 13 Q -24 7 -27 0 Z";

const PLACE = ["1s", "10s", "100s", "1000s"];

function earthY(i: number, earth: number) {
  return i < earth ? EARTH_TOP + i * EARTH_STEP : EARTH_BOTTOM - (3 - i) * EARTH_STEP;
}

/**
 * A soroban. Counted beads touch the beam: the top bead is 5, each bottom bead is 1.
 * Pass `onChange` to let the child move beads (tap a bead, or use the keyboard via `useAbacusKeys`).
 */
export default function Abacus({
  value,
  rods,
  onChange,
  selected,
  onSelect,
  className = "w-full",
  labels = rods > 1,
  dim = false,
  reserve,
}: {
  value: number;
  rods: number;
  onChange?: (v: number) => void;
  selected?: number;
  onSelect?: (rod: number) => void;
  className?: string;
  labels?: boolean;
  dim?: boolean;
  /** px of screen height needed for everything else; the abacus shrinks to fit the rest */
  reserve?: number;
}) {
  const state = toRods(value, rods);
  const W = rods * COL + PAD * 2;
  const set = (i: number, rod: Rod) => {
    if (!onChange) return;
    const next = state.map((r, k) => (k === i ? rod : r));
    playSound("step");
    onSelect?.(i);
    onChange(fromRods(next));
  };
  return (
    <svg
      viewBox={`0 0 ${W} ${H + (labels ? 26 : 0)}`}
      className={`${className} select-none ${dim ? "opacity-40" : ""}`}
      style={reserve ? { maxHeight: `max(220px, calc(100dvh - ${reserve}px))` } : undefined}
      role="img"
      aria-label={`Abacus showing ${value}`}
    >
      <rect x="0" y="0" width={W} height={H} rx="14" fill="#a0693a" />
      <rect x="8" y="8" width={W - 16} height={H - 16} rx="8" fill="#fff8ec" />
      {state.map((rod, i) => {
        const x = PAD + i * COL + COL / 2;
        const isSel = selected === i && !!onChange;
        return (
          <g key={i}>
            {isSel && <rect x={x - COL / 2 + 3} y="10" width={COL - 6} height={H - 20} rx="8" fill="#bfe6ff" />}
            <rect x={x - 2.5} y="12" width="5" height={H - 24} rx="2" fill="#8a5a2b" />
            {/* heaven bead */}
            <motion.g
              initial={false}
              animate={{ y: rod.heaven ? HEAVEN_DOWN : HEAVEN_UP }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={() => set(i, { ...rod, heaven: !rod.heaven })}
              style={{ cursor: onChange ? "pointer" : "default" }}
            >
              {/* a bigger invisible hit area than the bead itself, for small fingers */}
              <rect x={x - COL / 2 + 3} y={-20} width={COL - 6} height={40} fill="transparent" />
              <path d={BEAD} transform={`translate(${x} 0)`} fill={rod.heaven ? "#ff6b6b" : "#ffb3ab"} stroke="#d94848" strokeWidth="2.5" />
            </motion.g>
            {/* earth beads, index 0 nearest the beam */}
            {[0, 1, 2, 3].map((b) => (
              <motion.g
                key={b}
                initial={false}
                animate={{ y: earthY(b, rod.earth) }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                onClick={() => set(i, { ...rod, earth: b < rod.earth ? b : b + 1 })}
                style={{ cursor: onChange ? "pointer" : "default" }}
              >
                <rect x={x - COL / 2 + 3} y={-EARTH_STEP / 2} width={COL - 6} height={EARTH_STEP} fill="transparent" />
                <path d={BEAD} transform={`translate(${x} 0)`} fill={b < rod.earth ? "#ffc93c" : "#ffe7a3"} stroke="#d9a200" strokeWidth="2.5" />
              </motion.g>
            ))}
            {labels && (
              <text x={x} y={H + 20} textAnchor="middle" fontSize="16" fontWeight="700" fill="#5a6785" fontFamily="sans-serif">
                {PLACE[rods - 1 - i]}
              </text>
            )}
          </g>
        );
      })}
      <rect x="8" y={BEAM - 5} width={W - 16} height="10" rx="3" fill="#7d4f28" />
      {state.map((_, i) => (
        <circle key={i} cx={PAD + i * COL + COL / 2} cy={BEAM} r="3" fill="#fff8ec" />
      ))}
    </svg>
  );
}

/**
 * Keyboard for an interactive abacus: ← → pick a rod, ↑ pushes a bottom bead up, ↓ pulls one down,
 * Space flips the top (5) bead.
 */
export function useAbacusKeys({
  enabled,
  value,
  rods,
  selected,
  setSelected,
  onChange,
}: {
  enabled: boolean;
  value: number;
  rods: number;
  selected: number;
  setSelected: (i: number) => void;
  onChange: (v: number) => void;
}) {
  const latest = useRef({ value, selected });
  useEffect(() => {
    latest.current = { value, selected };
  });

  const change = (fn: (r: Rod) => Rod | null) => {
    const state = toRods(latest.current.value, rods);
    const i = latest.current.selected;
    const next = fn(state[i]);
    if (!next) {
      playSound("bump");
      return;
    }
    playSound("step");
    onChange(fromRods(state.map((r, k) => (k === i ? next : r))));
  };

  useGameKeys({
    enabled,
    onMove: (d) => {
      if (d === "left") setSelected(Math.max(0, latest.current.selected - 1));
      if (d === "right") setSelected(Math.min(rods - 1, latest.current.selected + 1));
      if (d === "up") change((r) => (r.earth < 4 ? { ...r, earth: r.earth + 1 } : null));
      if (d === "down") change((r) => (r.earth > 0 ? { ...r, earth: r.earth - 1 } : null));
    },
  });

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      // Space always means "move the top bead" here, even if a button (like Check) still has focus
      if (e.key !== " ") return;
      e.preventDefault();
      change((r) => ({ ...r, heaven: !r.heaven }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
}
