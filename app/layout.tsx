import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import MotionPreferences from "@/components/ui/MotionPreferences";
import ProgressHydrator from "@/components/ui/ProgressHydrator";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Aavir's Puzzle Park",
  description: "Friendly logic games and pattern puzzles for young thinkers.",
  applicationName: "Puzzle Park",
  // "Add to Home Screen" on iPad opens it full screen like an app
  appleWebApp: { capable: true, title: "Puzzle Park", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#bfe6ff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fredoka.variable}>
      <body className="font-sans antialiased min-h-dvh">
        <MotionPreferences>
          <ProgressHydrator />
          {children}
        </MotionPreferences>
      </body>
    </html>
  );
}
