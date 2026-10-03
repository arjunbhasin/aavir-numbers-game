import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import MissingLetterGame from "@/games/words/MissingLetterGame";

export const metadata: Metadata = { title: "Missing Letter · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="missing-letter" hint="Look at the picture. Which letter is missing?">
      <MissingLetterGame />
    </GameShell>
  );
}
