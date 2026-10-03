"use client";

import PatternGame from "@/components/shapes/PatternGame";
import WhatsNextPuzzle from "./WhatsNextPuzzle";

export default function WhatsNextGame() {
  return <PatternGame gameId="whats-next" renderPuzzle={({ key, ...p }) => <WhatsNextPuzzle key={key} {...p} />} />;
}
