import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import BalanceGame from "@/games/balance/BalanceGame";

export const metadata: Metadata = { title: "Balance Scale · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="balance" hint="Make both sides of the scale weigh the same.">
      <BalanceGame />
    </GameShell>
  );
}
