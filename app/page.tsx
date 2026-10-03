import GameCard from "@/components/ui/GameCard";
import { GAME_ICONS } from "@/components/ui/GameIcons";
import MuteToggle from "@/components/ui/MuteToggle";
import ResetProgress from "@/components/ui/ResetProgress";
import { Robot } from "@/components/grid/Sprites";
import { GAMES, SECTIONS } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="min-h-dvh max-w-6xl mx-auto px-4 pb-10">
      <header className="flex items-center gap-4 pt-6 pb-4">
        <div className="w-20 h-20 shrink-0 animate-float">
          <Robot />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-bold text-ink">Aavir&apos;s Puzzle Park</h1>
          <p className="text-xl text-ink-soft">Pick a game and let&apos;s think!</p>
        </div>
        <MuteToggle />
      </header>

      {SECTIONS.map((section) => {
        const games = GAMES.filter((g) => g.section === section.id);
        return (
          <section key={section.id} className="mt-8">
            <h2 className="text-3xl font-bold text-ink">{section.title}</h2>
            <p className="text-lg text-ink-soft mb-4">{section.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {games.map((g, i) => (
                <GameCard key={g.id} game={g} icon={GAME_ICONS[g.id]} index={i} />
              ))}
            </div>
          </section>
        );
      })}

      <footer className="mt-12 flex justify-center">
        <ResetProgress />
      </footer>
    </div>
  );
}
