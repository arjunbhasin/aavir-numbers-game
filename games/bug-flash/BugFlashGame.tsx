"use client";

import PatternGame from "@/components/shapes/PatternGame";
import BugFlashPuzzle from "./BugFlashPuzzle";

export default function BugFlashGame() {
  return (
    <PatternGame
      gameId="bug-flash"
      blurbs={["Groups of 2, 5 and 10", "Rows and groups up to 5", "Bigger rows, quicker peek"]}
      renderPuzzle={({ key, ...p }) => <BugFlashPuzzle key={key} {...p} />}
    />
  );
}
