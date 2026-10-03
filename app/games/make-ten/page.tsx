import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import MakeTenGame from "@/games/make-ten/MakeTenGame";

export const metadata: Metadata = { title: "Make Ten · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="make-ten" hint="Tap two numbers that add up to the target.">
      <MakeTenGame />
    </GameShell>
  );
}
