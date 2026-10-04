/**
 * Rainbow Rally: a pseudo-3D racer in the style of classic arcade road games.
 * The road is a list of flat segments; each frame they are projected onto the screen.
 * Everything here is plain data and maths (no drawing), so it can be tested.
 */

export const SEGMENT = 200; // length of one road segment, in world units
export const RUMBLE = 3; // segments per colour stripe
export const ROAD_WIDTH = 2000; // half the road's width; road edges are at x = -1 and +1
export const LANES = 3;
export const CAMERA_HEIGHT = 1000;
const FIELD_OF_VIEW = 100;
export const CAMERA_DEPTH = 1 / Math.tan(((FIELD_OF_VIEW / 2) * Math.PI) / 180);
export const PLAYER_Z = CAMERA_HEIGHT * CAMERA_DEPTH;
export const MAX_SPEED = SEGMENT * 60; // one segment per frame at 60 fps
export const DRAW_DISTANCE = 160;
export const LAPS = 3;
export const COUNTDOWN = 3;

const CRUISE = 0.82; // automatic speed, as a share of MAX_SPEED
const BOOST = 1.22;
const OFF_ROAD_SPEED = MAX_SPEED * 0.3;
const BUMP_SPEED = MAX_SPEED * 0.3;

export type ThemeId = "meadow" | "beach" | "snow";
export type ItemKind = "tree" | "bush" | "flowers" | "palm" | "umbrella" | "rock" | "pine" | "snowman" | "cone" | "star";
export type RacerKind = "robot" | "bear" | "cat" | "bunny";

/** World width of each item, in road half-widths (the player's car is 0.3). */
export const ITEM_WIDTH: Record<ItemKind, number> = {
  tree: 0.9,
  bush: 0.55,
  flowers: 0.4,
  palm: 0.8,
  umbrella: 0.6,
  rock: 0.5,
  pine: 0.75,
  snowman: 0.45,
  cone: 0.16,
  star: 0.2,
};
export const CAR_WIDTH = 0.3;

export type Item = { kind: ItemKind; offset: number; taken?: boolean };

export type Point = {
  world: { x: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
  screen: { x: number; y: number; w: number; scale: number };
};

export type Segment = {
  index: number;
  p1: Point;
  p2: Point;
  curve: number;
  items: Item[];
  /** boost pad centred at this road offset */
  boost?: number;
  finish?: boolean;
  /** screen y below which this segment is hidden by nearer road (set while drawing) */
  clip: number;
};

export type Car = {
  kind: RacerKind;
  z: number; // position along the lap
  lap: number;
  offset: number;
  targetOffset: number;
  base: number; // share of MAX_SPEED this friend likes to drive at
  speed: number;
  finishTime: number | null;
};

export type Theme = {
  id: ThemeId;
  name: string;
  centrifugal: number; // how hard curves push you outwards
  grip: number; // how quickly steering responds (snow is slippery)
  friends: number[]; // cruise speeds of the three friends
};

export const THEMES: Theme[] = [
  { id: "meadow", name: "Meadow", centrifugal: 0.3, grip: 20, friends: [0.73, 0.77, 0.8] },
  { id: "beach", name: "Beach", centrifugal: 0.36, grip: 14, friends: [0.76, 0.8, 0.83] },
  { id: "snow", name: "Snow", centrifugal: 0.4, grip: 4.5, friends: [0.77, 0.81, 0.84] },
];

export type RaceEvent = "star" | "boost" | "bump" | "lap" | "finish" | "beep" | "go";

export type Race = {
  theme: Theme;
  segments: Segment[];
  trackLength: number;
  position: number; // camera z along the lap
  lap: number;
  playerX: number;
  steerVel: number;
  speed: number;
  boost: number; // seconds of boost left
  bump: number; // seconds of wobble left after a bump
  stars: number;
  totalStars: number;
  clock: number; // seconds since GO
  countdown: number; // seconds until GO
  cars: Car[];
  finished: { rank: number; time: number } | null;
  /** sounds and effects that happened this frame */
  events: RaceEvent[];
  /** sky/hill scroll, follows the curves */
  skyOffset: number;
  /** repeatable randomness for the friends' lane changes */
  rng: () => number;
};

/* ------------------------------------------------------------------ */
/* Track building                                                      */
/* ------------------------------------------------------------------ */

const easeIn = (a: number, b: number, t: number) => a + (b - a) * t * t;
const easeInOut = (a: number, b: number, t: number) => a + (b - a) * (-Math.cos(t * Math.PI) / 2 + 0.5);

const point = (z: number, y: number): Point => ({
  world: { x: 0, y, z },
  camera: { x: 0, y: 0, z: 0 },
  screen: { x: 0, y: 0, w: 0, scale: 0 },
});

class Builder {
  segments: Segment[] = [];
  lastY() {
    return this.segments.length ? this.segments[this.segments.length - 1].p2.world.y : 0;
  }
  add(curve: number, y: number) {
    const n = this.segments.length;
    this.segments.push({ index: n, p1: point(n * SEGMENT, this.lastY()), p2: point((n + 1) * SEGMENT, y), curve, items: [], clip: 0 });
  }
  road(enter: number, hold: number, leave: number, curve: number, height: number) {
    const startY = this.lastY();
    const endY = startY + height * SEGMENT;
    const total = enter + hold + leave;
    for (let n = 0; n < enter; n++) this.add(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total));
    for (let n = 0; n < hold; n++) this.add(curve, easeInOut(startY, endY, (enter + n) / total));
    for (let n = 0; n < leave; n++) this.add(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total));
  }
  straight(n: number, height = 0) {
    this.road(n / 4, n / 2, n / 4, 0, height);
  }
  curve(n: number, curve: number, height = 0) {
    this.road(n / 4, n / 2, n / 4, curve, height);
  }
  sCurves(size: number, curve: number) {
    this.road(size, size, size, -curve, 0);
    this.road(size, size, size, curve, size / 5);
    this.road(size, size, size, -curve / 2, -size / 5);
  }
  bumps() {
    for (const h of [0.6, -0.8, 1, -1, 0.8, -0.6]) this.road(8, 8, 8, 0, h * 5);
  }
  /** bring the road back down to the start height so the lap joins up */
  homeStretch(n: number) {
    this.road(n, n, n, 0, -this.lastY() / SEGMENT);
  }
}

/** Repeatable pseudo-random numbers so each track is the same every time. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const SCENERY: Record<ThemeId, ItemKind[]> = {
  meadow: ["tree", "bush", "flowers", "tree", "bush"],
  beach: ["palm", "umbrella", "palm", "rock", "bush"],
  snow: ["pine", "snowman", "pine", "rock", "pine"],
};

export function buildTrack(theme: Theme): Segment[] {
  const b = new Builder();
  if (theme.id === "meadow") {
    b.straight(60);
    b.curve(80, 2, 10);
    b.straight(50, -10);
    b.curve(80, -2);
    b.sCurves(30, 2);
    b.straight(80, 15);
    b.curve(100, 3, -10);
    b.straight(50);
    b.curve(80, -2.5, 10);
    b.bumps();
    b.homeStretch(40);
  } else if (theme.id === "beach") {
    b.straight(50);
    b.curve(70, -3, 20);
    b.bumps();
    b.curve(90, 3, -20);
    b.sCurves(30, 3);
    b.straight(60, 30);
    b.curve(80, -3.5, -20);
    b.straight(40, -10);
    b.curve(90, 3.5, 15);
    b.sCurves(25, 2.5);
    b.homeStretch(45);
  } else {
    b.straight(50);
    b.curve(80, 3, 10);
    b.sCurves(30, 3);
    b.curve(90, -4, -10);
    b.straight(50, 10);
    b.curve(70, 4);
    b.sCurves(25, 3.5);
    b.curve(100, -3.5, -10);
    b.bumps();
    b.curve(70, 3);
    b.homeStretch(45);
  }
  const segs = b.segments;
  const rnd = seeded(theme.id.length * 977 + theme.centrifugal * 1000);

  // start/finish line
  for (let i = 0; i < RUMBLE * 2; i++) segs[i].finish = true;

  // scenery on both sides of the road
  for (let i = 20; i < segs.length; i += 3 + Math.floor(rnd() * 4)) {
    const kinds = SCENERY[theme.id];
    const side = rnd() < 0.5 ? -1 : 1;
    segs[i].items.push({ kind: kinds[Math.floor(rnd() * kinds.length)], offset: side * (1.3 + rnd() * 1.4) });
  }

  // rows of stars along a lane, a few cones, and boost pads
  const lanes = [-2 / 3, 0, 2 / 3];
  for (let i = 80; i < segs.length - 60; i += 70 + Math.floor(rnd() * 50)) {
    const lane = lanes[Math.floor(rnd() * 3)];
    for (let k = 0; k < 6; k++) segs[i + k * 4].items.push({ kind: "star", offset: lane });
  }
  const coneEvery = theme.id === "meadow" ? 160 : 120;
  for (let i = 120; i < segs.length - 60; i += coneEvery + Math.floor(rnd() * 60)) {
    segs[i].items.push({ kind: "cone", offset: lanes[Math.floor(rnd() * 3)] });
  }
  for (let i = 150; i < segs.length - 60; i += 200 + Math.floor(rnd() * 80)) {
    const lane = lanes[Math.floor(rnd() * 3)];
    for (let k = 0; k < 3; k++) segs[i + k].boost = lane;
  }
  return segs;
}

/* ------------------------------------------------------------------ */
/* Race                                                                */
/* ------------------------------------------------------------------ */

export function createRace(themeIndex: number): Race {
  const theme = THEMES[themeIndex];
  const segments = buildTrack(theme);
  const kinds: RacerKind[] = ["bear", "cat", "bunny"];
  // friends line up just ahead in the side lanes, leaving the middle lane clear for the player
  const cars: Car[] = kinds.map((kind, i) => ({
    kind,
    z: (6 + i * 5) * SEGMENT,
    lap: 0,
    offset: [-0.6, 0.6, -0.6][i],
    targetOffset: [-0.6, 0.6, -0.6][i],
    base: theme.friends[i],
    speed: 0,
    finishTime: null,
  }));
  return {
    theme,
    segments,
    trackLength: segments.length * SEGMENT,
    position: 0,
    lap: 0,
    playerX: 0,
    steerVel: 0,
    speed: 0,
    boost: 0,
    bump: 0,
    stars: 0,
    totalStars: segments.reduce((n, s) => n + s.items.filter((it) => it.kind === "star").length, 0),
    clock: 0,
    countdown: COUNTDOWN,
    cars,
    finished: null,
    events: [],
    skyOffset: 0,
    rng: seeded(themeIndex * 7919 + 13),
  };
}

export function findSegment(race: Race, z: number): Segment {
  const n = race.segments.length;
  return race.segments[((Math.floor(z / SEGMENT) % n) + n) % n];
}

const overlap = (x1: number, w1: number, x2: number, w2: number) => Math.abs(x1 - x2) < (w1 + w2) / 2;

export function playerDistance(race: Race): number {
  return race.lap * race.trackLength + race.position;
}

export function carDistance(race: Race, car: Car): number {
  return car.lap * race.trackLength + car.z - PLAYER_Z;
}

/** 1 = in front. */
export function currentRank(race: Race): number {
  if (race.finished) return race.finished.rank;
  const me = playerDistance(race);
  return 1 + race.cars.filter((c) => c.finishTime !== null || carDistance(race, c) > me).length;
}

export type Input = { left: boolean; right: boolean };

/** Move the race forward by dt seconds. */
export function update(race: Race, input: Input, dt: number): void {
  race.events = [];
  if (!Number.isFinite(dt) || dt <= 0) return;
  // At boost speed a 30 fps frame crosses multiple road segments. Small physics
  // steps never cross an entire segment, so stars, pads and cars cannot be skipped.
  let remaining = Math.min(dt, 1 / 20);
  while (remaining > 1e-9) {
    const step = Math.min(remaining, 1 / 120);
    updateStep(race, input, step);
    remaining -= step;
  }
}

function updateStep(race: Race, input: Input, dt: number): void {
  if (race.countdown > 0) {
    const before = Math.ceil(race.countdown);
    race.countdown -= dt;
    if (race.countdown <= 0) race.events.push("go");
    else if (Math.ceil(race.countdown) !== before) race.events.push("beep");
    return;
  }
  race.clock += dt;

  updateFriends(race, dt);
  if (race.finished) {
    // keep rolling gently past the line
    race.speed = Math.max(MAX_SPEED * 0.3, race.speed - MAX_SPEED * dt * 0.5);
    advance(race, dt);
    return;
  }

  const seg = findSegment(race, race.position + PLAYER_Z);
  const speedPct = race.speed / MAX_SPEED;

  // steering, with a little slide on snow
  const want = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const steerTarget = want * 2.2 * Math.max(0.35, speedPct);
  race.steerVel += (steerTarget - race.steerVel) * Math.min(1, race.theme.grip * dt);
  race.playerX += race.steerVel * dt;
  // curves push the car outwards
  race.playerX -= dt * 2 * speedPct * speedPct * seg.curve * race.theme.centrifugal;
  race.playerX = Math.max(-2.2, Math.min(2.2, race.playerX));

  // speed: the car drives itself; boosts go faster, grass slows you down
  race.boost = Math.max(0, race.boost - dt);
  race.bump = Math.max(0, race.bump - dt);
  const offRoad = Math.abs(race.playerX) > 1;
  let target = MAX_SPEED * (race.boost > 0 ? BOOST : CRUISE);
  if (offRoad) target = Math.min(target, OFF_ROAD_SPEED);
  const rate = race.speed < target ? MAX_SPEED * 0.45 : MAX_SPEED * (offRoad ? 1.2 : 0.8);
  race.speed = race.speed < target ? Math.min(target, race.speed + rate * dt) : Math.max(target, race.speed - rate * dt);

  // boost pads
  if (seg.boost !== undefined && overlap(race.playerX, CAR_WIDTH, seg.boost, 0.5) && race.boost < 1.2) {
    race.boost = 1.5;
    race.events.push("boost");
  }

  // stars, cones and roadside things
  for (const it of seg.items) {
    if (it.taken) continue;
    const w = ITEM_WIDTH[it.kind];
    if (it.kind === "star") {
      if (overlap(race.playerX, CAR_WIDTH, it.offset, w)) {
        it.taken = true;
        race.stars++;
        race.events.push("star");
      }
      continue;
    }
    // scenery sits beside the road; its centre is half its width further out
    const centre = it.kind === "cone" ? it.offset : it.offset + Math.sign(it.offset) * w * 0.4;
    if (race.bump === 0 && overlap(race.playerX, CAR_WIDTH, centre, w * 0.7)) bump(race, it.kind === "cone" ? 0 : -Math.sign(it.offset));
  }

  // friends' cars
  for (const car of race.cars) {
    const carSeg = findSegment(race, car.z);
    if (carSeg !== seg || race.bump > 0) continue;
    if (overlap(race.playerX, CAR_WIDTH, car.offset, CAR_WIDTH * 0.9) && race.speed > car.speed) {
      race.speed = car.speed * 0.8;
      race.playerX += race.playerX > car.offset ? 0.15 : -0.15;
      race.bump = 0.4;
      race.events.push("bump");
    }
  }

  const lapBefore = race.lap;
  advance(race, dt);
  if (race.lap > lapBefore) {
    if (race.lap >= LAPS) {
      race.finished = { rank: 1 + race.cars.filter((c) => c.finishTime !== null).length, time: race.clock };
      race.events.push("finish");
    } else race.events.push("lap");
  }
}

function bump(race: Race, push: number) {
  race.speed = Math.min(race.speed, BUMP_SPEED);
  race.bump = 0.6;
  race.playerX += push * 0.25;
  race.events.push("bump");
}

function advance(race: Race, dt: number) {
  const seg = findSegment(race, race.position + PLAYER_Z);
  race.skyOffset += seg.curve * (race.speed / MAX_SPEED) * dt * 0.08;
  race.position += race.speed * dt;
  while (race.position >= race.trackLength) {
    race.position -= race.trackLength;
    race.lap++;
  }
}

function updateFriends(race: Race, dt: number) {
  const me = playerDistance(race);
  for (const car of race.cars) {
    // friends speed up a little when behind and ease off when far ahead, so races stay close
    const gap = (me - carDistance(race, car)) / race.trackLength;
    const rubber = Math.max(0.88, Math.min(1.12, 1 + gap * 0.6));
    const target = MAX_SPEED * car.base * (race.finished ? 1 : rubber);
    car.speed += (target - car.speed) * Math.min(1, dt * 1.5);
    car.z += car.speed * dt;
    // drift between lanes now and then
    if (Math.abs(car.offset - car.targetOffset) < 0.02 && race.rng() < dt * 0.25) {
      car.targetOffset = [-0.6, 0, 0.6][Math.floor(race.rng() * 3)];
    }
    car.offset += (car.targetOffset - car.offset) * Math.min(1, dt * 1.2);
    while (car.z >= race.trackLength) {
      car.z -= race.trackLength;
      car.lap++;
      if (car.lap >= LAPS && car.finishTime === null) car.finishTime = race.clock;
    }
  }
}

export const RANK_NAMES = ["1st", "2nd", "3rd", "4th"];
export const starsForRank = (rank: number) => (rank === 1 ? 3 : rank <= 3 ? 2 : 1);
