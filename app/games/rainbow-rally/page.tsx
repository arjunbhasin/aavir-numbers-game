import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import RainbowRallyGame from "@/games/racing/RainbowRallyGame";

export const metadata: Metadata = { title: "Rainbow Rally · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="rainbow-rally" hint="Steer your car, grab stars, hit the rainbow pads and race your friends!">
      <RainbowRallyGame />
    </GameShell>
  );
}
