import { Crate, KeySprite, Penguin, Robot } from "@/components/grid/Sprites";
import { Carton, Cookie, Flower, HopBunny, Ladybug, MachineBox } from "@/components/math/Art";
import { Coin, Monster, Stone } from "@/components/math/AddArt";
import Abacus from "@/components/abacus/Abacus";
import { WORD_PICTURES } from "@/components/words/WordPictures";

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

const MakeTenIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {[
      [8, "3", -8],
      [52, "7", 8],
    ].map(([x, t, r]) => (
      <g key={t as string} transform={`rotate(${r} ${(x as number) + 20} 50)`}>
        <rect x={x as number} y="18" width="40" height="56" rx="10" fill={W} />
        <text x={(x as number) + 20} y="60" textAnchor="middle" fontSize="34" fontWeight="800" fill="#d98a00" fontFamily="sans-serif">
          {t}
        </text>
      </g>
    ))}
    <text x="50" y="96" textAnchor="middle" fontSize="18" fontWeight="800" fill={W} fontFamily="sans-serif">= 10</text>
  </svg>
);

const ScaleIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="47" y="24" width="6" height="62" rx="3" fill={W} />
    <rect x="30" y="84" width="40" height="8" rx="4" fill={W} />
    <rect x="10" y="22" width="80" height="6" rx="3" fill={W} />
    <path d="M14 28 6 52h28zM86 28l-8 24h28z" fill="none" stroke={W} strokeWidth="3" />
    <path d="M4 52h32q-2 10-16 10T4 52zM64 52h32q-2 10-16 10T64 52z" fill={W} />
    <rect x="12" y="40" width="8" height="8" fill="#ffc93c" />
    <rect x="21" y="40" width="8" height="8" fill="#ff7a6b" />
    <rect x="76" y="40" width="8" height="8" fill="#5cc96b" />
  </svg>
);

const CardsIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="8" y="16" width="38" height="52" rx="8" fill="#8253d1" transform="rotate(-10 27 42)" />
    <text x="27" y="52" textAnchor="middle" fontSize="26" fontWeight="800" fill={W} fontFamily="sans-serif" transform="rotate(-10 27 42)">?</text>
    <rect x="50" y="30" width="38" height="52" rx="8" fill={W} transform="rotate(8 69 56)" />
    <circle cx="69" cy="56" r="11" fill="#ff7a6b" transform="rotate(8 69 56)" />
  </svg>
);

const LightsIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="36" y="6" width="28" height="28" rx="8" fill="#ffe066" />
    <rect x="66" y="36" width="28" height="28" rx="8" fill={W} />
    <rect x="36" y="66" width="28" height="28" rx="8" fill={W} />
    <rect x="6" y="36" width="28" height="28" rx="8" fill={W} />
    <circle cx="50" cy="20" r="18" fill="#fff59a" opacity=".45" />
  </svg>
);

const TrayIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="6" y="22" width="88" height="60" rx="12" fill={W} />
    <circle cx="28" cy="42" r="10" fill="#ff6b6b" />
    <rect x="62" y="32" width="20" height="20" rx="4" fill="#4aa3ff" />
    <path d="M28 76l-12 0 12-18 12 18z" fill="#5cc96b" />
    <rect x="58" y="58" width="28" height="20" rx="5" fill="none" stroke="#e8a800" strokeWidth="3" strokeDasharray="5 4" />
    <text x="72" y="74" textAnchor="middle" fontSize="16" fontWeight="800" fill="#e8a800" fontFamily="sans-serif">?</text>
  </svg>
);

const FeetIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {[
      [22, 76],
      [42, 58],
      [36, 34],
      [60, 22],
      [78, 40],
    ].map(([x, y], i) => (
      <g key={i}>
        <ellipse cx={x} cy={y} rx="7" ry="10" fill={W} opacity={0.5 + i * 0.12} />
      </g>
    ))}
  </svg>
);

const TextIcon = ({ lines, size = 30 }: { lines: string[]; size?: number }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect x="4" y={50 - lines.length * (size * 0.65)} width="92" height={lines.length * size * 1.3} rx="14" fill={W} />
    {lines.map((l, i) => (
      <text key={i} x="50" y={50 - (lines.length - 1) * size * 0.65 + i * size * 1.3 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight="800" fill={INK} fontFamily="sans-serif">
        {l}
      </text>
    ))}
  </svg>
);

const TilesWordIcon = ({ letters, gap }: { letters: string; gap?: number }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {letters.split("").map((ch, i) => {
      const x = 50 - (letters.length * 28) / 2 + i * 28 + 1;
      return (
        <g key={i}>
          <rect x={x} y="34" width="26" height="32" rx="6" fill={i === gap ? "#ffe066" : W} />
          <text x={x + 13} y="59" textAnchor="middle" fontSize="22" fontWeight="800" fill={INK} fontFamily="sans-serif">
            {i === gap ? "?" : ch}
          </text>
        </g>
      );
    })}
  </svg>
);

const GridWordIcon = ({ highlight }: { highlight: "cross" | "search" }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {Array.from({ length: 16 }, (_, i) => {
      const r = Math.floor(i / 4);
      const c = i % 4;
      const on = highlight === "cross" ? r === 1 || c === 2 : r === 2 && c > 0;
      const hidden = highlight === "cross" && !(r === 1 || c === 2);
      if (hidden) return null;
      return <rect key={i} x={10 + c * 21} y={10 + r * 21} width="19" height="19" rx="4" fill={on ? "#ffe066" : W} />;
    })}
    {highlight === "search" && <rect x="29" y="50" width="61" height="21" rx="10" fill="none" stroke={INK} strokeWidth="3" />}
  </svg>
);

const RhymeIcon = () => (
  <div className="w-full h-full grid grid-cols-2 gap-1 items-center">
    <span className="aspect-square bg-white rounded-xl p-1">{WORD_PICTURES.cat}</span>
    <span className="aspect-square bg-white rounded-xl p-1">{WORD_PICTURES.hat}</span>
  </div>
);

const RaceCarIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M10 78q40-18 80 0" stroke="#fff" strokeWidth="6" fill="none" strokeDasharray="10 8" />
    <rect x="34" y="16" width="32" height="24" rx="10" fill="#4aa3ff" />
    <rect x="28" y="30" width="44" height="14" rx="6" fill="#cfe9ff" />
    <rect x="14" y="38" width="72" height="28" rx="10" fill="#ff5a5a" />
    <rect x="14" y="56" width="72" height="10" rx="5" fill="#d94848" />
    <rect x="20" y="44" width="12" height="7" rx="3" fill="#ffe066" />
    <rect x="68" y="44" width="12" height="7" rx="3" fill="#ffe066" />
    <rect x="10" y="58" width="16" height="14" rx="4" fill="#26324a" />
    <rect x="74" y="58" width="16" height="14" rx="4" fill="#26324a" />
  </svg>
);

export const GAME_ICONS: Record<string, React.ReactNode> = {
  "rainbow-rally": <RaceCarIcon />,
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
  "make-ten": <MakeTenIcon />,
  balance: <ScaleIcon />,
  "coin-shop": <Coin value={5} />,
  "monster-munch": <Monster />,
  "sum-path": <Stone value={3} />,
  "pair-match": <CardsIcon />,
  "copy-lights": <LightsIcon />,
  "whats-missing": <TrayIcon />,
  footprints: <FeetIcon />,
  "bead-reader": <Abacus value={7} rods={1} labels={false} className="h-full mx-auto" />,
  "friend-finder": <TextIcon lines={["3 + 2", "= 5"]} size={24} />,
  "which-formula": <TextIcon lines={["+4 =", "+5 − 1"]} size={22} />,
  "abacus-sums": <Abacus value={27} rods={2} labels={false} className="h-full mx-auto" />,
  "flash-abacus": <TextIcon lines={["4 + 3", "+ 2 ?"]} size={24} />,
  "friend-pairs": <TextIcon lines={["4 ♥ 6"]} size={28} />,
  crossword: <GridWordIcon highlight="cross" />,
  "missing-letter": <TilesWordIcon letters="cat" gap={1} />,
  "spell-it": <TilesWordIcon letters="sun" />,
  "word-search": <GridWordIcon highlight="search" />,
  "rhyme-time": <RhymeIcon />,
  "word-ladder": <TextIcon lines={["CAT", "↓ HAT"]} size={22} />,
  "missing-numbers": <NumbersIcon />,
  "find-numbers": <FindIcon />,
};
