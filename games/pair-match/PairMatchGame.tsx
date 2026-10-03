"use client";

import { useState } from "react";
import { PICTURES } from "@/components/memory/Pictures";
import MemoryBoard from "@/components/memory/MemoryBoard";
import { TenFrame } from "@/components/math/AddArt";
import Button from "@/components/ui/Button";
import { GridIcon, RestartIcon } from "@/components/ui/Icons";
import ModePicker from "@/components/ui/ModePicker";
import WinOverlay from "@/components/ui/WinOverlay";
import { useProgress } from "@/lib/progress";
import { makeRng, randomSeed } from "@/lib/random";
import { makeDeck, matchStars, type Card } from "./logic";

const MODES = [
  { title: "Easy", blurb: "4 pairs of pictures", accent: "grass" as const, dots: 1, pairs: 4, mode: "pictures" as const },
  { title: "Medium", blurb: "6 pairs of pictures", accent: "sun" as const, dots: 2, pairs: 6, mode: "pictures" as const },
  { title: "Hard", blurb: "Match numbers to dots", accent: "coral" as const, dots: 3, pairs: 8, mode: "numbers" as const },
];

function face(card: Card) {
  const f = card.face;
  if (f.type === "pic") return <div className="w-full h-full p-[12%]">{PICTURES[f.pic].node}</div>;
  if (f.type === "num") return <span className="text-5xl sm:text-6xl font-bold text-grape-dark">{f.n}</span>;
  return <TenFrame n={f.n} className="w-[85%]" />;
}

function label(card: Card) {
  const f = card.face;
  return f.type === "pic" ? PICTURES[f.pic].label : f.type === "num" ? `number ${f.n}` : `${f.n} dots`;
}

export default function PairMatchGame() {
  const [mode, setMode] = useState<number | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const [round, setRound] = useState(0);
  const [won, setWon] = useState<{ stars: number; moves: number } | null>(null);
  const record = useProgress((s) => s.recordStars);

  const start = (m: number) => {
    setMode(m);
    setDeck(makeDeck(makeRng(randomSeed()), MODES[m].pairs, MODES[m].mode, PICTURES.length));
    setRound((r) => r + 1);
    setWon(null);
  };

  if (mode === null) return <ModePicker gameId="pair-match" heading="How many cards?" modes={MODES} onPick={start} />;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <MemoryBoard
        key={round}
        cards={deck.map((c) => ({ id: c.id, label: label(c), face: face(c) }))}
        cols={4}
        isMatch={(a, b) => deck[a].key === deck[b].key}
        enabled={won === null}
        onDone={(moves) => {
          const stars = matchStars(moves, MODES[mode].pairs);
          record("pair-match", mode, stars);
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
      <WinOverlay open={won !== null} stars={won?.stars ?? 0} detail={`All pairs in ${won?.moves} tries!`} onAgain={() => start(mode)} onLevels={() => setMode(null)} />
    </div>
  );
}
