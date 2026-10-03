import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import BunnyHopsGame from "@/games/bunny-hops/BunnyHopsGame";

export const metadata: Metadata = { title: "Bunny Hops · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="bunny-hops" hint="Hop along the number line in equal jumps.">
      <BunnyHopsGame />
    </GameShell>
  );
}
