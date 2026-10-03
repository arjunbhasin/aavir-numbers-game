import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iPad and iPhone (they need a PNG). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#bfe6ff" }}>
        <div style={{ position: "relative", width: 130, height: 140, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 10, height: 18, background: "#2b7fdc", borderRadius: 5 }} />
          <div style={{ width: 120, height: 92, background: "#4aa3ff", borderRadius: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 92, height: 58, background: "#eaf6ff", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 14px" }}>
              <div style={{ width: 16, height: 16, borderRadius: 8, background: "#26324a" }} />
              <div style={{ width: 16, height: 16, borderRadius: 8, background: "#26324a" }} />
            </div>
          </div>
          <div style={{ width: 70, height: 26, background: "#2b7fdc", borderRadius: 10, marginTop: 4 }} />
        </div>
      </div>
    ),
    size,
  );
}
