"use client";

import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useGameKeys, useKeydown } from "@/lib/input";

/**
 * Big answer buttons. Tap/click, or use ← → and Enter.
 * Number answers can be typed (type 1 then 2 for 12); other answers use keys 1-6 by position.
 * Wrong answers shake and fade, and can't be picked again.
 */
export default function Choices<T>({
  choices,
  onPick,
  wrong,
  disabled = false,
  accent = "#4aa3ff",
  shadow = "#2b7fdc",
}: {
  choices: { value: T; label: ReactNode; aria?: string }[];
  onPick: (value: T, index: number) => void;
  wrong: number[];
  disabled?: boolean;
  accent?: string;
  shadow?: string;
}) {
  const [focus, setFocus] = useState(-1);
  const typed = useRef({ text: "", timer: undefined as ReturnType<typeof setTimeout> | undefined });
  const numeric = choices.every((c) => typeof c.value === "number");
  const letters = choices.every((c) => typeof c.value === "string" && /^[a-z]$/.test(c.value));

  useEffect(() => () => clearTimeout(typed.current.timer), []);

  const pickIndex = (i: number) => {
    if (i >= 0 && i < choices.length && !wrong.includes(i)) onPick(choices[i].value, i);
  };
  // the "wait for a second digit" timer must use the latest choices, not the ones from when it started
  const pickLatest = useRef(pickIndex);
  useLayoutEffect(() => {
    pickLatest.current = pickIndex;
  });

  useKeydown((e: KeyboardEvent) => {
    if (disabled || e.metaKey || e.ctrlKey) return;
    if (letters && /^[a-zA-Z]$/.test(e.key)) {
      const i = choices.findIndex((c) => c.value === e.key.toLowerCase());
      if (i !== -1) {
        e.preventDefault();
        pickIndex(i);
      }
      return;
    }
    if (!/^[0-9]$/.test(e.key)) return;
    e.preventDefault();
    if (!numeric) {
      pickIndex(Number(e.key) - 1);
      return;
    }
    const t = typed.current;
    clearTimeout(t.timer);
    t.text += e.key;
    const values = choices.map((c) => String(c.value));
    const exact = values.indexOf(t.text);
    const longer = values.some((v) => v !== t.text && v.startsWith(t.text));
    if (exact !== -1 && !longer) {
      t.text = "";
      pickIndex(exact);
    } else if (!longer) {
      t.text = ""; // typed a number that isn't an option
    } else {
      // wait a moment in case a second digit is coming (1 → 12)
      t.timer = setTimeout(() => {
        const i = values.indexOf(t.text);
        t.text = "";
        pickLatest.current(i);
      }, 700);
    }
  });

  useGameKeys({
    enabled: !disabled,
    onMove: (d) =>
      setFocus((f) => (d === "left" || d === "up" ? (f <= 0 ? choices.length - 1 : f - 1) : (f + 1) % choices.length)),
    onEnter: () => {
      if (focus >= 0 && !wrong.includes(focus)) onPick(choices[focus].value, focus);
    },
  });

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {choices.map((c, i) => {
        const isWrong = wrong.includes(i);
        return (
          <motion.button
            key={i}
            type="button"
            disabled={disabled || isWrong}
            onClick={() => onPick(c.value, i)}
            aria-label={c.aria}
            animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className={`btn-3d min-w-24 min-h-20 px-5 rounded-2xl text-white text-3xl font-bold flex items-center justify-center gap-2
              ${isWrong ? "opacity-35" : ""} ${focus === i ? "ring-4 ring-white outline-4 outline-ocean" : ""}`}
            style={{ background: accent, ["--btn-shadow" as string]: shadow }}
          >
            {c.label}
          </motion.button>
        );
      })}
    </div>
  );
}
