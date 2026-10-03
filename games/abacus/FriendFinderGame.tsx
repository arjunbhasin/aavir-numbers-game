"use client";

import PatternGame from "@/components/shapes/PatternGame";
import FriendFinderPuzzle from "./FriendFinderPuzzle";

export default function FriendFinderGame() {
  return (
    <PatternGame
      gameId="friend-finder"
      blurbs={["Little friends (make 5)", "Big friends (make 10)", "Both, plus formulas"]}
      renderPuzzle={({ key, ...p }) => <FriendFinderPuzzle key={key} {...p} />}
    />
  );
}
