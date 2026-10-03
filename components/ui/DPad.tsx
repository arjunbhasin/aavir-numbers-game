"use client";

import type { Dir } from "@/lib/grid";
import { ArrowIcon } from "./Icons";

export default function DPad({ onMove, className = "" }: { onMove: (d: Dir) => void; className?: string }) {
  const btn = (d: Dir, area: string) => (
    <button
      type="button"
      aria-label={`Move ${d}`}
      onPointerDown={(e) => {
        e.preventDefault();
        onMove(d);
      }}
      className="btn-3d grid place-items-center rounded-2xl bg-white text-ink w-[72px] h-[72px]"
      style={{ gridArea: area, ["--btn-shadow" as string]: "#c9d6e6" }}
    >
      <ArrowIcon dir={d} className="w-10 h-10" />
    </button>
  );
  return (
    <div
      className={`grid gap-2 select-none ${className}`}
      style={{ gridTemplateAreas: `". up ." "left . right" ". down ."`, touchAction: "manipulation" }}
    >
      {btn("up", "up")}
      {btn("left", "left")}
      {btn("right", "right")}
      {btn("down", "down")}
    </div>
  );
}
