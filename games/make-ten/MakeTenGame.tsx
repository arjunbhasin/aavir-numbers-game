"use client";

import PatternGame from "@/components/shapes/PatternGame";
import MakeTenPuzzle from "./MakeTenPuzzle";

export default function MakeTenGame() {
  return (
    <PatternGame
      gameId="make-ten"
      blurbs={["Make 10, with dots to help", "Make 10 with just numbers", "Make 20!"]}
      renderPuzzle={({ key, ...p }) => <MakeTenPuzzle key={key} {...p} />}
    />
  );
}
