import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import CoinShopGame from "@/games/coin-shop/CoinShopGame";

export const metadata: Metadata = { title: "Coin Shop · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="coin-shop" hint="Pay the exact price with coins. Hard mode: count your change!">
      <CoinShopGame />
    </GameShell>
  );
}
