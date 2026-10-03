"use client";

import PatternGame from "@/components/shapes/PatternGame";
import RhymeTimePuzzle from "./RhymeTimePuzzle";

export default function RhymeTimeGame() {
  return (
    <PatternGame
      gameId="rhyme-time"
      roundLength={5}
      blurbs={["Find 1 rhyme in 3 pictures", "Find 1 rhyme in 4 pictures", "Find 2 rhymes"]}
      renderPuzzle={({ key, ...p }) => <RhymeTimePuzzle key={key} {...p} />}
    />
  );
}
