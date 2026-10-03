import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import MissingPiecesGame from "@/games/patterns/MissingPiecesGame";

export const metadata: Metadata = { title: "Missing Pieces · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="missing-pieces" hint="Two shapes are missing. Pick them in order!">
      <MissingPiecesGame />
    </GameShell>
  );
}
