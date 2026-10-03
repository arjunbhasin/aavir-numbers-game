import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import WordLadderGame from "@/games/words/WordLadderGame";

export const metadata: Metadata = { title: "Change One Letter · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="word-ladder" hint="Change just one letter each time to make the next picture.">
      <WordLadderGame />
    </GameShell>
  );
}
