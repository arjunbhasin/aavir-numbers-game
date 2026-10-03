import { pick, randInt, shuffle, type Rng } from "@/lib/random";
import type { Difficulty } from "@/games/patterns/generators";

export type Rule = { op: "×" | "+"; n: number };

export const apply = (r: Rule, x: number) => (r.op === "×" ? x * r.n : x + r.n);
export const label = (r: Rule) => `${r.op} ${r.n}`;
const same = (a: Rule, b: Rule) => a.op === b.op && a.n === b.n;

export type MachinePuzzle =
  | { kind: "rule"; examples: [number, number][]; options: Rule[]; answer: Rule }
  | { kind: "output"; rule: Rule; input: number; options: number[]; answer: number }
  | { kind: "undo"; rule: Rule; output: number; options: number[]; answer: number }
  | { kind: "chain"; rules: [Rule, Rule]; input: number; options: number[]; answer: number }
  | { kind: "combine"; rules: [Rule, Rule]; options: Rule[]; answer: Rule };

const TIMES: Record<Difficulty, number[]> = { 0: [2, 5, 10], 1: [2, 3, 4, 5, 10], 2: [2, 3, 4, 5] };

function randomRule(rng: Rng, d: Difficulty, allowPlus = true): Rule {
  if (allowPlus && rng() < 0.3) return { op: "+", n: randInt(rng, 1, d === 0 ? 5 : 9) };
  return { op: "×", n: pick(rng, TIMES[d]) };
}

function numberOptions(rng: Rng, answer: number, near: number[]): number[] {
  const wrong = [...new Set(near.filter((n) => n > 0 && n !== answer))];
  let extra = 1;
  while (wrong.length < 2) {
    if (!wrong.includes(answer + extra) && answer + extra !== answer) wrong.push(answer + extra);
    extra++;
  }
  return shuffle(rng, [answer, ...shuffle(rng, wrong).slice(0, 2)]);
}

/** Which rules agree with every example? */
export function consistent(rule: Rule, examples: [number, number][]): boolean {
  return examples.every(([i, o]) => apply(rule, i) === o);
}

function makeRule(rng: Rng, d: Difficulty): MachinePuzzle {
  for (;;) {
    const answer = randomRule(rng, d);
    const inputs = shuffle(rng, [1, 2, 3, 4, 5, 6]).slice(0, 3).sort((a, b) => a - b);
    const examples = inputs.map((i) => [i, apply(answer, i)] as [number, number]);
    // tempting wrong rules: same number with the other sign, or a neighbouring times table
    const tempting: Rule[] = [
      { op: answer.op === "×" ? "+" : "×", n: answer.n },
      { op: "×", n: answer.n + 1 },
      { op: "×", n: Math.max(2, answer.n - 1) },
      { op: "+", n: answer.n + 1 },
      randomRule(rng, d),
    ];
    const pool = tempting.filter((r) => !same(r, answer) && r.n > 0 && !consistent(r, examples));
    const unique = pool.filter((r, i) => pool.findIndex((x) => same(x, r)) === i);
    if (unique.length < 2) continue;
    return { kind: "rule", examples, answer, options: shuffle(rng, [answer, ...shuffle(rng, unique).slice(0, 2)]) };
  }
}

function makeOutput(rng: Rng, d: Difficulty): MachinePuzzle {
  const rule = randomRule(rng, d);
  const input = randInt(rng, 2, d === 0 ? 5 : 9);
  const answer = apply(rule, input);
  const near = rule.op === "×" ? [input + rule.n, answer + rule.n, answer - rule.n] : [input * rule.n, answer + 1, answer - 1];
  return { kind: "output", rule, input, answer, options: numberOptions(rng, answer, near) };
}

function makeUndo(rng: Rng, d: Difficulty): MachinePuzzle {
  const rule = randomRule(rng, d, false);
  const answer = randInt(rng, 2, 9);
  const output = apply(rule, answer);
  return { kind: "undo", rule, output, answer, options: numberOptions(rng, answer, [output, answer + 1, answer - 1, output - rule.n]) };
}

const COMBOS: { rules: [Rule, Rule]; answer: Rule }[] = [
  { rules: [{ op: "×", n: 2 }, { op: "×", n: 2 }], answer: { op: "×", n: 4 } },
  { rules: [{ op: "×", n: 2 }, { op: "×", n: 3 }], answer: { op: "×", n: 6 } },
  { rules: [{ op: "×", n: 2 }, { op: "×", n: 5 }], answer: { op: "×", n: 10 } },
  { rules: [{ op: "+", n: 2 }, { op: "+", n: 3 }], answer: { op: "+", n: 5 } },
  { rules: [{ op: "+", n: 4 }, { op: "+", n: 4 }], answer: { op: "+", n: 8 } },
  { rules: [{ op: "×", n: 3 }, { op: "×", n: 2 }], answer: { op: "×", n: 6 } },
];

function makeCombine(rng: Rng): MachinePuzzle {
  const c = pick(rng, COMBOS);
  const [a, b] = c.rules;
  // the classic mistake is adding the numbers when they multiply, or vice versa
  const tempting: Rule[] = [
    { op: c.answer.op, n: a.op === "×" ? a.n + b.n : a.n * b.n },
    { op: c.answer.op === "×" ? "+" : "×", n: c.answer.n },
  ];
  const wrong = tempting.filter((r) => !same(r, c.answer));
  return { kind: "combine", rules: c.rules, answer: c.answer, options: shuffle(rng, [c.answer, ...wrong]) };
}

function makeChain(rng: Rng): MachinePuzzle {
  const rules: [Rule, Rule] = [{ op: "×", n: pick(rng, [2, 3]) }, pick(rng, [{ op: "+", n: randInt(rng, 1, 5) }, { op: "×", n: 2 }] as Rule[])];
  const input = randInt(rng, 2, 5);
  const answer = apply(rules[1], apply(rules[0], input));
  return {
    kind: "chain",
    rules,
    input,
    answer,
    options: numberOptions(rng, answer, [apply(rules[0], input), apply(rules[0], apply(rules[1], input)), answer + 1]),
  };
}

export function makeMachinePuzzle(rng: Rng, d: Difficulty): MachinePuzzle {
  const r = rng();
  if (d === 0) return r < 0.5 ? makeRule(rng, d) : makeOutput(rng, d);
  if (d === 1) return r < 0.4 ? makeRule(rng, d) : r < 0.7 ? makeUndo(rng, d) : makeOutput(rng, d);
  return r < 0.35 ? makeChain(rng) : r < 0.65 ? makeCombine(rng) : makeUndo(rng, d);
}
