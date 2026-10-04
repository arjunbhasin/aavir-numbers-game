/** Draws one frame of the race onto a canvas. */
import {
  CAMERA_DEPTH,
  CAMERA_HEIGHT,
  CAR_WIDTH,
  DRAW_DISTANCE,
  ITEM_WIDTH,
  LANES,
  PLAYER_Z,
  ROAD_WIDTH,
  RUMBLE,
  SEGMENT,
  findSegment,
  type Point,
  type Race,
  type ThemeId,
} from "./engine";
import type { SpriteImage, SpriteSet } from "./sprites";

type Palette = {
  sky: [string, string];
  hills: [string, string];
  grass: [string, string];
  rumble: [string, string];
  road: [string, string];
  lane: string;
};

const PALETTES: Record<ThemeId, Palette> = {
  meadow: { sky: ["#7cc8ff", "#d8f0ff"], hills: ["#8fd18a", "#6cbf6a"], grass: ["#7fd36e", "#72c862"], rumble: ["#ff6b6b", "#ffffff"], road: ["#8a93a6", "#848da0"], lane: "#ffffff" },
  beach: { sky: ["#5fb8ff", "#c9ecff"], hills: ["#5fc3e8", "#3aa8d8"], grass: ["#f6dc9a", "#efd28a"], rumble: ["#4aa3ff", "#ffffff"], road: ["#9a8f86", "#938880"], lane: "#fff8ec" },
  snow: { sky: ["#a9c8ea", "#eef6ff"], hills: ["#ffffff", "#e3eefa"], grass: ["#f4f8ff", "#e8f0fb"], rumble: ["#a678f0", "#ffffff"], road: ["#8fa6c4", "#879ebd"], lane: "#ffffff" },
};

function project(p: Point, cameraX: number, cameraY: number, cameraZ: number, w: number, h: number) {
  p.camera.x = p.world.x - cameraX;
  p.camera.y = p.world.y - cameraY;
  p.camera.z = p.world.z - cameraZ;
  p.screen.scale = CAMERA_DEPTH / p.camera.z;
  p.screen.x = Math.round(w / 2 + (p.screen.scale * p.camera.x * w) / 2);
  p.screen.y = Math.round(h / 2 - (p.screen.scale * p.camera.y * h) / 2);
  p.screen.w = Math.round((p.screen.scale * ROAD_WIDTH * w) / 2);
}

function quad(c: CanvasRenderingContext2D, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: string) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x1 - w1, y1);
  c.lineTo(x2 - w2, y2);
  c.lineTo(x2 + w2, y2);
  c.lineTo(x1 + w1, y1);
  c.closePath();
  c.fill();
}

function background(c: CanvasRenderingContext2D, w: number, h: number, pal: Palette, offset: number) {
  const g = c.createLinearGradient(0, 0, 0, h * 0.6);
  g.addColorStop(0, pal.sky[0]);
  g.addColorStop(1, pal.sky[1]);
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  // sun and clouds
  c.fillStyle = "rgba(255,240,150,0.9)";
  c.beginPath();
  c.arc(w * 0.82 - offset * w * 0.2, h * 0.14, h * 0.06, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(255,255,255,0.85)";
  for (const [x, y, s] of [[0.15, 0.12, 1], [0.45, 0.08, 0.8], [0.65, 0.2, 0.7]]) {
    const cx = ((((x - offset * 0.5) % 1) + 1) % 1) * w;
    for (const [dx, r] of [[-0.03, 0.035], [0, 0.05], [0.035, 0.035]]) {
      c.beginPath();
      c.arc(cx + dx * w * s, y * h, r * h * s, 0, Math.PI * 2);
      c.fill();
    }
  }
  // two layers of rolling hills that slide with the curves
  for (const [layer, color, amp, base] of [[0.6, pal.hills[0], 0.07, 0.5], [1, pal.hills[1], 0.05, 0.53]] as const) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const t = x / w + offset * layer;
      c.lineTo(x, h * (base - amp * (Math.sin(t * 9) * 0.6 + Math.sin(t * 23) * 0.4)));
    }
    c.lineTo(w, h);
    c.fill();
  }
}

function sprite(c: CanvasRenderingContext2D, img: SpriteImage, worldWidth: number, scale: number, x: number, y: number, w: number, offsetX: number, clipY: number) {
  const destW = worldWidth * ROAD_WIDTH * scale * (w / 2);
  const destH = destW * img.aspect;
  const dx = x + destW * offsetX;
  const dy = y - destH;
  const hidden = clipY ? Math.max(0, dy + destH - clipY) : 0;
  if (hidden >= destH || destW < 1) return;
  const srcH = img.canvas.height * (1 - hidden / destH);
  c.drawImage(img.canvas, 0, 0, img.canvas.width, srcH, dx, dy, destW, destH - hidden);
}

export function drawRace(c: CanvasRenderingContext2D, race: Race, sprites: SpriteSet, w: number, h: number, time: number, reducedMotion = false) {
  if (reducedMotion) time = 0;
  const pal = PALETTES[race.theme.id];
  background(c, w, h, pal, race.skyOffset);

  const base = findSegment(race, race.position);
  const basePct = (race.position % SEGMENT) / SEGMENT;
  const playerSeg = findSegment(race, race.position + PLAYER_Z);
  const playerPct = ((race.position + PLAYER_Z) % SEGMENT) / SEGMENT;
  const playerY = playerSeg.p1.world.y + (playerSeg.p2.world.y - playerSeg.p1.world.y) * playerPct;
  const n = race.segments.length;

  let maxY = h;
  let x = 0;
  let dx = -(base.curve * basePct);

  for (let i = 0; i < DRAW_DISTANCE; i++) {
    const seg = race.segments[(base.index + i) % n];
    const looped = seg.index < base.index;
    seg.clip = maxY;
    const camZ = race.position - (looped ? race.trackLength : 0);
    project(seg.p1, race.playerX * ROAD_WIDTH - x, playerY + CAMERA_HEIGHT, camZ, w, h);
    project(seg.p2, race.playerX * ROAD_WIDTH - x - dx, playerY + CAMERA_HEIGHT, camZ, w, h);
    x += dx;
    dx += seg.curve;
    if (seg.p1.camera.z <= CAMERA_DEPTH || seg.p2.screen.y >= seg.p1.screen.y || seg.p2.screen.y >= maxY) continue;

    const p1 = seg.p1.screen;
    const p2 = seg.p2.screen;
    const alt = Math.floor(seg.index / RUMBLE) % 2;
    c.fillStyle = pal.grass[alt];
    c.fillRect(0, p2.y, w, p1.y - p2.y);
    quad(c, p1.x, p1.y, p1.w * 1.15, p2.x, p2.y, p2.w * 1.15, pal.rumble[alt]);
    quad(c, p1.x, p1.y, p1.w, p2.x, p2.y, p2.w, pal.road[alt]);

    if (seg.finish) {
      // chequered start/finish line
      const cols = 8;
      for (let k = 0; k < cols; k++) {
        const t1 = -1 + (2 * k) / cols;
        const t2 = -1 + (2 * (k + 1)) / cols;
        c.fillStyle = (k + alt) % 2 ? "#26324a" : "#ffffff";
        c.beginPath();
        c.moveTo(p1.x + p1.w * t1, p1.y);
        c.lineTo(p2.x + p2.w * t1, p2.y);
        c.lineTo(p2.x + p2.w * t2, p2.y);
        c.lineTo(p1.x + p1.w * t2, p1.y);
        c.fill();
      }
    } else if (alt === 0) {
      const lw1 = p1.w / 32;
      const lw2 = p2.w / 32;
      for (let lane = 1; lane < LANES; lane++) {
        const t = -1 + (2 * lane) / LANES;
        quad(c, p1.x + p1.w * t, p1.y, lw1, p2.x + p2.w * t, p2.y, lw2, pal.lane);
      }
    }
    if (seg.boost !== undefined) {
      // rainbow boost pad, gently flashing
      const hue = (time * 240 + seg.index * 40) % 360;
      c.fillStyle = `hsl(${hue} 90% 62%)`;
      const t = seg.boost;
      c.beginPath();
      c.moveTo(p1.x + p1.w * (t - 0.25), p1.y);
      c.lineTo(p2.x + p2.w * (t - 0.25), p2.y);
      c.lineTo(p2.x + p2.w * (t + 0.25), p2.y);
      c.lineTo(p1.x + p1.w * (t + 0.25), p1.y);
      c.fill();
    }
    maxY = p1.y;
  }

  // things on and beside the road, far to near, so near ones cover far ones
  for (let i = DRAW_DISTANCE - 1; i > 0; i--) {
    const seg = race.segments[(base.index + i) % n];
    const scale = seg.p1.screen.scale;
    if (seg.p1.camera.z <= CAMERA_DEPTH) continue;
    for (const car of race.cars) {
      if (findSegment(race, car.z) !== seg) continue;
      const pct = (car.z % SEGMENT) / SEGMENT;
      const s = scale + (seg.p2.screen.scale - scale) * pct;
      const cx = seg.p1.screen.x + (seg.p2.screen.x - seg.p1.screen.x) * pct + (s * car.offset * ROAD_WIDTH * w) / 2;
      const cy = seg.p1.screen.y + (seg.p2.screen.y - seg.p1.screen.y) * pct;
      sprite(c, sprites[car.kind], CAR_WIDTH, s, cx, cy, w, -0.5, seg.clip);
    }
    for (const it of seg.items) {
      if (it.taken) continue;
      const sx = seg.p1.screen.x + (scale * it.offset * ROAD_WIDTH * w) / 2;
      const onRoad = it.kind === "star" || it.kind === "cone";
      const lift = it.kind === "star" ? scale * ROAD_WIDTH * h * 0.08 * (1 + 0.15 * Math.sin(time * 6 + seg.index)) : 0;
      sprite(c, sprites[it.kind], ITEM_WIDTH[it.kind], scale, sx, seg.p1.screen.y - lift, w, onRoad ? -0.5 : it.offset < 0 ? -1 : 0, seg.clip);
    }
  }

  // the player's car, with a little bounce and lean
  const bounce = !reducedMotion && race.speed > 0 ? Math.sin(time * 30) * 1.2 * (race.speed / 12000) : 0;
  const wobble = !reducedMotion && race.bump > 0 ? Math.sin(time * 50) * 0.08 : 0;
  const lean = Math.max(-0.12, Math.min(0.12, race.steerVel * 0.05)) + wobble;
  const carW = (w / 2) * CAR_WIDTH * ROAD_WIDTH * (CAMERA_DEPTH / PLAYER_Z);
  const img = sprites.robot;
  const carH = carW * img.aspect;
  c.save();
  c.translate(w / 2, h - h * 0.04 + bounce);
  c.rotate(lean);
  c.drawImage(img.canvas, -carW / 2, -carH, carW, carH);
  c.restore();
  if (race.boost > 0 && !reducedMotion) {
    // speed lines while boosting
    c.strokeStyle = "rgba(255,255,255,0.7)";
    c.lineWidth = 3;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + time * 3;
      const r1 = h * 0.35;
      const r2 = h * 0.5;
      c.beginPath();
      c.moveTo(w / 2 + Math.cos(a) * r1 * 1.6, h * 0.55 + Math.sin(a) * r1);
      c.lineTo(w / 2 + Math.cos(a) * r2 * 1.6, h * 0.55 + Math.sin(a) * r2);
      c.stroke();
    }
  }
}
