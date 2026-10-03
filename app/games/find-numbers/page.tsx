import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import FindNumbersGame from "@/games/numbers/FindNumbersGame";

export const metadata: Metadata = { title: "Find Numbers · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell title="Find Numbers" accent="mint" hint="Find the numbers in order: 1, 2, 3...">
      <FindNumbersGame />
    </GameShell>
  );
}
