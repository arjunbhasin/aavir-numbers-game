"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import type { Dir } from "./grid";

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right",
};

export type GameKeyHandlers = {
  onMove?: (d: Dir) => void;
  onUndo?: () => void;
  onRestart?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
};

/** Arrow keys / WASD to move, U or Z to undo, R to restart, Enter to continue. */
export function useGameKeys(handlers: GameKeyHandlers) {
  const ref = useRef(handlers);
  useLayoutEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const h = ref.current;
      if (h.enabled === false) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const dir = KEY_DIRS[e.key];
      if (dir && h.onMove) {
        e.preventDefault();
        h.onMove(dir);
        return;
      }
      const k = e.key.toLowerCase();
      if ((k === "u" || k === "z" || k === "backspace") && h.onUndo) {
        e.preventDefault();
        h.onUndo();
      } else if (k === "r" && h.onRestart) {
        e.preventDefault();
        h.onRestart();
      } else if (k === "enter" && h.onEnter) {
        e.preventDefault();
        h.onEnter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/** Swipe on an element to move. The element should have `touch-action: none`. */
export function useSwipe(target: RefObject<HTMLElement | null>, onMove: (d: Dir) => void) {
  const cb = useRef(onMove);
  useLayoutEffect(() => {
    cb.current = onMove;
  });

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let start: { x: number; y: number; id: number } | null = null;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) cb.current(dx > 0 ? "right" : "left");
      else cb.current(dy > 0 ? "down" : "up");
    };
    const cancel = () => {
      start = null;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cancel);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", cancel);
    };
  }, [target]);
}

let touchSeen = false;
const touchListeners = new Set<() => void>();

function subscribeTouch(cb: () => void) {
  touchListeners.add(cb);
  const mark = () => {
    if (touchSeen) return;
    touchSeen = true;
    touchListeners.forEach((l) => l());
  };
  window.addEventListener("touchstart", mark, { once: true, passive: true });
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", cb);
  return () => {
    touchListeners.delete(cb);
    window.removeEventListener("touchstart", mark);
    mq.removeEventListener("change", cb);
  };
}

/** True on touch devices (coarse pointer) or once any touch happened. */
export function useIsTouch(): boolean {
  return useSyncExternalStore(
    subscribeTouch,
    () => touchSeen || window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );
}

/** Undo/restart-able history of immutable states. */
export function useHistory<S>(initial: S) {
  const [stack, setStack] = useState<S[]>([initial]);
  const current = stack[stack.length - 1];
  return {
    state: current,
    moves: stack.length - 1,
    push: (s: S) => setStack((st) => [...st, s]),
    undo: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    reset: (s: S = initial) => setStack([s]),
    canUndo: stack.length > 1,
  };
}

/** setTimeout that is cancelled automatically when the component unmounts. */
export function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
}

/**
 * Listen for key presses on the whole page. The handler always sees the latest state:
 * it is swapped in synchronously after each render, so two quick key presses
 * never run against stale data (an ordinary effect only updates after the next paint).
 */
export function useKeydown(handler: (e: KeyboardEvent) => void, enabled = true) {
  const ref = useRef(handler);
  useLayoutEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    const on = (e: KeyboardEvent) => ref.current(e);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [enabled]);
}
