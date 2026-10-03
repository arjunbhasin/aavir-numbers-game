import type { ReactNode } from "react";
import { Crate, Fish, KeySprite } from "@/components/grid/Sprites";
import { Animal, Egg, Leaf } from "@/components/math/Art";
import { ToyArt } from "@/components/math/AddArt";
import { StarIcon } from "@/components/ui/Icons";
import type { Word } from "@/games/words/words";

const S = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
    {children}
  </svg>
);
const INK = "#26324a";

/** One clear drawing per word. Typed so every word in the list must have a picture. */
export const WORD_PICTURES: Record<Word, ReactNode> = {
  cat: <Animal kind="cat" mood="happy" />,
  pig: <Animal kind="pig" mood="happy" />,
  frog: <Animal kind="frog" mood="happy" />,
  owl: (
    <S>
      <path d="M22 26 30 8l10 14M78 26 70 8 60 22" fill="#8a5a2b" />
      <ellipse cx="50" cy="56" rx="32" ry="38" fill="#a0693a" />
      <ellipse cx="50" cy="66" rx="20" ry="24" fill="#f2cf9e" />
      <path d="M38 66q4 4 8 0M54 66q4 4 8 0M42 76q4 4 8 0M50 76q4 4 8 0" stroke="#c99a63" strokeWidth="2.5" fill="none" />
      <circle cx="36" cy="40" r="13" fill="#fff" />
      <circle cx="64" cy="40" r="13" fill="#fff" />
      <circle cx="36" cy="41" r="6" fill={INK} />
      <circle cx="64" cy="41" r="6" fill={INK} />
      <path d="M45 50h10l-5 9z" fill="#ffb020" />
      <path d="M38 92h8M54 92h8" stroke="#ffb020" strokeWidth="4" strokeLinecap="round" />
    </S>
  ),
  fish: <Fish />,
  duck: <ToyArt toy="duck" />,
  ball: <ToyArt toy="ball" />,
  car: <ToyArt toy="car" />,
  kite: <ToyArt toy="kite" />,
  drum: <ToyArt toy="drum" />,
  key: <KeySprite color="y" />,
  star: <StarIcon className="w-full h-full" />,
  box: <Crate />,
  egg: <Egg />,
  leaf: <Leaf />,
  hat: (
    <S>
      <ellipse cx="50" cy="72" rx="44" ry="12" fill="#4a5a8a" />
      <path d="M26 70V36q0-14 24-14t24 14v34z" fill="#5a6ca6" />
      <rect x="26" y="56" width="48" height="10" fill="#ff6b6b" />
    </S>
  ),
  bat: (
    <S>
      <path d="M50 40C40 28 22 26 6 34c8 4 10 12 8 20 8-6 16-4 20 2 4-6 10-8 16-6z" fill="#5a4a7a" />
      <path d="M50 40c10-12 28-14 44-6-8 4-10 12-8 20-8-6-16-4-20 2-4-6-10-8-16-6z" fill="#5a4a7a" />
      <ellipse cx="50" cy="52" rx="12" ry="16" fill="#6b5a8f" />
      <path d="M42 38l2-10 5 7M58 38l-2-10-5 7" fill="#6b5a8f" />
      <circle cx="45" cy="48" r="3" fill="#fff" />
      <circle cx="55" cy="48" r="3" fill="#fff" />
    </S>
  ),
  rat: (
    <S>
      <path d="M86 70q14-2 8-18" stroke="#c9a0a0" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="56" cy="66" rx="32" ry="20" fill="#a9b2c3" />
      <path d="M30 60 8 66l22 10z" fill="#a9b2c3" />
      <circle cx="34" cy="48" r="10" fill="#a9b2c3" />
      <circle cx="34" cy="48" r="5" fill="#ffc2d6" />
      <circle cx="22" cy="62" r="2.5" fill={INK} />
      <circle cx="8" cy="67" r="3" fill="#ff8fb3" />
    </S>
  ),
  dog: (
    <S>
      <ellipse cx="20" cy="46" rx="12" ry="24" fill="#8a5a2b" transform="rotate(15 20 46)" />
      <ellipse cx="80" cy="46" rx="12" ry="24" fill="#8a5a2b" transform="rotate(-15 80 46)" />
      <circle cx="50" cy="52" r="32" fill="#d9a066" />
      <ellipse cx="50" cy="66" rx="17" ry="12" fill="#f2d3ad" />
      <circle cx="39" cy="45" r="4.5" fill={INK} />
      <circle cx="61" cy="45" r="4.5" fill={INK} />
      <ellipse cx="50" cy="58" rx="7" ry="5" fill={INK} />
      <path d="M41 68q9 9 18 0" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </S>
  ),
  log: (
    <S>
      <rect x="12" y="38" width="70" height="34" rx="6" fill="#a0693a" />
      <path d="M20 46h40M26 58h46M18 66h30" stroke="#7d4f28" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="82" cy="55" rx="10" ry="17" fill="#e3b77f" stroke="#a0693a" strokeWidth="4" />
      <ellipse cx="82" cy="55" rx="4" ry="8" fill="none" stroke="#c99a63" strokeWidth="2" />
    </S>
  ),
  bug: (
    <S>
      <path d="M30 40 18 30M70 40l12-10M28 58H12M72 58h16M30 74l-12 10M70 74l12 10" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="50" cy="60" rx="24" ry="28" fill="#4cc35d" />
      <circle cx="50" cy="30" r="12" fill={INK} />
      <path d="M50 34v52" stroke="#2f9a40" strokeWidth="3" />
    </S>
  ),
  mug: (
    <S>
      <rect x="20" y="28" width="48" height="56" rx="8" fill="#4aa3ff" />
      <path d="M68 40h8a10 10 0 0 1 0 22h-8" stroke="#4aa3ff" strokeWidth="8" fill="none" />
      <path d="M32 18q4 6 0 12M44 14q4 6 0 12M56 18q4 6 0 12" stroke="#a9b2c3" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="44" cy="56" r="9" fill="#fff" opacity=".5" />
    </S>
  ),
  rug: (
    <S>
      <rect x="10" y="28" width="80" height="48" rx="6" fill="#ff7a6b" />
      <rect x="18" y="36" width="64" height="32" rx="4" fill="none" stroke="#ffc93c" strokeWidth="4" />
      <path d="M50 42l8 10-8 10-8-10z" fill="#ffc93c" />
      <path d="M10 32H4M10 44H4M10 56H4M10 68H4M90 32h6M90 44h6M90 56h6M90 68h6" stroke="#e35a4a" strokeWidth="3" />
    </S>
  ),
  jar: (
    <S>
      <rect x="28" y="12" width="44" height="12" rx="3" fill="#e35a4a" />
      <path d="M30 24h40q6 6 6 16v42q0 8-8 8H32q-8 0-8-8V40q0-10 6-16z" fill="#cdeaff" stroke="#7cc4f2" strokeWidth="4" />
      <path d="M28 54h44v26q0 6-6 6H34q-6 0-6-6z" fill="#ff9f43" />
    </S>
  ),
  bee: (
    <S>
      <ellipse cx="38" cy="32" rx="14" ry="10" fill="#cdeaff" transform="rotate(-25 38 32)" />
      <ellipse cx="62" cy="32" rx="14" ry="10" fill="#cdeaff" transform="rotate(25 62 32)" />
      <ellipse cx="50" cy="58" rx="30" ry="22" fill="#ffd94a" />
      <path d="M40 38v40M54 37v42" stroke={INK} strokeWidth="7" />
      <circle cx="24" cy="54" r="4" fill={INK} />
      <path d="M80 58l10 0" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </S>
  ),
  tree: (
    <S>
      <rect x="44" y="60" width="12" height="32" rx="3" fill="#8a5a2b" />
      <circle cx="50" cy="38" r="26" fill="#4cc35d" />
      <circle cx="32" cy="52" r="16" fill="#5cc96b" />
      <circle cx="68" cy="52" r="16" fill="#5cc96b" />
      <circle cx="40" cy="34" r="4" fill="#ff6b6b" />
      <circle cx="62" cy="44" r="4" fill="#ff6b6b" />
    </S>
  ),
  boat: (
    <S>
      <path d="M52 12v52" stroke="#8a5a2b" strokeWidth="4" />
      <path d="M54 14l28 40H54z" fill="#fff" stroke="#a9b2c3" strokeWidth="3" />
      <path d="M50 22 26 54h24z" fill="#ffc93c" />
      <path d="M10 62h80l-12 20H22z" fill="#ff6b6b" />
      <path d="M4 88q12-6 24 0t24 0 24 0 24 0" stroke="#4aa3ff" strokeWidth="4" fill="none" />
    </S>
  ),
  coat: (
    <S>
      <path d="M36 14h28l22 16-8 20-8-6v42H30V44l-8 6-8-20z" fill="#a678f0" />
      <path d="M36 14l14 18 14-18" fill="#7c4fd0" />
      <path d="M50 32v54" stroke="#7c4fd0" strokeWidth="3" />
      <circle cx="56" cy="46" r="3" fill="#ffc93c" />
      <circle cx="56" cy="60" r="3" fill="#ffc93c" />
      <circle cx="56" cy="74" r="3" fill="#ffc93c" />
    </S>
  ),
  goat: (
    <S>
      <path d="M36 22q-8-16 4-16M64 22q8-16-4-16" stroke="#a9b2c3" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="34" rx="12" ry="6" fill="#e7e9f2" transform="rotate(-20 20 34)" />
      <ellipse cx="80" cy="34" rx="12" ry="6" fill="#e7e9f2" transform="rotate(20 80 34)" />
      <path d="M30 34q20-14 40 0l-6 40q-14 10-28 0z" fill="#fff" stroke="#cfd5e6" strokeWidth="3" />
      <circle cx="42" cy="44" r="3.5" fill={INK} />
      <circle cx="58" cy="44" r="3.5" fill={INK} />
      <ellipse cx="50" cy="66" rx="9" ry="6" fill="#ffc2d6" />
      <path d="M46 76q4 14 8 0" fill="#e7e9f2" />
    </S>
  ),
  fan: (
    <S>
      <rect x="46" y="58" width="8" height="26" fill="#a9b2c3" />
      <rect x="32" y="82" width="36" height="8" rx="4" fill="#7b8db8" />
      <circle cx="50" cy="40" r="30" fill="none" stroke="#7b8db8" strokeWidth="4" />
      <path d="M50 40q-6-22 8-24 6 14-8 24zM50 40q22-6 24 8-14 6-24-8zM50 40q6 22-8 24-6-14 8-24zM50 40q-22 6-24-8 14-6 24 8z" fill="#4aa3ff" />
      <circle cx="50" cy="40" r="5" fill="#2b7fdc" />
    </S>
  ),
  van: (
    <S>
      <path d="M8 34h56l14 14h12v22H8z" fill="#5cc96b" stroke="#3aa64b" strokeWidth="3" strokeLinejoin="round" />
      <path d="M66 38l10 10H66z" fill="#eaf6ff" />
      <rect x="16" y="40" width="16" height="12" rx="2" fill="#eaf6ff" />
      <rect x="38" y="40" width="16" height="12" rx="2" fill="#eaf6ff" />
      <circle cx="26" cy="72" r="9" fill={INK} />
      <circle cx="72" cy="72" r="9" fill={INK} />
    </S>
  ),
  can: (
    <S>
      <rect x="28" y="16" width="44" height="70" rx="6" fill="#d7dde8" />
      <ellipse cx="50" cy="18" rx="22" ry="6" fill="#a9b2c3" />
      <rect x="28" y="34" width="44" height="34" fill="#ff6b6b" />
      <path d="M40 52l10-10 10 10-10 10z" fill="#ffc93c" />
    </S>
  ),
  hen: (
    <S>
      <path d="M40 16q4-8 8 0 4-8 8 0 2 6-6 8h-6q-6-2-4-8z" fill="#ff5a5a" />
      <ellipse cx="54" cy="62" rx="32" ry="24" fill="#fff" stroke="#e7e9f2" strokeWidth="3" />
      <circle cx="46" cy="34" r="14" fill="#fff" stroke="#e7e9f2" strokeWidth="3" />
      <path d="M32 34h-10l10 6z" fill="#ff9f43" />
      <circle cx="42" cy="32" r="3" fill={INK} />
      <path d="M36 44q2 6 6 4" fill="#ff5a5a" />
      <path d="M48 86v8M62 86v8" stroke="#ff9f43" strokeWidth="4" strokeLinecap="round" />
    </S>
  ),
  pen: (
    <S>
      <g transform="rotate(35 50 50)">
        <rect x="42" y="8" width="16" height="64" rx="4" fill="#4aa3ff" />
        <rect x="42" y="8" width="16" height="16" rx="4" fill="#2b7fdc" />
        <path d="M42 72h16l-8 18z" fill="#f2cf9e" />
        <path d="M47 82h6l-3 8z" fill={INK} />
        <rect x="56" y="12" width="4" height="26" rx="2" fill="#2b7fdc" />
      </g>
    </S>
  ),
  fox: (
    <S>
      <path d="M16 18l14 26-18 0zM84 18 70 44l18 0z" fill="#ff8a3d" />
      <path d="M12 40q38-14 76 0-6 28-38 44Q18 68 12 40z" fill="#ff8a3d" />
      <path d="M30 56q20 30 40 0-10 22-20 26-10-4-20-26z" fill="#fff" />
      <circle cx="36" cy="50" r="4" fill={INK} />
      <circle cx="64" cy="50" r="4" fill={INK} />
      <circle cx="50" cy="74" r="4.5" fill={INK} />
    </S>
  ),
  bell: (
    <S>
      <circle cx="50" cy="14" r="6" fill="#e0a300" />
      <path d="M50 18c-18 0-24 16-24 34 0 14-8 20-12 24h72c-4-4-12-10-12-24 0-18-6-34-24-34z" fill="#ffc93c" stroke="#e0a300" strokeWidth="3" />
      <circle cx="50" cy="84" r="7" fill="#e0a300" />
      <path d="M36 34q4-8 10-8" stroke="#fff3b0" strokeWidth="4" fill="none" strokeLinecap="round" />
    </S>
  ),
  shell: (
    <S>
      <path d="M50 18 12 70q38 20 76 0z" fill="#ffc2d6" stroke="#ff8fb3" strokeWidth="4" strokeLinejoin="round" />
      <path d="M50 18 30 74M50 18v60M50 18l20 56M50 18 18 70M50 18l32 52" stroke="#ff8fb3" strokeWidth="3" />
      <path d="M40 80h20l-4 8H44z" fill="#ff8fb3" />
    </S>
  ),
  moon: (
    <S>
      <path d="M62 10a40 40 0 1 0 28 62A32 32 0 0 1 62 10z" fill="#ffe066" />
      <circle cx="40" cy="44" r="5" fill="#ffd23f" />
      <circle cx="52" cy="70" r="7" fill="#ffd23f" />
    </S>
  ),
  spoon: (
    <S>
      <g transform="rotate(30 50 50)">
        <ellipse cx="50" cy="24" rx="16" ry="20" fill="#d7dde8" stroke="#a9b2c3" strokeWidth="3" />
        <rect x="46" y="42" width="8" height="50" rx="4" fill="#d7dde8" stroke="#a9b2c3" strokeWidth="3" />
        <ellipse cx="45" cy="20" rx="5" ry="8" fill="#fff" />
      </g>
    </S>
  ),
  cake: (
    <S>
      <rect x="48" y="12" width="4" height="14" fill="#4aa3ff" />
      <path d="M50 4q4 4 0 8-4-4 0-8z" fill="#ff9f43" />
      <rect x="18" y="40" width="64" height="44" rx="6" fill="#ffc2d6" />
      <path d="M18 48q8 10 16 0t16 0 16 0 16 0v-4a6 6 0 0 0-6-6H24a6 6 0 0 0-6 6z" fill="#fff" />
      <rect x="18" y="26" width="64" height="16" rx="6" fill="#a0693a" />
      <circle cx="34" cy="64" r="4" fill="#ff5a5a" />
      <circle cx="50" cy="70" r="4" fill="#5cc96b" />
      <circle cx="66" cy="64" r="4" fill="#4aa3ff" />
    </S>
  ),
  snake: (
    <S>
      <path d="M14 76q12-20 26-6t26-4 18-24" stroke="#5cc96b" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M14 76q12-20 26-6t26-4 18-24" stroke="#ffd94a" strokeWidth="4" strokeDasharray="4 10" fill="none" />
      <circle cx="84" cy="38" r="12" fill="#5cc96b" />
      <circle cx="88" cy="34" r="3" fill={INK} />
      <path d="M94 42l6 4-6 0" stroke="#ff5a5a" strokeWidth="2.5" fill="none" />
    </S>
  ),
  net: (
    <S>
      <path d="M20 88 50 50" stroke="#8a5a2b" strokeWidth="6" strokeLinecap="round" />
      <circle cx="64" cy="34" r="26" fill="#eaf6ff" stroke="#7b8db8" strokeWidth="5" />
      <path d="M44 22l40 24M42 36l42 0M48 52l36-30M64 8v52M76 12 52 58" stroke="#a9b8de" strokeWidth="2" />
    </S>
  ),
  jet: (
    <S>
      <path d="M8 54q30-10 76-8 10 2 10 8t-10 8q-46 2-76-8z" fill="#e7e9f2" stroke="#a9b2c3" strokeWidth="3" />
      <path d="M44 50 30 20h12l20 30zM44 58 30 86h12l20-28z" fill="#4aa3ff" />
      <path d="M12 52 6 34h8l10 16z" fill="#4aa3ff" />
      <circle cx="78" cy="52" r="4" fill="#4aa3ff" />
      <circle cx="66" cy="52" r="4" fill="#4aa3ff" />
    </S>
  ),
  sun: (
    <S>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect key={a} x="47" y="4" width="6" height="18" rx="3" fill="#ffb020" transform={`rotate(${a} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="24" fill="#ffd23f" />
      <circle cx="42" cy="46" r="3" fill={INK} />
      <circle cx="58" cy="46" r="3" fill={INK} />
      <path d="M41 56q9 8 18 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    </S>
  ),
  bus: (
    <S>
      <rect x="8" y="22" width="84" height="50" rx="10" fill="#ffc93c" stroke="#e0a300" strokeWidth="3" />
      {[16, 36, 56].map((x) => (
        <rect key={x} x={x} y="30" width="14" height="16" rx="2" fill="#eaf6ff" />
      ))}
      <rect x="76" y="30" width="10" height="30" rx="2" fill="#eaf6ff" />
      <rect x="8" y="54" width="84" height="5" fill="#e0a300" />
      <circle cx="26" cy="74" r="9" fill={INK} />
      <circle cx="74" cy="74" r="9" fill={INK} />
    </S>
  ),
  cup: (
    <S>
      <path d="M22 30h48l-6 50H28z" fill="#ff6fae" />
      <path d="M68 38h6a10 10 0 0 1 0 20h-8" stroke="#ff6fae" strokeWidth="7" fill="none" />
      <ellipse cx="46" cy="30" rx="24" ry="6" fill="#e04b8e" />
      <ellipse cx="46" cy="84" rx="26" ry="5" fill="#e3ebf5" />
    </S>
  ),
  bed: (
    <S>
      <rect x="8" y="30" width="10" height="56" rx="3" fill="#a0693a" />
      <rect x="82" y="48" width="10" height="38" rx="3" fill="#a0693a" />
      <rect x="14" y="56" width="74" height="18" rx="4" fill="#4aa3ff" />
      <rect x="20" y="44" width="22" height="14" rx="6" fill="#fff" />
      <path d="M40 56q20-12 48 0" fill="#2b7fdc" />
    </S>
  ),
  bag: (
    <S>
      <path d="M36 32q0-18 14-18t14 18" stroke="#8a5a2b" strokeWidth="6" fill="none" />
      <path d="M18 32h64l-6 56H24z" fill="#ff9f43" />
      <rect x="40" y="48" width="20" height="14" rx="3" fill="#e57f1a" />
    </S>
  ),
  sock: (
    <S>
      <path d="M38 8h28v50q0 10-8 18L46 88q-10 8-22 0-10-10 0-20l14-14z" fill="#ff6b6b" />
      <rect x="38" y="8" width="28" height="12" fill="#fff" />
      <path d="M38 30h28M38 42h28" stroke="#fff" strokeWidth="5" />
      <path d="M22 70q-6 12 6 18" stroke="#d94848" strokeWidth="4" fill="none" />
    </S>
  ),
  nest: (
    <S>
      <ellipse cx="38" cy="52" rx="10" ry="13" fill="#bfe6ff" />
      <ellipse cx="54" cy="50" rx="10" ry="13" fill="#bfe6ff" />
      <ellipse cx="68" cy="54" rx="9" ry="12" fill="#bfe6ff" />
      <path d="M10 56q40 18 80 0-4 28-40 30-36-2-40-30z" fill="#a0693a" />
      <path d="M14 62q36 14 72 0M18 72q32 10 64 0" stroke="#7d4f28" strokeWidth="3" fill="none" />
    </S>
  ),
};

export const pictureFor = (word: string): ReactNode => WORD_PICTURES[word as Word];
