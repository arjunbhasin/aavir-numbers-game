"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ACCENT, type Accent } from "./accents";
import { playSound } from "@/lib/sound";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  accent?: Accent | "white";
  size?: "md" | "lg";
  icon?: ReactNode;
  silent?: boolean;
};

export default function Button({ accent = "ocean", size = "md", icon, children, className = "", silent, onClick, style, ...rest }: Props) {
  const isWhite = accent === "white";
  const colors = isWhite ? "bg-white text-ink" : `${ACCENT[accent].bg} text-white`;
  const shadow = isWhite ? "#c9d6e6" : ACCENT[accent].shadow;
  const sizing = size === "lg" ? "min-h-[72px] px-7 text-2xl gap-3" : "min-h-[56px] px-5 text-xl gap-2";
  return (
    <button
      type="button"
      {...rest}
      onClick={(e) => {
        if (!silent) playSound("click");
        onClick?.(e);
      }}
      style={{ ["--btn-shadow" as string]: shadow, ...style }}
      className={`btn-3d inline-flex items-center justify-center rounded-2xl font-semibold select-none disabled:opacity-40 disabled:cursor-not-allowed ${colors} ${sizing} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
