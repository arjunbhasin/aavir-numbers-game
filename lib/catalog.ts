import type { Accent } from "@/components/ui/accents";

export type SectionId = "race" | "logic" | "patterns" | "memory" | "words" | "numbers" | "addsub" | "abacus" | "multiply";

export type GameInfo = {
  id: string;
  title: string;
  blurb: string;
  accent: Accent;
  section: SectionId;
  /** levels (level games) or difficulties (round games); each is worth up to 3 stars */
  levels: number;
};

export type SectionInfo = { id: SectionId; title: string; subtitle: string; accent: Accent };

/** Home page order: thinking games first, then math from counting up to dividing. */
export const SECTIONS: SectionInfo[] = [
  { id: "race", title: "Race Day", subtitle: "Steer, boost and race your friends", accent: "berry" },
  { id: "logic", title: "Puzzle Adventures", subtitle: "Plan your moves and solve each level", accent: "coral" },
  { id: "patterns", title: "Pattern Detective", subtitle: "Find the rule, pick the right shape", accent: "berry" },
  { id: "memory", title: "Memory Lane", subtitle: "Look closely, remember, and repeat", accent: "mint" },
  { id: "words", title: "Word Play", subtitle: "Letters, spelling, rhymes and crosswords", accent: "tangerine" },
  { id: "numbers", title: "Number Fun", subtitle: "Count, order and find numbers", accent: "ocean" },
  { id: "addsub", title: "Add & Take Away", subtitle: "Make ten, balance, shop and take away", accent: "sun" },
  { id: "abacus", title: "Abacus Club", subtitle: "Beads, little friends, big friends and formulas", accent: "grass" },
  { id: "multiply", title: "Times & Share", subtitle: "Groups, hops and fair sharing", accent: "grape" },
];

export const GAMES: GameInfo[] = [
  { id: "rainbow-rally", title: "Rainbow Rally", blurb: "Race your animal friends on three tracks", accent: "berry", section: "race", levels: 3 },
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
  { id: "make-ten", title: "Make Ten", blurb: "Pop two numbers that add up to the target", accent: "sun", section: "addsub", levels: 3 },
  { id: "balance", title: "Balance Scale", blurb: "Add blocks until both sides weigh the same", accent: "ocean", section: "addsub", levels: 3 },
  { id: "coin-shop", title: "Coin Shop", blurb: "Pay the exact price and count the change", accent: "grass", section: "addsub", levels: 3 },
  { id: "monster-munch", title: "Monster Munch", blurb: "The monster ate some apples. How many are left?", accent: "berry", section: "addsub", levels: 3 },
  { id: "sum-path", title: "Sum Path", blurb: "Collect numbers and reach the flag with the exact total", accent: "coral", section: "addsub", levels: 12 },
  { id: "pair-match", title: "Pair Match", blurb: "Flip two cards. Find all the pairs", accent: "grape", section: "memory", levels: 3 },
  { id: "copy-lights", title: "Copy the Lights", blurb: "Watch the lights, then play them back", accent: "coral", section: "memory", levels: 3 },
  { id: "whats-missing", title: "What's Missing?", blurb: "Remember the toys. Which one went away?", accent: "sun", section: "memory", levels: 3 },
  { id: "footprints", title: "Footprints", blurb: "Watch the robot's path, then walk it yourself", accent: "mint", section: "memory", levels: 3 },
  { id: "bead-reader", title: "Bead Reader", blurb: "Read the beads, then show numbers on the abacus", accent: "grass", section: "abacus", levels: 3 },
  { id: "friend-finder", title: "Friend Finder", blurb: "Little friends make 5, big friends make 10", accent: "sun", section: "abacus", levels: 3 },
  { id: "which-formula", title: "Which Formula?", blurb: "Direct, little friend, big friend or both?", accent: "ocean", section: "abacus", levels: 3 },
  { id: "abacus-sums", title: "Abacus Sums", blurb: "Move the beads to do the sum yourself", accent: "coral", section: "abacus", levels: 8 },
  { id: "flash-abacus", title: "Flash Abacus", blurb: "Numbers flash by. Add them in your head", accent: "grape", section: "abacus", levels: 3 },
  { id: "friend-pairs", title: "Friend Pairs", blurb: "Flip cards to find friends that make 5 or 10", accent: "mint", section: "abacus", levels: 3 },
  { id: "crossword", title: "Mini Crossword", blurb: "Fill the picture crossword with letter tiles", accent: "tangerine", section: "words", levels: 3 },
  { id: "missing-letter", title: "Missing Letter", blurb: "Which letter fills the gap?", accent: "berry", section: "words", levels: 3 },
  { id: "spell-it", title: "Spell It", blurb: "Put the letters in order to spell the picture", accent: "ocean", section: "words", levels: 3 },
  { id: "word-search", title: "Word Search", blurb: "Find the hidden picture words", accent: "grass", section: "words", levels: 3 },
  { id: "rhyme-time", title: "Rhyme Time", blurb: "Which pictures rhyme?", accent: "grape", section: "words", levels: 3 },
  { id: "word-ladder", title: "Change One Letter", blurb: "Change one letter to make a new word", accent: "coral", section: "words", levels: 3 },
  { id: "missing-numbers", title: "Missing Numbers", blurb: "Put the lost numbers back", accent: "ocean", section: "numbers", levels: 3 },
  { id: "find-numbers", title: "Find Numbers", blurb: "Find 1, then 2, then 3...", accent: "mint", section: "numbers", levels: 3 },
];

export function maxStars(g: GameInfo): number {
  return g.levels * 3;
}

export function gameInfo(id: string): GameInfo {
  const g = GAMES.find((x) => x.id === id);
  if (!g) throw new Error(`Unknown game ${id}`);
  return g;
}
