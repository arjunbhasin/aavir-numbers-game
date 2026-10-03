import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import ProgressHydrator from "@/components/ui/ProgressHydrator";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Aavir's Puzzle Park",
  description: "Friendly logic games and pattern puzzles for young thinkers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#bfe6ff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fredoka.variable}>
      <body className="font-sans antialiased min-h-dvh">
        <ProgressHydrator />
        {children}
      </body>
    </html>
  );
}
