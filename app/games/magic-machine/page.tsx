import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import MagicMachineGame from "@/games/magic-machine/MagicMachineGame";

export const metadata: Metadata = { title: "Magic Machine · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="magic-machine" hint="Numbers go in, numbers come out. What does the machine do?">
      <MagicMachineGame />
    </GameShell>
  );
}
