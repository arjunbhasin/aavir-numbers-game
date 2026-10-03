import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import RhymeTimeGame from "@/games/words/RhymeTimeGame";

export const metadata: Metadata = { title: "Rhyme Time · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="rhyme-time" hint="Rhyming words sound the same at the end, like cat and hat.">
      <RhymeTimeGame />
    </GameShell>
  );
}
