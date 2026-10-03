import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import RobotPathGame from "@/games/robot-path/RobotPathGame";

export const metadata: Metadata = { title: "Robot Path · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="robot-path" hint="Plan all the steps, then press Go! Collect the stars, then reach the battery.">
      <RobotPathGame />
    </GameShell>
  );
}
