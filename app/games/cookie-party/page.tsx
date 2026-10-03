import type { Metadata } from "next";
import GameShell from "@/components/ui/GameShell";
import CookiePartyGame from "@/games/cookie-party/CookiePartyGame";

export const metadata: Metadata = { title: "Cookie Party · Aavir's Puzzle Park" };

export default function Page() {
  return (
    <GameShell id="cookie-party" hint="Share fairly. Leftovers go to the dog!">
      <CookiePartyGame />
    </GameShell>
  );
}
