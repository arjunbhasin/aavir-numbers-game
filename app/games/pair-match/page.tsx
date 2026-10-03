import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import PairMatchGame from "@/games/pair-match/PairMatchGame";

export const metadata: Metadata = { title: "Pair Match · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="pair-match" hint="Flip two cards at a time. Remember where everything is!">
      <PairMatchGame />
    </GameShell>
  );
}
