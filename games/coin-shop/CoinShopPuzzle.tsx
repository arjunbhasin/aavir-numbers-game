"use client";

import KeyboardHint from "@/components/ui/KeyboardHint";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Coin, ToyArt } from "@/components/math/AddArt";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import Button from "@/components/ui/Button";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { coinSentence, makeShopPuzzle, payResult } from "./logic";

function PriceTag({ toy, price }: { toy: string; price: number }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 rounded-[2rem] bg-white shadow-[0_6px_0_#c9d6e6]">
      <div className="w-24 h-24">
        <ToyArt toy={toy} />
      </div>
      <div className="relative bg-sun text-ink font-bold text-4xl px-5 py-2 rounded-2xl rotate-3 shadow-[0_4px_0_#e8a800]">
        {price}
        <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white" />
      </div>
    </div>
  );
}

export default function CoinShopPuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeShopPuzzle(makeRng(seed), difficulty), [seed, difficulty]);
  const [tray, setTray] = useState<{ id: number; value: number }[]>([]);
  const [nextId, setNextId] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const [solved, setSolved] = useState(false);
  const later = useLater();
  const values = tray.map((t) => t.value);
  const total = values.reduce((a, b) => a + b, 0);

  const add = (v: number) => {
    if (solved || tray.length >= 12) return;
    playSound("pick");
    setMessage(null);
    setTray((t) => [...t, { id: nextId, value: v }]);
    setNextId((n) => n + 1);
  };
  const remove = (id?: number) => {
    if (solved || !tray.length) return;
    playSound("click");
    setTray((t) => (id === undefined ? t.slice(0, -1) : t.filter((c) => c.id !== id)));
  };
  const pay = () => {
    if (solved || p.kind !== "pay" || !tray.length) return;
    const r = payResult(p.price, values);
    if (r === "exact") {
      setSolved(true);
      playSound("correct");
      setMessage({ text: `${coinSentence(values)}. Exactly right!`, good: true });
      later(() => onSolved(mistakes), 1600);
    } else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setMessage({ text: r === "over" ? `That's ${total}. Too much! Take a coin back.` : `That's ${total}. Not enough yet!`, good: false });
    }
  };

  useEffect(() => {
    if (p.kind !== "pay") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return;
      if (e.key === "Enter") {
        // Enter always pays, even when a coin button has focus; other buttons keep their own Enter
        if (e.target instanceof HTMLButtonElement && !e.target.dataset.coin) return;
        e.preventDefault();
        pay();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        remove();
      } else {
        const v = e.key === "0" ? 10 : Number(e.key);
        if (p.coins.includes(v)) add(v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (p.kind === "change") {
    return (
      <div className="flex flex-col items-center gap-5 w-full">
        <PriceTag toy={p.toy} price={p.price} />
        <div className="flex items-center gap-3 text-2xl font-semibold text-ink">
          You pay with
          {Array.from({ length: p.paid / 10 }, (_, i) => (
            <div key={i} className="w-20 h-20">
              <Coin value={10} />
            </div>
          ))}
          <span className="text-ink-soft">= {p.paid}</span>
        </div>
        <p className={`text-2xl font-semibold min-h-8 text-center ${solved ? "text-grass-dark" : "text-ink"}`}>
          {solved ? `${p.paid} − ${p.price} = ${p.answer}. That's your change!` : "How much change do you get back?"}
        </p>
        <Choices
          choices={p.options.map((o) => ({ value: o, label: o }))}
          wrong={wrong}
          disabled={solved}
          accent="#5cc96b"
          shadow="#3aa64b"
          onPick={(v, i) => {
            if (v === p.answer) {
              setSolved(true);
              playSound("correct");
              later(() => onSolved(wrong.length), 1600);
            } else {
              playSound("wrong");
              setWrong((w) => [...w, i]);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <PriceTag toy={p.toy} price={p.price} />
      <div className="w-full max-w-2xl min-h-28 rounded-[2rem] bg-[#fff1dc] shadow-[inset_0_0_0_5px_#fff] p-4 flex flex-wrap items-center justify-center gap-2">
        <AnimatePresence>
          {tray.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              aria-label={`Take back coin ${c.value}`}
              data-coin="tray"
              onClick={() => remove(c.id)}
              initial={{ y: 60, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.6 }}
              className="w-16 h-16"
            >
              <Coin value={c.value} />
            </motion.button>
          ))}
        </AnimatePresence>
        {!tray.length && <span className="text-xl text-ink-soft/70">Tap coins to put them here</span>}
      </div>
      <p className={`text-2xl font-semibold min-h-8 text-center ${message?.good ? "text-grass-dark" : message ? "text-coral-dark" : "text-ink"}`}>
        {message?.text ?? (tray.length ? `You have ${coinSentence(values)}` : `Pay exactly ${p.price}.`)}
      </p>
      <div className="flex flex-wrap items-end justify-center gap-4">
        {p.coins.map((v) => (
          <button key={v} type="button" data-coin="add" onClick={() => add(v)} aria-label={`Add coin ${v}`} disabled={solved} className="w-20 h-20 sm:w-24 sm:h-24 active:scale-95 transition-transform">
            <Coin value={v} />
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button accent="grass" size="lg" onClick={pay} disabled={solved || !tray.length} silent>
          Pay!
        </Button>
        <Button accent="white" size="lg" onClick={() => remove()} disabled={solved || !tray.length}>
          Take one back
        </Button>
      </div>
      <KeyboardHint>
        Keys: {p.coins.map((v) => (v === 10 ? "0 = 10" : v)).join(", ")} add coins · Backspace takes one back · Enter pays
      </KeyboardHint>
    </div>
  );
}
