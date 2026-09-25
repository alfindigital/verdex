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
  { id: "solana", label: "sol" },
  { id: "bsc", label: "bsc" },
  { id: "base", label: "base" },
  { id: "ethereum", label: "eth" },
];

function ScanSkeleton() {
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-line bg-raised" role="status" aria-label="Scanning token">
      <div className="flex flex-wrap items-center gap-6 border-b border-line px-5 py-5">
        <div className="space-y-2.5">
          <div className="skeleton h-9 w-36 -rotate-2" />
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-3 w-64 max-w-full" />
        </div>
        <div className="skeleton h-24 w-24 rounded-full" />
        <div className="ml-auto grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-2.5 w-14" />
              <div className="skeleton h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-line/60 p-5 lg:[&:nth-child(-n+2)]:border-b lg:odd:border-r">
            <div className="mb-3 flex justify-between">
              <div className="skeleton h-3.5 w-24" />
              <div className="skeleton h-3.5 w-16" />
            </div>
            <div className="skeleton mb-3 h-3 w-full" />
            <div className="skeleton mb-3 h-2 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only">Pulling swaps, pools, LP events and security flags from CoinMarketCap…</p>
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
        <div className="flex items-stretch overflow-hidden rounded-md border border-line-bright bg-ink transition-colors focus-within:border-safe">
          <span className="flex select-none items-center pl-3.5 font-data text-sm font-bold text-safe" aria-hidden="true">
            &gt;
          </span>
          <input
            id="token-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="address | $ticker | name"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-3 py-3.5 font-data text-sm text-text caret-safe placeholder:text-faint focus:outline-none"
          />
          <button
            disabled={loading || !query.trim()}
            className="shrink-0 border-l border-line-bright bg-raised px-5 font-data text-xs font-bold uppercase tracking-widest text-safe transition-colors hover:bg-safe hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "…" : "run"}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-data text-[10px] uppercase tracking-widest text-faint">--chain</span>
          {PLATFORMS.map((p) => (
            <button
              key={p.id || "auto"}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={`rounded-sm border px-2 py-0.5 font-data text-[10px] transition-colors ${
                platform === p.id
                  ? "border-safe/60 bg-safe/10 text-safe"
                  : "border-line text-dim hover:border-faint hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </form>

      {loading && <ScanSkeleton />}

      {out && "error" in out && (
        <div className="mt-4 rounded-md border border-danger/40 bg-danger/5 px-4 py-3">
          <p className="font-data text-[10px] uppercase tracking-widest text-danger">ERR — request failed</p>
          <p className="mt-1 font-data text-xs text-dim">{out.error}</p>
          {out.snapshots && out.snapshots.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {out.snapshots.map((s) => (
                <button
                  key={s.symbol + s.platform}
                  onClick={() => run(s.address)}
                  className="rounded-sm border border-line px-2 py-0.5 font-data text-[10px] text-dim transition-colors hover:border-safe/60 hover:text-safe"
                >
                  {s.symbol} · {s.platform}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {out && "kind" in out && out.kind === "notFound" && (
        <div className="mt-4 rounded-md border border-line bg-raised px-4 py-3">
          <p className="font-data text-[10px] uppercase tracking-widest text-warn">404 — no match</p>
          <p className="mt-1 font-data text-xs text-dim">
            <span className="text-text">“{out.query}”</span> resolved nothing. Paste the full contract — tickers
            collide across chains and we never silently pick one.
          </p>
        </div>
      )}

      {out && "kind" in out && out.kind === "ambiguous" && (
        <div className="mt-4 overflow-hidden rounded-md border border-line bg-raised">
          <p className="border-b border-line px-4 py-2.5 font-data text-[10px] uppercase tracking-widest text-warn">
            ambiguous — {out.candidates.length} candidates, pick one:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <tbody>
                {out.candidates.map((c, i) => (
                  <tr
                    key={`${c.platform}:${c.address}`}
                    onClick={() => run(query, i)}
                    className="cursor-pointer border-b border-line/40 font-data text-xs last:border-b-0 hover:bg-panel"
                  >
                    <td className="px-4 py-2.5 font-bold text-text">{c.symbol}</td>
                    <td className="px-4 py-2.5 text-dim">{c.name}</td>
                    <td className="px-4 py-2.5 uppercase text-faint">{c.platform}</td>
                    <td className="px-4 py-2.5 text-faint">{c.address.slice(0, 16)}…</td>
                    <td className="px-4 py-2.5 text-right text-safe">select →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {out && "kind" in out && out.kind === "verdict" && <div className="mt-4"><VerdictCard v={out} /></div>}
    </div>
  );
}
