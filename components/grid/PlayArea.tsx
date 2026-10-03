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
  onEnter,
  canUndo,
  moves,
  par,
  locked = false,
  extra,
  side,
  dpad = true,
}: {
  board: ReactNode;
  onMove?: (d: Dir) => void;
  onUndo?: () => void;
  onRestart: () => void;
  onLevels: () => void;
  onEnter?: () => void;
  canUndo?: boolean;
  moves?: number;
  par?: number;
  locked?: boolean;
  extra?: ReactNode;
  /** shown beside the board on wide screens, below it otherwise */
  side?: ReactNode;
  /** show the on-screen arrow pad on touch screens */
  dpad?: boolean;
}) {
  const touch = useIsTouch();
  const showPad = touch && dpad && !!onMove;
  useGameKeys({ enabled: !locked, onMove, onUndo, onRestart, onEnter });

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        {board}
        {side}
        {showPad && <DPad className="hidden lg:grid" onMove={(d) => !locked && onMove!(d)} />}
      </div>
      {/* in portrait, game info sits right under the board and the arrow pad comes after it */}
      {extra}
      {showPad && <DPad className="grid lg:hidden mt-4" onMove={(d) => !locked && onMove!(d)} />}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
        {onUndo && (
          <Button accent="white" onClick={onUndo} disabled={!canUndo || locked} icon={<UndoIcon className="w-7 h-7" />}>
            Undo
          </Button>
        )}
        <Button accent="white" onClick={onRestart} disabled={locked} icon={<RestartIcon className="w-7 h-7" />}>
          Restart
        </Button>
        <Button accent="white" onClick={onLevels} disabled={locked} icon={<GridIcon className="w-7 h-7" />}>
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
