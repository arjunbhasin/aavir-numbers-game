import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import SumPathGame from "@/games/sum-path/SumPathGame";

export const metadata: Metadata = { title: "Sum Path · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="sum-path" hint="Collect number stones and reach the flag with exactly the target.">
      <SumPathGame />
    </GameShell>
  );
}
