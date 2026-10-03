import { beforeEach, describe, expect, it } from "vitest";
import { totalStars, unlockedUpTo, useProgress } from "./progress";

describe("progress store", () => {
  beforeEach(() => useProgress.setState({ games: {}, muted: false }));

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
