"use client";

// Case-files table — the whole recorded corpus, filterable, sortable, paginated.
// Desktop = dense table; mobile = stacked dossier rows.

import { useMemo, useState } from "react";
import Link from "next/link";
import { filterCaseRows, sortCaseRows, type CaseRow, type CaseSortKey, type SortDir } from "@/lib/case-table";
import { fmtNum, fmtUsd } from "@/components/viz";

const TEXT: Record<string, string> = {
  safe: "text-safe",
  warn: "text-warn",
  danger: "text-danger",
  unknown: "text-unknown",
};

const PAGE_SIZE = 20;

// Metric filters — one-tap evidence thresholds on top of verdict/chain facets.
const METRIC_FILTERS = [
  { key: "mcap1m", label: "mcap ≥ $1M", ok: (r: CaseRow) => (r.mcapUsd ?? 0) >= 1_000_000 },
  { key: "liq50k", label: "liq ≥ $50k", ok: (r: CaseRow) => r.liqUsd >= 50_000 },
  { key: "inflow", label: "net inflow", ok: (r: CaseRow) => r.netUsd > 0 },
  { key: "outflow", label: "net outflow", ok: (r: CaseRow) => r.netUsd < 0 },
  { key: "sells", label: "sells observed", ok: (r: CaseRow) => r.sells > 0 },
] as const;

type MetricKey = (typeof METRIC_FILTERS)[number]["key"];

function FunnelIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M2 2.5h12l-4.6 5.4v4.6l-2.8 1.4V7.9L2 2.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function CaseTable({ rows }: { rows: CaseRow[] }) {
  const [verdicts, setVerdicts] = useState<Set<string>>(new Set());
  const [chains, setChains] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<Set<MetricKey>>(new Set());
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<CaseSortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const verdictFacets = useMemo(() => {
    const m = new Map<string, { label: string; tone: string; n: number }>();
    for (const r of rows) {
      const cur = m.get(r.verdictKey);
      m.set(r.verdictKey, { label: r.label, tone: r.tone, n: (cur?.n ?? 0) + 1 });
    }
    return [...m.entries()];
  }, [rows]);

  const chainFacets = useMemo(() => [...new Set(rows.map((r) => r.platform.toLowerCase()))].sort(), [rows]);

  const filtered = useMemo(() => {
    const base = filterCaseRows(rows, { verdicts, chains, q });
    const withMetrics = metrics.size === 0
      ? base
      : base.filter((r) => METRIC_FILTERS.filter((f) => metrics.has(f.key)).every((f) => f.ok(r)));
    return sortCaseRows(withMetrics, sortKey, sortDir);
  }, [rows, verdicts, chains, metrics, q, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pageCount - 1);
  const paged = filtered.slice(cur * PAGE_SIZE, cur * PAGE_SIZE + PAGE_SIZE);

  const toggle = <K extends string>(set: Set<K>, key: K, apply: (s: Set<K>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    apply(next);
    setPage(0);
  };

  const clearAll = () => {
    setVerdicts(new Set());
    setChains(new Set());
    setMetrics(new Set());
    setQ("");
    setPage(0);
  };

  const thClick = (key: CaseSortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const th = (key: CaseSortKey, label: string, extra = "") => (
    <th
      key={key}
      aria-sort={sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-4 py-2.5 text-right ${extra}`}
    >
      <button
        type="button"
        onClick={() => thClick(key)}
        className={`font-data text-[10px] uppercase tracking-widest transition-colors ${sortKey === key ? "text-accent" : "text-dim hover:text-text"}`}
      >
        {label} {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
      </button>
    </th>
  );

  const filteredEmpty = filtered.length === 0;
  const hasFilters = verdicts.size > 0 || chains.size > 0 || metrics.size > 0 || q.trim().length > 0;

  return (
    <div className="overflow-hidden rounded-md border border-line bg-panel">
      {/* ——— Filter bar ——— */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-line px-4 py-3">
        <span className="flex items-center gap-1.5 font-data text-[10px] uppercase tracking-widest text-dim">
          <FunnelIcon /> filter
        </span>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by verdict">
          {verdictFacets.map(([key, f]) => (
            <button
              key={key}
              type="button"
              aria-pressed={verdicts.has(key)}
              onClick={() => toggle(verdicts, key, setVerdicts)}
              className={`chip ${verdicts.has(key) ? "on" : ""}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full bg-current ${TEXT[f.tone]}`} aria-hidden="true" />
              {f.label} <span className="opacity-60">{f.n}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by metric">
          {METRIC_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={metrics.has(f.key)}
              onClick={() => toggle(metrics, f.key, setMetrics)}
              className={`chip ${metrics.has(f.key) ? "on" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by chain">
          {chainFacets.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={chains.has(c)}
              onClick={() => toggle(chains, c, setChains)}
              className={`chip ${chains.has(c) ? "on" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="search…"
          aria-label="Filter records"
          className="ml-auto w-32 min-w-32 rounded-sm border border-line bg-ink px-2.5 py-1.5 font-data text-[11px] text-text caret-accent placeholder:text-dim focus:w-44 focus:border-accent focus:outline-none transition-[width]"
        />
      </div>

      {/* ——— Desktop table ——— */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="border-b border-line bg-raised">
              <th className="px-4 py-2.5 font-data text-[10px] uppercase tracking-widest text-dim">verdict</th>
              <th className="px-4 py-2.5 font-data text-[10px] uppercase tracking-widest text-dim">token</th>
              <th className="px-4 py-2.5 font-data text-[10px] uppercase tracking-widest text-dim">chain</th>
              {th("mcap", "mcap")}
              {th("liq", "liq")}
              {th("net", "net flow")}
              <th className="px-4 py-2.5 text-right font-data text-[10px] uppercase tracking-widest text-dim">sells obs.</th>
              {th("score", "score")}
              <th className="px-4 py-2.5 font-data text-[10px] uppercase tracking-widest text-dim">jev</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => {
              const tone = TEXT[r.tone] ?? TEXT.unknown;
              return (
                <tr key={r.id} className="group border-b border-line/50 transition-colors last:border-b-0 hover:bg-raised">
                  <td className="px-4 py-3">
                    <span className={`stamp stamp-sm ${tone}`}>{r.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/verdict/${r.slug}`} className="font-semibold transition-colors hover:text-accent">
                      {r.symbol.replace(/^\$/, "")}
                    </Link>
                    <span className="ml-1.5 hidden font-data text-[10px] text-dim xl:inline">{r.address.slice(0, 8)}…</span>
                  </td>
                  <td className="px-4 py-3 font-data text-[11px] uppercase text-dim">{r.platform}</td>
                  <td className="num px-4 py-3 text-right font-data text-xs">{fmtUsd(r.mcapUsd)}</td>
                  <td className="num px-4 py-3 text-right font-data text-xs">{fmtUsd(r.liqUsd)}</td>
                  <td className={`num px-4 py-3 text-right font-data text-xs ${r.netUsd >= 0 ? "text-safe" : "text-danger"}`}>
                    {r.netUsd >= 0 ? "+" : ""}
                    {fmtUsd(r.netUsd)}
                  </td>
                  <td className="num px-4 py-3 text-right font-data text-xs">{fmtNum(r.sells)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`num font-data text-base font-bold ${tone} ${r.tone === "unknown" ? "opacity-55" : ""}`}>{r.score}</span>
                  </td>
                  <td className="px-4 py-3 font-data text-[10px] text-dim">
                    {r.jevProb != null ? `P=${r.jevProb.toFixed(2)}` : "—"}
                    <span className={`ml-1 ${r.agreement === "consensus" ? "text-safe" : r.agreement === "contested" ? "text-danger" : "text-faint"}`}>
                      {r.agreement === "consensus" ? "✓" : r.agreement === "contested" ? "✗" : "·"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/verdict/${r.slug}`} className="font-data text-xs text-dim transition-colors hover:text-accent group-hover:text-accent">
                      open
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filteredEmpty && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center">
                  <p className="font-data text-xs text-dim">no records match these filters</p>
                  <button type="button" onClick={clearAll} className="btn-ghost mt-3">
                    clear filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ——— Mobile dossier rows ——— */}
      <ul className="divide-y divide-line md:hidden">
        {paged.map((r) => {
          const tone = TEXT[r.tone] ?? TEXT.unknown;
          return (
            <li key={r.id}>
              <Link href={`/verdict/${r.slug}`} className="block px-4 py-4 transition-colors hover:bg-raised">
                <div className="flex items-center justify-between gap-3">
                  <span className={`stamp stamp-sm ${tone}`}>{r.label}</span>
                  <span className={`num font-data text-xl font-bold ${tone} ${r.tone === "unknown" ? "opacity-55" : ""}`}>{r.score}</span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between gap-3">
                  <span className="text-base font-semibold">{r.symbol.replace(/^\$/, "")}</span>
                  <span className="font-data text-[10px] uppercase text-dim">{r.platform}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 font-data text-[11px]">
                  <div><span className="text-dim">mcap</span> <span className="num">{fmtUsd(r.mcapUsd)}</span></div>
                  <div><span className="text-dim">liq</span> <span className="num">{fmtUsd(r.liqUsd)}</span></div>
                  <div><span className="text-dim">net</span> <span className={`num ${r.netUsd >= 0 ? "text-safe" : "text-danger"}`}>{r.netUsd >= 0 ? "+" : ""}{fmtUsd(r.netUsd)}</span></div>
                </div>
              </Link>
            </li>
          );
        })}
        {filteredEmpty && (
          <li className="px-4 py-10 text-center">
            <p className="font-data text-xs text-dim">no records match these filters</p>
            <button type="button" onClick={clearAll} className="btn-ghost mt-3">
              clear filters
            </button>
          </li>
        )}
      </ul>

      {/* ——— Footer: pagination + evidence note ——— */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-4 py-2.5 font-data text-[10px] text-dim">
        <span>
          {filtered.length} of {rows.length} records · committed evidence · SHA-256 receipts
        </span>
        {pageCount > 1 && (
          <nav aria-label="Case pages" className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              disabled={cur === 0}
              onClick={() => setPage(cur - 1)}
              className="chip disabled:opacity-40"
            >
              ← prev
            </button>
            <span className="px-1.5 tabular-nums">
              {cur + 1} / {pageCount}
            </span>
            <button
              type="button"
              disabled={cur >= pageCount - 1}
              onClick={() => setPage(cur + 1)}
              className="chip disabled:opacity-40"
            >
              next →
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
