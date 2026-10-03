import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import MonsterMunchGame from "@/games/monster-munch/MonsterMunchGame";

export const metadata: Metadata = { title: "Monster Munch · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="monster-munch" hint="A hungry monster is eating apples. Can you work out how many?">
      <MonsterMunchGame />
    </GameShell>
  );
}
