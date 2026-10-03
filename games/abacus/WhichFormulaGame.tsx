"use client";

import PatternGame from "@/components/shapes/PatternGame";
import WhichFormulaPuzzle from "./WhichFormulaPuzzle";

export default function WhichFormulaGame() {
  return (
    <PatternGame
      gameId="which-formula"
      blurbs={["Direct or little friend", "Adds big friends", "All four, with combinations"]}
      renderPuzzle={({ key, ...p }) => <WhichFormulaPuzzle key={key} {...p} />}
    />
  );
}
