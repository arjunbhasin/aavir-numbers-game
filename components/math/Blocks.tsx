/** A number shown as unit cubes in rows of five, with the number on top. */
export default function Blocks({ n, color = "#4aa3ff", dark = "#2b7fdc", size = 14 }: { n: number; color?: string; dark?: string; size?: number }) {
  const rows = Math.ceil(n / 5);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold text-ink leading-none">{n}</span>
      <div className="flex flex-col-reverse gap-[2px]">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-[2px]">
            {Array.from({ length: Math.min(5, n - r * 5) }, (_, i) => (
              <span key={i} className="rounded-[3px]" style={{ width: size, height: size, background: color, boxShadow: `inset 0 -3px 0 ${dark}` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
