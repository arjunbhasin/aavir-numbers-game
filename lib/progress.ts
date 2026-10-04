"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { GAMES } from "./catalog";

/** Best stars per level (index -> 1..3) for one game. */
export type GameProgress = Record<number, number>;

type ProgressState = {
  hydrated: boolean;
  muted: boolean;
  games: Record<string, GameProgress>;
  /** most recently opened games, newest first */
  recent: string[];
  visit: (gameId: string) => void;
  recordStars: (gameId: string, level: number, stars: number) => void;
  toggleMute: () => void;
  resetAll: () => void;
};

/** Saved browser data is untrusted: retain valid progress without accepting actions or bad shapes. */
function savedProgress(value: unknown): Pick<ProgressState, "games" | "recent" | "muted"> {
  const object = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
  const saved = object(value) ? value : {};
  const games: Record<string, GameProgress> = {};
  if (object(saved.games)) {
    for (const game of GAMES) {
      const raw = saved.games[game.id];
      if (!object(raw)) continue;
      const valid: GameProgress = {};
      for (let i = 0; i < game.levels; i++) {
        const stars = raw[i];
        if (typeof stars === "number" && Number.isInteger(stars) && stars >= 1 && stars <= 3) valid[i] = stars;
      }
      if (Object.keys(valid).length) games[game.id] = valid;
    }
  }
  const ids = new Set(GAMES.map((g) => g.id));
  const recent = Array.isArray(saved.recent)
    ? [...new Set(saved.recent.filter((id): id is string => typeof id === "string" && ids.has(id)))].slice(0, 6)
    : [];
  return { games, recent, muted: typeof saved.muted === "boolean" ? saved.muted : false };
}

/** localStorage that never throws (private mode, blocked storage, SSR). */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return globalThis.localStorage?.getItem(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.localStorage?.setItem(name, value);
    } catch {
      /* ignore */
    }
  },
  removeItem: (name) => {
    try {
      globalThis.localStorage?.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      hydrated: false,
      muted: false,
      games: {},
      recent: [],
      visit: (gameId) => set((s) => ({ recent: [gameId, ...s.recent.filter((g) => g !== gameId)].slice(0, 6) })),
      recordStars: (gameId, level, stars) =>
        set((s) => {
          const game = s.games[gameId] ?? {};
          if ((game[level] ?? 0) >= stars) return s;
          return { games: { ...s.games, [gameId]: { ...game, [level]: stars } } };
        }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      resetAll: () => set({ games: {}, recent: [] }),
    }),
    {
      name: "aavir-games-v1",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ muted: s.muted, games: s.games, recent: s.recent }),
      skipHydration: true,
      merge: (saved, current) => ({ ...current, ...savedProgress(saved) }),
      onRehydrateStorage: () => () => {
        useProgress.setState({ hydrated: true });
      },
    },
  ),
);

/** Index of the highest level a player may open (completed + 1). */
export function unlockedUpTo(progress: GameProgress | undefined, levelCount: number): number {
  if (!progress) return 0;
  let i = 0;
  while (i < levelCount && (progress[i] ?? 0) > 0) i++;
  return Math.min(i, levelCount - 1);
}

export function totalStars(progress: GameProgress | undefined): number {
  if (!progress) return 0;
  return Object.values(progress).reduce((a, b) => a + b, 0);
}
