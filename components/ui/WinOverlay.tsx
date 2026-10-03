"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { celebrate } from "@/lib/confetti";
import { playSound } from "@/lib/sound";
import Button from "./Button";
import { GridIcon, NextIcon, RestartIcon } from "./Icons";
import Stars from "./Stars";

const CHEERS = ["Amazing!", "You did it!", "Super smart!", "Brilliant!", "Wow, great job!", "Fantastic!"];

export default function WinOverlay({
  open,
  stars,
  message,
  onNext,
  onAgain,
  onLevels,
}: {
  open: boolean;
  stars?: number;
  message?: string;
  onNext?: () => void;
  onAgain?: () => void;
  onLevels?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    playSound("win");
    celebrate();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const primary = onNext ?? onAgain;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !primary) return;
      // a focused button (Next / Again / Levels) handles Enter itself
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) return;
      e.preventDefault();
      primary();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onNext, onAgain]);

  const cheer = CHEERS[stars ?? 0] ?? CHEERS[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Level complete"
        >
          <motion.div
            className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-5 text-center"
            initial={{ scale: 0.6, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <h2 className="text-4xl font-bold text-ink">{message ?? cheer}</h2>
            {stars !== undefined && <Stars count={stars} size="w-16 h-16" animate />}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {onNext && (
                <Button accent="grass" size="lg" onClick={onNext} icon={<NextIcon className="w-7 h-7" />} autoFocus>
                  Next
                </Button>
              )}
              {onAgain && (
                <Button accent={onNext ? "white" : "grass"} size="lg" onClick={onAgain} icon={<RestartIcon className="w-7 h-7" />} autoFocus={!onNext}>
                  Again
                </Button>
              )}
              {onLevels && (
                <Button accent="white" size="lg" onClick={onLevels} icon={<GridIcon className="w-7 h-7" />}>
                  Levels
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
