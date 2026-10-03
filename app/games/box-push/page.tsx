import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import BoxPushGame from "@/games/box-push/BoxPushGame";

export const metadata: Metadata = { title: "Box Push · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell title="Box Push" accent="coral" hint="Push every box onto a star!">
      <BoxPushGame />
    </GameShell>
  );
}
