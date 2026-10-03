import { Crate, KeySprite, Penguin, Robot } from "@/components/grid/Sprites";
import { Carton, Cookie, Flower, HopBunny, Ladybug, MachineBox } from "@/components/math/Art";

const W = "#ffffff";
const INK = "#26324a";

const TilesIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="6" y="6" width="88" height="88" rx="14" fill="#8253d1" />
    {[1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => {
      const r = Math.floor(i / 3);
      const c = i % 3;
      return (
        <g key={n}>
          <rect x={12 + c * 26} y={12 + r * 26} width="24" height="24" rx="6" fill={W} />
          <text x={24 + c * 26} y={30 + r * 26} textAnchor="middle" fontSize="16" fontWeight="700" fill="#8253d1" fontFamily="sans-serif">
            {n}
          </text>
        </g>
      );
    })}
  </svg>
);

const MissingIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="4" y="22" width="92" height="56" rx="12" fill={W} />
    <path d="M14 64 25 38 36 64z" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    <text x="49" y="63" textAnchor="middle" fontSize="28" fontWeight="700" fill="#e04b8e" fontFamily="sans-serif">?</text>
    <rect x="62" y="40" width="22" height="22" fill="none" stroke={INK} strokeWidth="4" />
  </svg>
);

const NextShapeIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="18" cy="50" r="8" fill={W} />
    <circle cx="42" cy="50" r="12" fill={W} />
    <circle cx="72" cy="50" r="17" fill="none" stroke={W} strokeWidth="4" strokeDasharray="6 5" />
    <text x="72" y="59" textAnchor="middle" fontSize="24" fontWeight="700" fill={W} fontFamily="sans-serif">?</text>
  </svg>
);

const OddIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="28" cy="30" r="14" fill={W} />
    <circle cx="72" cy="30" r="14" fill={W} />
    <circle cx="28" cy="72" r="14" fill={W} />
    <rect x="58" y="58" width="28" height="28" rx="3" fill="#ffe066" transform="rotate(12 72 72)" />
  </svg>
);

const MagicIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="8" y="8" width="84" height="84" rx="12" fill={W} />
    <path d="M50 14v72M14 50h72" stroke="#c9d1de" strokeWidth="3" />
    <circle cx="31" cy="31" r="11" fill="#8253d1" />
    <rect x="58" y="20" width="22" height="22" fill="#8253d1" />
    <circle cx="31" cy="69" r="11" fill="none" stroke="#8253d1" strokeWidth="4" />
    <text x="69" y="80" textAnchor="middle" fontSize="28" fontWeight="700" fill="#e04b8e" fontFamily="sans-serif">?</text>
  </svg>
);

const NumbersIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {["1", "2", "?", "4"].map((t, i) => (
      <g key={i}>
        <rect x={4 + (i % 2) * 48} y={4 + Math.floor(i / 2) * 48} width="44" height="44" rx="10" fill={t === "?" ? "#ffe066" : W} />
        <text x={26 + (i % 2) * 48} y={38 + Math.floor(i / 2) * 48} textAnchor="middle" fontSize="30" fontWeight="700" fill={INK} fontFamily="sans-serif">
          {t}
        </text>
      </g>
    ))}
  </svg>
);

const FindIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <text x="14" y="30" fontSize="18" fontWeight="700" fill={W} fontFamily="sans-serif">7</text>
    <text x="70" y="22" fontSize="16" fontWeight="700" fill={W} fontFamily="sans-serif">12</text>
    <text x="76" y="90" fontSize="18" fontWeight="700" fill={W} fontFamily="sans-serif">5</text>
    <circle cx="44" cy="50" r="22" fill={W} stroke={INK} strokeWidth="6" />
    <text x="44" y="60" textAnchor="middle" fontSize="28" fontWeight="700" fill="#1fae9e" fontFamily="sans-serif">3</text>
    <path d="M60 66 80 86" stroke={INK} strokeWidth="9" strokeLinecap="round" />
  </svg>
);

export const GAME_ICONS: Record<string, React.ReactNode> = {
  "box-push": <Crate />,
  "ice-slide": <Penguin />,
  "key-maze": <KeySprite color="y" />,
  "slide-tiles": <TilesIcon />,
  "robot-path": <Robot />,
  "missing-pieces": <MissingIcon />,
  "whats-next": <NextShapeIcon />,
  "odd-one-out": <OddIcon />,
  "magic-square": <MagicIcon />,
  "bug-flash": <Ladybug />,
  "bunny-hops": <HopBunny />,
  garden: <Flower color={0} />,
  "cookie-party": <Cookie />,
  packing: <Carton capacity={4} filled={3} />,
  "magic-machine": <MachineBox label="× 2" className="w-full h-full" />,
  "missing-numbers": <NumbersIcon />,
  "find-numbers": <FindIcon />,
};
