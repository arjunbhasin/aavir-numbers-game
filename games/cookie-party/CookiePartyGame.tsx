"use client";

import KeyboardHint from "@/components/ui/KeyboardHint";
import { LayoutGroup, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ANIMALS, Animal, Cookie, Dog, Plate } from "@/components/math/Art";
import Choices from "@/components/math/Choices";
import Button from "@/components/ui/Button";
import { GridIcon, RestartIcon } from "@/components/ui/Icons";
import LevelGame, { type LevelProps } from "@/components/ui/LevelGame";
import { starsForMistakes } from "@/components/shapes/PatternGame";
import { useGameKeys, useLater } from "@/lib/input";
import { playSound } from "@/lib/sound";
import { LEVELS } from "./levels";
import { canGive, isDone, reverseAnswer, shareSentence, type PlatesLevel, type ReverseLevel, type ShareLevel } from "./logic";

const NAMES: Record<string, string> = { bear: "Bear", cat: "Cat", frog: "Frog", pig: "Pig", owl: "Owl", bunny: "Bunny" };

/** -1 = still in the pile, -2 = given to the dog, otherwise the plate index */
type Where = number;

function CookieDot({ id, size = "w-10 h-10" }: { id: number; size?: string }) {
  return (
    <motion.div layoutId={`cookie-${id}`} className={size} transition={{ type: "spring", stiffness: 380, damping: 28 }}>
      <Cookie />
    </motion.div>
  );
}

function Friend({
  index,
  cookies,
  mood,
  selected,
  bounce,
  onClick,
}: {
  index: number;
  cookies: number[];
  mood: "happy" | "sad" | "wait";
  selected?: boolean;
  bounce?: boolean;
  onClick?: () => void;
}) {
  const kind = ANIMALS[index % ANIMALS.length];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={onClick ? `Give a cookie to ${NAMES[kind]}` : `${NAMES[kind]} has ${cookies.length} cookies`}
      animate={bounce ? { y: [0, -14, 0, -8, 0] } : { y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center rounded-3xl p-2 w-[clamp(6rem,15vw,9rem)] ${selected ? "bg-white/80 ring-4 ring-berry" : "bg-white/40"} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20">
        <Animal kind={kind} mood={mood} />
      </div>
      <div className="relative w-full aspect-[5/3] -mt-1">
        <div className="absolute inset-0">
          <Plate />
        </div>
        <div className="absolute inset-[18%_14%] flex flex-wrap content-center justify-center gap-0.5">
          {cookies.map((id) => (
            <CookieDot key={id} id={id} size="w-6 h-6 sm:w-7 sm:h-7" />
          ))}
        </div>
      </div>
      <span className="text-xl font-bold text-ink tabular-nums">{cookies.length}</span>
    </motion.button>
  );
}

function ShareView({ level, onWin, onLevels }: { level: ShareLevel } & Omit<LevelProps, "level">) {
  const fresh = () => Array.from({ length: level.cookies }, () => -1 as Where);
  const [where, setWhere] = useState<Where[]>(fresh);
  const [selected, setSelected] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [bounce, setBounce] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const later = useLater();

  const counts = Array.from({ length: level.plates }, (_, p) => where.filter((w) => w === p).length);
  const pile = where.map((w, id) => (w === -1 ? id : -1)).filter((id) => id >= 0);
  const max = Math.max(...counts);
  const allEqual = counts.every((c) => c === counts[0]);

  const finish = (nextWhere: Where[]) => {
    setDone(true);
    const left = nextWhere.filter((w) => w === -1).length;
    if (left) {
      later(() => {
        setWhere(nextWhere.map((w) => (w === -1 ? -2 : w)));
        playSound("pick");
      }, 500);
    }
    playSound("correct");
    later(() => onWin(starsForMistakes(mistakes), shareSentence(level.cookies, level.plates)), left ? 1500 : 900);
  };

  const give = (plate: number) => {
    if (done || !pile.length) return;
    setSelected(plate);
    if (!canGive(counts, plate)) {
      playSound("wrong");
      setMistakes((m) => m + 1);
      const fewest = counts.map((c, i) => (c === Math.min(...counts) ? i : -1)).filter((i) => i >= 0);
      setBounce(fewest);
      later(() => setBounce([]), 600);
      const name = NAMES[ANIMALS[fewest[0] % ANIMALS.length]];
      setMessage(`Wait! ${name} has fewer. Give ${fewest.length > 1 ? "everyone with fewer" : name} one first.`);
      return;
    }
    const next = [...where];
    next[pile[pile.length - 1]] = plate;
    setWhere(next);
    setMessage(null);
    playSound("pick");
    const nextCounts = counts.map((c, i) => (i === plate ? c + 1 : c));
    if (isDone(nextCounts, pile.length - 1)) finish(next);
  };

  const dealRound = () => {
    if (done || pile.length < level.plates || !allEqual) return;
    const next = [...where];
    for (let p = 0; p < level.plates; p++) next[pile[pile.length - 1 - p]] = p;
    setWhere(next);
    setMessage(null);
    playSound("pick");
    const nextCounts = counts.map((c) => c + 1);
    if (isDone(nextCounts, pile.length - level.plates)) finish(next);
  };

  useGameKeys({
    enabled: !done,
    onMove: (d) => {
      if (d === "left") setSelected((s) => (s + level.plates - 1) % level.plates);
      if (d === "right") setSelected((s) => (s + 1) % level.plates);
      if (d === "down") give(selected);
    },
    onEnter: () => give(selected),
    onRestart: () => {
      setWhere(fresh());
      setMessage(null);
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= level.plates) give(n - 1);
      // a focused button already reacts to Space by itself
      if (e.key === " " && level.dealButton && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        dealRound();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const dogCookies = where.map((w, id) => (w === -2 ? id : -1)).filter((id) => id >= 0);

  return (
    <LayoutGroup>
      <div className="flex flex-col items-center gap-4 w-full">
        <p className="text-2xl font-semibold text-ink text-center">
          Share {level.cookies} cookies fairly between {level.plates} friends.
        </p>
        <div className="flex flex-wrap justify-center gap-1 max-w-xl min-h-14 p-3 rounded-3xl bg-[#fff1dc] shadow-[inset_0_0_0_4px_#fff]">
          {pile.map((id) => (
            <CookieDot key={id} id={id} size="w-11 h-11" />
          ))}
          {pile.length === 0 && <span className="text-lg text-ink-soft/70 self-center">All shared!</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {counts.map((_, p) => (
            <Friend
              key={p}
              index={p}
              cookies={where.map((w, id) => (w === p ? id : -1)).filter((id) => id >= 0)}
              mood={max === 0 ? "wait" : allEqual || counts[p] === max ? "happy" : "sad"}
              selected={selected === p && !done}
              bounce={bounce.includes(p)}
              onClick={done ? undefined : () => give(p)}
            />
          ))}
          <div className="flex flex-col items-center rounded-3xl p-2 w-[clamp(6rem,15vw,9rem)] bg-white/30">
            <div className="w-16 h-16 sm:w-20 sm:h-20">
              <Dog happy={dogCookies.length > 0} />
            </div>
            <div className="flex flex-wrap justify-center gap-0.5 min-h-8 mt-1">
              {dogCookies.map((id) => (
                <CookieDot key={id} id={id} size="w-6 h-6 sm:w-7 sm:h-7" />
              ))}
            </div>
            <span className="text-base font-semibold text-ink-soft">leftovers</span>
          </div>
        </div>
        <p className="text-xl font-semibold text-coral-dark min-h-7 text-center">{message}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {level.dealButton && (
            <Button accent="berry" size="lg" onClick={dealRound} disabled={done || pile.length < level.plates || !allEqual} silent>
              One for everyone!
            </Button>
          )}
          <Button
            accent="white"
            onClick={() => {
              setWhere(fresh());
              setMessage(null);
            }}
            disabled={done}
            icon={<RestartIcon className="w-6 h-6" />}
          >
            Start again
          </Button>
          <Button accent="white" onClick={onLevels} icon={<GridIcon className="w-6 h-6" />}>
            Levels
          </Button>
        </div>
        <KeyboardHint>
          Tap a friend, or press 1–{level.plates}{level.dealButton ? " · Space gives one to everyone" : ""}
        </KeyboardHint>
      </div>
    </LayoutGroup>
  );
}

function ReverseView({ level, onWin, onLevels }: { level: ReverseLevel } & Omit<LevelProps, "level">) {
  const [wrong, setWrong] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const answer = reverseAnswer(level);
  const later = useLater();
  const plateIds = (p: number) => Array.from({ length: level.each }, (_, k) => p * level.each + k);
  const dogIds = Array.from({ length: level.leftover }, (_, k) => level.plates * level.each + k);
  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-2xl font-semibold text-ink text-center">
        Everyone got the same, and the dog got the leftovers. How many cookies were there?
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: level.plates }, (_, p) => (
          <Friend key={p} index={p} mood="happy" cookies={plateIds(p)} />
        ))}
        <div className="flex flex-col items-center rounded-3xl p-2 w-[clamp(6rem,15vw,9rem)] bg-white/30">
          <div className="w-16 h-16 sm:w-20 sm:h-20">
            <Dog happy />
          </div>
          <div className="flex flex-wrap justify-center gap-0.5 min-h-8 mt-1">
            {dogIds.map((k) => (
              <CookieDot key={k} id={k} size="w-7 h-7" />
            ))}
          </div>
          <span className="text-xl font-bold text-ink">{level.leftover}</span>
        </div>
      </div>
      <p className="text-xl font-semibold text-coral-dark min-h-7">{wrong.length ? "Count the cookies on one plate, times the friends, then add the dog's." : ""}</p>
      <Choices
        choices={level.choices.map((c) => ({ value: c, label: c }))}
        wrong={wrong}
        disabled={done}
        accent="#ff6fae"
        shadow="#e04b8e"
        onPick={(c, i) => {
          if (c === answer) {
            setDone(true);
            playSound("correct");
            later(
              () =>
                onWin(
                  starsForMistakes(wrong.length),
                  `${level.plates} × ${level.each}${level.leftover ? ` + ${level.leftover}` : ""} = ${answer} cookies`,
                ),
              600,
            );
          } else {
            playSound("wrong");
            setWrong((w) => [...w, i]);
          }
        }}
      />
      <Button accent="white" onClick={onLevels} icon={<GridIcon className="w-6 h-6" />}>
        Levels
      </Button>
    </div>
  );
}

function PlatesView({ level, onWin, onLevels }: { level: PlatesLevel } & Omit<LevelProps, "level">) {
  const [wrong, setWrong] = useState<number[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const later = useLater();
  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-2xl font-semibold text-ink text-center">
        How many friends can share {level.cookies} cookies with <span className="text-berry-dark">nothing left</span> for the dog?
      </p>
      <div className="flex flex-wrap justify-center gap-1 max-w-xl p-3 rounded-3xl bg-[#fff1dc] shadow-[inset_0_0_0_4px_#fff]">
        {Array.from({ length: level.cookies }, (_, i) => (
          <div key={i} className="w-11 h-11">
            <Cookie />
          </div>
        ))}
      </div>
      <div className="w-20 h-20">
        <Dog />
      </div>
      <p className="text-xl font-semibold text-coral-dark min-h-7 text-center">{hint}</p>
      <Choices
        choices={level.choices.map((c) => ({
          value: c,
          aria: `${c} friends`,
          label: (
            <span className="flex items-center gap-2">
              {c}
              <span className="flex -space-x-3">
                {Array.from({ length: c }, (_, k) => (
                  <span key={k} className="w-8 h-8 inline-block">
                    <Animal kind={ANIMALS[k % ANIMALS.length]} mood="happy" />
                  </span>
                ))}
              </span>
            </span>
          ),
        }))}
        wrong={wrong}
        disabled={done}
        accent="#ff6fae"
        shadow="#e04b8e"
        onPick={(p, i) => {
          if (level.cookies % p === 0) {
            setDone(true);
            setHint(null);
            playSound("correct");
            later(() => onWin(starsForMistakes(wrong.length), `${level.cookies} ÷ ${p} = ${level.cookies / p} each`), 600);
          } else {
            playSound("wrong");
            setWrong((w) => [...w, i]);
            setHint(`${level.cookies} shared by ${p} is ${Math.floor(level.cookies / p)} each, with ${level.cookies % p} left for the dog. Try another!`);
          }
        }}
      />
      <Button accent="white" onClick={onLevels} icon={<GridIcon className="w-6 h-6" />}>
        Levels
      </Button>
    </div>
  );
}

export default function CookiePartyGame() {
  return (
    <LevelGame
      gameId="cookie-party"
      accent="berry"
      count={LEVELS.length}
      renderLevel={({ level, ...p }) => {
        const l = LEVELS[level];
        if (l.kind === "share") return <ShareView level={l} {...p} />;
        if (l.kind === "reverse") return <ReverseView level={l} {...p} />;
        return <PlatesView level={l} {...p} />;
      }}
    />
  );
}
