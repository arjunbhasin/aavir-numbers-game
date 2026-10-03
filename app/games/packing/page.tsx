import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import PackingGame from "@/games/packing/PackingGame";

export const metadata: Metadata = { title: "Packing Day · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell title="Packing Day" accent="ocean" hint="Push the eggs into boxes. Every box you use must be full.">
      <PackingGame />
    </GameShell>
  );
}
