"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { DIFFICULTY_NAMES, type Difficulty } from "@/games/patterns/generators";
import { useProgress } from "@/lib/progress";
import { randomSeed } from "@/lib/random";
import Button from "@/components/ui/Button";
import { GridIcon } from "@/components/ui/Icons";
import ModePicker, { type Mode } from "@/components/ui/ModePicker";
import WinOverlay from "@/components/ui/WinOverlay";

export const ROUND_LENGTH = 5;

export type PuzzleProps = {
  seed: number;
  difficulty: Difficulty;
  /** position of this puzzle in the round, starting at 0 */
  index: number;
  /** call once the puzzle is solved, with how many wrong tries it took */
  onSolved: (mistakes: number) => void;
};

const DIFF_STYLE: Omit<Mode, "title">[] = [
  { accent: "grass", blurb: "One thing changes", dots: 1 },
  { accent: "sun", blurb: "Two things change", dots: 2 },
  { accent: "coral", blurb: "Brain stretcher!", dots: 3 },
];

export function starsForMistakes(m: number): number {
  return m <= 1 ? 3 : m <= 4 ? 2 : 1;
}

export default function PatternGame({
  gameId,
  renderPuzzle,
  blurbs,
  roundLength = ROUND_LENGTH,
}: {
  gameId: string;
  /** puzzles per round (long puzzles like crosswords use fewer) */
  roundLength?: number;
  /** what each difficulty means for this game, shown on the picker */
  blurbs?: [string, string, string];
  renderPuzzle: (p: PuzzleProps & { key: string }) => ReactNode;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [roundSeed, setRoundSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [won, setWon] = useState<number | null>(null);
  const record = useProgress((s) => s.recordStars);

  const start = (d: Difficulty) => {
    setDifficulty(d);
    setRoundSeed(randomSeed());
    setIndex(0);
    setMistakes(0);
    setWon(null);
  };

  if (difficulty === null) {
    return (
      <ModePicker
        gameId={gameId}
        heading="How tricky?"
        modes={DIFF_STYLE.map((m, i) => ({ ...m, title: DIFFICULTY_NAMES[i], blurb: blurbs?.[i] ?? m.blurb }))}
        onPick={(i) => start(i as Difficulty)}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-xl font-semibold text-ink-soft">{DIFFICULTY_NAMES[difficulty]}</span>
        <div className="flex gap-2" role="img" aria-label={`Puzzle ${index + 1} of ${roundLength}`}>
          {Array.from({ length: roundLength }, (_, i) => (
            <motion.span
              key={i}
              animate={{ scale: i === index ? 1.25 : 1 }}
              className={`w-5 h-5 rounded-full border-4 ${i < index ? "bg-grass border-grass" : i === index ? "bg-white border-sun" : "bg-white/60 border-white"}`}
            />
          ))}
        </div>
      </div>

      {renderPuzzle({
        key: `${roundSeed}-${index}`,
        seed: roundSeed + index * 7919,
        index,
        difficulty,
        onSolved: (m) => {
          const total = mistakes + m;
          setMistakes(total);
          if (index + 1 >= roundLength) {
            const stars = starsForMistakes(total);
            record(gameId, difficulty, stars);
            setWon(stars);
          } else {
            setIndex(index + 1);
          }
        },
      })}

      <div className="mt-8">
        <Button accent="white" onClick={() => setDifficulty(null)} icon={<GridIcon className="w-7 h-7" />}>
          Change level
        </Button>
      </div>

      <WinOverlay
        open={won !== null}
        stars={won ?? 0}
        onNext={() => start(difficulty)}
        onLevels={() => setDifficulty(null)}
      />
    </div>
  );
}
