/** The shape model every pattern puzzle is built from. */

export const SHAPES = ["circle", "square", "triangle", "diamond", "star", "heart", "hexagon", "pentagon"] as const;
/** Shapes that look different when turned, used whenever rotation is part of the rule. */
export const TURN_SHAPES = ["arrow", "moon", "flag"] as const;
export const COLORS = ["red", "blue", "green", "yellow", "purple", "ink"] as const;
export const FILLS = ["none", "solid", "striped"] as const;
export const SIZES = [1, 2, 3] as const;
export const COUNTS = [1, 2, 3, 4, 5, 6] as const;
export const ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export type ShapeKind = (typeof SHAPES)[number] | (typeof TURN_SHAPES)[number];
export type ColorName = (typeof COLORS)[number];
export type Fill = (typeof FILLS)[number];

export type Figure = {
  shape: ShapeKind;
  color: ColorName;
  fill: Fill;
  size: number; // 1 small, 2 medium, 3 large
  count: number; // copies shown
  rotation: number; // degrees, only matters for TURN_SHAPES
};

export type Attr = keyof Figure;

export const COLOR_HEX: Record<ColorName, { main: string; dark: string }> = {
  red: { main: "#ff6b6b", dark: "#d94848" },
  blue: { main: "#4aa3ff", dark: "#2b7fdc" },
  green: { main: "#4cc35d", dark: "#2f9a40" },
  yellow: { main: "#ffc93c", dark: "#d9a200" },
  purple: { main: "#a678f0", dark: "#7c4fd0" },
  ink: { main: "#26324a", dark: "#26324a" },
};

export function isTurnShape(s: ShapeKind): boolean {
  return (TURN_SHAPES as readonly string[]).includes(s);
}

/** Canonical form: rotation is ignored for shapes that look the same when turned. */
export function normalize(f: Figure): Figure {
  return { ...f, rotation: isTurnShape(f.shape) ? ((f.rotation % 360) + 360) % 360 : 0 };
}

export function figureKey(f: Figure): string {
  const n = normalize(f);
  return `${n.shape}|${n.color}|${n.fill}|${n.size}|${n.count}|${n.rotation}`;
}

export function sameFigure(a: Figure, b: Figure): boolean {
  return figureKey(a) === figureKey(b);
}

export const BASE: Figure = { shape: "circle", color: "blue", fill: "solid", size: 3, count: 1, rotation: 0 };
