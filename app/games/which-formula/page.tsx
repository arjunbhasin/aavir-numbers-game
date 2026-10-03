import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import WhichFormulaGame from "@/games/abacus/WhichFormulaGame";

export const metadata: Metadata = { title: "Which Formula? · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="which-formula" hint="Pick the abacus formula, then watch the beads move.">
      <WhichFormulaGame />
    </GameShell>
  );
}
