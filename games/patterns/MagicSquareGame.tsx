"use client";

import PatternGame from "@/components/shapes/PatternGame";
import MagicSquarePuzzle from "./MagicSquarePuzzle";

export default function MagicSquareGame() {
  return <PatternGame gameId="magic-square" renderPuzzle={({ key, ...p }) => <MagicSquarePuzzle key={key} {...p} />} />;
}
