import { Chest, Crate, Fish, KeySprite, Penguin, Robot } from "@/components/grid/Sprites";
import { Carrot, Cookie, Flower, HopBunny, Ladybug } from "@/components/math/Art";
import { Apple, ToyArt } from "@/components/math/AddArt";

/** Pictures for the memory games. Each must look clearly different from the others. */
export const PICTURES: { label: string; node: React.ReactNode }[] = [
  { label: "robot", node: <Robot /> },
  { label: "penguin", node: <Penguin /> },
  { label: "fish", node: <Fish /> },
  { label: "carrot", node: <Carrot /> },
  { label: "cookie", node: <Cookie /> },
  { label: "flower", node: <Flower color={2} /> },
  { label: "bunny", node: <HopBunny /> },
  { label: "ladybug", node: <Ladybug /> },
  { label: "apple", node: <Apple /> },
  { label: "key", node: <KeySprite color="y" /> },
  { label: "treasure chest", node: <Chest /> },
  { label: "box", node: <Crate /> },
  { label: "ball", node: <ToyArt toy="ball" /> },
  { label: "teddy bear", node: <ToyArt toy="teddy" /> },
  { label: "kite", node: <ToyArt toy="kite" /> },
  { label: "car", node: <ToyArt toy="car" /> },
  { label: "duck", node: <ToyArt toy="duck" /> },
  { label: "rocket", node: <ToyArt toy="rocket" /> },
];
