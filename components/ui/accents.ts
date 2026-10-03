export type Accent = "coral" | "sun" | "grass" | "ocean" | "grape" | "berry" | "mint" | "tangerine";

/** Literal class names per accent so Tailwind can see them. */
export const ACCENT: Record<Accent, { bg: string; text: string; soft: string; ring: string; shadow: string; hex: string }> = {
  coral: { bg: "bg-coral", text: "text-coral-dark", soft: "bg-coral/15", ring: "ring-coral", shadow: "#e35a4a", hex: "#ff7a6b" },
  sun: { bg: "bg-sun", text: "text-sun-dark", soft: "bg-sun/20", ring: "ring-sun", shadow: "#e8a800", hex: "#ffc93c" },
  grass: { bg: "bg-grass", text: "text-grass-dark", soft: "bg-grass/15", ring: "ring-grass", shadow: "#3aa64b", hex: "#5cc96b" },
  ocean: { bg: "bg-ocean", text: "text-ocean-dark", soft: "bg-ocean/15", ring: "ring-ocean", shadow: "#2b7fdc", hex: "#4aa3ff" },
  grape: { bg: "bg-grape", text: "text-grape-dark", soft: "bg-grape/15", ring: "ring-grape", shadow: "#8253d1", hex: "#a678f0" },
  berry: { bg: "bg-berry", text: "text-berry-dark", soft: "bg-berry/15", ring: "ring-berry", shadow: "#e04b8e", hex: "#ff6fae" },
  mint: { bg: "bg-mint", text: "text-mint-dark", soft: "bg-mint/15", ring: "ring-mint", shadow: "#1fae9e", hex: "#3fd1c0" },
  tangerine: { bg: "bg-tangerine", text: "text-tangerine-dark", soft: "bg-tangerine/15", ring: "ring-tangerine", shadow: "#e57f1a", hex: "#ff9f43" },
};
