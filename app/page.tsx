import GameCard from "@/components/ui/GameCard";
import { GAME_ICONS } from "@/components/ui/GameIcons";
import { KeepPlaying, SectionNav, StarTotal } from "@/components/ui/HomeExtras";
import MuteToggle from "@/components/ui/MuteToggle";
import ResetProgress from "@/components/ui/ResetProgress";
import { SectionIcon } from "@/components/ui/SectionIcons";
import { ACCENT } from "@/components/ui/accents";
import { Robot } from "@/components/grid/Sprites";
import { GAMES, SECTIONS } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="min-h-dvh max-w-6xl mx-auto px-4 pb-12">
      <header className="flex items-center gap-3 sm:gap-4 pt-6 pb-2">
        <div className="hidden min-[420px]:block w-14 h-14 sm:w-20 sm:h-20 shrink-0 animate-float">
          <Robot />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[1.65rem] sm:text-5xl font-bold text-ink leading-tight">Aavir&apos;s Puzzle Park</h1>
          <p className="hidden sm:block text-xl text-ink-soft">
            {GAMES.length} games to think, remember and count
          </p>
        </div>
        <StarTotal />
        <MuteToggle />
      </header>

      <KeepPlaying />
      <SectionNav />

      {SECTIONS.map((section) => {
        const games = GAMES.filter((g) => g.section === section.id);
        const a = ACCENT[section.accent];
        return (
          <section key={section.id} id={`section-${section.id}`} className="scroll-mt-20 mt-8" aria-labelledby={`h-${section.id}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`${a.bg} text-white w-12 h-12 rounded-2xl grid place-items-center shadow-[0_4px_0_rgba(0,0,0,.15)] shrink-0`}>
                <SectionIcon id={section.id} className="w-7 h-7" />
              </span>
              <div className="flex-1 min-w-0">
                <h2 id={`h-${section.id}`} className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
                  {section.title}
                </h2>
                <p className="text-base sm:text-lg text-ink-soft leading-snug">{section.subtitle}</p>
              </div>
              <span className="hidden sm:block text-base font-semibold text-ink-soft bg-white/70 rounded-full px-3 py-1 shrink-0">
                {games.length} games
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {games.map((g, i) => (
                <GameCard key={g.id} game={g} icon={GAME_ICONS[g.id]} index={i} />
              ))}
            </div>
          </section>
        );
      })}

      <footer className="mt-14 flex justify-center">
        <ResetProgress />
      </footer>
    </div>
  );
}
