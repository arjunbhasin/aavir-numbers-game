import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import KeyMazeGame from "@/games/key-maze/KeyMazeGame";

export const metadata: Metadata = { title: "Key Maze · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="key-maze" hint="Each key opens one door of the same color. Reach the treasure!">
      <KeyMazeGame />
    </GameShell>
  );
}
