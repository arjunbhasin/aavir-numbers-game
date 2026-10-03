import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import OddOneOutGame from "@/games/patterns/OddOneOutGame";

export const metadata: Metadata = { title: "Odd One Out · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="odd-one-out" hint="One shape doesn't belong. Can you find it?">
      <OddOneOutGame />
    </GameShell>
  );
}
