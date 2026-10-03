"use client";

import PatternGame from "@/components/shapes/PatternGame";
import MissingLetterPuzzle from "./MissingLetterPuzzle";

export default function MissingLetterGame() {
  return (
    <PatternGame
      gameId="missing-letter"
      roundLength={5}
      blurbs={["The middle sound (vowels)", "Any letter, 3-letter words", "4-letter words"]}
      renderPuzzle={({ key, ...p }) => <MissingLetterPuzzle key={key} {...p} />}
    />
  );
}
