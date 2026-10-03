export type ShareLevel = { kind: "share"; cookies: number; plates: number; dealButton?: boolean };
export type ReverseLevel = { kind: "reverse"; plates: number; each: number; leftover: number; choices: number[] };
export type PlatesLevel = { kind: "plates"; cookies: number; choices: number[] };
export type Level = ShareLevel | ReverseLevel | PlatesLevel;

/** Giving a cookie is fair only if that plate doesn't already have more than the emptiest plate. */
export function canGive(counts: number[], plate: number): boolean {
  return counts[plate] <= Math.min(...counts);
}

/** Sharing is finished when there aren't enough cookies left for everyone to get one more. */
export function isDone(counts: number[], left: number): boolean {
  return left < counts.length && counts.every((c) => c === counts[0]);
}

export function shareSentence(cookies: number, plates: number): string {
  const each = Math.floor(cookies / plates);
  const left = cookies % plates;
  return left ? `${cookies} ÷ ${plates} = ${each}, with ${left} left for the dog` : `${cookies} ÷ ${plates} = ${each} each`;
}

export function reverseAnswer(l: ReverseLevel): number {
  return l.plates * l.each + l.leftover;
}
