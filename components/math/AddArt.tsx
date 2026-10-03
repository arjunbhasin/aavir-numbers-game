/** Drawings for the addition and subtraction games. All use a 100x100 box. */

type S = { className?: string };
const svg = (children: React.ReactNode, className = "w-full h-full") => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden>
    {children}
  </svg>
);

const COIN_STYLE: Record<number, { fill: string; rim: string; size: number }> = {
  1: { fill: "#e9a95f", rim: "#c98b4a", size: 34 },
  2: { fill: "#d7dde8", rim: "#a9b2c3", size: 38 },
  5: { fill: "#ffd94a", rim: "#e0a800", size: 42 },
  10: { fill: "#ffc93c", rim: "#d98a00", size: 46 },
};

export function Coin({ value, className }: S & { value: number }) {
  const c = COIN_STYLE[value] ?? COIN_STYLE[1];
  return svg(
    <>
      <circle cx="50" cy="54" r={c.size} fill={c.rim} />
      <circle cx="50" cy="50" r={c.size} fill={c.fill} stroke={c.rim} strokeWidth="4" />
      <circle cx="50" cy="50" r={c.size - 9} fill="none" stroke={c.rim} strokeWidth="2.5" strokeDasharray="4 4" />
      <text x="50" y={50 + c.size * 0.36} textAnchor="middle" fontSize={c.size * 1.05} fontWeight="800" fill="#5b3a1e" fontFamily="sans-serif">
        {value}
      </text>
    </>,
    className,
  );
}

export function ToyArt({ toy, className }: S & { toy: string }) {
  switch (toy) {
    case "ball":
      return svg(
        <>
          <circle cx="50" cy="52" r="38" fill="#ff6b6b" />
          <path d="M14 46q36 18 72 0" stroke="#fff" strokeWidth="8" fill="none" />
          <path d="M50 14q-14 38 0 76" stroke="#ffc93c" strokeWidth="8" fill="none" />
        </>,
        className,
      );
    case "teddy":
      return svg(
        <>
          <circle cx="28" cy="24" r="12" fill="#c98b4a" />
          <circle cx="72" cy="24" r="12" fill="#c98b4a" />
          <circle cx="50" cy="40" r="26" fill="#e09550" />
          <ellipse cx="50" cy="78" rx="28" ry="20" fill="#c98b4a" />
          <ellipse cx="50" cy="48" rx="11" ry="8" fill="#f2cf9e" />
          <circle cx="40" cy="36" r="4" fill="#26324a" />
          <circle cx="60" cy="36" r="4" fill="#26324a" />
          <circle cx="50" cy="45" r="3.5" fill="#26324a" />
        </>,
        className,
      );
    case "kite":
      return svg(
        <>
          <path d="M50 6 82 40 50 74 18 40z" fill="#a678f0" stroke="#7c4fd0" strokeWidth="4" strokeLinejoin="round" />
          <path d="M50 6v68M18 40h64" stroke="#7c4fd0" strokeWidth="3" />
          <path d="M50 74q-8 8 0 12t0 12" stroke="#ff6fae" strokeWidth="4" fill="none" />
        </>,
        className,
      );
    case "car":
      return svg(
        <>
          <path d="M10 64V50l14-4 10-16h32l12 16 12 4v14z" fill="#4aa3ff" stroke="#2b7fdc" strokeWidth="4" strokeLinejoin="round" />
          <path d="M38 34h12v12H30zM54 34h10l8 12H54z" fill="#eaf6ff" />
          <circle cx="30" cy="68" r="10" fill="#26324a" />
          <circle cx="72" cy="68" r="10" fill="#26324a" />
          <circle cx="30" cy="68" r="4" fill="#d7dde8" />
          <circle cx="72" cy="68" r="4" fill="#d7dde8" />
        </>,
        className,
      );
    case "duck":
      return svg(
        <>
          <ellipse cx="52" cy="66" rx="36" ry="22" fill="#ffd94a" />
          <circle cx="34" cy="38" r="18" fill="#ffd94a" />
          <path d="M14 40h-10l10 8z" fill="#ff9f43" />
          <circle cx="30" cy="34" r="3.5" fill="#26324a" />
          <path d="M60 58q14-6 22 6" stroke="#e0a800" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>,
        className,
      );
    case "rocket":
      return svg(
        <>
          <path d="M50 6q22 20 18 62H32Q28 26 50 6z" fill="#e7e9f2" stroke="#a9b2c3" strokeWidth="4" />
          <circle cx="50" cy="38" r="9" fill="#4aa3ff" stroke="#2b7fdc" strokeWidth="3" />
          <path d="M32 54 18 72l16-4zM68 54l14 18-16-4z" fill="#ff6b6b" />
          <path d="M40 70h20l-10 22z" fill="#ff9f43" />
        </>,
        className,
      );
    case "drum":
      return svg(
        <>
          <ellipse cx="50" cy="36" rx="34" ry="12" fill="#fff" stroke="#a9b2c3" strokeWidth="4" />
          <path d="M16 36v34q34 22 68 0V36" fill="#ff6b6b" stroke="#d94848" strokeWidth="4" />
          <path d="M16 40l17 32 17-30 17 30 17-32" stroke="#ffc93c" strokeWidth="4" fill="none" />
          <path d="M28 8l18 24M74 8 56 32" stroke="#c98b4a" strokeWidth="5" strokeLinecap="round" />
        </>,
        className,
      );
    default:
      return svg(
        <>
          <circle cx="50" cy="56" r="30" fill="#5cc96b" stroke="#3aa64b" strokeWidth="5" />
          <circle cx="50" cy="56" r="12" fill="#3aa64b" />
          <path d="M50 26V4" stroke="#26324a" strokeWidth="3" />
        </>,
        className,
      );
  }
}

export const Apple = ({ className, bitten }: S & { bitten?: boolean }) =>
  svg(
    <>
      <path d="M50 26q-4-14 6-20" stroke="#8a5a2b" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M56 18q14-8 22 2-12 8-22-2z" fill="#5cc96b" />
      <path d="M50 30c-20-12-40 2-38 26 2 26 22 40 38 34 16 6 36-8 38-34 2-24-18-38-38-26z" fill={bitten ? "#ffd6d6" : "#ff5a5a"} />
      {!bitten && <ellipse cx="34" cy="46" rx="6" ry="10" fill="#ff9a9a" transform="rotate(20 34 46)" />}
    </>,
    className,
  );

export function Monster({ className, chomping, color = "#a678f0" }: S & { chomping?: boolean; color?: string }) {
  return svg(
    <>
      <path d="M22 26 18 6l16 14zM78 26l4-20-16 14z" fill={color} />
      <path d="M14 60c0-30 16-44 36-44s36 14 36 44v26q-6-8-12 0-6-8-12 0-6-8-12 0-6-8-12 0-6-8-12 0-6-8-12 0z" fill={color} />
      <circle cx="38" cy="38" r="9" fill="#fff" />
      <circle cx="62" cy="38" r="9" fill="#fff" />
      <circle cx="40" cy="40" r="4.5" fill="#26324a" />
      <circle cx="60" cy="40" r="4.5" fill="#26324a" />
      {chomping ? (
        <ellipse cx="50" cy="62" rx="18" ry="14" fill="#26324a" />
      ) : (
        <path d="M32 58q18 16 36 0" stroke="#26324a" strokeWidth="5" fill="none" strokeLinecap="round" />
      )}
      {chomping && <path d="M36 52l4 6 4-6 4 6 4-6 4 6 4-6" stroke="#fff" strokeWidth="3" fill="none" />}
    </>,
    className,
  );
}

export const Flag = ({ className }: S) =>
  svg(
    <>
      <ellipse cx="34" cy="92" rx="18" ry="4" fill="rgba(0,0,0,.15)" />
      <rect x="30" y="10" width="6" height="82" rx="3" fill="#8a5a2b" />
      <path d="M36 12h46l-12 16 12 16H36z" fill="#ff6b6b" stroke="#d94848" strokeWidth="3" strokeLinejoin="round" />
    </>,
    className,
  );

export function Stone({ value, className }: S & { value: number }) {
  const minus = value < 0;
  return svg(
    <>
      <ellipse cx="50" cy="60" rx="40" ry="32" fill={minus ? "#d94848" : "#7b8db8"} />
      <ellipse cx="50" cy="54" rx="40" ry="32" fill={minus ? "#ff7a6b" : "#a9b8de"} />
      <text x="50" y="68" textAnchor="middle" fontSize="38" fontWeight="800" fill="#fff" fontFamily="sans-serif">
        {minus ? `−${-value}` : `+${value}`}
      </text>
    </>,
    className,
  );
}

/** Ten-frame dots for a number up to 20. */
export function TenFrame({ n, className }: S & { n: number }) {
  const frames = n > 10 ? 2 : 1;
  return (
    <svg viewBox={`0 0 100 ${frames * 44}`} className={className} aria-hidden>
      {Array.from({ length: frames * 10 }, (_, i) => {
        const f = Math.floor(i / 10);
        const k = i % 10;
        const x = 10 + (k % 5) * 20;
        const y = 12 + f * 44 + Math.floor(k / 5) * 20;
        return (
          <g key={i}>
            <rect x={x - 9} y={y - 9} width="18" height="18" fill="none" stroke="#c9d1de" strokeWidth="1.5" />
            {i < n && <circle cx={x} cy={y} r="6.5" fill={i < 10 ? "#ff7a6b" : "#4aa3ff"} />}
          </g>
        );
      })}
    </svg>
  );
}
