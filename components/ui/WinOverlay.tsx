"use client";

import { useKeydown } from "@/lib/input";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
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
  detail,
  onNext,
  onAgain,
  onLevels,
}: {
  open: boolean;
  stars?: number;
  message?: string;
  /** a math sentence or explanation shown under the stars */
  detail?: string;
  onNext?: () => void;
  onAgain?: () => void;
  onLevels?: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();
    playSound("win");
    const stopCelebration = celebrate(confettiRef.current);
    return () => {
      stopCelebration?.();
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [open]);

  useKeydown((e: KeyboardEvent) => {
    const primary = onNext ?? onAgain;
    if (e.key !== "Enter" || !primary) return;
    // a focused button (Next / Again / Levels) handles Enter itself
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) return;
    e.preventDefault();
    primary();
  }, open);

  const cheer = CHEERS[stars ?? 0] ?? CHEERS[0];

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.dialog
          ref={dialogRef}
          onCancel={(e) => {
            e.preventDefault();
            onLevels?.();
          }}
          onKeyDown={(e) => {
            if (e.key !== "Tab") return;
            const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
            const first = buttons[0];
            const last = buttons.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }}
          className="fixed inset-0 z-50 m-0 w-full h-full max-w-none max-h-none border-0 grid place-items-center bg-ink/40 backdrop-blur-sm p-4"
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
            {detail && (
              <motion.p
                className="text-2xl font-semibold text-ocean-dark bg-ocean/10 rounded-2xl px-5 py-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                {detail}
              </motion.p>
            )}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {onNext && (
                <Button accent="grass" size="lg" onClick={onNext} icon={<NextIcon className="w-7 h-7" />}>
                  Next
                </Button>
              )}
              {onAgain && (
                <Button accent={onNext ? "white" : "grass"} size="lg" onClick={onAgain} icon={<RestartIcon className="w-7 h-7" />}>
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
          <canvas ref={confettiRef} aria-hidden="true" className="fixed inset-0 w-full h-full pointer-events-none" />
        </motion.dialog>
      )}
    </AnimatePresence>, document.body
  );
}
