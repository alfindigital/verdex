// Pure presentational verdict card — safe for server and client rendering.

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

export const VERDICT_STYLE: Record<string, { label: string; cls: string }> = {
  LAYAK: { label: "ENTRY-WORTHY", cls: "border-emerald-500 bg-emerald-500/10 text-emerald-300" },
  RAWAN: { label: "CAUTION", cls: "border-amber-500 bg-amber-500/10 text-amber-300" },
  JANGAN: { label: "AVOID", cls: "border-red-500 bg-red-500/10 text-red-300" },
  BELUM_CUKUP_BUKTI: { label: "INSUFFICIENT EVIDENCE", cls: "border-neutral-500 bg-neutral-500/10 text-neutral-300" },
};
const LEVEL_DOT: Record<string, string> = {
  CLEAN: "bg-emerald-400",
  WARN: "bg-amber-400",
  DANGER: "bg-red-400",
  INSUFFICIENT: "bg-neutral-500",
};

export function VerdictCard({ v }: { v: VerdictRecord }) {
  const style = VERDICT_STYLE[v.result.verdict] ?? VERDICT_STYLE.BELUM_CUKUP_BUKTI;
  return (
    <section className="mt-6 space-y-4">
      <div className={`rounded-xl border-2 p-5 ${style.cls}`}>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-black tracking-tight">{style.label}</span>
            <span className="ml-3 text-lg font-semibold text-neutral-200">
              {v.token.symbol} <span className="text-sm text-neutral-400">on {v.token.platform}</span>
            </span>
          </div>
          <div className="text-right text-sm">
            <div>
              score <span className="font-mono font-bold">{v.result.score}</span>/100
            </div>
            <div className="text-neutral-400">confidence: {v.result.confidence}</div>
          </div>
        </div>
        <p className="mt-1 font-mono text-xs text-neutral-500">
          {v.token.address} · {v.ts}
        </p>
      </div>

      {v.narration && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <p className="font-semibold">{v.narration.headline}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-300">
            {v.narration.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-neutral-500">narrative source: {v.narration.source} (verdict computed by rules)</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {v.result.subs.map((s) => (
          <div key={s.dim} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${LEVEL_DOT[s.level] ?? "bg-neutral-500"}`} />
              <span className="font-semibold">{s.dim}</span>
              <span className="ml-auto text-xs text-neutral-400">{s.level}</span>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {s.metrics.map((m) => (
                  <tr key={m.name} className="border-t border-neutral-800/60">
                    <td className="py-1 pr-2 text-neutral-400">{m.name}</td>
                    <td className="py-1 font-mono">{String(m.value)}</td>
                    <td className="py-1 pl-2 text-right text-neutral-500">{m.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">Jev second opinion:</span>
          {v.jev.available ? (
            <span className="font-mono">P(risky) = {v.jev.riskyProb?.toFixed(2)}</span>
          ) : (
            <span className="text-neutral-500">unavailable — verdict stands on rules alone</span>
          )}
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${
              v.agreement === "consensus"
                ? "bg-emerald-500/20 text-emerald-300"
                : v.agreement === "contested"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-neutral-700 text-neutral-300"
            }`}
          >
            {v.agreement}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4 text-sm">
        <span className="font-semibold text-amber-300">Falsifier — </span>
        <span className="text-amber-100/80">{v.result.falsifier}</span>
      </div>

      {v.failures.length > 0 && (
        <div className="rounded-xl border border-neutral-700 p-4 text-xs text-neutral-400">
          {v.failures.length} endpoint(s) failed — affected dimensions marked INSUFFICIENT:
          <ul className="mt-1 list-disc pl-5">
            {v.failures.map((f, i) => (
              <li key={i}>
                {f.endpoint}: {f.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="rounded-xl border border-neutral-800">
        <summary className="cursor-pointer p-3 text-sm text-neutral-400 hover:text-neutral-200">
          Evidence receipts — {v.receipts.length} CMC calls
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900 text-left text-neutral-400">
                <th className="p-2">endpoint</th>
                <th className="p-2">params</th>
                <th className="p-2">credits</th>
                <th className="p-2">sha256</th>
                <th className="p-2">source</th>
              </tr>
            </thead>
            <tbody>
              {v.receipts.map((r, i) => (
                <tr key={i} className="border-t border-neutral-800/60 font-mono">
                  <td className="p-2">{r.endpoint}</td>
                  <td className="p-2 text-neutral-500">{JSON.stringify(r.params)}</td>
                  <td className="p-2">{r.credits}</td>
                  <td className="p-2">{r.sha256.slice(0, 12)}…</td>
                  <td className="p-2">{r.cached ? "cache" : "live"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
