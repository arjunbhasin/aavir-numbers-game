"use client";

import PatternGame from "@/components/shapes/PatternGame";
import FlashAbacusPuzzle from "./FlashAbacusPuzzle";

export default function FlashAbacusGame() {
  return (
    <PatternGame
      gameId="flash-abacus"
      blurbs={["3 small numbers, slow", "4 numbers", "5 numbers, quick"]}
      renderPuzzle={({ key, ...p }) => <FlashAbacusPuzzle key={key} {...p} />}
    />
  );
}
