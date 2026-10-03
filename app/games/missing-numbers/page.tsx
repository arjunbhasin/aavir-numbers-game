import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import MissingNumbersGame from "@/games/numbers/MissingNumbersGame";

export const metadata: Metadata = { title: "Missing Numbers · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell title="Missing Numbers" accent="ocean" hint="Some numbers got lost. Put them back!">
      <MissingNumbersGame />
    </GameShell>
  );
}
