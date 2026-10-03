import { useId } from "react";
import { COLOR_HEX, isTurnShape, type Figure, type ShapeKind } from "@/games/patterns/figure";

/** Outline path for one shape centred on (0,0) with radius r. */
function shapePath(shape: ShapeKind, r: number): string {
  const poly = (n: number, offset = -Math.PI / 2, rr = r) =>
    Array.from({ length: n }, (_, i) => {
      const a = offset + (i * 2 * Math.PI) / n;
      return `${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`;
    });
  switch (shape) {
    case "circle":
      return `M ${-r} 0 a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
    case "square": {
      const s = r * 0.86;
      return `M ${-s} ${-s} H ${s} V ${s} H ${-s} Z`;
    }
    case "triangle":
      return `M ${poly(3, -Math.PI / 2, r * 1.1).join(" L ")} Z`;
    case "diamond":
      return `M 0 ${-r} L ${r * 0.78} 0 L 0 ${r} L ${-r * 0.78} 0 Z`;
    case "pentagon":
      return `M ${poly(5).join(" L ")} Z`;
    case "hexagon":
      return `M ${poly(6, 0).join(" L ")} Z`;
    case "star": {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 === 0 ? r * 1.05 : r * 0.45;
        return `${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`;
      });
      return `M ${pts.join(" L ")} Z`;
    }
    case "heart": {
      const k = r / 10;
      return `M 0 ${8 * k} C ${-12 * k} ${0} ${-11 * k} ${-9 * k} ${-5 * k} ${-9 * k} C ${-2 * k} ${-9 * k} 0 ${-7 * k} 0 ${-5 * k} C 0 ${-7 * k} ${2 * k} ${-9 * k} ${5 * k} ${-9 * k} C ${11 * k} ${-9 * k} ${12 * k} 0 0 ${8 * k} Z`;
    }
    case "arrow": {
      const k = r / 10;
      return `M 0 ${-10 * k} L ${8 * k} ${-1 * k} L ${3 * k} ${-1 * k} L ${3 * k} ${10 * k} L ${-3 * k} ${10 * k} L ${-3 * k} ${-1 * k} L ${-8 * k} ${-1 * k} Z`;
    }
    case "moon": {
      // crescent: left half of a circle minus a shallower arc, opening to the right at rotation 0
      const t = r * 0.6; // shifted right so the crescent turns around its middle
      return `M ${t} ${-r} A ${r} ${r} 0 0 0 ${t} ${r} A ${r * 1.15} ${r * 1.15} 0 0 1 ${t} ${-r} Z`;
    }
    case "flag": {
      const k = r / 10;
      return `M ${-6 * k} ${10 * k} L ${-6 * k} ${-10 * k} L ${8 * k} ${-5 * k} L ${-3 * k} 0 L ${-3 * k} ${10 * k} Z`;
    }
  }
}

/** Where copies go for counts 1-6, in a 100x100 box. */
const LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[29, 50], [71, 50]],
  3: [[50, 27], [27, 70], [73, 70]],
  4: [[29, 29], [71, 29], [29, 71], [71, 71]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[29, 22], [71, 22], [29, 50], [71, 50], [29, 78], [71, 78]],
};
const RADIUS: Record<number, number> = { 1: 38, 2: 19, 3: 19, 4: 18, 5: 15, 6: 13 };
const SIZE_SCALE: Record<number, number> = { 1: 0.5, 2: 0.74, 3: 1 };

export default function FigureView({ figure, className = "w-full h-full" }: { figure: Figure; className?: string }) {
  const id = useId().replace(/:/g, "");
  const { main, dark } = COLOR_HEX[figure.color];
  const r = RADIUS[figure.count] * SIZE_SCALE[figure.size];
  const d = shapePath(figure.shape, r);
  const rot = isTurnShape(figure.shape) ? figure.rotation : 0;
  const fill = figure.fill === "solid" ? main : figure.fill === "striped" ? `url(#st${id})` : "#ffffff";
  const strokeW = Math.max(2.5, r * 0.12);
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={describe(figure)}>
      <defs>
        <pattern id={`st${id}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="#fff" />
          <rect width="3.2" height="7" fill={main} />
        </pattern>
      </defs>
      {LAYOUTS[figure.count].map(([x, y], i) => (
        <path
          key={i}
          d={d}
          transform={`translate(${x} ${y}) rotate(${rot})`}
          fill={fill}
          stroke={figure.fill === "solid" ? dark : main}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export function describe(f: Figure): string {
  const size = { 1: "small", 2: "medium", 3: "big" }[f.size];
  const fill = f.fill === "none" ? "empty" : f.fill;
  return `${f.count} ${size} ${fill} ${f.color === "ink" ? "black" : f.color} ${f.shape}${f.count > 1 ? "s" : ""}${isTurnShape(f.shape) ? ` turned ${((f.rotation % 360) + 360) % 360} degrees` : ""}`;
}
