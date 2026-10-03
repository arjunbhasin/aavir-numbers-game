"use client";

import { useState } from "react";
import Abacus from "@/components/abacus/Abacus";
import MemoryBoard from "@/components/memory/MemoryBoard";
import Button from "@/components/ui/Button";
import { GridIcon, RestartIcon } from "@/components/ui/Icons";
import ModePicker from "@/components/ui/ModePicker";
import WinOverlay from "@/components/ui/WinOverlay";
import { matchStars } from "@/games/pair-match/logic";
import { useProgress } from "@/lib/progress";
import { makeRng, randomSeed } from "@/lib/random";
import { makeFriendDeck, type FriendCard } from "./logic";

const MODES = [
  { title: "Easy", blurb: "Little friends that make 5", accent: "grass" as const, dots: 1, target: 5 as const, pairs: 4, beads: false },
  { title: "Medium", blurb: "Big friends that make 10", accent: "sun" as const, dots: 2, target: 10 as const, pairs: 6, beads: false },
  { title: "Hard", blurb: "Big friends on the abacus", accent: "coral" as const, dots: 3, target: 10 as const, pairs: 6, beads: true },
];

export default function FriendPairsGame() {
  const [mode, setMode] = useState<number | null>(null);
  const [deck, setDeck] = useState<FriendCard[]>([]);
  const [round, setRound] = useState(0);
  const [won, setWon] = useState<{ stars: number; moves: number } | null>(null);
  const record = useProgress((s) => s.recordStars);

  const start = (m: number) => {
    setMode(m);
    setDeck(makeFriendDeck(makeRng(randomSeed()), MODES[m].target, MODES[m].pairs));
    setRound((r) => r + 1);
    setWon(null);
  };

  if (mode === null) return <ModePicker gameId="friend-pairs" heading="Which friends?" modes={MODES} onPick={start} />;
  const spec = MODES[mode];

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <span className={`px-4 py-1 rounded-full text-lg font-bold text-white ${spec.target === 5 ? "bg-sun-dark" : "bg-ocean-dark"}`}>
        Find two cards that make {spec.target}
      </span>
      <MemoryBoard
        key={round}
        cards={deck.map((c) => ({
          id: c.id,
          label: `${c.n}`,
          face: spec.beads ? (
            <div className="h-[88%] aspect-[100/300]">
              <Abacus value={c.n} rods={1} labels={false} className="h-full" />
            </div>
          ) : (
            <span className="text-5xl sm:text-6xl font-bold text-mint-dark">{c.n}</span>
          ),
        }))}
        cols={4}
        isMatch={(a, b) => deck[a].n + deck[b].n === spec.target}
        enabled={won === null}
        back="#3fd1c0"
        backShadow="#1fae9e"
        onDone={(moves) => {
          const stars = matchStars(moves, spec.pairs);
          record("friend-pairs", mode, stars);
          setWon({ stars, moves });
        }}
      />
      <div className="flex gap-3">
        <Button accent="white" onClick={() => start(mode)} icon={<RestartIcon className="w-6 h-6" />}>
          New cards
        </Button>
        <Button accent="white" onClick={() => setMode(null)} icon={<GridIcon className="w-6 h-6" />}>
          Change level
        </Button>
      </div>
      <WinOverlay open={won !== null} stars={won?.stars ?? 0} detail={`All friends found in ${won?.moves} tries!`} onAgain={() => start(mode)} onLevels={() => setMode(null)} />
    </div>
  );
}
