import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import BugFlashGame from "@/games/bug-flash/BugFlashGame";

export const metadata: Metadata = { title: "Bug Count Flash · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="bug-flash" hint="Peek at the ladybugs, then say how many. Count in groups!">
      <BugFlashGame />
    </GameShell>
  );
}
