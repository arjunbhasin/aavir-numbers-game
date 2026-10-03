"use client";

import PatternGame from "@/components/shapes/PatternGame";
import SpellItPuzzle from "./SpellItPuzzle";

export default function SpellItGame() {
  return (
    <PatternGame
      gameId="spell-it"
      roundLength={5}
      blurbs={["3 letters, first one given", "4 and 5 letter words", "With an extra letter that doesn't fit"]}
      renderPuzzle={({ key, ...p }) => <SpellItPuzzle key={key} {...p} />}
    />
  );
}
