"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useGameKeys, useLater } from "@/lib/input";
import { playSound } from "@/lib/sound";

export type MemoryCard = { id: number; label: string; face: ReactNode };

/** Flip two cards at a time; matching cards stay up. Arrows + Enter work too. */
export default function MemoryBoard({
  cards,
  cols,
  isMatch,
  onDone,
  enabled = true,
  back = "#a678f0",
  backShadow = "#8253d1",
}: {
  cards: MemoryCard[];
  cols: number;
  isMatch: (a: number, b: number) => boolean;
  onDone: (moves: number) => void;
  enabled?: boolean;
  back?: string;
  backShadow?: string;
}) {
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [focus, setFocus] = useState(-1);
  const later = useLater();

  const flip = (i: number) => {
    if (!enabled || open.length === 2 || open.includes(i) || matched.includes(i)) return;
    playSound("click");
    const nowOpen = [...open, i];
    setOpen(nowOpen);
    if (nowOpen.length < 2) return;
    const [a, b] = nowOpen;
    const count = moves + 1;
    setMoves(count);
    if (isMatch(a, b)) {
      const nowMatched = [...matched, a, b];
      later(() => {
        playSound("pick");
        setMatched(nowMatched);
        setOpen([]);
        if (nowMatched.length === cards.length) later(() => onDone(count), 400);
      }, 450);
    } else {
      later(() => {
        playSound("bump");
        setOpen([]);
      }, 1000);
    }
  };

  useGameKeys({
    enabled,
    onMove: (d) =>
      setFocus((f) => {
        const n = cards.length;
        if (f < 0) return 0;
        if (d === "left") return (f + n - 1) % n;
        if (d === "right") return (f + 1) % n;
        if (d === "up") return (f - cols + n) % n;
        return (f + cols) % n;
      }),
    onEnter: () => focus >= 0 && flip(focus),
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-2xl font-semibold text-ink">
        Pairs found: {matched.length / 2} of {cards.length / 2} · Tries: {moves}
      </p>
      <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cards.map((card, i) => {
          const faceUp = open.includes(i) || matched.includes(i);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(i)}
              aria-label={faceUp ? card.label : `Card ${i + 1}, face down`}
              className={`relative w-[clamp(4.5rem,18vw,8.5rem)] aspect-square [perspective:600px] rounded-2xl ${focus === i ? "ring-4 ring-ocean" : ""}`}
            >
              <motion.div
                className="absolute inset-0 [transform-style:preserve-3d]"
                animate={{ rotateY: faceUp ? 180 : 0, scale: matched.includes(i) ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="absolute inset-0 rounded-2xl grid place-items-center [backface-visibility:hidden]"
                  style={{ background: back, boxShadow: `0 5px 0 ${backShadow}` }}
                >
                  <span className="text-4xl text-white/80 font-bold">?</span>
                </div>
                <div
                  className={`absolute inset-0 rounded-2xl grid place-items-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    matched.includes(i) ? "bg-[#e6f8e8] shadow-[0_5px_0_#5cc96b]" : "bg-white shadow-[0_5px_0_#c9d6e6]"
                  }`}
                >
                  {card.face}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
