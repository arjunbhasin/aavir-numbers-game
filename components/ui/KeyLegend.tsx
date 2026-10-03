"use client";

import { useIsTouch } from "@/lib/input";

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-grid place-items-center min-w-8 h-8 px-1.5 rounded-lg bg-white border-b-4 border-slate-300 text-ink font-semibold text-sm">
    {children}
  </kbd>
);

export default function KeyLegend({ undo = true, restart = true }: { undo?: boolean; restart?: boolean }) {
  const touch = useIsTouch();
  if (touch) return null;
  return (
    <div className="hidden md:flex items-center gap-5 text-ink-soft text-base mt-3">
      <span className="flex items-center gap-1">
        <Key>↑</Key>
        <Key>↓</Key>
        <Key>←</Key>
        <Key>→</Key>
        <span className="ml-1">move</span>
      </span>
      {undo && (
        <span className="flex items-center gap-1">
          <Key>U</Key>
          <span className="ml-1">undo</span>
        </span>
      )}
      {restart && (
        <span className="flex items-center gap-1">
          <Key>R</Key>
          <span className="ml-1">restart</span>
        </span>
      )}
    </div>
  );
}
