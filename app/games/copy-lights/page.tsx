import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import CopyLightsGame from "@/games/copy-lights/CopyLightsGame";

export const metadata: Metadata = { title: "Copy the Lights · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="copy-lights" hint="Watch the lights, then play them back in the same order.">
      <CopyLightsGame />
    </GameShell>
  );
}
