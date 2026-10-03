import type { Accent } from "@/components/ui/accents";

export type GameInfo = {
  id: string;
  title: string;
  blurb: string;
  accent: Accent;
  section: "logic" | "patterns" | "multiply" | "numbers";
  /** total levels (logic games) or rounds per difficulty (pattern games) for the star counter */
  levels: number;
};

export const SECTIONS: { id: GameInfo["section"]; title: string; subtitle: string }[] = [
  { id: "logic", title: "Puzzle Adventures", subtitle: "Use the arrow keys to solve each level" },
  { id: "patterns", title: "Pattern Detective", subtitle: "Find the rule, pick the right shape" },
  { id: "multiply", title: "Times & Share", subtitle: "Groups, hops and fair sharing: the start of multiplying and dividing" },
  { id: "numbers", title: "Number Fun", subtitle: "Play with numbers" },
];

export const GAMES: GameInfo[] = [
  { id: "box-push", title: "Box Push", blurb: "Push the boxes onto the stars", accent: "coral", section: "logic", levels: 15 },
  { id: "ice-slide", title: "Ice Slide", blurb: "Slide the penguin to the fish", accent: "ocean", section: "logic", levels: 15 },
  { id: "key-maze", title: "Key Maze", blurb: "Find keys, open doors, get the treasure", accent: "grass", section: "logic", levels: 12 },
  { id: "slide-tiles", title: "Slide Tiles", blurb: "Slide the tiles back in order", accent: "grape", section: "logic", levels: 9 },
  { id: "robot-path", title: "Robot Path", blurb: "Plan the steps, then press Go", accent: "mint", section: "logic", levels: 12 },
  { id: "missing-pieces", title: "Missing Pieces", blurb: "Two shapes are missing. Which ones?", accent: "berry", section: "patterns", levels: 3 },
  { id: "whats-next", title: "What's Next?", blurb: "Which shape comes next?", accent: "sun", section: "patterns", levels: 3 },
  { id: "odd-one-out", title: "Odd One Out", blurb: "Find the shape that doesn't belong", accent: "coral", section: "patterns", levels: 3 },
  { id: "magic-square", title: "Magic Square", blurb: "Fill the empty box in the grid", accent: "grape", section: "patterns", levels: 3 },
  { id: "bug-flash", title: "Bug Count Flash", blurb: "Peek at the bugs. How many? Count in groups!", accent: "coral", section: "multiply", levels: 3 },
  { id: "bunny-hops", title: "Bunny Hops", blurb: "Hop in jumps of 2, 3, 5 to the carrot", accent: "sun", section: "multiply", levels: 12 },
  { id: "garden", title: "Garden Builder", blurb: "Plant flowers in rows. Find every rectangle", accent: "grass", section: "multiply", levels: 12 },
  { id: "cookie-party", title: "Cookie Party", blurb: "Share the cookies fairly. Leftovers go to the dog", accent: "berry", section: "multiply", levels: 12 },
  { id: "packing", title: "Packing Day", blurb: "Push eggs into boxes. Every box must be full", accent: "ocean", section: "multiply", levels: 10 },
  { id: "magic-machine", title: "Magic Machine", blurb: "What does the machine do? Can you undo it?", accent: "grape", section: "multiply", levels: 3 },
  { id: "missing-numbers", title: "Missing Numbers", blurb: "Put the lost numbers back", accent: "ocean", section: "numbers", levels: 3 },
  { id: "find-numbers", title: "Find Numbers", blurb: "Find 1, then 2, then 3...", accent: "mint", section: "numbers", levels: 3 },
];

export function gameInfo(id: string): GameInfo {
  const g = GAMES.find((x) => x.id === id);
  if (!g) throw new Error(`Unknown game ${id}`);
  return g;
}
