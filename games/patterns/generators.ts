import { pick, randInt, shuffle, type Rng } from "@/lib/random";
import {
  COLORS,
  COUNTS,
  FILLS,
  ROTATIONS,
  SHAPES,
  SIZES,
  TURN_SHAPES,
  figureKey,
  sameFigure,
  type Attr,
  type ColorName,
  type Figure,
  type ShapeKind,
} from "./figure";

export type Difficulty = 0 | 1 | 2; // easy, medium, hard
export const DIFFICULTY_NAMES = ["Easy", "Medium", "Hard"] as const;

/* ------------------------------------------------------------------ */
/* Sequence rules                                                      */
/* ------------------------------------------------------------------ */

/** How one attribute changes along a sequence. */
export type Rule =
  | { attr: Attr; kind: "cycle"; values: (string | number)[] } // A B A B... or A B C A B C...
  | { attr: Attr; kind: "step"; start: number; delta: number }; // count +1, rotation +90...

function valueAt(rule: Rule, i: number): string | number {
  if (rule.kind === "cycle") return rule.values[i % rule.values.length];
  return rule.start + rule.delta * i;
}

/** Can every hidden value be worked out from the visible ones? */
function inferable(rule: Rule, visible: number[]): boolean {
  if (rule.kind === "step") return visible.length >= 2;
  const p = rule.values.length;
  for (let r = 0; r < p; r++) if (!visible.some((i) => i % p === r)) return false;
  return true;
}

type RuleMaker = (rng: Rng, length: number) => Rule | null;

const distinct = <T,>(rng: Rng, items: readonly T[], n: number) => shuffle(rng, items).slice(0, n);

const RULES: Record<string, RuleMaker> = {
  shape2: (rng) => ({ attr: "shape", kind: "cycle", values: distinct(rng, SHAPES, 2) }),
  shape3: (rng) => ({ attr: "shape", kind: "cycle", values: distinct(rng, SHAPES, 3) }),
  color2: (rng) => ({ attr: "color", kind: "cycle", values: distinct(rng, COLORS.slice(0, 5), 2) }),
  color3: (rng) => ({ attr: "color", kind: "cycle", values: distinct(rng, COLORS.slice(0, 5), 3) }),
  size2: (rng) => ({ attr: "size", kind: "cycle", values: rng() < 0.5 ? [1, 3] : [3, 1] }),
  size3: (rng) => ({ attr: "size", kind: "cycle", values: rng() < 0.5 ? [1, 2, 3] : [3, 2, 1] }),
  fill2: (rng) => ({ attr: "fill", kind: "cycle", values: distinct(rng, FILLS, 2) }),
  fill3: (rng) => ({ attr: "fill", kind: "cycle", values: shuffle(rng, FILLS) }),
  countUp: () => ({ attr: "count", kind: "step", start: 1, delta: 1 }),
  countDown: (_rng, len) => (len <= 6 ? { attr: "count", kind: "step", start: len, delta: -1 } : null),
  turn90: (rng) => ({ attr: "rotation", kind: "step", start: pick(rng, [0, 90, 180, 270]), delta: rng() < 0.5 ? 90 : -90 }),
  turn45: (rng) => ({ attr: "rotation", kind: "step", start: pick(rng, ROTATIONS), delta: rng() < 0.5 ? 45 : -45 }),
};

/** Which rules each difficulty may combine, and how many. */
const RULE_SETS: Record<Difficulty, { pool: string[]; howMany: number }> = {
  0: { pool: ["shape2", "color2", "size2", "countUp"], howMany: 1 },
  1: { pool: ["shape2", "shape3", "color2", "color3", "fill2", "countUp", "countDown", "turn90", "size2"], howMany: 2 },
  2: { pool: ["shape3", "color3", "fill3", "countUp", "countDown", "turn45", "turn90", "size3"], howMany: 3 },
};

function pickRules(rng: Rng, d: Difficulty, length: number): Rule[] {
  for (;;) {
    const names = distinct(rng, RULE_SETS[d].pool, RULE_SETS[d].howMany);
    const rules = names.map((n) => RULES[n](rng, length)).filter((r): r is Rule => r !== null);
    const attrs = rules.map((r) => r.attr);
    if (new Set(attrs).size !== attrs.length) continue; // one rule per attribute
    if (attrs.includes("rotation") && attrs.includes("shape")) continue; // turning needs a fixed turn-shape
    if (rules.length === RULE_SETS[d].howMany) return rules;
  }
}

function baseFigure(rng: Rng, d: Difficulty, rules: Rule[]): Figure {
  const turning = rules.some((r) => r.attr === "rotation");
  return {
    shape: turning ? pick(rng, TURN_SHAPES) : pick(rng, SHAPES),
    // hard puzzles look like the classic black-and-white tests unless color is the rule
    color: d === 2 ? "ink" : pick(rng, COLORS.slice(0, 5)),
    fill: d === 0 ? "solid" : pick(rng, ["none", "solid"] as const),
    size: 3,
    count: 1,
    rotation: 0,
  };
}

function buildSequence(base: Figure, rules: Rule[], length: number): Figure[] {
  return Array.from({ length }, (_, i) => {
    const f: Figure = { ...base };
    for (const r of rules) (f as Record<Attr, unknown>)[r.attr] = valueAt(r, i);
    return f;
  });
}

/* ------------------------------------------------------------------ */
/* Wrong answers                                                       */
/* ------------------------------------------------------------------ */

const DOMAINS: Record<Attr, readonly (string | number)[]> = {
  shape: SHAPES,
  color: COLORS.slice(0, 5),
  fill: FILLS,
  size: SIZES,
  count: COUNTS,
  rotation: ROTATIONS,
};

/** Change one attribute of `f` to a different value, preferring values already on screen. */
function mutate(rng: Rng, f: Figure, attr: Attr, seen: Figure[]): Figure {
  let domain: readonly (string | number)[] = DOMAINS[attr];
  if (attr === "shape" && (TURN_SHAPES as readonly string[]).includes(f.shape)) domain = TURN_SHAPES;
  if (attr === "color" && f.color === "ink") domain = COLORS.slice(0, 5);
  const onScreen = [...new Set(seen.map((s) => s[attr]))].filter((v) => v !== f[attr]);
  const others = domain.filter((v) => v !== f[attr]);
  let value: string | number;
  if (attr === "count") value = Math.max(1, Math.min(6, f.count + (rng() < 0.5 ? -1 : 1)));
  else if (attr === "rotation") value = f.rotation + pick(rng, [45, 90, 180, -90, -45]);
  else value = onScreen.length && rng() < 0.7 ? pick(rng, onScreen) : pick(rng, others);
  if (value === f[attr]) value = pick(rng, others);
  return { ...f, [attr]: value } as Figure;
}

/** Wrong options: each breaks the pattern in exactly one way. */
function distractors(rng: Rng, answers: Figure[], varying: Attr[], n: number, seen: Figure[]): Figure[] {
  const out: Figure[] = [];
  const all = [...answers];
  const attrs = [...new Set<Attr>([...varying, "color", "shape", "fill", "count"])];
  for (let tries = 0; out.length < n && tries < 500; tries++) {
    const from = pick(rng, answers);
    // mostly break a rule that is actually in play, sometimes change something else
    const attr = rng() < 0.75 && varying.length ? pick(rng, varying) : pick(rng, attrs);
    if (attr === "rotation" && !(TURN_SHAPES as readonly string[]).includes(from.shape)) continue;
    const d = mutate(rng, from, attr, seen);
    if (all.some((x) => sameFigure(x, d))) continue;
    out.push(d);
    all.push(d);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Puzzle types                                                        */
/* ------------------------------------------------------------------ */

export type SequencePuzzle = {
  kind: "sequence";
  items: (Figure | null)[]; // null = "?"
  answers: Figure[]; // in order of the "?" slots
  options: Figure[];
};

/** "What's next?": four figures, pick the fifth. */
export function makeWhatsNext(rng: Rng, d: Difficulty): SequencePuzzle {
  const length = 5;
  const rules = pickRules(rng, d, length);
  const seq = buildSequence(baseFigure(rng, d, rules), rules, length);
  const answer = seq[length - 1];
  const wrong = distractors(rng, [answer], rules.map((r) => r.attr), d === 0 ? 2 : 3, seq);
  return { kind: "sequence", items: [...seq.slice(0, -1), null], answers: [answer], options: shuffle(rng, [answer, ...wrong]) };
}

/** "Missing pieces" (like the classic test): a row with two gaps, choose both. */
export function makeMissingPieces(rng: Rng, d: Difficulty): SequencePuzzle {
  const length = d === 0 ? 5 : 6;
  for (;;) {
    const rules = pickRules(rng, d, length);
    const seq = buildSequence(baseFigure(rng, d, rules), rules, length);
    // two gaps, never side by side, never in the very first box
    const gapA = randInt(rng, 1, length - 3);
    const gapB = randInt(rng, gapA + 2, length - 1);
    const visible = seq.map((_, i) => i).filter((i) => i !== gapA && i !== gapB);
    if (!rules.every((r) => inferable(r, visible))) continue;
    const answers = [seq[gapA], seq[gapB]];
    if (sameFigure(answers[0], answers[1])) continue;
    const wrong = distractors(rng, answers, rules.map((r) => r.attr), d === 0 ? 2 : 3, seq);
    const items = seq.map((f, i) => (i === gapA || i === gapB ? null : f));
    return { kind: "sequence", items, answers, options: shuffle(rng, [...answers, ...wrong]) };
  }
}

export type OddPuzzle = { kind: "odd"; items: Figure[]; odd: number; rule: Attr };

const ODD_KEYS: Record<Difficulty, Attr[]> = {
  0: ["shape", "color", "size"],
  1: ["shape", "color", "fill", "count"],
  2: ["shape", "fill", "count", "rotation", "size"],
};

/** "Odd one out": all figures share one thing except one. Other things vary so they can't give it away. */
export function makeOddOneOut(rng: Rng, d: Difficulty): OddPuzzle {
  const n = d === 0 ? 4 : 5;
  for (;;) {
    const key = pick(rng, ODD_KEYS[d]);
    const noiseCount = d;
    // noise attributes get a different value on every figure, so they never single one out
    const noisePool = (["shape", "color", "count"] as Attr[]).filter((a) => a !== key && !(key === "rotation" && a === "shape"));
    const noise = distinct(rng, noisePool, noiseCount);
    const base: Figure = {
      shape: key === "rotation" ? pick(rng, TURN_SHAPES) : pick(rng, SHAPES),
      color: d === 2 ? "ink" : pick(rng, COLORS.slice(0, 5)),
      fill: d === 0 ? "solid" : pick(rng, ["none", "solid"] as const),
      size: key === "size" ? pick(rng, [1, 3]) : 3,
      count: key === "count" ? randInt(rng, 1, 4) : 1,
      rotation: key === "rotation" ? pick(rng, [0, 90, 180, 270]) : 0,
    };
    const items: Figure[] = Array.from({ length: n }, () => ({ ...base }));
    for (const a of noise) {
      const domain: readonly (string | number)[] =
        a === "shape" ? SHAPES : a === "color" ? (d === 2 ? COLORS : COLORS.slice(0, 5)) : COUNTS.slice(0, 5);
      const values = distinct(rng, domain, n);
      items.forEach((f, i) => ((f as Record<Attr, unknown>)[a] = values[i]));
    }
    const odd = randInt(rng, 0, n - 1);
    let oddValue: string | number;
    if (key === "rotation") oddValue = base.rotation + pick(rng, [90, 180, 270]);
    else if (key === "size") oddValue = base.size === 1 ? 3 : 1;
    else if (key === "count") oddValue = base.count + pick(rng, [1, 2]);
    else oddValue = pick(rng, (key === "shape" ? SHAPES : key === "color" ? COLORS.slice(0, 5) : FILLS).filter((v) => v !== base[key]));
    (items[odd] as Record<Attr, unknown>)[key] = oddValue;
    if (oddOnes(items).length === 1 && oddOnes(items)[0] === odd) return { kind: "odd", items, odd, rule: key };
  }
}

/** Indices that differ from all the others in some attribute where everyone else agrees. */
export function oddOnes(items: Figure[]): number[] {
  const attrs: Attr[] = ["shape", "color", "fill", "size", "count", "rotation"];
  const found = new Set<number>();
  for (const a of attrs) {
    const vals = items.map((f) => (a === "rotation" ? figureKey(f).split("|")[5] : String(f[a])));
    vals.forEach((v, i) => {
      const rest = vals.filter((_, j) => j !== i);
      if (rest.every((x) => x === rest[0]) && v !== rest[0]) found.add(i);
    });
  }
  // two identical figures can never be "the odd one", so duplicates also count as ambiguity
  return [...found];
}

export type MatrixPuzzle = { kind: "matrix"; size: 2 | 3; cells: (Figure | null)[]; answer: Figure; options: Figure[] };

const MATRIX_ATTRS: Attr[] = ["shape", "color", "count", "fill", "size"];

function attrValues(rng: Rng, a: Attr, n: number): (string | number)[] {
  if (a === "shape") return distinct(rng, SHAPES, n);
  if (a === "color") return distinct(rng, COLORS.slice(0, 5), n);
  if (a === "count") return n === 2 ? distinct(rng, [1, 2, 3], 2).sort() : [1, 2, 3];
  if (a === "fill") return distinct(rng, FILLS, n);
  return n === 2 ? [1, 3] : [1, 2, 3];
}

/** "Magic square": rows follow one rule, columns another. Fill in the empty cell. */
export function makeMagicSquare(rng: Rng, d: Difficulty): MatrixPuzzle {
  const size = d === 0 ? 2 : 3;
  const [rowAttr, colAttr] = distinct(rng, MATRIX_ATTRS, 2);
  const rowVals = attrValues(rng, rowAttr, size);
  const colVals = attrValues(rng, colAttr, size);
  const base: Figure = {
    shape: pick(rng, SHAPES),
    color: d === 2 ? "ink" : pick(rng, COLORS.slice(0, 5)),
    fill: "solid",
    size: 3,
    count: 1,
    rotation: 0,
  };
  const cells: Figure[] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      // hard: column attribute is a Latin square, so each row and column has every value once
      const ci = d === 2 ? (r + c) % size : c;
      cells.push({ ...base, [rowAttr]: rowVals[r], [colAttr]: colVals[ci] } as Figure);
    }
  const hole = randInt(rng, 0, cells.length - 1);
  const answer = cells[hole];
  const wrong = distractors(rng, [answer], [rowAttr, colAttr], d === 0 ? 2 : 3, cells);
  return {
    kind: "matrix",
    size,
    cells: cells.map((f, i) => (i === hole ? null : f)),
    answer,
    options: shuffle(rng, [answer, ...wrong]),
  };
}

export type { ColorName, ShapeKind };
