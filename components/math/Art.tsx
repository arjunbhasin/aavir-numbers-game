/** Drawings for the multiplication and division games. All use a 100x100 box. */

type S = { className?: string };
const svg = (children: React.ReactNode, className = "w-full h-full", label?: string) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
    {children}
  </svg>
);

/* ---------- Cookie Party ---------- */

export const Cookie = ({ className }: S) =>
  svg(
    <>
      <circle cx="50" cy="52" r="40" fill="#c98b4a" />
      <circle cx="50" cy="48" r="40" fill="#e9a95f" />
      <circle cx="34" cy="34" r="6" fill="#5b3a1e" />
      <circle cx="62" cy="30" r="5" fill="#5b3a1e" />
      <circle cx="66" cy="56" r="6.5" fill="#5b3a1e" />
      <circle cx="40" cy="62" r="5" fill="#5b3a1e" />
      <circle cx="52" cy="46" r="3.5" fill="#5b3a1e" />
    </>,
    className,
  );

export const Plate = ({ className }: S) =>
  svg(
    <>
      <ellipse cx="50" cy="58" rx="48" ry="30" fill="#d7e2f0" />
      <ellipse cx="50" cy="54" rx="48" ry="30" fill="#ffffff" />
      <ellipse cx="50" cy="54" rx="34" ry="20" fill="none" stroke="#e3ebf5" strokeWidth="4" />
    </>,
    className,
  );

export type AnimalKind = "bear" | "cat" | "frog" | "pig" | "bunny" | "owl";
export const ANIMALS: AnimalKind[] = ["bear", "cat", "frog", "pig", "owl", "bunny"];

const ANIMAL_COLORS: Record<AnimalKind, { main: string; dark: string; inner: string }> = {
  bear: { main: "#c98b4a", dark: "#9c6430", inner: "#f2cf9e" },
  cat: { main: "#ffb347", dark: "#e08a12", inner: "#ffe2b8" },
  frog: { main: "#6fd27b", dark: "#3aa64b", inner: "#d6f5d0" },
  pig: { main: "#ffa3c4", dark: "#e47aa0", inner: "#ffd6e5" },
  bunny: { main: "#e7e9f2", dark: "#b9bfd3", inner: "#ffd6e5" },
  owl: { main: "#a678f0", dark: "#7c4fd0", inner: "#e6d9ff" },
};

/** A round animal face. `mood` changes the mouth: happy, sad or waiting. */
export function Animal({ kind, mood = "wait", className }: S & { kind: AnimalKind; mood?: "happy" | "sad" | "wait" }) {
  const c = ANIMAL_COLORS[kind];
  const mouth =
    mood === "happy" ? "M38 62q12 12 24 0" : mood === "sad" ? "M38 68q12-10 24 0" : "M42 64h16";
  return svg(
    <>
      {kind === "bear" && (
        <>
          <circle cx="22" cy="24" r="12" fill={c.main} />
          <circle cx="78" cy="24" r="12" fill={c.main} />
          <circle cx="22" cy="24" r="6" fill={c.inner} />
          <circle cx="78" cy="24" r="6" fill={c.inner} />
        </>
      )}
      {kind === "cat" && (
        <>
          <path d="M16 36 22 6l22 18z" fill={c.main} />
          <path d="M84 36 78 6 56 24z" fill={c.main} />
        </>
      )}
      {kind === "bunny" && (
        <>
          <ellipse cx="34" cy="16" rx="9" ry="22" fill={c.main} />
          <ellipse cx="66" cy="16" rx="9" ry="22" fill={c.main} />
          <ellipse cx="34" cy="18" rx="4" ry="15" fill={c.inner} />
          <ellipse cx="66" cy="18" rx="4" ry="15" fill={c.inner} />
        </>
      )}
      {kind === "pig" && (
        <>
          <path d="M18 30 20 10l18 12z" fill={c.dark} />
          <path d="M82 30 80 10 62 22z" fill={c.dark} />
        </>
      )}
      {kind === "owl" && (
        <>
          <path d="M20 30 18 8l20 14z" fill={c.dark} />
          <path d="M80 30 82 8 62 22z" fill={c.dark} />
        </>
      )}
      <circle cx="50" cy="54" r="38" fill={c.main} />
      {kind === "frog" && (
        <>
          <circle cx="32" cy="26" r="13" fill={c.main} />
          <circle cx="68" cy="26" r="13" fill={c.main} />
          <circle cx="32" cy="26" r="8" fill="#fff" />
          <circle cx="68" cy="26" r="8" fill="#fff" />
        </>
      )}
      {kind === "owl" && (
        <>
          <circle cx="36" cy="46" r="13" fill={c.inner} />
          <circle cx="64" cy="46" r="13" fill={c.inner} />
        </>
      )}
      <ellipse cx="50" cy="64" rx="20" ry="15" fill={c.inner} />
      <circle cx={kind === "frog" ? 32 : 36} cy={kind === "frog" ? 26 : 46} r="5" fill="#26324a" />
      <circle cx={kind === "frog" ? 68 : 64} cy={kind === "frog" ? 26 : 46} r="5" fill="#26324a" />
      {kind === "pig" ? (
        <>
          <ellipse cx="50" cy="58" rx="10" ry="7" fill={c.dark} />
          <circle cx="46" cy="58" r="2" fill="#26324a" />
          <circle cx="54" cy="58" r="2" fill="#26324a" />
        </>
      ) : kind === "owl" ? (
        <path d="M45 54h10l-5 8z" fill="#ffc93c" />
      ) : (
        <ellipse cx="50" cy="56" rx="5" ry="3.5" fill="#26324a" />
      )}
      <path d={mouth} stroke="#26324a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {mood === "happy" && (
        <>
          <circle cx="26" cy="62" r="5" fill="#ff8fb3" opacity=".6" />
          <circle cx="74" cy="62" r="5" fill="#ff8fb3" opacity=".6" />
        </>
      )}
    </>,
    className,
  );
}

export const Dog = ({ className, happy }: S & { happy?: boolean }) =>
  svg(
    <>
      <ellipse cx="18" cy="46" rx="12" ry="24" fill="#8a5a2b" transform="rotate(15 18 46)" />
      <ellipse cx="82" cy="46" rx="12" ry="24" fill="#8a5a2b" transform="rotate(-15 82 46)" />
      <circle cx="50" cy="52" r="34" fill="#d9a066" />
      <ellipse cx="50" cy="66" rx="18" ry="13" fill="#f2d3ad" />
      <circle cx="38" cy="44" r="5" fill="#26324a" />
      <circle cx="62" cy="44" r="5" fill="#26324a" />
      <ellipse cx="50" cy="58" rx="7" ry="5" fill="#26324a" />
      <path d={happy ? "M40 68q10 10 20 0" : "M42 70h16"} stroke="#26324a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {happy && <path d="M47 72q3 10 6 0z" fill="#ff7a9a" />}
    </>,
    className,
  );

/* ---------- Bunny Hops ---------- */

export const HopBunny = ({ className }: S) =>
  svg(
    <>
      <ellipse cx="50" cy="94" rx="24" ry="5" fill="rgba(0,0,0,.15)" />
      <ellipse cx="38" cy="22" rx="8" ry="20" fill="#fff" stroke="#cfd5e6" strokeWidth="3" />
      <ellipse cx="60" cy="20" rx="8" ry="20" fill="#fff" stroke="#cfd5e6" strokeWidth="3" />
      <ellipse cx="38" cy="24" rx="3.5" ry="13" fill="#ffc2d6" />
      <ellipse cx="60" cy="22" rx="3.5" ry="13" fill="#ffc2d6" />
      <ellipse cx="50" cy="72" rx="26" ry="22" fill="#fff" stroke="#cfd5e6" strokeWidth="3" />
      <circle cx="50" cy="48" r="20" fill="#fff" stroke="#cfd5e6" strokeWidth="3" />
      <circle cx="43" cy="45" r="3.5" fill="#26324a" />
      <circle cx="57" cy="45" r="3.5" fill="#26324a" />
      <ellipse cx="50" cy="53" rx="3.5" ry="2.5" fill="#ff8fb3" />
      <path d="M45 57q5 4 10 0" stroke="#26324a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="76" cy="76" r="7" fill="#fff" stroke="#cfd5e6" strokeWidth="3" />
    </>,
    className,
  );

export const Carrot = ({ className }: S) =>
  svg(
    <>
      <path d="M44 22q-10-14 0-18 4 8 6 16 2-12 12-14 2 10-8 18z" fill="#4cc35d" />
      <path d="M36 28q14-10 28 0L52 94q-2 4-4 0z" fill="#ff9f43" stroke="#e57f1a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M42 44h8M46 60h7M48 76h4" stroke="#e57f1a" strokeWidth="3" strokeLinecap="round" />
    </>,
    className,
  );

export const Splash = ({ className }: S) =>
  svg(
    <>
      <ellipse cx="50" cy="70" rx="40" ry="14" fill="#7cc4f2" />
      <ellipse cx="50" cy="68" rx="30" ry="9" fill="#a9dbff" />
    </>,
    className,
  );

/* ---------- Garden Builder ---------- */

const PETALS = ["#ff7a9a", "#ffc93c", "#a678f0", "#ff9f43", "#4aa3ff"];

export const Flower = ({ className, color = 0 }: S & { color?: number }) =>
  svg(
    <>
      <path d="M50 54v38" stroke="#3aa64b" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 78q-14-2-18-14 14 0 18 10" fill="#4cc35d" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="50" cy="26" rx="10" ry="16" fill={PETALS[color % PETALS.length]} transform={`rotate(${a} 50 42)`} />
      ))}
      <circle cx="50" cy="42" r="9" fill="#ffe066" stroke="#e8a800" strokeWidth="3" />
    </>,
    className,
  );

export const Sprout = ({ className }: S) =>
  svg(
    <>
      <path d="M50 88V56" stroke="#3aa64b" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 60q-20 0-24-18 20-2 24 14" fill="#5cc96b" />
      <path d="M50 64q18-2 24-18-20-2-24 14" fill="#4cc35d" />
    </>,
    className,
  );

/* ---------- Packing Day ---------- */

export const Egg = ({ className }: S) =>
  svg(
    <>
      <ellipse cx="50" cy="90" rx="22" ry="5" fill="rgba(0,0,0,.12)" />
      <path d="M50 12c18 0 30 30 30 48a30 30 0 0 1-60 0c0-18 12-48 30-48z" fill="#fff8ec" stroke="#e8d3b0" strokeWidth="4" />
      <ellipse cx="40" cy="38" rx="6" ry="10" fill="#fff" transform="rotate(20 40 38)" />
    </>,
    className,
  );

/** An egg box with `capacity` holes, `filled` of them holding eggs. */
export function Carton({ capacity, filled, className }: S & { capacity: number; filled: number }) {
  const cols = capacity <= 3 ? capacity : Math.ceil(capacity / 2);
  const rows = capacity <= 3 ? 1 : 2;
  const full = filled >= capacity;
  const cell = 80 / Math.max(cols, rows * 1.4);
  const w = cols * cell;
  const h = rows * cell;
  const x0 = 50 - w / 2;
  const y0 = 54 - h / 2;
  return svg(
    <>
      <rect x="4" y="14" width="92" height="80" rx="12" fill={full ? "#3aa64b" : "#c99a63"} />
      <rect x="4" y="10" width="92" height="80" rx="12" fill={full ? "#5cc96b" : "#e3b77f"} />
      {Array.from({ length: capacity }, (_, i) => {
        const r = rows === 1 ? 0 : Math.floor(i / cols);
        const c = rows === 1 ? i : i % cols;
        const cx = x0 + c * cell + cell / 2;
        const cy = y0 + r * cell + cell / 2;
        return i < filled ? (
          <ellipse key={i} cx={cx} cy={cy} rx={cell * 0.36} ry={cell * 0.42} fill="#fff8ec" stroke="#e8d3b0" strokeWidth="2" />
        ) : (
          <circle key={i} cx={cx} cy={cy} r={cell * 0.34} fill={full ? "#3aa64b" : "#b98a52"} />
        );
      })}
      <text x="88" y="28" textAnchor="end" fontSize="16" fontWeight="700" fill="#fff" fontFamily="sans-serif">
        {full ? "✓" : `${filled}/${capacity}`}
      </text>
    </>,
    className,
  );
}

/* ---------- Bug Count Flash ---------- */

export const Ladybug = ({ className }: S) =>
  svg(
    <>
      <circle cx="50" cy="22" r="13" fill="#26324a" />
      <ellipse cx="50" cy="58" rx="34" ry="36" fill="#ff5a5a" stroke="#26324a" strokeWidth="4" />
      <path d="M50 24v70" stroke="#26324a" strokeWidth="4" />
      <circle cx="34" cy="48" r="7" fill="#26324a" />
      <circle cx="66" cy="48" r="7" fill="#26324a" />
      <circle cx="36" cy="72" r="6" fill="#26324a" />
      <circle cx="64" cy="72" r="6" fill="#26324a" />
      <circle cx="44" cy="18" r="3" fill="#fff" />
      <circle cx="56" cy="18" r="3" fill="#fff" />
    </>,
    className,
  );

export const Leaf = ({ className }: S) =>
  svg(
    <>
      <path d="M8 60Q20 8 92 12 86 82 30 90 14 84 8 60z" fill="#5cc96b" stroke="#3aa64b" strokeWidth="4" />
      <path d="M20 80Q48 48 84 20" stroke="#3aa64b" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>,
    className,
  );

/* ---------- Magic Machine ---------- */

export function MachineBox({ label, className, busy }: S & { label: string; busy?: boolean }) {
  return (
    <svg viewBox="0 0 160 140" className={className} role="img" aria-label={`Machine: ${label}`}>
      <rect x="20" y="30" width="120" height="96" rx="18" fill="#7c4fd0" />
      <rect x="20" y="24" width="120" height="96" rx="18" fill="#a678f0" />
      <rect x="40" y="40" width="80" height="50" rx="12" fill="#fff" />
      <text x="80" y="76" textAnchor="middle" fontSize="32" fontWeight="800" fill="#7c4fd0" fontFamily="sans-serif">
        {label}
      </text>
      <circle cx="50" cy="104" r="7" fill={busy ? "#ffe066" : "#ffc93c"} />
      <circle cx="80" cy="104" r="7" fill={busy ? "#5cc96b" : "#3aa64b"} />
      <circle cx="110" cy="104" r="7" fill={busy ? "#ff8fb3" : "#ff6fae"} />
      <rect x="60" y="6" width="10" height="20" rx="3" fill="#7c4fd0" />
      <rect x="90" y="10" width="10" height="16" rx="3" fill="#7c4fd0" />
      <rect x="0" y="62" width="22" height="26" rx="4" fill="#5a6785" />
      <rect x="138" y="62" width="22" height="26" rx="4" fill="#5a6785" />
    </svg>
  );
}
