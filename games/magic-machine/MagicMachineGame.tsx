"use client";

import PatternGame from "@/components/shapes/PatternGame";
import MachinePuzzle from "./MachinePuzzle";

export default function MagicMachineGame() {
  return (
    <PatternGame
      gameId="magic-machine"
      blurbs={["Find the rule: × 2, × 5, × 10", "Run it backwards to divide", "Two machines in a row"]}
      renderPuzzle={({ key, ...p }) => <MachinePuzzle key={key} {...p} />}
    />
  );
}
