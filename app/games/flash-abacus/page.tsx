import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import FlashAbacusGame from "@/games/abacus/FlashAbacusGame";

export const metadata: Metadata = { title: "Flash Abacus · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="flash-abacus" hint="Watch the numbers flash by and add them in your head.">
      <FlashAbacusGame />
    </GameShell>
  );
}
