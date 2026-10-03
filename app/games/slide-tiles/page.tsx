import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import SlideTilesGame from "@/games/slide-tiles/SlideTilesGame";

export const metadata: Metadata = { title: "Slide Tiles · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="slide-tiles" hint="Slide the tiles into the empty space to put them in order.">
      <SlideTilesGame />
    </GameShell>
  );
}
