import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import WhatsNextGame from "@/games/patterns/WhatsNextGame";

export const metadata: Metadata = { title: "What's Next? · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="whats-next" hint="Find the pattern. Which shape comes next?">
      <WhatsNextGame />
    </GameShell>
  );
}
