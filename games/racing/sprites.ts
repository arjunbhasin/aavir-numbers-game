/**
 * All race pictures are drawn once into small off-screen canvases when the race loads,
 * then copied (scaled) every frame. That keeps each frame cheap, even on older tablets.
 */
import type { ItemKind, RacerKind } from "./engine";

export type SpriteImage = { canvas: HTMLCanvasElement; aspect: number }; // aspect = height / width
export type SpriteSet = Record<ItemKind | RacerKind, SpriteImage>;

const RES = 2; // draw sprites at twice their nominal size so they stay crisp when scaled up

function make(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void): SpriteImage {
  const canvas = document.createElement("canvas");
  canvas.width = w * RES;
  canvas.height = h * RES;
  const c = canvas.getContext("2d")!;
  c.scale(RES, RES);
  c.lineJoin = "round";
  c.lineCap = "round";
  draw(c);
  return { canvas, aspect: h / w };
}

const circle = (c: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) => {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
};
const rrect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) => {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
};
const poly = (c: CanvasRenderingContext2D, pts: number[], fill: string) => {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
};

/** A car seen from behind, with its driver's head poking up. */
function car(body: string, dark: string, head: (c: CanvasRenderingContext2D) => void): SpriteImage {
  return make(100, 84, (c) => {
    c.globalAlpha = 0.25;
    c.beginPath();
    c.ellipse(50, 80, 46, 5, 0, 0, Math.PI * 2);
    c.fillStyle = "#000";
    c.fill();
    c.globalAlpha = 1;
    head(c);
    rrect(c, 22, 30, 56, 18, 8, "#cfe9ff"); // rear window
    rrect(c, 6, 40, 88, 32, 12, body); // body
    rrect(c, 6, 60, 88, 12, 6, dark);
    rrect(c, 12, 46, 16, 8, 3, "#ffe066"); // lights
    rrect(c, 72, 46, 16, 8, 3, "#ffe066");
    rrect(c, 38, 50, 24, 9, 3, "#fff"); // number plate
    rrect(c, 4, 64, 20, 16, 5, "#26324a"); // wheels
    rrect(c, 76, 64, 20, 16, 5, "#26324a");
  });
}

const heads: Record<RacerKind, (c: CanvasRenderingContext2D) => void> = {
  robot: (c) => {
    c.strokeStyle = "#2b7fdc";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(50, 12);
    c.lineTo(50, 4);
    c.stroke();
    circle(c, 50, 4, 4, "#ff6fae");
    rrect(c, 34, 10, 32, 26, 10, "#4aa3ff");
  },
  bear: (c) => {
    circle(c, 37, 14, 7, "#9c6430");
    circle(c, 63, 14, 7, "#9c6430");
    circle(c, 50, 24, 16, "#c98b4a");
  },
  cat: (c) => {
    poly(c, [34, 20, 37, 4, 47, 14], "#e08a12");
    poly(c, [66, 20, 63, 4, 53, 14], "#e08a12");
    circle(c, 50, 24, 16, "#ffb347");
  },
  bunny: (c) => {
    c.fillStyle = "#e7e9f2";
    c.beginPath();
    c.ellipse(42, 8, 5, 13, -0.15, 0, Math.PI * 2);
    c.ellipse(58, 8, 5, 13, 0.15, 0, Math.PI * 2);
    c.fill();
    circle(c, 50, 25, 15, "#e7e9f2");
  },
};

export function makeSprites(): SpriteSet {
  return {
    robot: car("#ff5a5a", "#d94848", heads.robot),
    bear: car("#a678f0", "#7c4fd0", heads.bear),
    cat: car("#4cc35d", "#2f9a40", heads.cat),
    bunny: car("#4aa3ff", "#2b7fdc", heads.bunny),
    tree: make(100, 130, (c) => {
      rrect(c, 42, 80, 16, 48, 4, "#8a5a2b");
      circle(c, 50, 50, 40, "#3fa652");
      circle(c, 30, 66, 24, "#4cc35d");
      circle(c, 70, 66, 24, "#4cc35d");
      circle(c, 40, 36, 6, "#ff6b6b");
      circle(c, 64, 52, 6, "#ff6b6b");
    }),
    bush: make(100, 60, (c) => {
      circle(c, 28, 40, 22, "#3fa652");
      circle(c, 72, 40, 22, "#3fa652");
      circle(c, 50, 28, 26, "#4cc35d");
    }),
    flowers: make(100, 50, (c) => {
      c.strokeStyle = "#3aa64b";
      c.lineWidth = 4;
      for (const [x, col] of [[18, "#ff7a9a"], [40, "#ffc93c"], [62, "#a678f0"], [84, "#ff9f43"]] as const) {
        c.beginPath();
        c.moveTo(x, 50);
        c.lineTo(x, 22);
        c.stroke();
        circle(c, x, 18, 9, col);
        circle(c, x, 18, 4, "#fff3b0");
      }
    }),
    palm: make(100, 150, (c) => {
      c.strokeStyle = "#a0693a";
      c.lineWidth = 12;
      c.beginPath();
      c.moveTo(52, 150);
      c.quadraticCurveTo(40, 90, 54, 40);
      c.stroke();
      c.fillStyle = "#3fa652";
      for (const a of [-2.6, -2, -1.2, -0.5, 0.2]) {
        c.beginPath();
        c.ellipse(54 + Math.cos(a) * 26, 40 + Math.sin(a) * 18, 30, 9, a, 0, Math.PI * 2);
        c.fill();
      }
      circle(c, 50, 46, 6, "#8a5a2b");
      circle(c, 60, 48, 6, "#8a5a2b");
    }),
    umbrella: make(100, 110, (c) => {
      c.strokeStyle = "#7b8db8";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(50, 30);
      c.lineTo(50, 108);
      c.stroke();
      const cols = ["#ff6b6b", "#fff", "#ff6b6b", "#fff", "#ff6b6b"];
      cols.forEach((col, i) => {
        c.beginPath();
        c.moveTo(50, 10);
        c.lineTo(6 + i * 17.6, 40);
        c.lineTo(6 + (i + 1) * 17.6, 40);
        c.closePath();
        c.fillStyle = col;
        c.fill();
      });
    }),
    rock: make(100, 60, (c) => {
      poly(c, [8, 58, 16, 24, 40, 6, 70, 10, 90, 30, 94, 58], "#8a94a8");
      poly(c, [16, 24, 40, 6, 70, 10, 58, 28, 30, 32], "#a9b2c3");
    }),
    pine: make(100, 140, (c) => {
      rrect(c, 42, 110, 16, 30, 3, "#8a5a2b");
      poly(c, [50, 4, 86, 56, 14, 56], "#2f8a44");
      poly(c, [50, 30, 92, 90, 8, 90], "#3fa652");
      poly(c, [50, 60, 96, 118, 4, 118], "#2f8a44");
      poly(c, [50, 4, 64, 24, 36, 24], "#fff");
      poly(c, [50, 30, 62, 46, 38, 46], "#fff");
    }),
    snowman: make(80, 110, (c) => {
      circle(c, 40, 80, 28, "#fff");
      circle(c, 40, 40, 20, "#fff");
      rrect(c, 24, 6, 32, 16, 3, "#26324a");
      rrect(c, 18, 20, 44, 5, 2, "#26324a");
      circle(c, 33, 38, 3, "#26324a");
      circle(c, 47, 38, 3, "#26324a");
      poly(c, [40, 44, 56, 47, 40, 50], "#ff9f43");
      rrect(c, 20, 56, 40, 7, 3, "#ff6b6b");
    }),
    cone: make(60, 70, (c) => {
      poly(c, [30, 2, 50, 62, 10, 62], "#ff8a3d");
      poly(c, [24, 22, 36, 22, 40, 34, 20, 34], "#fff");
      rrect(c, 2, 60, 56, 10, 3, "#e57f1a");
    }),
    star: make(60, 60, (c) => {
      const pts: number[] = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 ? 12 : 28;
        pts.push(30 + Math.cos(a) * r, 32 + Math.sin(a) * r);
      }
      poly(c, pts, "#ffc93c");
      c.strokeStyle = "#e8a800";
      c.lineWidth = 3;
      c.stroke();
    }),
  };
}
