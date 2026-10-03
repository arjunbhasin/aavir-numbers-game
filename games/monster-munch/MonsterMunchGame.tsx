"use client";

import PatternGame from "@/components/shapes/PatternGame";
import MonsterMunchPuzzle from "./MonsterMunchPuzzle";

export default function MonsterMunchGame() {
  return (
    <PatternGame
      gameId="monster-munch"
      blurbs={["Take away, up to 10", "How many were eaten? Up to 15", "How many more? Up to 20"]}
      renderPuzzle={({ key, ...p }) => <MonsterMunchPuzzle key={key} {...p} />}
    />
  );
}
