"use client";

import PatternGame from "@/components/shapes/PatternGame";
import WordSearchPuzzle from "./WordSearchPuzzle";

export default function WordSearchGame() {
  return (
    <PatternGame
      gameId="word-search"
      roundLength={3}
      blurbs={["3 words, across only", "3 words, across and down", "4 words, across and down"]}
      renderPuzzle={({ key, ...p }) => <WordSearchPuzzle key={key} {...p} />}
    />
  );
}
