"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GAMES, SECTIONS, maxStars } from "@/lib/catalog";
import { totalStars, useProgress } from "@/lib/progress";
import { ACCENT } from "./accents";
import { GAME_ICONS } from "./GameIcons";
import { StarIcon } from "./Icons";
import { SectionIcon } from "./SectionIcons";

/** Star count across every game, for the header. */
export function StarTotal() {
  const games = useProgress((s) => s.games);
  const total = GAMES.reduce((sum, g) => sum + totalStars(games[g.id]), 0);
  const max = GAMES.reduce((sum, g) => sum + maxStars(g), 0);
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 h-14 px-3 sm:px-4 rounded-2xl bg-white shadow-[0_6px_0_#c9d6e6] shrink-0" aria-label={`${total} of ${max} stars`}>
      <StarIcon className="w-7 h-7 sm:w-8 sm:h-8" />
      <span className="text-2xl font-bold text-ink tabular-nums">{total}</span>
      <span className="hidden sm:inline text-base text-ink-soft">/ {max}</span>
    </div>
  );
}

/** The last few games played, so it's quick to jump back in. */
export function KeepPlaying() {
  const recent = useProgress((s) => s.recent);
  const games = recent.map((id) => GAMES.find((g) => g.id === id)).filter((g) => g !== undefined).slice(0, 4);
  if (!games.length) return null;
  return (
    <section className="mt-4" aria-labelledby="keep-playing">
      <h2 id="keep-playing" className="text-xl font-bold text-ink-soft mb-2">
        Keep playing
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {games.map((g) => {
          const a = ACCENT[g.accent];
          return (
            <Link
              key={g.id}
              href={`/games/${g.id}`}
              className="btn-3d flex items-center gap-3 shrink-0 rounded-2xl bg-white pr-5 overflow-hidden"
              style={{ ["--btn-shadow" as string]: "#c9d6e6" }}
            >
              <span className={`${a.bg} w-16 h-16 grid place-items-center`}>
                <span className="w-11 h-11">{GAME_ICONS[g.id]}</span>
              </span>
              <span className={`text-lg font-bold ${a.text} whitespace-nowrap`}>{g.title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Sticky row of section tabs. The section on screen is highlighted. */
export function SectionNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace("section-", ""));
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <nav className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-sky-top/85 backdrop-blur-md" aria-label="Game sections">
      <div className="flex gap-2 overflow-x-auto">
        {SECTIONS.map((s) => {
          const a = ACCENT[s.accent];
          const on = active === s.id;
          return (
            <a
              key={s.id}
              href={`#section-${s.id}`}
              aria-current={on ? "true" : undefined}
              className={`flex items-center gap-2 shrink-0 h-11 px-4 rounded-full text-base font-semibold transition-colors ${
                on ? `${a.bg} text-white shadow-[0_4px_0_rgba(0,0,0,.15)]` : "bg-white/80 text-ink hover:bg-white"
              }`}
            >
              <SectionIcon id={s.id} className="w-5 h-5" />
              {s.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
