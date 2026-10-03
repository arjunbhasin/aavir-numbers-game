import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import CrosswordGame from "@/games/words/CrosswordGame";

export const metadata: Metadata = { title: "Mini Crossword · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="crossword" hint="Fill in the picture crossword with the letter tiles.">
      <CrosswordGame />
    </GameShell>
  );
}
