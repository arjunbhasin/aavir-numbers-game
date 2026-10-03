import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import FriendFinderGame from "@/games/abacus/FriendFinderGame";

export const metadata: Metadata = { title: "Friend Finder · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="friend-finder" hint="Little friends make 5. Big friends make 10.">
      <FriendFinderGame />
    </GameShell>
  );
}
