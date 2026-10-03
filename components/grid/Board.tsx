"use client";

import { motion, useAnimate } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import type { Dir } from "@/lib/grid";
import { useSwipe } from "@/lib/input";

export type Sprite = {
  id: string;
  r: number;
  c: number;
  node: ReactNode;
  z?: number;
  /** seconds for the slide animation (ice slides take longer) */
  duration?: number;
};

export default function Board({
  rows,
  cols,
  cell,
  renderCell,
  sprites,
  onSwipe,
  shake = 0,
  frame = "#7b8db8",
}: {
  rows: number;
  cols: number;
  cell: number;
  renderCell: (r: number, c: number) => ReactNode;
  sprites: Sprite[];
  onSwipe?: (d: Dir) => void;
  shake?: number;
  frame?: string;
}) {
  const swipeRef = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  useSwipe(swipeRef, (d) => onSwipe?.(d));

  useEffect(() => {
    if (shake > 0 && scope.current) void animate(scope.current, { x: [0, -7, 7, -4, 4, 0] }, { duration: 0.3 });
  }, [shake, animate, scope]);

  return (
    <div ref={swipeRef} style={{ touchAction: "none" }} className="select-none">
      <div
        ref={scope}
        className="relative rounded-3xl p-2 shadow-[0_10px_0_rgba(0,0,0,.12)]"
        style={{ background: frame }}
      >
        <div className="relative overflow-hidden rounded-2xl" style={{ width: cols * cell, height: rows * cell }}>
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gridTemplateRows: `repeat(${rows}, ${cell}px)` }}>
            {Array.from({ length: rows * cols }, (_, i) => (
              <div key={i} className="relative">
                {renderCell(Math.floor(i / cols), i % cols)}
              </div>
            ))}
          </div>
          {sprites.map((s) => (
            <motion.div
              key={s.id}
              className="absolute left-0 top-0"
              style={{ width: cell, height: cell, zIndex: s.z ?? 2 }}
              initial={false}
              animate={{ x: s.c * cell, y: s.r * cell }}
              transition={{ type: "tween", ease: s.duration ? "easeOut" : "easeInOut", duration: s.duration ?? 0.12 }}
            >
              {s.node}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
