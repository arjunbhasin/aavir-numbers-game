import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import WhatsMissingGame from "@/games/whats-missing/WhatsMissingGame";

export const metadata: Metadata = { title: "What's Missing? · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="whats-missing" hint="Remember the toys. One will hide. Which one?">
      <WhatsMissingGame />
    </GameShell>
  );
}
