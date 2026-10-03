/**
 * Soroban (abacus) helpers. Each rod has one heaven bead worth 5 and four earth beads worth 1.
 * A bead "counts" when it is pushed to the beam.
 */
export type Rod = { heaven: boolean; earth: number };

export function digitToRod(d: number): Rod {
  return { heaven: d >= 5, earth: d % 5 };
}

export function rodToDigit(r: Rod): number {
  return (r.heaven ? 5 : 0) + r.earth;
}

/** Rods for a number, highest place first. */
export function toRods(value: number, rods: number): Rod[] {
  return Array.from({ length: rods }, (_, i) => digitToRod(Math.floor(value / 10 ** (rods - 1 - i)) % 10));
}

export function fromRods(rods: Rod[]): number {
  return rods.reduce((n, r) => n * 10 + rodToDigit(r), 0);
}

export type Method = "direct" | "little" | "big" | "combo";

export const METHOD_NAMES: Record<Method, string> = {
  direct: "Direct",
  little: "Little friend",
  big: "Big friend",
  combo: "Big + little friend",
};

/**
 * How an abacus learner adds digit d (1-9) to a rod showing a (0-9).
 *  direct:  the beads are free, just push them
 *  little:  +d = +5 − (5−d)            e.g. 3 + 4: +5 −1
 *  big:     +d = +10 − (10−d)          e.g. 8 + 7: +10 −3
 *  combo:   +d = +10 − 5 + (d−5)       e.g. 5 + 6: +10 −5 +1 (the big friend can't be taken off directly)
 */
export function methodFor(a: number, d: number): Method {
  const earth = a % 5;
  if (a + d >= 10) {
    const friend = 10 - d;
    // taking the big friend off needs that many earth beads, unless it is 5 or more
    if (friend < 5 && a >= 5 && earth < friend) return "combo";
    return "big";
  }
  if (d < 5) return earth + d <= 4 ? "direct" : "little";
  return "direct";
}

/** The formula as children learn to say it. */
export function formula(method: Method, d: number): string {
  switch (method) {
    case "direct":
      return `+${d}`;
    case "little":
      return `+5 − ${5 - d}`;
    case "big":
      return `+10 − ${10 - d}`;
    case "combo":
      return `+10 − 5 + ${d - 5}`;
  }
}

/** The bead moves in order, as signed amounts: little friend 4 → [+5, −1]. */
export function moves(method: Method, d: number): number[] {
  switch (method) {
    case "direct":
      return [d];
    case "little":
      return [5, -(5 - d)];
    case "big":
      return [10, -(10 - d)];
    case "combo":
      return [10, -5, d - 5];
  }
}

/** Which methods make sense to offer for +d (as answer cards). */
export function methodsFor(d: number): Method[] {
  return d < 5 ? ["direct", "little", "big"] : d === 5 ? ["direct", "big"] : ["direct", "big", "combo"];
}
