import { shuffle, type Rng } from "@/lib/random";

export type Face = { type: "pic"; pic: number } | { type: "num"; n: number } | { type: "dots"; n: number };
export type Card = { id: number; key: number; face: Face };

/** Picture pairs, or (hard) a number that matches its dots. */
export function makeDeck(rng: Rng, pairs: number, mode: "pictures" | "numbers", pictureCount: number): Card[] {
  const keys = shuffle(rng, Array.from({ length: mode === "numbers" ? 9 : pictureCount }, (_, i) => i)).slice(0, pairs);
  const cards: Card[] = keys.flatMap((k, i) =>
    mode === "numbers"
      ? [
          { id: i * 2, key: k, face: { type: "num", n: k + 1 } as Face },
          { id: i * 2 + 1, key: k, face: { type: "dots", n: k + 1 } as Face },
        ]
      : [
          { id: i * 2, key: k, face: { type: "pic", pic: k } as Face },
          { id: i * 2 + 1, key: k, face: { type: "pic", pic: k } as Face },
        ],
  );
  return shuffle(rng, cards);
}

export function matchStars(moves: number, pairs: number): number {
  return moves <= Math.ceil(pairs * 1.5) ? 3 : moves <= pairs * 2.5 ? 2 : 1;
}
