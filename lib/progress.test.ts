import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { totalStars, unlockedUpTo, useProgress } from "./progress";

describe("progress store", () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => useProgress.setState({ games: {}, muted: false }));

  it("recovers from malformed saved collections", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify({ version: 1, state: { games: null, recent: null, muted: "yes" } }),
      setItem: () => {}, removeItem: () => {},
    });
    await useProgress.persist.rehydrate();
    expect(useProgress.getState().games).toEqual({});
    expect(useProgress.getState().recent).toEqual([]);
    expect(useProgress.getState().muted).toBe(false);
    expect(() => useProgress.getState().visit("box-push")).not.toThrow();
  });

  it("keeps valid saved stars while discarding invalid entries", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify({ version: 1, state: {
        games: { "box-push": { 0: 3, 1: 0, 2: 4, 3: "2", 30: 3, "-1": 2 }, unknown: { 0: 3 } },
        recent: ["box-push", "unknown", "box-push", 1, "ice-slide"], muted: true,
      } }),
      setItem: () => {}, removeItem: () => {},
    });
    await useProgress.persist.rehydrate();
    expect(useProgress.getState().games).toEqual({ "box-push": { 0: 3 } });
    expect(useProgress.getState().recent).toEqual(["box-push", "ice-slide"]);
    expect(useProgress.getState().muted).toBe(true);
  });

  it("keeps the best stars per level", () => {
    const { recordStars } = useProgress.getState();
    recordStars("box-push", 0, 2);
    recordStars("box-push", 0, 1);
    recordStars("box-push", 0, 3);
    expect(useProgress.getState().games["box-push"]).toEqual({ 0: 3 });
  });

  it("unlocks the level after the last completed one", () => {
    expect(unlockedUpTo(undefined, 10)).toBe(0);
    expect(unlockedUpTo({ 0: 1, 1: 3 }, 10)).toBe(2);
    expect(unlockedUpTo({ 0: 1, 1: 1, 2: 1 }, 3)).toBe(2);
    expect(totalStars({ 0: 1, 1: 3 })).toBe(4);
  });

  it("works without localStorage (server, private mode)", async () => {
    // vitest runs in node, where localStorage does not exist
    await useProgress.persist.rehydrate();
    expect(useProgress.getState().hydrated).toBe(true);
    useProgress.getState().toggleMute();
    expect(useProgress.getState().muted).toBe(true);
  });
});
