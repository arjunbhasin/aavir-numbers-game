import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import BeadReaderGame from "@/games/abacus/BeadReaderGame";

export const metadata: Metadata = { title: "Bead Reader · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="bead-reader" hint="Read the beads, then show numbers on the abacus. Top bead is 5, bottom beads are 1.">
      <BeadReaderGame />
    </GameShell>
  );
}
