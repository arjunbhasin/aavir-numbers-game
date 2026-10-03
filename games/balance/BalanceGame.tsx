"use client";

import PatternGame from "@/components/shapes/PatternGame";
import BalancePuzzle from "./BalancePuzzle";

export default function BalanceGame() {
  return (
    <PatternGame
      gameId="balance"
      blurbs={["Up to 10", "Two blocks, up to 15", "Three blocks, up to 20"]}
      renderPuzzle={({ key, ...p }) => <BalancePuzzle key={key} {...p} />}
    />
  );
}
