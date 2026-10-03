import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import SpellItGame from "@/games/words/SpellItGame";

export const metadata: Metadata = { title: "Spell It · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="spell-it" hint="Tap the letters in the right order to spell the picture.">
      <SpellItGame />
    </GameShell>
  );
}
