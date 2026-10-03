"use client";

import { motion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import { MachineBox } from "@/components/math/Art";
import Choices from "@/components/math/Choices";
import type { PuzzleProps } from "@/components/shapes/PatternGame";
import { useLater } from "@/lib/input";
import { makeRng } from "@/lib/random";
import { playSound } from "@/lib/sound";
import { apply, label, makeMachinePuzzle, type Rule } from "./logic";

function Ball({ children, ask = false }: { children: ReactNode; ask?: boolean }) {
  return (
    <motion.div
      key={String(children)}
      initial={{ scale: 0.5 }}
      animate={{ scale: 1 }}
      className={`grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-full text-3xl font-bold shrink-0 ${
        ask ? "border-4 border-dashed border-berry text-berry bg-white" : "bg-sun text-ink shadow-[0_5px_0_#e8a800]"
      }`}
    >
      {children}
    </motion.div>
  );
}

const Arrow = () => <span className="text-3xl text-ink-soft font-bold">→</span>;

function Row({ input, machines, output }: { input: ReactNode; machines: ReactNode[]; output: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
      {input}
      {machines.map((m, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-3">
          <Arrow />
          {m}
        </div>
      ))}
      <Arrow />
      {output}
    </div>
  );
}

const machine = (text: string, busy = false) => <MachineBox label={text} busy={busy} className="w-32 sm:w-44 shrink-0" />;

export default function MachinePuzzle({ seed, difficulty, onSolved }: PuzzleProps) {
  const p = useMemo(() => makeMachinePuzzle(makeRng(seed), difficulty), [seed, difficulty]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const later = useLater();

  const [note, setNote] = useState<string | null>(null);
  const win = (sentence: string) => {
    setSolved(true);
    playSound("correct");
    setNote(sentence);
    later(() => onSolved(wrong.length), 1800);
  };
  const miss = (i: number) => {
    playSound("wrong");
    setWrong((w) => [...w, i]);
  };

  let question: string;
  let picture: ReactNode;
  let choices: { value: number | Rule; label: string }[];
  let check: (v: number | Rule) => string | null;

  switch (p.kind) {
    case "rule":
      question = "What does the machine do?";
      picture = (
        <div className="flex flex-col gap-3">
          {p.examples.map(([i, o]) => (
            <Row key={i} input={<Ball>{i}</Ball>} machines={[machine(solved ? label(p.answer) : "?")]} output={<Ball>{o}</Ball>} />
          ))}
        </div>
      );
      choices = p.options.map((r) => ({ value: r, label: label(r) }));
      check = (v) => (label(v as Rule) === label(p.answer) ? `The machine does ${label(p.answer)}!` : null);
      break;
    case "output":
      question = "What comes out?";
      picture = <Row input={<Ball>{p.input}</Ball>} machines={[machine(label(p.rule), solved)]} output={<Ball ask={!solved}>{solved ? p.answer : "?"}</Ball>} />;
      choices = p.options.map((n) => ({ value: n, label: String(n) }));
      check = (v) => (v === p.answer ? `${p.input} ${label(p.rule)} = ${p.answer}` : null);
      break;
    case "undo":
      question = "What went in? Run the machine backwards!";
      picture = <Row input={<Ball ask={!solved}>{solved ? p.answer : "?"}</Ball>} machines={[machine(label(p.rule), solved)]} output={<Ball>{p.output}</Ball>} />;
      choices = p.options.map((n) => ({ value: n, label: String(n) }));
      check = (v) =>
        v === p.answer
          ? p.rule.op === "×"
            ? `${p.output} ÷ ${p.rule.n} = ${p.answer}, because ${p.answer} × ${p.rule.n} = ${p.output}`
            : `${p.output} − ${p.rule.n} = ${p.answer}`
          : null;
      break;
    case "chain":
      question = "Two machines in a row. What comes out at the end?";
      picture = (
        <Row
          input={<Ball>{p.input}</Ball>}
          machines={[machine(label(p.rules[0]), solved), machine(label(p.rules[1]), solved)]}
          output={<Ball ask={!solved}>{solved ? p.answer : "?"}</Ball>}
        />
      );
      choices = p.options.map((n) => ({ value: n, label: String(n) }));
      check = (v) => (v === p.answer ? `${p.input} → ${apply(p.rules[0], p.input)} → ${p.answer}` : null);
      break;
    case "combine":
      question = "One machine that does the same as both. Which one?";
      picture = (
        <div className="flex flex-col items-center gap-4">
          <Row input={<Ball>?</Ball>} machines={[machine(label(p.rules[0])), machine(label(p.rules[1]))]} output={<Ball>?</Ball>} />
          <span className="text-2xl font-bold text-ink-soft">is the same as</span>
          <Row input={<Ball>?</Ball>} machines={[machine(solved ? label(p.answer) : "?")]} output={<Ball>?</Ball>} />
        </div>
      );
      choices = p.options.map((r) => ({ value: r, label: label(r) }));
      check = (v) => {
        if (label(v as Rule) !== label(p.answer)) return null;
        const x = 3;
        return `Try 3: ${x} → ${apply(p.rules[0], x)} → ${apply(p.rules[1], apply(p.rules[0], x))}, and 3 ${label(p.answer)} = ${apply(p.answer, x)}`;
      };
      break;
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="w-full max-w-4xl rounded-[2rem] bg-white/60 p-4 sm:p-6">{picture}</div>
      <p className={`text-2xl font-semibold text-center min-h-8 ${solved ? "text-grass-dark" : "text-ink"}`}>{solved ? note : question}</p>
      <Choices
        choices={choices}
        wrong={wrong}
        disabled={solved}
        accent="#a678f0"
        shadow="#7c4fd0"
        onPick={(v, i) => {
          const sentence = check(v);
          if (sentence) win(sentence);
          else miss(i);
        }}
      />
    </div>
  );
}
