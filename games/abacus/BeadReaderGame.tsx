"use client";

import PatternGame from "@/components/shapes/PatternGame";
import BeadReaderPuzzle from "./BeadReaderPuzzle";

export default function BeadReaderGame() {
  return (
    <PatternGame
      gameId="bead-reader"
      blurbs={["1 rod, 0 to 9", "2 rods, up to 99", "3 rods, up to 999"]}
      renderPuzzle={({ key, ...p }) => <BeadReaderPuzzle key={key} {...p} />}
    />
  );
}
