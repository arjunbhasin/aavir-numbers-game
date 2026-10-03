import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import AbacusSumsGame from "@/games/abacus/AbacusSumsGame";

export const metadata: Metadata = { title: "Abacus Sums · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="abacus-sums" hint="Move the beads to work out each sum, then press Check.">
      <AbacusSumsGame />
    </GameShell>
  );
}
