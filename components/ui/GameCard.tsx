"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { totalStars, useProgress } from "@/lib/progress";
import type { GameInfo } from "@/lib/catalog";
import { ACCENT } from "./accents";
import { StarIcon } from "./Icons";

export default function GameCard({ game, icon, index }: { game: GameInfo; icon: ReactNode; index: number }) {
  const stars = useProgress((s) => totalStars(s.games[game.id]));
  const a = ACCENT[game.accent];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Link
        href={`/games/${game.id}`}
        className="btn-3d group flex flex-col h-full rounded-[1.75rem] bg-white overflow-hidden"
        style={{ ["--btn-shadow" as string]: a.shadow }}
      >
        <div className={`${a.bg} relative h-32 grid place-items-center overflow-hidden`}>
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/20" />
          <div className="absolute -left-4 -bottom-8 w-20 h-20 rounded-full bg-white/15" />
          <div className="relative w-24 h-24 transition-transform group-hover:scale-110 group-hover:-rotate-3">{icon}</div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className={`text-2xl font-bold ${a.text}`}>{game.title}</h3>
          <p className="text-ink-soft text-lg leading-snug flex-1">{game.blurb}</p>
          {stars > 0 && (
            <div className="flex items-center gap-1 mt-2 text-ink font-semibold text-lg">
              <StarIcon className="w-6 h-6" /> {stars}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
