"use client";

import { useState } from "react";
import { VerdictCard, type TokenRef, type VerdictRecord } from "@/components/verdict-card";

type ApiResult =
  | VerdictRecord
  | { kind: "ambiguous"; candidates: TokenRef[] }
  | { kind: "notFound"; query: string }
  | { error: string; snapshots?: { id: string; symbol: string; platform: string; address: string; verdict: string }[] };

const PLATFORMS = [
  { id: "", label: "auto" },
  { id: "solana", label: "Solana" },
  { id: "bsc", label: "BSC" },
  { id: "base", label: "Base" },
  { id: "ethereum", label: "Ethereum" },
];

function VerdictSkeleton() {
  return (
    <div className="mt-6 space-y-5" role="status" aria-label="Analyzing token">
      <div className="rounded-lg border border-line bg-panel p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="skeleton h-12 w-44 -rotate-2" />
            <div className="skeleton h-6 w-56" />
            <div className="skeleton h-3 w-72 max-w-full" />
          </div>
          <div className="space-y-2 text-right">
            <div className="skeleton ml-auto h-12 w-24" />
            <div className="skeleton ml-auto h-1.5 w-40" />
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-line bg-panel">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-line/60 px-5 py-4 last:border-b-0">
            <div className="mb-3 flex justify-between">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-14" />
            </div>
            <div className="space-y-2">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-5/6" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only">Pulling swap-level DEX data, pool depth, and security flags from CoinMarketCap…</p>
    </div>
  );
}

export function Checker({ live }: { live: boolean }) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<ApiResult | null>(null);

  async function run(q: string, pick?: number, plat = platform) {
    setLoading(true);
    setOut(null);
    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, pick, platform: plat || undefined }),
      });
      setOut((await res.json()) as ApiResult);
    } catch (e) {
      setOut({ error: e instanceof Error ? e.message : "request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) run(query.trim());
        }}
      >
        <label htmlFor="token-input" className="sr-only">
          Token address, name, or ticker
        </label>
        <div className="flex gap-2">
          <input
            id="token-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste address or $TICKER — PEPE, 0x…, So111…"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-md border border-line-bright bg-raised px-4 py-3.5 font-data text-sm text-text placeholder:text-faint transition-colors hover:border-faint focus:border-safe"
          />
          <button
            disabled={loading || !query.trim()}
            className="shrink-0 rounded-md bg-safe px-5 py-3.5 font-data text-sm font-bold text-ink transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "RUNNING…" : "CHECK →"}
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-data text-[10px] uppercase tracking-widest text-faint">chain</span>
          {PLATFORMS.map((p) => (
            <button
              key={p.id || "auto"}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={`rounded-sm border px-2 py-1 font-data text-[11px] transition-colors ${
                platform === p.id
                  ? "border-safe/60 bg-safe/10 text-safe"
                  : "border-line bg-transparent text-dim hover:border-faint hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </form>

      {loading && <VerdictSkeleton />}

      {out && "error" in out && (
        <div className="mt-4 rounded-lg border border-danger/40 bg-danger/5 px-4 py-3.5 text-sm">
          <p className="font-data text-[11px] uppercase tracking-widest text-danger">Request failed</p>
          <p className="mt-1 text-dim">{out.error}</p>
          {out.snapshots && out.snapshots.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {out.snapshots.map((s) => (
                <button
                  key={s.symbol + s.platform}
                  onClick={() => run(s.address)}
                  className="rounded-sm border border-line px-2 py-1 font-data text-[11px] text-dim transition-colors hover:border-safe/60 hover:text-safe"
                >
                  {s.symbol} · {s.platform} · {s.verdict}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {out && "kind" in out && out.kind === "notFound" && (
        <div className="mt-4 rounded-lg border border-line bg-panel px-4 py-3.5 text-sm">
          <p className="font-data text-[11px] uppercase tracking-widest text-warn">No match</p>
          <p className="mt-1 text-dim">
            Nothing resolved for <span className="font-data text-text">“{out.query}”</span>. Paste the full contract
            address — tickers collide across chains and we never silently pick one.
          </p>
        </div>
      )}

      {out && "kind" in out && out.kind === "ambiguous" && (
        <div className="mt-4 rounded-lg border border-line bg-panel">
          <p className="border-b border-line px-4 py-3 font-data text-[11px] uppercase tracking-widest text-warn">
            Multiple matches — pick one (never silently chosen)
          </p>
          <div>
            {out.candidates.map((c, i) => (
              <button
                key={`${c.platform}:${c.address}`}
                onClick={() => run(query, i)}
                className="case-row block w-full border-b border-line/40 px-4 py-3 text-left last:border-b-0 hover:bg-raised"
              >
                <span className="font-semibold">{c.symbol}</span>
                <span className="ml-2 text-dim">{c.name}</span>
                <span className="ml-2 rounded-sm border border-line px-1.5 py-0.5 font-data text-[10px] uppercase tracking-wider text-faint">
                  {c.platform}
                </span>
                <span className="mt-1 block truncate font-data text-[11px] text-faint">{c.address}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {out && "kind" in out && out.kind === "verdict" && <VerdictCard v={out} />}
    </div>
  );
}
