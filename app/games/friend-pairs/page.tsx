import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import FriendPairsGame from "@/games/abacus/FriendPairsGame";

export const metadata: Metadata = { title: "Friend Pairs · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="friend-pairs" hint="Flip two cards that are friends: they make 5 or 10.">
      <FriendPairsGame />
    </GameShell>
  );
}
