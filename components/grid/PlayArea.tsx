"use client";

import type { ReactNode } from "react";
import type { Dir } from "@/lib/grid";
import { useGameKeys, useIsTouch } from "@/lib/input";
import Button from "@/components/ui/Button";
import DPad from "@/components/ui/DPad";
import KeyLegend from "@/components/ui/KeyLegend";
import { GridIcon, RestartIcon, UndoIcon } from "@/components/ui/Icons";

/** Board + controls shared by every grid game. */
export default function PlayArea({
  board,
  onMove,
  onUndo,
  onRestart,
  onLevels,
  canUndo,
  moves,
  par,
  locked = false,
  extra,
}: {
  board: ReactNode;
  onMove?: (d: Dir) => void;
  onUndo?: () => void;
  onRestart: () => void;
  onLevels: () => void;
  canUndo?: boolean;
  moves?: number;
  par?: number;
  locked?: boolean;
  extra?: ReactNode;
}) {
  const touch = useIsTouch();
  useGameKeys({ enabled: !locked, onMove, onUndo, onRestart });

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        {board}
        {touch && onMove && <DPad onMove={(d) => !locked && onMove(d)} />}
      </div>
      {extra}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
        {onUndo && (
          <Button accent="white" onClick={onUndo} disabled={!canUndo || locked} icon={<UndoIcon className="w-7 h-7" />}>
            Undo
          </Button>
        )}
        <Button accent="white" onClick={onRestart} icon={<RestartIcon className="w-7 h-7" />}>
          Restart
        </Button>
        <Button accent="white" onClick={onLevels} icon={<GridIcon className="w-7 h-7" />}>
          Levels
        </Button>
        {moves !== undefined && (
          <div className="px-4 py-2 rounded-2xl bg-white/70 text-ink text-xl font-semibold tabular-nums">
            Moves: {moves}
            {par !== undefined && <span className="text-ink-soft text-base font-medium"> / best {par}</span>}
          </div>
        )}
      </div>
      {onMove && <KeyLegend undo={!!onUndo} />}
    </div>
  );
}
