import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import WordSearchGame from "@/games/words/WordSearchGame";

export const metadata: Metadata = { title: "Word Search · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="word-search" hint="Find the picture words hidden in the letters.">
      <WordSearchGame />
    </GameShell>
  );
}
