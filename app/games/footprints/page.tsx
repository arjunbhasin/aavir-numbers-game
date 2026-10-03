import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import FootprintsGame from "@/games/footprints/FootprintsGame";

export const metadata: Metadata = { title: "Footprints · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="footprints" hint="Watch the robot walk, then walk the same path.">
      <FootprintsGame />
    </GameShell>
  );
}
