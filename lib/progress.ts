"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

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
