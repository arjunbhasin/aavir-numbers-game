import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import RobotPathGame from "@/games/robot-path/RobotPathGame";

export const metadata: Metadata = { title: "Robot Path · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell title="Robot Path" accent="mint" hint="Plan all the steps, then press Go! Collect the stars, then reach the battery.">
      <RobotPathGame />
    </GameShell>
  );
}
