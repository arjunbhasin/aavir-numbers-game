import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import IceSlideGame from "@/games/ice-slide/IceSlideGame";

export const metadata: Metadata = { title: "Ice Slide · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="ice-slide" hint="The penguin slides until it bumps a rock. Stop on the fish!">
      <IceSlideGame />
    </GameShell>
  );
}
