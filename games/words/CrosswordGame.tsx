"use client";

import PatternGame from "@/components/shapes/PatternGame";
import CrosswordPuzzle from "./CrosswordPuzzle";

export default function CrosswordGame() {
  return (
    <PatternGame
      gameId="crossword"
      roundLength={3}
      blurbs={["2 short words", "3 words", "4 words"]}
      renderPuzzle={({ key, ...p }) => <CrosswordPuzzle key={key} {...p} />}
    />
  );
}
