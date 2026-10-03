import Link from "next/link";
import type { ReactNode } from "react";
import { ACCENT, type Accent } from "./accents";
import { HomeIcon } from "./Icons";
import MuteToggle from "./MuteToggle";

export default function GameShell({
  title,
  accent,
  hint,
  children,
}: {
  title: string;
  accent: Accent;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2 max-w-5xl w-full mx-auto">
        <Link
          href="/"
          aria-label="Back to all games"
          className="btn-3d grid place-items-center w-14 h-14 rounded-2xl bg-white text-ink shrink-0"
          style={{ ["--btn-shadow" as string]: "#c9d6e6" }}
        >
          <HomeIcon className="w-8 h-8" />
        </Link>
        <div className="flex-1 min-w-0 text-center">
          <h1 className={`text-3xl sm:text-4xl font-bold truncate ${ACCENT[accent].text}`}>{title}</h1>
          {hint && <p className="text-base sm:text-lg text-ink-soft leading-tight mt-0.5">{hint}</p>}
        </div>
        <MuteToggle />
      </header>
      <main className="flex-1 flex flex-col items-center px-4 pb-6 max-w-5xl w-full mx-auto">{children}</main>
    </div>
  );
}
