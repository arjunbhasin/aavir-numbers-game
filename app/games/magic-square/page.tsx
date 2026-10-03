import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import MagicSquareGame from "@/games/patterns/MagicSquareGame";

export const metadata: Metadata = { title: "Magic Square · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="magic-square" hint="Every row and column has a rule. What goes in the empty box?">
      <MagicSquareGame />
    </GameShell>
  );
}
