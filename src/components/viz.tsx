// Pure-SVG data-viz primitives for the Verdex terminal UI. Zero dependencies.

export function fmtUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function fmtPct(n: number | null | undefined, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function fmtNum(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US");
}

/** Horizontal bar vs a threshold tick. value 0..1, threshold 0..1 (optional). */
export function HBar({
  value,
  max = 1,
  threshold,
  tone = "bg-safe",
  height = 6,
}: {
  value: number;
  max?: number;
  threshold?: number;
  tone?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  const t = threshold != null ? Math.max(0, Math.min(1, threshold / max)) * 100 : null;
  return (
    <div className="relative w-full" style={{ height }} role="img" aria-label={`bar ${pct.toFixed(0)}%`}>
      <div className="absolute inset-0 rounded-sm bg-line" />
      <div className={`absolute inset-y-0 left-0 rounded-sm ${tone}`} style={{ width: `${pct}%` }} />
      {t != null && <div className="absolute inset-y-[-2px] w-px bg-text/70" style={{ left: `${t}%` }} />}
    </div>
  );
}

/** Diverging buy/sell bar — buy left(green) vs sell right(red) around center. */
export function SplitBar({ buy, sell }: { buy: number; sell: number }) {
  const total = buy + sell;
  if (total <= 0) {
    return <div className="h-3 w-full rounded-sm bg-line" role="img" aria-label="no data" />;
  }
  const b = (buy / total) * 100;
  const s = 100 - b;
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-sm" role="img" aria-label={`buy ${b.toFixed(0)}% sell ${s.toFixed(0)}%`}>
      <div className="bg-safe" style={{ width: `${b}%` }} />
      <div className="bg-danger" style={{ width: `${s}%` }} />
    </div>
  );
}

/** Centered -1..+1 needle gauge for netBuyRatio. */
export function NeedleGauge({ value, min = -1, max = 1 }: { value: number; min?: number; max?: number }) {
  const pct = ((value - min) / (max - min)) * 100;
  const tone = value >= 0 ? "bg-safe" : "bg-danger";
  return (
    <div className="relative h-2 w-full rounded-sm bg-line" role="img" aria-label={`needle ${value.toFixed(2)}`}>
      <div className="absolute inset-y-0 left-1/2 w-px bg-text/40" />
      <div
        className={`absolute inset-y-[-3px] w-1.5 rounded-sm ${tone}`}
        style={{ left: `calc(${Math.max(0, Math.min(100, pct))}% - 3px)` }}
      />
    </div>
  );
}

/** Score arc gauge 0..100, ~240° sweep. */
export function ScoreGauge({ score, tone = "#34d399", size = 120 }: { score: number; tone?: string; size?: number }) {
  const r = 44;
  const cx = 50;
  const cy = 54;
  const start = -210;
  const sweep = 240;
  const frac = Math.max(0, Math.min(1, score / 100));
  const arc = (from: number, to: number) => {
    const p = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return `${cx + r * Math.cos(rad)} ${cy + r * Math.sin(rad)}`;
    };
    return `M ${p(from)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${p(to)}`;
  };
  const end = start + sweep * frac;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`score ${score}/100`}>
      <path d={arc(start, start + sweep)} fill="none" stroke="var(--color-line)" strokeWidth="7" strokeLinecap="round" />
      {frac > 0.004 && (
        <path d={arc(start, end)} fill="none" stroke={tone} strokeWidth="7" strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--color-text)" fontFamily="var(--font-data)">
        {score}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="var(--color-faint)" fontFamily="var(--font-data)">
        /100
      </text>
    </svg>
  );
}

/** Donut for share metrics (e.g. top5 maker share). */
export function Donut({ share, tone = "#34d399", size = 64, label }: { share: number; tone?: string; size?: number; label: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, share));
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label={`${label} ${(frac * 100).toFixed(0)}%`}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-line)" strokeWidth="6" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth="6"
        strokeDasharray={`${frac * c} ${c}`}
        strokeLinecap="butt"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="27" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-text)" fontFamily="var(--font-data)">
        {(frac * 100).toFixed(0)}%
      </text>
    </svg>
  );
}

/** Dimension level bar: CLEAN/WARN/DANGER/INSUFFICIENT as 3 segments + position. */
export function LevelMeter({ level }: { level: string }) {
  const pos = level === "CLEAN" ? 0 : level === "WARN" ? 1 : level === "DANGER" ? 2 : -1;
  const segs = ["bg-safe", "bg-warn", "bg-danger"];
  return (
    <div className="flex gap-1" role="img" aria-label={`level ${level}`}>
      {segs.map((c, i) => (
        <span
          key={c}
          className={`h-1.5 w-6 rounded-sm ${i <= pos ? c : "bg-line"} ${pos === -1 ? "bg-line" : ""}`}
        />
      ))}
    </div>
  );
}

/** Dense stat tile. */
export function Stat({ k, v, sub, tone }: { k: string; v: string; sub?: string; tone?: string }) {
  return (
    <div className="border-l-2 border-line pl-3">
      <div className="font-data text-[10px] uppercase tracking-[0.15em] text-faint">{k}</div>
      <div className={`num mt-0.5 font-data text-lg font-bold leading-none ${tone ?? "text-text"}`}>{v}</div>
      {sub && <div className="mt-0.5 font-data text-[10px] text-faint">{sub}</div>}
    </div>
  );
}
