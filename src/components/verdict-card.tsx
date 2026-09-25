// Pure presentational verdict card — safe for server and client rendering.
// Motif: forensic evidence file. Verdict = rubber stamp, metrics = ledger.

export type TokenRef = { platform: string; address: string; name: string; symbol: string; mcapUsd?: number | null; vol24hUsd?: number | null };
export type MetricRow = { name: string; value: number | string; threshold: string; level: string };
export type SubVerdict = { dim: string; level: string; metrics: MetricRow[] };
export type VerdictRecord = {
  kind: "verdict";
  id: string;
  ts: string;
  token: TokenRef;
  metrics: Record<string, Record<string, number | string | null>>;
  result: { verdict: string; score: number; confidence: string; falsifier: string; subs: SubVerdict[] };
  jev: { available: boolean; riskyProb: number | null };
  agreement: string;
  narration: { source: string; headline: string; bullets: string[] } | null;
  receipts: { endpoint: string; params: Record<string, unknown>; ts: string; credits: number; sha256: string; cached: boolean }[];
  failures: { endpoint: string; error: string }[];
};

type Tone = { text: string; chip: string; meter: string; bar: string };
const TONE: Record<string, Tone> = {
  safe: { text: "text-safe", chip: "border-safe/50 text-safe", meter: "bg-safe", bar: "bg-safe" },
  warn: { text: "text-warn", chip: "border-warn/50 text-warn", meter: "bg-warn", bar: "bg-warn" },
  danger: { text: "text-danger", chip: "border-danger/50 text-danger", meter: "bg-danger", bar: "bg-danger" },
  unknown: { text: "text-unknown", chip: "border-unknown/50 text-unknown", meter: "bg-unknown", bar: "bg-unknown" },
};

export const VERDICT_STYLE: Record<string, { label: string; tone: keyof typeof TONE }> = {
  LAYAK: { label: "ENTRY-WORTHY", tone: "safe" },
  RAWAN: { label: "CAUTION", tone: "warn" },
  JANGAN: { label: "AVOID", tone: "danger" },
  BELUM_CUKUP_BUKTI: { label: "INSUFFICIENT EVIDENCE", tone: "unknown" },
};

const LEVEL_TONE: Record<string, keyof typeof TONE> = {
  CLEAN: "safe",
  WARN: "warn",
  DANGER: "danger",
  INSUFFICIENT: "unknown",
};

export function VerdictCard({ v }: { v: VerdictRecord }) {
  const style = VERDICT_STYLE[v.result.verdict] ?? VERDICT_STYLE.BELUM_CUKUP_BUKTI;
  const tone = TONE[style.tone];
  return (
    <section className="reveal space-y-5" aria-label={`Verdict for ${v.token.symbol}`}>
      {/* ——— Verdict stamp panel ——— */}
      <div className="rounded-lg border border-line bg-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <span className={`stamp stamp-lg ${tone.text}`}>{style.label}</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">
              {v.token.name} <span className="font-data text-dim">${v.token.symbol}</span>
            </h2>
            <p className="mt-1 font-data text-xs text-faint break-all">
              {v.token.platform.toUpperCase()} · {v.token.address}
            </p>
          </div>
          <div className="text-right">
            <div className={`num font-data text-5xl font-bold ${tone.text}`}>
              {v.result.score}
              <span className="text-lg text-faint">/100</span>
            </div>
            <div className="meter mt-2 w-40">
              <span className={tone.bar} style={{ width: `${v.result.score}%` }} />
            </div>
            <div className="mt-2 font-data text-xs text-dim">
              confidence <span className="text-text">{v.result.confidence}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 font-data text-[11px] text-faint">
          verdict id {v.id} · computed {v.ts} · deterministic rules
        </p>
      </div>

      {/* ——— Narration ——— */}
      {v.narration && (
        <div className="rounded-lg border border-line bg-panel p-5">
          <p className="font-semibold leading-snug">{v.narration.headline}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-dim marker:text-faint">
            {v.narration.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <p className="mt-3 font-data text-[11px] text-faint">
            AI narration ({v.narration.source}) — verdict computed by rules
          </p>
        </div>
      )}

      {/* ——— Evidence ledger: one block per dimension ——— */}
      <div className="rounded-lg border border-line bg-panel">
        <div className="border-b border-line px-5 py-3 font-data text-[11px] uppercase tracking-[0.18em] text-faint">
          Evidence ledger
        </div>
        {v.result.subs.map((s) => {
          const lt = TONE[LEVEL_TONE[s.level] ?? "unknown"];
          return (
            <div key={s.dim} className="border-b border-line/60 px-5 py-4 last:border-b-0">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-data text-sm font-bold tracking-wide">{s.dim}</span>
                <span className={`rounded-sm border px-1.5 py-0.5 font-data text-[10px] font-bold tracking-widest ${lt.chip}`}>
                  {s.level}
                </span>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {s.metrics.map((m) => (
                    <tr key={m.name} className="border-t border-line/40">
                      <td className="py-1.5 pr-3 text-dim">{m.name}</td>
                      <td className="num py-1.5 font-data font-medium">{String(m.value)}</td>
                      <td className="py-1.5 pl-3 text-right font-data text-faint">{m.threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* ——— Second opinion ——— */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-line bg-panel px-5 py-4 text-sm">
        <span className="font-data text-[11px] uppercase tracking-[0.18em] text-faint">Jev second opinion</span>
        {v.jev.available ? (
          <span className="num font-data">
            P(risky) = <span className="font-bold">{v.jev.riskyProb?.toFixed(2)}</span>
          </span>
        ) : (
          <span className="text-faint">unavailable — verdict stands on rules alone</span>
        )}
        <span
          className={`ml-auto rounded-sm border px-1.5 py-0.5 font-data text-[10px] font-bold uppercase tracking-widest ${
            v.agreement === "consensus"
              ? TONE.safe.chip
              : v.agreement === "contested"
                ? TONE.danger.chip
                : TONE.unknown.chip
          }`}
        >
          {v.agreement}
        </span>
      </div>

      {/* ——— Falsifier ——— */}
      <div className="rounded-lg border border-warn/30 bg-warn/5 p-5">
        <p className="font-data text-[11px] uppercase tracking-[0.18em] text-warn">Falsifier condition</p>
        <p className="mt-2 text-sm leading-relaxed text-text/85">{v.result.falsifier}</p>
      </div>

      {v.failures.length > 0 && (
        <div className="rounded-lg border border-line p-4 text-xs text-dim">
          {v.failures.length} endpoint(s) failed — affected dimensions marked INSUFFICIENT:
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5 font-data">
            {v.failures.map((f, i) => (
              <li key={i}>
                {f.endpoint}: {f.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ——— Receipts ——— */}
      <details className="group rounded-lg border border-line bg-panel">
        <summary className="cursor-pointer select-none px-5 py-3.5 font-data text-xs text-dim transition-colors hover:text-text [&::-webkit-details-marker]:hidden">
          <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
          Evidence receipts — {v.receipts.length} CMC calls · SHA-256 logged
        </summary>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-raised text-left font-data text-[10px] uppercase tracking-widest text-faint">
                <th className="p-2.5">endpoint</th>
                <th className="p-2.5">params</th>
                <th className="p-2.5">credits</th>
                <th className="p-2.5">sha256</th>
                <th className="p-2.5">source</th>
              </tr>
            </thead>
            <tbody>
              {v.receipts.map((r, i) => (
                <tr key={i} className="border-t border-line/40 font-data">
                  <td className="p-2.5">{r.endpoint}</td>
                  <td className="max-w-48 truncate p-2.5 text-faint" title={JSON.stringify(r.params)}>
                    {JSON.stringify(r.params)}
                  </td>
                  <td className="num p-2.5">{r.credits}</td>
                  <td className="p-2.5 text-dim">{r.sha256.slice(0, 12)}…</td>
                  <td className="p-2.5 text-faint">{r.cached ? "cache" : "live"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
