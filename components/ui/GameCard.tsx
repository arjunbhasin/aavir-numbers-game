"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { totalStars, useProgress } from "@/lib/progress";
import { maxStars, type GameInfo } from "@/lib/catalog";
import { ACCENT } from "./accents";
import { StarIcon } from "./Icons";

export default function GameCard({ game, icon, index }: { game: GameInfo; icon: ReactNode; index: number }) {
  const stars = useProgress((s) => totalStars(s.games[game.id]));
  const max = maxStars(game);
  const a = ACCENT[game.accent];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: (index % 4) * 0.05 }}>
      <Link
        href={`/games/${game.id}`}
        className="btn-3d group flex flex-col h-full rounded-[1.5rem] bg-white overflow-hidden"
        style={{ ["--btn-shadow" as string]: a.shadow }}
      >
        <div className={`${a.bg} relative h-24 sm:h-28 grid place-items-center overflow-hidden`}>
          <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-white/20" />
          <div className="absolute -left-4 -bottom-6 w-16 h-16 rounded-full bg-white/15" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 transition-transform group-hover:scale-110 group-hover:-rotate-3">{icon}</div>
        </div>
        <div className="p-3 sm:p-4 flex-1 flex flex-col gap-1">
          <h3 className={`text-lg sm:text-xl font-bold leading-tight ${a.text}`}>{game.title}</h3>
          <p className="text-ink-soft text-sm sm:text-base leading-snug flex-1 line-clamp-2">{game.blurb}</p>
          <div className="flex items-center gap-2 mt-1" aria-label={`${stars} of ${max} stars`}>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-sun transition-all" style={{ width: `${Math.min(100, (stars / max) * 100)}%` }} />
            </div>
            <span className="flex items-center gap-0.5 text-sm font-semibold text-ink-soft tabular-nums">
              <StarIcon className="w-4 h-4" filled={stars > 0} />
              {stars}/{max}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
