# Aavir's Puzzle Park

Friendly logic games and pattern puzzles for 6–7 year olds. Big buttons, cheerful sounds, no timers, no game-over. Works with a keyboard on a laptop and with taps and swipes on a tablet. Stars and unlocked levels are saved in the browser. There are no accounts.

## Games

| Section | Game | How it plays |
|---|---|---|
| Race Day | Rainbow Rally | A pseudo-3D racer: steer while the car drives itself, grab stars and rainbow boost pads, and race three animal friends over 3 laps. Meadow, Beach and Snow tracks. |
| Puzzle Adventures | Box Push | Sokoban. Push every box onto a star. 30 levels, up to 4 boxes; warns when a box gets stuck in a corner. |
| | Ice Slide | The penguin slides until it hits a rock. Stop on the fish. 15 levels. |
| | Key Maze | Each key opens one door of its color. Reach the treasure. 24 levels; later ones add one-way arrow paths and decoy doors that can waste a key. |
| | Slide Tiles | Sliding number puzzle, 2x2 up to 3x3. 9 levels. |
| | Robot Path | Plan a list of arrow steps, press Go, collect the stars, reach the battery. 12 levels. |
| Pattern Detective | Missing Pieces | A row of shapes with two gaps. Pick both missing shapes in order. |
| | What's Next? | Which shape comes next in the row? |
| | Odd One Out | Find the shape that breaks the rule. |
| | Magic Square | Rows follow one rule and columns another. Fill the empty box. |
| Memory Lane | Pair Match | Flip two cards at a time and find every pair. Hard matches numbers to dots. |
| | Copy the Lights | Four lights on the arrow keys play a tune; copy it as it grows longer. |
| | What's Missing? | Remember the toys on the tray. One hides; which one? |
| | Footprints | Watch the robot walk a path, then walk it yourself. |
| Add & Take Away | Make Ten | Pop pairs of cards that add up to 10 (or 20). Ten-frames help on Easy. |
| | Balance Scale | Pick the block that makes both sides weigh the same. The scale tips to show too heavy or too light. |
| | Coin Shop | Pay the exact price with coins of 1, 2, 5 and 10. Hard mode counts change. |
| | Monster Munch | Take away, "how many were eaten?" and "how many more?" with a hungry monster. |
| | Sum Path | Grid puzzle: collect number stones to reach the flag with the exact total. Later levels need take-away stones. 12 levels. |
| Times & Share | Bug Count Flash | Peek at ladybugs in groups or rows, then say how many. Builds "seeing" groups. |
| | Bunny Hops | Hop along a number line in equal jumps, dodge puddles, predict how many hops. Skip counting and division. 12 levels. |
| | Garden Builder | Plant all the seedlings as a rectangle and find every shape. Arrays, turning (3×4 = 4×3), and "lonely" prime numbers. 12 levels. |
| | Cookie Party | Deal cookies fairly to friends, leftovers go to the dog. Division as sharing, remainders, and working backwards. 12 levels. |
| | Packing Day | Sokoban with eggs: every box you use must be full. Division as grouping, with mixed box sizes. 10 levels. |
| | Magic Machine | Find a machine's rule, run it backwards, chain two machines. Division undoes multiplication. |
| Word Play | Mini Crossword | Small picture crosswords filled from letter tiles. |
| | Missing Letter | A picture word with one letter missing; pick it (Easy tests the middle vowel). |
| | Spell It | Put scrambled letter tiles in order to spell the picture. |
| | Word Search | Find picture words hidden in a letter grid. |
| | Rhyme Time | Pick the pictures that rhyme with the word at the top. |
| | Change One Letter | Word ladders: change one letter at a time to make each new picture. |
| Abacus Club | Bead Reader | Read numbers on a soroban, and set them by moving beads. |
| | Friend Finder | Little friends (make 5) and big friends (make 10), plus formula gaps like +4 = +5 − ?. |
| | Which Formula? | Choose direct, little friend, big friend, or big + little friend, then watch the beads. |
| | Abacus Sums | Do sums on the abacus yourself, from direct sums to two-digit sums. 8 levels. |
| | Flash Abacus | Numbers flash one at a time; add them in your head. |
| | Friend Pairs | Memory game where matching cards are friends that make 5 or 10. |
| Number Fun | Missing Numbers | Put lost numbers back into a 1–20, 1–50 or 1–100 grid. |
| | Find Numbers | Find 1, 2, 3… hidden among scattered numbers. |

Pattern, memory and most math games come in Easy, Medium and Hard. Puzzle-style games (Box Push, Sum Path, Packing Day and others) have numbered levels instead.

The home page groups games into six sections with sticky tabs, shows each game's stars as a progress bar, and has a "Keep playing" row for recently opened games. Each round is five fresh puzzles made by a generator, so they never run out.

## Controls

- Arrow keys or WASD move. `U` (or Backspace) undoes, `R` restarts, Enter continues.
- Answer choices: click, use the arrows and Enter, or type the number answer. Shape answers use `A`–`E` or `1`–`5`.
- On a touch screen an arrow pad appears, and you can swipe on the board.
- Abacus: ← → pick a rod, ↑ ↓ move a bottom bead, Space moves the top (5) bead, Enter checks. Beads can also be tapped.
- Word games: type letters on the keyboard or tap the tiles.
- Rainbow Rally: hold ← → (or A D) to steer; on a tablet, press and hold either side of the road.

## Tablets

- Every game is checked in tablet portrait and landscape by the browser tests: no sideways scrolling, and the main buttons stay on screen.
- On touch screens an arrow pad appears (beside the board in landscape, below in portrait), keyboard tips are hidden, and tap targets are finger-sized.
- Double-tap zoom and long-press text selection are turned off so taps feel like an app.
- On an iPad, Share → "Add to Home Screen" installs it with its own icon and opens it full screen.

## Browser support

Recent Chrome, Edge, Firefox and Safari. On iPad and iPhone it needs iPadOS/iOS 16.4 or newer (the styling uses modern CSS that older Safari versions don't support).

## Tech

Next.js 16 (App Router, all pages static), React 19, Tailwind CSS 4, Motion, Zustand, Vitest, Playwright, Bun.

TypeScript 7 does the type-checking (`bun run typecheck`). TypeScript 6 is also installed because typescript-eslint and Next's build step do not support the TypeScript 7 API yet.

```bash
bun install
bun run dev        # http://localhost:3000
bun run test       # unit tests: every level is solvable, puzzles have one right answer
bun run test:e2e   # browser tests (run `bun run build` first; `bunx playwright install chromium` once)
bun run lint
bun run typecheck
bun run build
```

## Project layout

- `app/` holds the home page and one route per game under `app/games/<slug>`.
- `games/<game>/` holds each game's rules (`logic.ts`), its levels, and its screen.
- `games/patterns/` holds the shape model and the puzzle generators.
- `components/math/` holds the art and answer buttons for the Times & Share games.
- `components/` holds shared pieces: the board, sprites, buttons, the win screen, the shape renderer.
- `lib/` holds progress saving, sounds, keyboard and swipe input, and the breadth-first solver.

## Adding or editing levels

Levels are small text drawings, for example Box Push uses `#` wall, `@` player, `$` box, `.` star. Each level stores a `par`, the fewest possible moves, which sets the stars. After editing a level run `bun run test`. The test solves every level and tells you if it is impossible or if `par` changed.

## Deploying

Import the repo in Vercel. No settings or environment variables are needed.
