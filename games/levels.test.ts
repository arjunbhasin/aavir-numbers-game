import { describe, expect, it } from "vitest";
import * as box from "./box-push/logic";
import { LEVELS as BOX } from "./box-push/levels";
import * as ice from "./ice-slide/logic";
import { LEVELS as ICE } from "./ice-slide/levels";
import * as keys from "./key-maze/logic";
import { LEVELS as KEYS } from "./key-maze/levels";
import * as robot from "./robot-path/logic";
import { LEVELS as ROBOT } from "./robot-path/levels";
import * as tiles from "./slide-tiles/logic";
import { LEVELS as TILES } from "./slide-tiles/levels";
import { GAMES } from "@/lib/catalog";

const count = (id: string) => GAMES.find((g) => g.id === id)!.levels;

describe("Box Push", () => {
  it("has as many levels as the home page says", () => expect(BOX.length).toBe(count("box-push")));
  it.each(BOX.map((l, i) => [i + 1, l] as const))("level %i is solvable in exactly par moves", (_, l) => {
    const level = box.parseLevel(l.map);
    expect(level.goals.length).toBe(level.start.boxes.length);
    expect(box.solve(level)?.length).toBe(l.par);
  });
  it("replaying the solver's answer solves the level", () => {
    const level = box.parseLevel(BOX[4].map);
    let s = level.start;
    for (const d of box.solve(level)!) s = box.move(level, s, d)!.state;
    expect(box.isSolved(level, s)).toBe(true);
  });
  it("cannot push two boxes at once or push into walls", () => {
    const level = box.parseLevel("#####\n#@$$.#\n######");
    expect(box.move(level, level.start, "right")).toBeNull();
    expect(box.move(level, level.start, "up")).toBeNull();
  });
});

describe("Ice Slide", () => {
  it("has as many levels as the home page says", () => expect(ICE.length).toBe(count("ice-slide")));
  it.each(ICE.map((l, i) => [i + 1, l] as const))("level %i is solvable in exactly par moves", (_, l) => {
    expect(ice.solve(ice.parseLevel(l.map))?.length).toBe(l.par);
  });
  it("slides until a rock, and stops on snow", () => {
    const level = ice.parseLevel("@  #\n    \n_   ");
    expect(ice.slide(level, level.start, "right").at(-1)).toEqual({ r: 0, c: 2 });
    const snow = ice.parseLevel("@ _  F");
    expect(snow.tiles[0][2]).toBe("snow");
    expect(ice.slide(snow, snow.start, "right").at(-1)).toEqual({ r: 0, c: 2 });
  });
});

describe("Key Maze", () => {
  it("has as many levels as the home page says", () => expect(KEYS.length).toBe(count("key-maze")));
  it.each(KEYS.map((l, i) => [i + 1, l] as const))("level %i is solvable in par moves, and needs its keys", (_, l) => {
    const level = keys.parseLevel(l.map);
    expect(keys.solve(level)?.length).toBe(l.par);
    const withoutKeys = { ...level, items: level.items.filter((it) => it.kind === "door") };
    expect(keys.solve(withoutKeys)).toBeNull();
  });
  it("a key opens one door of its color and is used up", () => {
    const level = keys.parseLevel("@rRRT");
    let s = keys.startState(level);
    s = keys.move(level, s, "right").state!;
    expect(s.bag).toEqual(["r"]);
    s = keys.move(level, s, "right").state!;
    expect(s.bag).toEqual([]);
    expect(keys.move(level, s, "right")).toEqual({ state: null, event: "locked" });
  });
});

describe("Slide Tiles", () => {
  it("has as many levels as the home page says", () => expect(TILES.length).toBe(count("slide-tiles")));
  it.each(TILES.map((l, i) => [i + 1, l] as const))("level %i starts unsolved and takes exactly par moves", (_, l) => {
    const b = tiles.shuffled(l.rows, l.cols, l.shuffle, l.seed);
    expect(tiles.isSolved(b)).toBe(false);
    expect(tiles.solve(b)?.length).toBe(l.par);
  });
  it("arrow moves the neighbouring tile into the gap", () => {
    const b: tiles.Board = { rows: 2, cols: 2, tiles: [1, 2, 0, 3] };
    expect(tiles.slide(b, "left")?.tiles).toEqual([1, 2, 3, 0]);
    expect(tiles.slide(b, "right")).toBeNull();
    expect(tiles.dirForTile(b, 3)).toBe("left");
  });
});

describe("Robot Path", () => {
  it("has as many levels as the home page says", () => expect(ROBOT.length).toBe(count("robot-path")));
  it.each(ROBOT.map((l, i) => [i + 1, l] as const))("level %i: the shortest program has par steps and runs", (_, l) => {
    const level = robot.parseLevel(l.map);
    const sol = robot.solve(level)!;
    expect(sol.length).toBe(l.par);
    expect(robot.run(level, sol).success).toBe(true);
  });
  it("stops at the first bump and needs all gems", () => {
    const level = robot.parseLevel("@*.B\n.#..");
    expect(robot.run(level, ["down", "right"]).success).toBe(false);
    expect(robot.run(level, ["right", "right", "right"]).success).toBe(true);
  });
});
