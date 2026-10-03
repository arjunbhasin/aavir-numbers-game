"use client";

import { useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import type { Accent } from "./accents";
import LevelPicker from "./LevelPicker";
import WinOverlay from "./WinOverlay";

export type LevelProps = {
  level: number;
  onWin: (stars: number) => void;
  onLevels: () => void;
};

/** Level picker + win overlay + saved stars around any level-based game. */
export default function LevelGame({
  gameId,
  accent,
  count,
  renderLevel,
}: {
  gameId: string;
  accent: Accent;
  count: number;
  renderLevel: (p: LevelProps) => ReactNode;
}) {
  const [level, setLevel] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [won, setWon] = useState<number | null>(null);
  const record = useProgress((s) => s.recordStars);

  const open = (l: number | null) => {
    setLevel(l);
    setWon(null);
    setAttempt((a) => a + 1);
  };

  if (level === null) return <LevelPicker gameId={gameId} count={count} accent={accent} onPick={open} />;

  return (
    <>
      <div className="text-xl font-semibold text-ink-soft mb-2">
        Level {level + 1} <span className="opacity-60">of {count}</span>
      </div>
      <div key={`${level}-${attempt}`} className="w-full flex flex-col items-center">
        {renderLevel({
          level,
          onWin: (stars) => {
            record(gameId, level, stars);
            setWon(stars);
          },
          onLevels: () => open(null),
        })}
      </div>
      <WinOverlay
        open={won !== null}
        stars={won ?? 0}
        onNext={level < count - 1 ? () => open(level + 1) : undefined}
        onAgain={() => open(level)}
        onLevels={() => open(null)}
      />
    </>
  );
}
