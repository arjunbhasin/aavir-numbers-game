"use client";

import PatternGame from "@/components/shapes/PatternGame";
import OddOneOutPuzzle from "./OddOneOutPuzzle";

export default function OddOneOutGame() {
  return <PatternGame gameId="odd-one-out" renderPuzzle={({ key, ...p }) => <OddOneOutPuzzle key={key} {...p} />} />;
}
