import type { Dir } from "@/lib/grid";

/** All sprites draw in a 100x100 box and scale to the cell. */
type S = { className?: string };
const svg = (children: React.ReactNode, className = "w-full h-full") => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden>
    {children}
  </svg>
);

export const KEY_COLORS = {
  r: { main: "#ff6b6b", dark: "#d94848", name: "red" },
  b: { main: "#4aa3ff", dark: "#2b7fdc", name: "blue" },
  y: { main: "#ffc93c", dark: "#e0a300", name: "yellow" },
} as const;
export type KeyColor = keyof typeof KEY_COLORS;

/* ---------- Box Push ---------- */

export const Floor = ({ alt }: { alt?: boolean }) => (
  <div className={`w-full h-full ${alt ? "bg-[#fbe9c6]" : "bg-[#f7e1b5]"}`} />
);

export const Wall = ({ className }: S) =>
  svg(
    <>
      <rect x="0" y="0" width="100" height="100" fill="#7b8db8" />
      <rect x="4" y="4" width="92" height="88" rx="14" fill="#93a6d3" />
      <rect x="12" y="10" width="76" height="14" rx="7" fill="#b4c4ea" />
      <path d="M8 56h84M50 24v32M28 56v36M72 56v36" stroke="#7b8db8" strokeWidth="5" />
    </>,
    className,
  );

export const Goal = ({ className }: S) =>
  svg(
    <path
      d="m50 18 9 19 21 3-15 14 4 21-19-10-19 10 4-21-15-14 21-3z"
      fill="#fff3c4"
      stroke="#f0b400"
      strokeWidth="5"
      strokeLinejoin="round"
      strokeDasharray="8 6"
    />,
    className,
  );

export const Crate = ({ onGoal, className }: S & { onGoal?: boolean }) =>
  svg(
    <>
      <rect x="8" y="10" width="84" height="84" rx="10" fill={onGoal ? "#3aa64b" : "#c47a3a"} />
      <rect x="8" y="6" width="84" height="84" rx="10" fill={onGoal ? "#5cc96b" : "#e09550"} />
      <rect x="18" y="16" width="64" height="64" rx="6" fill="none" stroke={onGoal ? "#3aa64b" : "#b56a2a"} strokeWidth="6" />
      <path d="M22 20 78 76M78 20 22 76" stroke={onGoal ? "#3aa64b" : "#b56a2a"} strokeWidth="7" strokeLinecap="round" />
      {onGoal && (
        <path d="m50 30 6 12 13 2-9.5 9 2.5 13-12-6.5-12 6.5 2.5-13-9.5-9 13-2z" fill="#ffe066" stroke="#e8a800" strokeWidth="3" strokeLinejoin="round" />
      )}
    </>,
    className,
  );

/** The friendly robot hero. Pupils look where it is heading. */
export const Robot = ({ facing = "down", className }: S & { facing?: Dir }) => {
  const look = { up: [0, -3], down: [0, 3], left: [-4, 0], right: [4, 0] }[facing];
  return svg(
    <>
      <ellipse cx="50" cy="93" rx="26" ry="5" fill="rgba(0,0,0,.15)" />
      <line x1="50" y1="14" x2="50" y2="4" stroke="#2b7fdc" strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="5" r="5.5" fill="#ff6fae" />
      <rect x="18" y="14" width="64" height="50" rx="20" fill="#4aa3ff" />
      <rect x="25" y="22" width="50" height="32" rx="14" fill="#eaf6ff" />
      <circle cx={38 + look[0]} cy={38 + look[1]} r="6" fill="#26324a" />
      <circle cx={62 + look[0]} cy={38 + look[1]} r="6" fill="#26324a" />
      <circle cx={40 + look[0]} cy={36 + look[1]} r="2" fill="#fff" />
      <circle cx={64 + look[0]} cy={36 + look[1]} r="2" fill="#fff" />
      <path d="M42 48q8 6 16 0" stroke="#26324a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="28" y="62" width="44" height="26" rx="10" fill="#2b7fdc" />
      <circle cx="50" cy="75" r="5" fill="#ffc93c" />
      <rect x="12" y="66" width="12" height="16" rx="6" fill="#4aa3ff" />
      <rect x="76" y="66" width="12" height="16" rx="6" fill="#4aa3ff" />
    </>,
    className,
  );
};

/* ---------- Ice Slide ---------- */

export const Ice = ({ alt }: { alt?: boolean }) => (
  <div className={`w-full h-full relative ${alt ? "bg-[#d9f1ff]" : "bg-[#cdeaff]"}`}>
    <div className="absolute left-[18%] top-[20%] w-[30%] h-[8%] rounded-full bg-white/70 rotate-[-25deg]" />
  </div>
);

export const Snow = () => (
  <div className="w-full h-full bg-white relative">
    <div className="absolute left-[25%] top-[30%] w-[10%] h-[10%] rounded-full bg-sky-200" />
    <div className="absolute left-[60%] top-[55%] w-[12%] h-[12%] rounded-full bg-sky-200" />
    <div className="absolute left-[40%] top-[70%] w-[8%] h-[8%] rounded-full bg-sky-100" />
  </div>
);

export const Rock = ({ className }: S) =>
  svg(
    <>
      <rect width="100" height="100" fill="#cdeaff" />
      <path d="M12 82 20 40 42 18 70 22 88 48 86 82z" fill="#8a94a8" />
      <path d="M20 40 42 18 70 22 60 40 34 46z" fill="#a9b2c3" />
      <path d="M12 82h74" stroke="#6b7488" strokeWidth="6" strokeLinecap="round" />
    </>,
    className,
  );

export const Penguin = ({ facing = "down", className }: S & { facing?: Dir }) => {
  const flip = facing === "left" ? -1 : 1;
  return svg(
    <g transform={`translate(50 0) scale(${flip} 1) translate(-50 0)`}>
      <ellipse cx="50" cy="93" rx="24" ry="5" fill="rgba(0,0,0,.15)" />
      <ellipse cx="50" cy="55" rx="30" ry="36" fill="#26324a" />
      <ellipse cx="52" cy="60" rx="20" ry="27" fill="#fff" />
      <circle cx="44" cy="36" r="5" fill="#fff" />
      <circle cx="60" cy="36" r="5" fill="#fff" />
      <circle cx="45.5" cy="36.5" r="2.6" fill="#26324a" />
      <circle cx="61.5" cy="36.5" r="2.6" fill="#26324a" />
      <path d="M48 44h12l-6 7z" fill="#ffa53c" />
      <ellipse cx="22" cy="60" rx="7" ry="16" fill="#26324a" transform="rotate(15 22 60)" />
      <ellipse cx="78" cy="60" rx="7" ry="16" fill="#26324a" transform="rotate(-15 78 60)" />
      <ellipse cx="40" cy="90" rx="9" ry="4" fill="#ffa53c" />
      <ellipse cx="62" cy="90" rx="9" ry="4" fill="#ffa53c" />
      <circle cx="38" cy="47" r="4" fill="#ff9fc4" opacity=".7" />
      <circle cx="68" cy="47" r="4" fill="#ff9fc4" opacity=".7" />
    </g>,
    className,
  );
};

export const Fish = ({ className }: S) =>
  svg(
    <>
      <path d="M18 50q22-26 50-6l16-14v40L68 56q-28 20-50-6z" fill="#ff7a6b" stroke="#e35a4a" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="32" cy="46" r="4" fill="#26324a" />
      <path d="M46 40q4 10 0 20" stroke="#e35a4a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </>,
    className,
  );

/* ---------- Key Maze ---------- */

export const Grass = ({ alt }: { alt?: boolean }) => (
  <div className={`w-full h-full ${alt ? "bg-[#c9f0c2]" : "bg-[#bfeab7]"}`} />
);

export const Hedge = ({ className }: S) =>
  svg(
    <>
      <rect width="100" height="100" fill="#3e9b52" />
      <circle cx="28" cy="30" r="22" fill="#4fb565" />
      <circle cx="70" cy="28" r="22" fill="#57be6d" />
      <circle cx="30" cy="72" r="22" fill="#57be6d" />
      <circle cx="72" cy="70" r="22" fill="#4fb565" />
      <circle cx="50" cy="50" r="18" fill="#66cc7a" />
    </>,
    className,
  );

export const KeySprite = ({ color, className }: S & { color: KeyColor }) => {
  const c = KEY_COLORS[color];
  return svg(
    <g transform="rotate(-35 50 50)">
      <circle cx="30" cy="50" r="17" fill={c.main} stroke={c.dark} strokeWidth="5" />
      <circle cx="30" cy="50" r="6" fill="#fff" />
      <rect x="44" y="45" width="42" height="10" rx="4" fill={c.main} stroke={c.dark} strokeWidth="4" />
      <rect x="70" y="53" width="8" height="14" rx="2" fill={c.main} stroke={c.dark} strokeWidth="4" />
      <rect x="80" y="53" width="7" height="10" rx="2" fill={c.main} stroke={c.dark} strokeWidth="4" />
    </g>,
    className,
  );
};

export const Door = ({ color, className }: S & { color: KeyColor }) => {
  const c = KEY_COLORS[color];
  return svg(
    <>
      <rect width="100" height="100" fill="#3e9b52" />
      <rect x="10" y="6" width="80" height="90" rx="12" fill={c.dark} />
      <rect x="16" y="12" width="68" height="78" rx="8" fill={c.main} />
      <path d="M32 12v78M50 12v78M68 12v78" stroke={c.dark} strokeWidth="3" opacity=".6" />
      <circle cx="50" cy="46" r="8" fill="#26324a" />
      <path d="M46 50h8l3 16H43z" fill="#26324a" />
    </>,
    className,
  );
};

export const Chest = ({ className }: S) =>
  svg(
    <>
      <ellipse cx="50" cy="90" rx="34" ry="5" fill="rgba(0,0,0,.15)" />
      <rect x="14" y="44" width="72" height="44" rx="6" fill="#c47a3a" />
      <path d="M14 46q0-26 36-26t36 26z" fill="#e09550" />
      <rect x="14" y="42" width="72" height="8" fill="#ffc93c" />
      <rect x="44" y="42" width="12" height="22" rx="3" fill="#ffc93c" stroke="#e0a300" strokeWidth="3" />
      <path d="M24 30l4-8M76 30l-4-8M50 18v-8" stroke="#ffe066" strokeWidth="4" strokeLinecap="round" />
    </>,
    className,
  );

/* ---------- Robot Path ---------- */

export const Battery = ({ className }: S) =>
  svg(
    <>
      <rect x="30" y="18" width="40" height="70" rx="9" fill="#26324a" />
      <rect x="40" y="10" width="20" height="10" rx="3" fill="#26324a" />
      <rect x="36" y="24" width="28" height="58" rx="5" fill="#5cc96b" />
      <path d="m54 32-12 22h10l-6 20 14-26H50z" fill="#ffe066" stroke="#e0a300" strokeWidth="2" strokeLinejoin="round" />
    </>,
    className,
  );

export const Puddle = ({ className }: S) =>
  svg(
    <>
      <path d="M14 56q0-24 30-26 20-12 36 6 16 12 4 28-10 18-40 14-30-2-30-22z" fill="#9ccfff" />
      <path d="M30 46q8-6 16-4" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
    </>,
    className,
  );
