/**
 * Generated with a solver, then hand-picked. `.` is grass, digits add, a-e take away 1-5.
 * `par` = fewest moves (checked by tests). Levels 8+ can only be solved with a take-away stone.
 */
export const LEVELS: { target: number; par: number; map: string }[] = [
  { target: 5, par: 9, map: `
..3.
....
F@.2` },
  { target: 5, par: 6, map: `
.F142
.....
.@.#.` },
  { target: 7, par: 8, map: `
#..4
.3.#
@.F2
.1..` },
  { target: 10, par: 12, map: `
.5.@#
.#..3
1F...
.2.#.` },
  { target: 13, par: 10, map: `
.1.#.
F.5..
3...#
@#42.` },
  { target: 13, par: 14, map: `
.3@#1
.F.5.
4...2
...#.
.#.#.` },
  { target: 16, par: 13, map: `
#6.F.
.5...
....3
#2##4
..@..` },
  { target: 6, par: 10, map: `
.4.b.
.@.5#
....F
.3..#` },
  { target: 4, par: 13, map: `
.#c#4
....F
@3...
...5.
.#2..` },
  { target: 8, par: 18, map: `
c..F.
#3@#.
..4..
...65
c#.#.` },
  { target: 6, par: 13, map: `
c...#c
7.@.3.
.5F.4.
....#.
#.#...` },
  { target: 19, par: 17, map: `
.a....
...#..
F@#8.b
#.5#3.
6#.4..` },
];
