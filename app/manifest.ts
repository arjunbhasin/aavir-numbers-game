import type { MetadataRoute } from "next";

/** Lets tablets install the site from the browser and open it full screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aavir's Puzzle Park",
    short_name: "Puzzle Park",
    description: "Friendly logic games, pattern puzzles, maths and word games for young thinkers.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#eaf7ff",
    theme_color: "#bfe6ff",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
