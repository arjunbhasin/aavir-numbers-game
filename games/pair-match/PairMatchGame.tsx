"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { PICTURES } from "@/components/memory/Pictures";
import { TenFrame } from "@/components/math/AddArt";
import Button from "@/components/ui/Button";
import { GridIcon, RestartIcon } from "@/components/ui/Icons";
import ModePicker from "@/components/ui/ModePicker";
import WinOverlay from "@/components/ui/WinOverlay";
import { useGameKeys, useLater } from "@/lib/input";
import { useProgress } from "@/lib/progress";
import { makeRng, randomSeed } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { makeDeck, matchStars, type Card } from "./logic";

const MODES = [
  { title: "Easy", blurb: "4 pairs of pictures", accent: "grass" as const, dots: 1, pairs: 4, cols: 4, mode: "pictures" as const },
  { title: "Medium", blurb: "6 pairs of pictures", accent: "sun" as const, dots: 2, pairs: 6, cols: 4, mode: "pictures" as const },
  { title: "Hard", blurb: "Match numbers to dots", accent: "coral" as const, dots: 3, pairs: 8, cols: 4, mode: "numbers" as const },
];

function Face({ card }: { card: Card }) {
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
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [focus, setFocus] = useState(-1);
  const [won, setWon] = useState<number | null>(null);
  const record = useProgress((s) => s.recordStars);
  const later = useLater();

  const start = (m: number) => {
    setMode(m);
    setDeck(makeDeck(makeRng(randomSeed()), MODES[m].pairs, MODES[m].mode, PICTURES.length));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setWon(null);
  };

  const flip = (i: number) => {
    if (mode === null || open.length === 2 || open.includes(i) || matched.includes(i)) return;
    playSound("click");
    const nowOpen = [...open, i];
    setOpen(nowOpen);
    if (nowOpen.length < 2) return;
    const [a, b] = nowOpen;
    const moveCount = moves + 1;
    setMoves(moveCount);
    if (deck[a].key === deck[b].key) {
      const nowMatched = [...matched, a, b];
      later(() => {
        playSound("pick");
        setMatched(nowMatched);
        setOpen([]);
        if (nowMatched.length === deck.length) {
          const stars = matchStars(moveCount, MODES[mode].pairs);
          record("pair-match", mode, stars);
          later(() => setWon(stars), 400);
        }
      }, 450);
    } else {
      later(() => {
        playSound("bump");
        setOpen([]);
      }, 1000);
    }
  };

  const cols = mode === null ? 4 : MODES[mode].cols;
  useGameKeys({
    enabled: mode !== null && won === null,
    onMove: (d) =>
      setFocus((f) => {
        const n = deck.length;
        if (f < 0) return 0;
        if (d === "left") return (f + n - 1) % n;
        if (d === "right") return (f + 1) % n;
        if (d === "up") return (f - cols + n) % n;
        return (f + cols) % n;
      }),
    onEnter: () => focus >= 0 && flip(focus),
  });

  if (mode === null) return <ModePicker gameId="pair-match" heading="How many cards?" modes={MODES} onPick={start} />;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-2xl font-semibold text-ink">
        Pairs found: {matched.length / 2} of {MODES[mode].pairs} · Tries: {moves}
      </p>
      <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {deck.map((card, i) => {
          const faceUp = open.includes(i) || matched.includes(i);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(i)}
              aria-label={faceUp ? label(card) : `Card ${i + 1}, face down`}
              className={`relative w-[clamp(4.5rem,18vw,8.5rem)] aspect-square [perspective:600px] rounded-2xl ${focus === i ? "ring-4 ring-ocean" : ""}`}
            >
              <motion.div
                className="absolute inset-0 [transform-style:preserve-3d]"
                animate={{ rotateY: faceUp ? 180 : 0, scale: matched.includes(i) ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-grape shadow-[0_5px_0_#8253d1] grid place-items-center [backface-visibility:hidden]">
                  <span className="text-4xl text-white/80 font-bold">?</span>
                </div>
                <div
                  className={`absolute inset-0 rounded-2xl grid place-items-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    matched.includes(i) ? "bg-[#e6f8e8] shadow-[0_5px_0_#5cc96b]" : "bg-white shadow-[0_5px_0_#c9d6e6]"
                  }`}
                >
                  <Face card={card} />
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        <Button accent="white" onClick={() => start(mode)} icon={<RestartIcon className="w-6 h-6" />}>
          New cards
        </Button>
        <Button accent="white" onClick={() => setMode(null)} icon={<GridIcon className="w-6 h-6" />}>
          Change level
        </Button>
      </div>
      <WinOverlay open={won !== null} stars={won ?? 0} detail={`All pairs in ${moves} tries!`} onAgain={() => start(mode)} onLevels={() => setMode(null)} />
    </div>
  );
}
