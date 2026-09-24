"use client";

import { useState } from "react";
import { VerdictCard, type TokenRef, type VerdictRecord } from "@/components/verdict-card";

type ApiResult = VerdictRecord | { kind: "ambiguous"; candidates: TokenRef[] } | { kind: "notFound"; query: string } | { error: string };

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<ApiResult | null>(null);

  async function run(q: string, pick?: number) {
    setLoading(true);
    setOut(null);
    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, pick }),
      });
      setOut((await res.json()) as ApiResult);
    } catch (e) {
      setOut({ error: e instanceof Error ? e.message : "request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Verdex</h1>
        <p className="mt-2 text-neutral-400">
          Don&apos;t be the exit liquidity. Paste a token address or ticker — get a deterministic, evidence-backed verdict
          computed from CoinMarketCap DEX data, cross-examined by Jev.
        </p>
      </header>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) run(query.trim());
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Token address or ticker — e.g. PEPE, 0x…, So111…"
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500"
        />
        <button
          disabled={loading}
          className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "…" : "Check"}
        </button>
      </form>

      {out && "error" in out && (
        <p className="mt-4 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">{out.error}</p>
      )}

      {out && "kind" in out && out.kind === "notFound" && (
        <p className="mt-4 rounded-lg border border-neutral-700 px-4 py-3 text-sm text-neutral-300">
          No token found for “{out.query}”. Try the contract address.
        </p>
      )}

      {out && "kind" in out && out.kind === "ambiguous" && (
        <div className="mt-4 rounded-lg border border-neutral-700 p-4">
          <p className="mb-3 text-sm text-neutral-300">Multiple matches — pick one (we never silently choose):</p>
          <div className="space-y-2">
            {out.candidates.map((c, i) => (
              <button
                key={`${c.platform}:${c.address}`}
                onClick={() => run(query, i)}
                className="block w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-left hover:border-emerald-500"
              >
                <span className="font-semibold">{c.symbol}</span>
                <span className="ml-2 text-neutral-400">{c.name}</span>
                <span className="ml-2 rounded bg-neutral-800 px-2 py-0.5 text-xs">{c.platform}</span>
                <span className="mt-1 block font-mono text-xs text-neutral-500">{c.address}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {out && "kind" in out && out.kind === "verdict" && <VerdictCard v={out} />}
    </main>
  );
}
