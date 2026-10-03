# Aavir's Puzzle Park

Friendly logic games and pattern puzzles for 6–7 year olds. Big buttons, cheerful sounds, no timers, no game-over. Works with a keyboard on a laptop and with taps and swipes on a tablet. Stars and unlocked levels are saved in the browser. There are no accounts.

## Games

| Section | Game | How it plays |
|---|---|---|
| Puzzle Adventures | Box Push | Sokoban. Push every box onto a star. 15 levels. |
| | Ice Slide | The penguin slides until it hits a rock. Stop on the fish. 15 levels. |
| | Key Maze | Each key opens one door of its color. Reach the treasure. 12 levels. |
| | Slide Tiles | Sliding number puzzle, 2x2 up to 3x3. 9 levels. |
| | Robot Path | Plan a list of arrow steps, press Go, collect the stars, reach the battery. 12 levels. |
| Pattern Detective | Missing Pieces | A row of shapes with two gaps. Pick both missing shapes in order. |
| | What's Next? | Which shape comes next in the row? |
| | Odd One Out | Find the shape that breaks the rule. |
| | Magic Square | Rows follow one rule and columns another. Fill the empty box. |
| Number Fun | Missing Numbers | Put lost numbers back into a 1–20, 1–50 or 1–100 grid. |
| | Find Numbers | Find 1, 2, 3… hidden among scattered numbers. |

Pattern games come in Easy, Medium and Hard. Each round is five fresh puzzles made by a generator, so they never run out.

## Controls

- Arrow keys or WASD move. `U` (or Backspace) undoes, `R` restarts, Enter continues.
- Answer choices: click, press `A`–`E` or `1`–`5`, or use the arrows and Enter.
- On a touch screen an arrow pad appears, and you can swipe on the board.

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
- `components/` holds shared pieces: the board, sprites, buttons, the win screen, the shape renderer.
- `lib/` holds progress saving, sounds, keyboard and swipe input, and the breadth-first solver.

## Adding or editing levels

Levels are small text drawings, for example Box Push uses `#` wall, `@` player, `$` box, `.` star. Each level stores a `par`, the fewest possible moves, which sets the stars. After editing a level run `bun run test`. The test solves every level and tells you if it is impossible or if `par` changed.

## Deploying

Import the repo in Vercel. No settings or environment variables are needed.
