"use client";

import type { ReactNode } from "react";
import { useIsTouch } from "@/lib/input";

/** Keyboard tips, hidden on tablets and phones (optionally replaced by a touch tip). */
export default function KeyboardHint({ children, touch, className = "" }: { children: ReactNode; touch?: ReactNode; className?: string }) {
  const isTouch = useIsTouch();
  if (isTouch) return touch ? <p className={`text-ink-soft text-center ${className}`}>{touch}</p> : null;
  return <p className={`hidden md:block text-ink-soft text-center ${className}`}>{children}</p>;
}
