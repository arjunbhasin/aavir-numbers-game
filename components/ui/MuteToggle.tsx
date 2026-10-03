"use client";

import { useProgress } from "@/lib/progress";
import { SoundOffIcon, SoundOnIcon } from "./Icons";

export default function MuteToggle() {
  const muted = useProgress((s) => s.muted);
  const toggle = useProgress((s) => s.toggleMute);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      className="btn-3d grid place-items-center w-14 h-14 rounded-2xl bg-white text-ink"
      style={{ ["--btn-shadow" as string]: "#c9d6e6" }}
    >
      {muted ? <SoundOffIcon className="w-8 h-8" /> : <SoundOnIcon className="w-8 h-8" />}
    </button>
  );
}
