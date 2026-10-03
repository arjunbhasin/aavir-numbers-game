import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import GardenGame from "@/games/garden/GardenGame";

export const metadata: Metadata = { title: "Garden Builder · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="garden" hint="Plant all the seedlings in rows. Find every rectangle!">
      <GardenGame />
    </GameShell>
  );
}
