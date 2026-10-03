"use client";

import PatternGame from "@/components/shapes/PatternGame";
import FootprintsPuzzle from "./FootprintsPuzzle";

export default function FootprintsGame() {
  return (
    <PatternGame
      gameId="footprints"
      blurbs={["3 steps on a small grid", "5 steps", "7 steps on a big grid"]}
      renderPuzzle={({ key, ...p }) => <FootprintsPuzzle key={key} {...p} />}
    />
  );
}
