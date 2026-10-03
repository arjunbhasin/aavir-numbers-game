"use client";

import PatternGame from "@/components/shapes/PatternGame";
import WhatsMissingPuzzle from "./WhatsMissingPuzzle";

export default function WhatsMissingGame() {
  return (
    <PatternGame
      gameId="whats-missing"
      blurbs={["4 toys, keep their places", "6 toys, keep their places", "8 toys, all mixed up"]}
      renderPuzzle={({ key, ...p }) => <WhatsMissingPuzzle key={key} {...p} />}
    />
  );
}
