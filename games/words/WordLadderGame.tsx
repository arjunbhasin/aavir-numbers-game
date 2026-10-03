"use client";

import PatternGame from "@/components/shapes/PatternGame";
import WordLadderPuzzle from "./WordLadderPuzzle";

export default function WordLadderGame() {
  return (
    <PatternGame
      gameId="word-ladder"
      roundLength={5}
      blurbs={["Change 1 letter", "Two changes in a row", "Three changes in a row"]}
      renderPuzzle={({ key, ...p }) => <WordLadderPuzzle key={key} {...p} />}
    />
  );
}
