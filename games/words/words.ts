/**
 * Picture words for the word games: short, everyday and easy to draw.
 * `rhyme` groups words that rhyme. Every word here has a drawing in components/words/WordPictures.tsx.
 */
export const WORDS = [
  { word: "cat", rhyme: "at" },
  { word: "hat", rhyme: "at" },
  { word: "bat", rhyme: "at" },
  { word: "rat", rhyme: "at" },
  { word: "dog", rhyme: "og" },
  { word: "log", rhyme: "og" },
  { word: "frog", rhyme: "og" },
  { word: "bug", rhyme: "ug" },
  { word: "mug", rhyme: "ug" },
  { word: "rug", rhyme: "ug" },
  { word: "car", rhyme: "ar" },
  { word: "star", rhyme: "ar" },
  { word: "jar", rhyme: "ar" },
  { word: "bee", rhyme: "ee" },
  { word: "key", rhyme: "ee" },
  { word: "tree", rhyme: "ee" },
  { word: "boat", rhyme: "oat" },
  { word: "coat", rhyme: "oat" },
  { word: "goat", rhyme: "oat" },
  { word: "fan", rhyme: "an" },
  { word: "van", rhyme: "an" },
  { word: "can", rhyme: "an" },
  { word: "hen", rhyme: "en" },
  { word: "pen", rhyme: "en" },
  { word: "box", rhyme: "ox" },
  { word: "fox", rhyme: "ox" },
  { word: "bell", rhyme: "ell" },
  { word: "shell", rhyme: "ell" },
  { word: "moon", rhyme: "oon" },
  { word: "spoon", rhyme: "oon" },
  { word: "cake", rhyme: "ake" },
  { word: "snake", rhyme: "ake" },
  { word: "net", rhyme: "et" },
  { word: "jet", rhyme: "et" },
  { word: "sun", rhyme: "un" },
  { word: "bus", rhyme: "us" },
  { word: "pig", rhyme: "ig" },
  { word: "cup", rhyme: "up" },
  { word: "bed", rhyme: "ed" },
  { word: "egg", rhyme: "egg" },
  { word: "owl", rhyme: "owl" },
  { word: "bag", rhyme: "ag" },
  { word: "fish", rhyme: "ish" },
  { word: "duck", rhyme: "uck" },
  { word: "ball", rhyme: "all" },
  { word: "kite", rhyme: "ite" },
  { word: "drum", rhyme: "um" },
  { word: "sock", rhyme: "ock" },
  { word: "nest", rhyme: "est" },
  { word: "leaf", rhyme: "eaf" },
] as const;

export type Word = (typeof WORDS)[number]["word"];

export const WORD_LIST: string[] = WORDS.map((w) => w.word);
export const rhymeOf = (word: string): string => WORDS.find((w) => w.word === word)!.rhyme;
export const VOWELS = "aeiou";
export const isVowel = (ch: string) => VOWELS.includes(ch);
