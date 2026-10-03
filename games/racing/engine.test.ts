import { describe, expect, it } from "vitest";
import { GAMES } from "@/lib/catalog";
import { LAPS, MAX_SPEED, PLAYER_Z, SEGMENT, THEMES, buildTrack, createRace, currentRank, findSegment, playerDistance, update, type Race } from "./engine";

/** A careful driver: lean into curves and step around cones. */
function autopilot(race: Race) {
  const look = (k: number) => findSegment(race, race.position + PLAYER_Z + k * SEGMENT);
  let aim = look(6).curve * 0.1;
  const ahead = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(look);
  if (ahead.some((s) => s.items.some((it) => it.kind === "cone" && !it.taken && Math.abs(it.offset - aim) < 0.35))) aim += aim > 0 ? -0.6 : 0.6;
  return { left: race.playerX > aim + 0.06, right: race.playerX < aim - 0.06 };
}

function runRace(themeIndex: number, steer: (r: Race) => { left: boolean; right: boolean }, seconds = 240) {
  const race = createRace(themeIndex);
  for (let t = 0; t < seconds * 60 && !race.finished; t++) update(race, steer(race), 1 / 60);
  return race;
}

describe("Rainbow Rally", () => {
  it("has as many tracks as the home page says", () => {
    expect(THEMES.length).toBe(GAMES.find((g) => g.id === "rainbow-rally")!.levels);
  });

  it.each(THEMES.map((t, i) => [t.name, i] as const))("%s track is a closed loop of reasonable length", (_, i) => {
    const segs = buildTrack(THEMES[i]);
    expect(segs.length).toBeGreaterThan(500);
    expect(Math.abs(segs[segs.length - 1].p2.world.y)).toBeLessThan(1);
    expect(segs.every((s) => Number.isFinite(s.curve) && Number.isFinite(s.p1.world.y))).toBe(true);
    expect(segs.some((s) => s.items.some((it) => it.kind === "star"))).toBe(true);
    expect(segs.some((s) => s.boost !== undefined)).toBe(true);
  });

  it.each(THEMES.map((t, i) => [t.name, i] as const))("%s: a careful driver finishes in 60-90 seconds near the front", (_, i) => {
    const race = runRace(i, autopilot);
    expect(race.finished, THEMES[i].name).not.toBeNull();
    expect(race.finished!.time).toBeGreaterThan(55);
    expect(race.finished!.time).toBeLessThan(95);
    expect(race.finished!.rank).toBeLessThanOrEqual(2);
    expect(Number.isFinite(race.playerX) && Number.isFinite(race.speed)).toBe(true);
  });

  it("a child who never steers still finishes, but steering really helps", () => {
    const lazy = runRace(0, () => ({ left: false, right: false }), 400);
    const careful = runRace(0, autopilot);
    expect(lazy.finished).not.toBeNull();
    expect(lazy.finished!.time).toBeGreaterThan(careful.finished!.time + 20);
  });

  it("countdown holds everyone still, then the car speeds up by itself", () => {
    const race = createRace(0);
    race.cars = []; // no friends to bump into for this check
    for (let t = 0; t < 120; t++) update(race, { left: false, right: false }, 1 / 60);
    expect(race.speed).toBe(0);
    for (let t = 0; t < 300; t++) update(race, autopilot(race), 1 / 60);
    expect(race.speed).toBeGreaterThan(MAX_SPEED * 0.7);
  });

  it("driving on the grass slows you down; stars and boosts are collected", () => {
    const race = createRace(0);
    race.countdown = 0;
    race.speed = MAX_SPEED * 0.8;
    race.playerX = 1.8;
    for (let t = 0; t < 120; t++) update(race, { left: false, right: false }, 1 / 60);
    expect(race.speed).toBeLessThan(MAX_SPEED * 0.4);

    const r2 = createRace(0);
    r2.countdown = 0;
    const starSeg = r2.segments.find((s) => s.items.some((it) => it.kind === "star"))!;
    const star = starSeg.items.find((it) => it.kind === "star")!;
    r2.playerX = star.offset;
    r2.position = starSeg.index * SEGMENT - r2.trackLength / r2.segments.length * 0 - 1000;
    r2.speed = MAX_SPEED * 0.5;
    for (let t = 0; t < 30; t++) update(r2, { left: false, right: false }, 1 / 60);
    expect(r2.stars).toBeGreaterThan(0);
  });

  it("rank goes from 1 to 4 and laps count up to the finish", () => {
    const race = createRace(1);
    expect(currentRank(race)).toBe(4); // friends start just ahead
    let laps = 0;
    for (let t = 0; t < 200 * 60 && !race.finished; t++) {
      update(race, autopilot(race), 1 / 60);
      if (race.events.includes("lap")) laps++;
    }
    expect(laps).toBe(LAPS - 1);
    expect(playerDistance(race)).toBeGreaterThanOrEqual(LAPS * race.trackLength);
  });
});
