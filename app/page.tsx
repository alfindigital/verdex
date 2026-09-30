import Image from "next/image";
import Link from "next/link";
import { Checker } from "@/components/checker";
import { ThemeToggle } from "@/components/theme-toggle";
import { CaseTable } from "@/components/case-table";
import type { CaseRow } from "@/lib/case-table";
import { listSnapshotIds, loadVerdict, slugFor } from "@/lib/verdict-store";
import { displayFor } from "@/lib/verdict-display";
import { fmtNum, fmtUsd, num, Stat } from "@/components/viz";
import { resolveScanMode } from "@/lib/scan-policy";

export const dynamic = "force-dynamic";

const ENDPOINTS = [
  "/v1/dex/search",
  "/v1/dex/tokens/transactions",
  "/v1/dex/token/pools",
  "/v1/dex/token",
  "/v1/dex/liquidity-change/list",
  "/v1/dex/security/detail",
  "/v1/global-metrics/quotes/latest",
  "/v1/global-metrics/quotes/historical",
  "/v3/fear-and-greed/latest",
];

const TEXT: Record<string, string> = {
  safe: "text-safe",
  warn: "text-warn",
  danger: "text-danger",
  unknown: "text-unknown",
};

const SHOWCASE_BLURB: Record<string, string> = {
  LAYAK: "no flags observed in this recorded sample",
  RAWAN: "concentration or warning observations on file",
  JANGAN: "danger-level flags in the recorded window",
  BELUM_CUKUP_BUKTI: "insufficient evidence in recorded sample",
};

export default function Home() {
  const live = resolveScanMode(process.env) === "v2-live";
  const snapshots = listSnapshotIds()
    .map((id) => loadVerdict(id))
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const totalSwaps = snapshots.reduce((a, v) => a + num(v.metrics.flow?.swapCount), 0);
  const totalReceipts = snapshots.reduce((a, v) => a + v.receipts.length, 0);
  const chainList = [...new Set(snapshots.map((v) => v.token.platform.toLowerCase()))];

  const showcase = [
    snapshots.find((v) => v.result.verdict === "LAYAK"),
    snapshots.find((v) => v.result.verdict === "RAWAN"),
    snapshots.find((v) => v.result.verdict === "JANGAN"),
    snapshots.find((v) => v.result.verdict === "BELUM_CUKUP_BUKTI"),
  ]
    .filter((v): v is NonNullable<typeof v> => Boolean(v))
    .slice(0, 3);

  const rows: CaseRow[] = snapshots.map((v) => {
    const st = displayFor(v);
    return {
      slug: slugFor(v.token.symbol, v.token.platform),
      id: v.id,
      symbol: v.token.symbol,
      name: v.token.name,
      platform: v.token.platform,
      address: v.token.address,
      verdictKey: v.result.verdict,
      label: st.label,
      tone: st.tone,
      score: v.result.score,
      mcapUsd: v.token.mcapUsd ?? null,
      liqUsd: num(v.metrics.liq?.totalLiqUsd),
      netUsd: num(v.metrics.flow?.netBuyUsd),
      sells: num(v.metrics.flow?.observedSellMakers ?? v.metrics.flow?.thirdPartySells),
      jevProb: v.jev.riskyProb,
      agreement: v.agreement,
      captured: v.ts,
    };
  });

  return (
    <main className="relative z-[1] mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
      <a
        href="#scan"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:font-data focus:text-xs focus:font-bold focus:text-ink"
      >
        Skip to scanner
      </a>

      {/* ——— Top bar ——— */}
      <header className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Verdex" width={30} height={30} className="rounded-sm" />
          <span className="deco text-xl leading-none">Verdex</span>
        </Link>
        <nav aria-label="Sections" className="hidden items-center gap-5 font-data text-[10px] uppercase tracking-[0.18em] text-dim md:flex">
          <a href="#scan" className="transition-colors hover:text-accent">scanner</a>
          <a href="#cases" className="transition-colors hover:text-accent">cases</a>
          <a href="#files" className="transition-colors hover:text-accent">files</a>
          <a href="#method" className="transition-colors hover:text-accent">method</a>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <span
            className="chip"
            title={live ? "live mode — every scan calls the CMC API now" : "replay archive — verdicts replayed from committed real CMC captures; no live API calls"}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-safe" : "bg-warn"}`} aria-hidden="true" />
            {live ? "live scan" : "replay archive"}
          </span>
          <a
            href="https://github.com/alfindigital/verdex"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Verdex on GitHub"
            title="Verdex on GitHub"
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-line text-dim transition-colors hover:border-line-bright hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* ——— Hero: one focal point, real numbers ——— */}
      <section aria-labelledby="hero-title" className="grid gap-10 border-b border-line py-10 sm:py-14 lg:grid-cols-[1.55fr_1fr] lg:items-end">
        <div>
          <p className="flex flex-wrap items-center gap-3">
            <span className="paper-tag">CMC DEX forensics</span>
            <span className="font-data text-[11px] uppercase tracking-[0.16em] text-dim">
              {snapshots.length} recorded exhibits · {chainList.length} chains
            </span>
          </p>
          <h1 id="hero-title" className="deco mt-6 text-[clamp(2.9rem,7.5vw,5.4rem)] leading-[0.98]">
            Don&apos;t be the <span className="text-accent">exit liquidity</span>.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-dim sm:text-base">
            Paste a DEX token contract. Verdex returns an auditable verdict —{" "}
            <span className="text-safe">entry-worthy</span>, <span className="text-warn">caution</span>, or{" "}
            <span className="text-danger">avoid</span> — where every claim traces to a hashed CoinMarketCap
            receipt and a named falsifier.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          <Stat k="verdicts on file" v={String(snapshots.length)} sub="committed snapshots" />
          <Stat k="CMC receipts" v={fmtNum(totalReceipts)} sub="SHA-256 per call" />
          <Stat k="swaps analyzed" v={fmtNum(totalSwaps)} sub="across all cases" />
          <Stat k="chains" v={String(chainList.length)} sub={chainList.slice(0, 4).join(" · ")} />
        </div>
      </section>

      {/* ——— Scanner instrument ——— */}
      <section id="scan" aria-labelledby="scan-title" className="mt-12 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-md border border-line bg-panel">
          <div className="panel-head">
            <span id="scan-title">Scanner</span>
            <span className={live ? "text-safe" : "text-warn"}>
              {live ? "live · calls the CMC API now" : "replay · archived CMC evidence"}
            </span>
          </div>
          <div className="p-4 sm:p-6">
            <Checker live={live} />
          </div>
        </div>

        <aside className="rounded-md border border-line bg-panel">
          <div className="panel-head">Verdict logic</div>
          <ul className="space-y-3 p-4 sm:p-5">
            <li className="flex items-baseline gap-3">
              <span className="stamp stamp-sm shrink-0 text-danger">Avoid</span>
              <span className="text-xs leading-relaxed text-dim">DANGER in SAFETY/FLOW, or liquidity under $1k (untradeable)</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="stamp stamp-sm shrink-0 text-warn">Caution</span>
              <span className="text-xs leading-relaxed text-dim">DANGER elsewhere, or any WARN-level flag</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="stamp stamp-sm shrink-0 text-safe">Entry</span>
              <span className="text-xs leading-relaxed text-dim">all four dimensions CLEAN and score ≥ 70</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="stamp stamp-sm shrink-0 text-unknown">Insuf.</span>
              <span className="text-xs leading-relaxed text-dim">data missing, no DANGER, under 2 WARN</span>
            </li>
          </ul>
          <div className="border-t border-line p-4 font-data text-[10px] leading-relaxed text-dim sm:px-5">
            Thresholds are published constants in the rules engine — every verdict is reproducible from its
            committed evidence bundle.
          </div>
        </aside>
      </section>

      {/* ——— Recorded cases ——— */}
      {showcase.length > 0 && (
        <section id="cases" className="mt-14" aria-labelledby="ex1-title">
          <div className="exhibit">
            <h2 id="ex1-title" className="exhibit-title">Recorded cases</h2>
            <span className="exhibit-rule" aria-hidden="true" />
            <span className="hidden font-data text-[10px] uppercase tracking-widest text-dim sm:inline">dated replay · shareable</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {showcase.map((v) => {
              const st = displayFor(v);
              return (
                <Link key={v.id} href={`/verdict/${slugFor(v.token.symbol, v.token.platform)}`} className="dossier">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`stamp stamp-sm ${TEXT[st.tone]}`}>{st.label}</span>
                    <span className="paper-tag">{v.receipts.length} receipts</span>
                  </div>
                  <div className="deco mt-5 text-2xl leading-none">
                    {v.token.symbol.replace(/^\$/, "")}
                    <span className="ml-2 align-middle font-data text-[10px] font-normal uppercase tracking-widest text-dim">
                      {v.token.platform}
                    </span>
                  </div>
                  <div className="mono-strip mt-2.5">
                    {v.token.address.slice(0, 14)}<b>…</b>{v.token.address.slice(-6)}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-dim">
                    {SHOWCASE_BLURB[v.result.verdict] ?? SHOWCASE_BLURB.BELUM_CUKUP_BUKTI} · captured{" "}
                    {new Date(v.ts).toISOString().slice(0, 10)}
                  </p>
                  <div className="mt-5 font-data text-[10px] uppercase tracking-[0.16em] text-accent">open case file →</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ——— Case files ——— */}
      {rows.length > 0 && (
        <section id="files" className="mt-14" aria-labelledby="ex2-title">
          <div className="exhibit">
            <h2 id="ex2-title" className="exhibit-title">Case files</h2>
            <span className="exhibit-rule" aria-hidden="true" />
            <span className="hidden font-data text-[10px] uppercase tracking-widest text-dim sm:inline">{rows.length} records</span>
          </div>
          <div className="mt-6">
            <CaseTable rows={rows} />
          </div>
        </section>
      )}

      {/* ——— Method ——— */}
      <section id="method" className="mt-14" aria-labelledby="ex3-title">
        <div className="exhibit">
          <h2 id="ex3-title" className="exhibit-title">Method</h2>
          <span className="exhibit-rule" aria-hidden="true" />
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-md border border-line bg-panel">
            <div className="panel-head">Pipeline</div>
            <ol>
              {[
                ["resolve", "dex/search — address, ticker, or ranked ambiguity list"],
                ["evidence", "swaps ×100 · pools · LP deltas · security detail"],
                ["score", "SAFETY · FLOW · LIQUIDITY · PUMP on published thresholds"],
                ["audit", "independent model opinion — consensus, lean, or contested"],
                ["publish", "named falsifier + SHA-256 receipt per CMC call"],
              ].map(([step, desc], i) => (
                <li key={step} className="flex items-baseline gap-4 border-b border-line/50 px-4 py-3.5 last:border-b-0 sm:px-5">
                  <span className="font-data text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <span className="text-sm font-semibold uppercase tracking-wide">{step}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-dim">{desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-md border border-line bg-panel">
            <div className="panel-head">CMC endpoints</div>
            <div className="flex flex-wrap content-start gap-1.5 p-4 sm:p-5">
              {ENDPOINTS.map((e) => (
                <code key={e} className="rounded-sm border border-line bg-raised px-2 py-1 font-data text-[10px] text-dim">
                  {e}
                </code>
              ))}
              <p className="mt-4 w-full text-xs leading-relaxed text-dim">
                Deterministic rules produce the verdict; the model opinion is labeled and never overrides them.
                <span className="mt-1 block font-data text-[10px] uppercase tracking-widest text-dim">
                  not financial advice · recorded samples are dated evidence, not live quotes
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 font-data text-[10px] uppercase tracking-widest text-dim">
        <span>evidence over vibes</span>
        <span>not financial advice</span>
      </footer>
    </main>
  );
}
