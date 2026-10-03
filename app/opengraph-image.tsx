import { ImageResponse } from "next/og";

export const alt = "Aavir's Puzzle Park: logic games and pattern puzzles for kids";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const tiles = ["#ff7a6b", "#4aa3ff", "#5cc96b", "#a678f0", "#3fd1c0", "#ffc93c"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #bfe6ff, #eaf7ff)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 24, marginBottom: 48 }}>
          {tiles.map((c) => (
            <div key={c} style={{ width: 110, height: 110, borderRadius: 28, background: c, boxShadow: "0 10px 0 rgba(0,0,0,.15)" }} />
          ))}
        </div>
        <div style={{ fontSize: 92, fontWeight: 800, color: "#26324a" }}>Aavir&apos;s Puzzle Park</div>
        <div style={{ fontSize: 40, color: "#5a6785", marginTop: 12 }}>Logic games and pattern puzzles for young thinkers</div>
      </div>
    ),
    size,
  );
}
