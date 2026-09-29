"use client";

import { useRef, useState } from "react";
import { VerdictCard, type TokenRef, type VerdictRecord } from "@/components/verdict-card";
import { makeScanRequestBody } from "@/lib/scan-request";

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
    <div className="mt-5 overflow-hidden rounded-md border border-line bg-raised" role="status" aria-label="Scanning token">
      <div className="flex flex-wrap items-center gap-6 border-b border-line px-5 py-6 sm:px-6">
        <div className="space-y-3">
          <div className="skeleton h-11 w-44 -rotate-2" />
          <div className="skeleton h-6 w-56" />
          <div className="skeleton h-3 w-72 max-w-full" />
        </div>
        <div className="skeleton h-28 w-28 rounded-full" />
        <div className="ml-auto grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-2.5 w-16" />
              <div className="skeleton h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-line/60 p-5 lg:[&:nth-child(-n+2)]:border-b lg:odd:border-r">
            <div className="mb-4 flex justify-between">
              <div className="skeleton h-3.5 w-28" />
              <div className="skeleton h-3.5 w-20" />
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
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  async function run(q: string, selection?: TokenRef, plat = platform) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setOut(null);
    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(makeScanRequestBody(q, plat, selection)),
        signal: controller.signal,
      });
      const next = (await res.json()) as ApiResult;
      if (requestId === requestIdRef.current) setOut(next);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (requestId === requestIdRef.current) setOut({ error: e instanceof Error ? e.message : "request failed" });
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        abortRef.current = null;
      }
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
        <div className="flex items-stretch overflow-hidden rounded-md border border-line-bright bg-ink transition-colors focus-within:border-accent">
          <span className="flex select-none items-center pl-4 font-data text-base font-bold text-accent" aria-hidden="true">
            &gt;
          </span>
          <input
            id="token-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="contract address · $ticker · token name"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-3 py-4 font-data text-sm text-text caret-accent placeholder:text-dim focus:outline-none sm:text-base"
          />
          <button disabled={loading || !query.trim()} className="btn-run shrink-0 text-sm">
            {loading ? "scanning…" : "Run scan"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-data text-[10px] uppercase tracking-widest text-dim">chain</span>
          {PLATFORMS.map((p) => (
            <button
              key={p.id || "auto"}
              type="button"
              aria-pressed={platform === p.id}
              onClick={() => setPlatform(p.id)}
              className={`chip ${platform === p.id ? "on" : ""}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </form>

      {!loading && !out && (
        <p className="mt-4 font-data text-[11px] leading-relaxed text-dim">
          Exact identity only — tickers collide across chains, so an ambiguous query returns a candidate list,
          never a guess. Or open a recorded exhibit below.
        </p>
      )}

      {loading && <ScanSkeleton />}
      <p className="sr-only" aria-live="polite">
        {loading ? "Inspecting token identity and evidence sources" : out ? "Verdex result ready" : ""}
      </p>

      {out && "error" in out && (
        <div className="mt-5 rounded-md border border-danger/50 bg-danger/5 px-4 py-4 sm:px-5">
          <p className="font-data text-[11px] font-bold uppercase tracking-widest text-danger">Request failed</p>
          <p className="mt-1.5 text-sm text-dim">{out.error}</p>
          {out.snapshots && out.snapshots.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {out.snapshots.map((s) => (
                <button
                  key={s.symbol + s.platform}
                  onClick={() => run(s.address, undefined, s.platform)}
                  className="chip"
                >
                  {s.symbol} · {s.platform}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {out && "kind" in out && out.kind === "notFound" && (
        <div className="mt-5 rounded-md border border-line bg-raised px-4 py-4 sm:px-5">
          <p className="font-data text-[11px] font-bold uppercase tracking-widest text-warn">No match</p>
          <p className="mt-1.5 text-sm leading-relaxed text-dim">
            <span className="text-text">“{out.query}”</span> resolved nothing. Paste the full contract — tickers
            collide across chains and we never silently pick one.
          </p>
        </div>
      )}

      {out && "kind" in out && out.kind === "ambiguous" && (
        <div className="mt-5 overflow-hidden rounded-md border border-line bg-raised">
          <div className="panel-head">
            <span className="text-warn">Ambiguous identity — {out.candidates.length} candidates</span>
            <span>pick one to continue</span>
          </div>
          <ul className="divide-y divide-line/60">
            {out.candidates.map((c) => (
              <li key={`${c.platform}:${c.address}`}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => run(query, c, c.platform)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-panel disabled:opacity-50 sm:px-5"
                >
                  <span className="min-w-16 font-semibold text-text">{c.symbol}</span>
                  <span className="text-sm text-dim">{c.name}</span>
                  <span className="font-data text-[10px] uppercase tracking-widest text-dim">{c.platform}</span>
                  <span className="mono-strip ml-auto hidden sm:inline">
                    {c.address.slice(0, 12)}<b>…</b>{c.address.slice(-4)}
                  </span>
                  <span className="font-data text-[11px] uppercase tracking-widest text-accent">select →</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {out && "kind" in out && out.kind === "verdict" && <div className="mt-6"><VerdictCard v={out} /></div>}
    </div>
  );
}
