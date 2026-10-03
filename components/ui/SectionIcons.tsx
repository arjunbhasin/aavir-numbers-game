import type { SectionId } from "@/lib/catalog";

const p = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Small line icons for the home page section headers and tabs. */
export function SectionIcon({ id, className }: { id: SectionId; className?: string }) {
  switch (id) {
    case "logic":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p} aria-hidden>
          <path d="M9 4h4v2.5a1.5 1.5 0 1 0 3 0V4h4v5h-2.5a1.5 1.5 0 1 0 0 3H20v8h-5v-2.5a1.5 1.5 0 1 0-3 0V20H4v-5h2.5a1.5 1.5 0 1 0 0-3H4V4h5z" />
        </svg>
      );
    case "patterns":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p} aria-hidden>
          <circle cx="10" cy="10" r="6" />
          <path d="m14.5 14.5 5.5 5.5" />
          <path d="M8 9.5h4M10 7.5v4" />
        </svg>
      );
    case "memory":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p} aria-hidden>
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
        </svg>
      );
    case "numbers":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p} aria-hidden>
          <path d="M4 8l2-2v12M10 8a2 2 0 1 1 3.5 1.3L10 18h4M17 6h3l-2 4a3 3 0 1 1-2 5" />
        </svg>
      );
    case "addsub":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p} aria-hidden>
          <path d="M7 4v8M3 8h8M14 17h7" />
          <path d="M5 20 19 4" opacity=".35" />
        </svg>
      );
    case "words":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p} aria-hidden>
          <path d="M3 18 7.5 6 12 18M4.7 14h5.6" />
          <path d="M20 18v-6a2.5 2.5 0 0 0-5 0M20 15a2.5 2.5 0 1 1-2.5-2.5H20" />
        </svg>
      );
    case "abacus":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p} aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M8 3v18M16 3v18" />
          <circle cx="8" cy="6" r="1.4" fill="currentColor" />
          <circle cx="16" cy="12" r="1.4" fill="currentColor" />
          <circle cx="8" cy="12" r="1.4" fill="currentColor" />
          <circle cx="16" cy="15" r="1.4" fill="currentColor" />
        </svg>
      );
    case "multiply":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p} aria-hidden>
          <path d="m4 4 7 7M11 4l-7 7" />
          <path d="M14 17h7" />
          <circle cx="17.5" cy="13.5" r="1" fill="currentColor" />
          <circle cx="17.5" cy="20.5" r="1" fill="currentColor" />
        </svg>
      );
  }
}
