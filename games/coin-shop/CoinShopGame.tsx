"use client";

import PatternGame from "@/components/shapes/PatternGame";
import CoinShopPuzzle from "./CoinShopPuzzle";

export default function CoinShopGame() {
  return (
    <PatternGame
      gameId="coin-shop"
      blurbs={["Pay up to 10", "Pay up to 20", "Pay up to 30, and count change"]}
      renderPuzzle={({ key, ...p }) => <CoinShopPuzzle key={key} {...p} />}
    />
  );
}
