"use client";

import PatternGame from "@/components/shapes/PatternGame";
import MissingPiecesPuzzle from "./MissingPiecesPuzzle";

export default function MissingPiecesGame() {
  return <PatternGame gameId="missing-pieces" renderPuzzle={({ key, ...p }) => <MissingPiecesPuzzle key={key} {...p} />} />;
}
