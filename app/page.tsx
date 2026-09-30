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

const TEXT: Record<string, string> = {
  safe: "text-safe",
  warn: "text-warn",
  danger: "text-danger",
  unknown: "text-unknown",
};

const SHOWCASE_BLURB: Record<string, string> = {
  LAYAK: "no flags observed",
  RAWAN: "warning observations on file",
  JANGAN: "danger-level flags on file",
  BELUM_CUKUP_BUKTI: "insufficient evidence",
};

const FAQ: [string, string][] = [
  ["What does a verdict mean?", "Deterministic rules read the tape: SAFETY, FLOW, LIQUIDITY, PUMP. DANGER anywhere stamps AVOID; all-clean plus score ≥70 stamps ENTRY-WORTHY. Published constants — every verdict reproduces from its committed bundle."],
  ["Where does the data come from?", "9 CoinMarketCap endpoints per scan — swaps, pools, LP events, security detail, market meta, macro context. Every call is SHA-256 receipted and stored in the bundle."],
  ["Live or replay?", "This archive replays committed CMC captures — dated evidence, not live quotes. The scanner runs live when the deployment carries an API key."],
  ["What is Jev?", "An independent model opinion labeled on every case — consensus, lean, or contested. It never overrides the deterministic rules."],
];

export default function Home() {
  const live = resolveScanMode(process.env) === "v2-live";
  const snapshots = listSnapshotIds()
    .map((id) => loadVerdict(id))
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const totalSwaps = snapshots.reduce((a, v) => a + num(v.metrics.flow?.swapCount), 0);
  const totalReceipts = snapshots.reduce((a, v) => a + v.receipts.length, 0);
  const chainList = [...new Set(snapshots.map((v) => v.token.platform.toLowerCase()))];
  const dist = { LAYAK: 0, RAWAN: 0, JANGAN: 0, BELUM_CUKUP_BUKTI: 0 } as Record<string, number>;
  for (const v of snapshots) dist[v.result.verdict] = (dist[v.result.verdict] ?? 0) + 1;

  // Curated showcase — each card carries a story the jury can verify:
  // a clean tape, a collapsed-but-liquid survivor, a dead-tape catch.
  const showcaseBySlug = ["brett-base", "ftx-token-ethereum", "titano-bsc"]
    .map((slug) => snapshots.find((v) => slugFor(v.token.symbol, v.token.platform) === slug))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
  const showcase = [
    ...showcaseBySlug,
    ...(["LAYAK", "RAWAN", "JANGAN", "BELUM_CUKUP_BUKTI"] as const)
      .map((v) => snapshots.find((s) => s.result.verdict === v && !showcaseBySlug.includes(s))),
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
      <header className="relative flex items-center justify-between gap-4 border-b border-line pb-4 pt-1">
        <Link href="/" className="deco text-2xl leading-none tracking-tight">
          Verdex<span className="text-accent">.</span>
        </Link>
        <nav
          aria-label="Sections"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 font-data text-[11px] font-medium uppercase tracking-[0.2em] text-dim md:flex"
        >
          <a href="#scan" className="transition-colors hover:text-accent">scanner</a>
          <a href="#cases" className="transition-colors hover:text-accent">cases</a>
          <a href="#files" className="transition-colors hover:text-accent">files</a>
          <a href="#method" className="transition-colors hover:text-accent">method</a>
        </nav>
        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com/alfindigital/verdex"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Verdex on GitHub"
            title="Verdex on GitHub"
            className="icon-btn"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-[18px] w-[18px]">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* ——— Stat band: the page leads with numbers, not words ——— */}
      <section aria-label="Archive at a glance" className="border-b border-line py-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
          <Stat k="verdicts on file" v={String(snapshots.length)} sub="committed snapshots" />
          <Stat k="CMC receipts" v={fmtNum(totalReceipts)} sub="SHA-256 per call" />
          <Stat k="swaps analyzed" v={fmtNum(totalSwaps)} sub="across all cases" />
          <Stat k="chains" v={String(chainList.length)} sub={chainList.slice(0, 4).join(" · ")} />
        </div>
        {/* verdict distribution — one honest bar */}
        <div className="mt-8" aria-label="Verdict distribution">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full border border-line">
            {dist.LAYAK > 0 && <div className="bg-safe" style={{ width: `${(dist.LAYAK / snapshots.length) * 100}%` }} />}
            {dist.RAWAN > 0 && <div className="bg-warn" style={{ width: `${(dist.RAWAN / snapshots.length) * 100}%` }} />}
            {dist.JANGAN > 0 && <div className="bg-danger" style={{ width: `${(dist.JANGAN / snapshots.length) * 100}%` }} />}
            {dist.BELUM_CUKUP_BUKTI > 0 && (
              <div className="bg-unknown" style={{ width: `${(dist.BELUM_CUKUP_BUKTI / snapshots.length) * 100}%` }} />
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 font-data text-[10px] uppercase tracking-widest text-dim">
            <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-safe not-italic" />entry-worthy {dist.LAYAK}</span>
            <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-warn not-italic" />caution {dist.RAWAN}</span>
            <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-danger not-italic" />avoid {dist.JANGAN}</span>
            <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-unknown not-italic" />insufficient {dist.BELUM_CUKUP_BUKTI}</span>
          </div>
        </div>
      </section>

      {/* ——— Scanner is the hero ——— */}
      <section id="scan" aria-labelledby="scan-title" className="mt-10">
        <div className="scan-hero rounded-md border border-line-bright bg-panel">
          <div className="panel-head">
            <span id="scan-title" className="text-text">Scanner</span>
            <span className={live ? "text-safe" : "text-warn"}>
              {live ? "live · calls the CMC API now" : "replay · archived CMC evidence"}
            </span>
          </div>
          <div className="p-5 sm:p-8">
            <p className="mb-5 max-w-xl text-sm leading-relaxed text-dim">
              Paste a contract or ticker — get a verdict where every claim traces to a hashed CMC receipt.
            </p>
            <Checker live={live} />
          </div>
        </div>

        {/* verdict logic — horizontal strip, always visible under the instrument */}
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <li className="rounded-md border border-line bg-panel px-4 py-3.5">
            <span className="stamp stamp-sm text-danger">Avoid</span>
            <p className="mt-2.5 text-xs leading-relaxed text-dim">DANGER in SAFETY/FLOW, or liquidity under $1k</p>
          </li>
          <li className="rounded-md border border-line bg-panel px-4 py-3.5">
            <span className="stamp stamp-sm text-warn">Caution</span>
            <p className="mt-2.5 text-xs leading-relaxed text-dim">DANGER elsewhere, or any WARN flag</p>
          </li>
          <li className="rounded-md border border-line bg-panel px-4 py-3.5">
            <span className="stamp stamp-sm text-safe">Entry</span>
            <p className="mt-2.5 text-xs leading-relaxed text-dim">all four dimensions CLEAN, score ≥ 70</p>
          </li>
          <li className="rounded-md border border-line bg-panel px-4 py-3.5">
            <span className="stamp stamp-sm text-unknown">Insuf.</span>
            <p className="mt-2.5 text-xs leading-relaxed text-dim">evidence missing — unknown, not zero</p>
          </li>
        </ul>
      </section>

      {/* ——— Recorded cases ——— */}
      {showcase.length > 0 && (
        <section id="cases" className="mt-14" aria-labelledby="cases-title">
          <div className="exhibit">
            <h2 id="cases-title" className="exhibit-title">Recorded cases</h2>
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
                    {SHOWCASE_BLURB[v.result.verdict] ?? SHOWCASE_BLURB.BELUM_CUKUP_BUKTI} ·{" "}
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
        <section id="files" className="mt-14" aria-labelledby="files-title">
          <div className="exhibit">
            <h2 id="files-title" className="exhibit-title">Case files</h2>
            <span className="exhibit-rule" aria-hidden="true" />
            <span className="hidden font-data text-[10px] uppercase tracking-widest text-dim sm:inline">{rows.length} records</span>
          </div>
          <div className="mt-6">
            <CaseTable rows={rows} />
          </div>
        </section>
      )}

      {/* ——— Method: FAQ, not a manifesto ——— */}
      <section id="method" className="mt-14" aria-labelledby="method-title">
        <div className="exhibit">
          <h2 id="method-title" className="exhibit-title">Method</h2>
          <span className="exhibit-rule" aria-hidden="true" />
        </div>
        <dl className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-2">
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <dt className="text-sm font-semibold">{q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-dim">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="mt-16 flex flex-col items-center gap-4 border-t border-line pt-8">
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/alfindigital/verdex"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Verdex on GitHub"
            title="Source on GitHub"
            className="icon-btn"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-[18px] w-[18px]">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
          <a
            href="https://coinmarketcap.com/api/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CoinMarketCap API"
            title="Data: CoinMarketCap API"
            className="icon-btn"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-[18px] w-[18px]">
              <path d="M11.9 9.05c-.35 0-.64.29-.64.64v.79c0 .35.29.64.64.64h.64c.35 0 .64-.29.64-.64v-.79c0-.35-.29-.64-.64-.64h-.64Zm2.56-3.2c.7 0 1.28-.58 1.28-1.28 0-.71-.58-1.28-1.28-1.28-.71 0-1.28.57-1.28 1.28 0 .7.57 1.28 1.28 1.28ZM8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8Zm3.89 11.23c0 .35-.28.64-.63.64H4.73a.63.63 0 0 1-.63-.64V4.77c0-.35.28-.64.63-.64h6.53c.35 0 .63.29.63.64v6.46ZM5.38 9.41v1.9c0 .12.1.22.22.22h4.8c.12 0 .22-.1.22-.22v-1.9c0-.12-.1-.22-.22-.22h-1.14a.22.22 0 0 1-.22-.22V6.6c0-.12.1-.22.22-.22h1.14c.12 0 .22-.1.22-.22V4.7c0-.12-.1-.22-.22-.22h-4.8a.22.22 0 0 0-.22.22v1.45c0 .12.1.22.22.22h1.13c.12 0 .22.1.22.22v2.38c0 .12-.1.22-.22.22H5.6a.22.22 0 0 0-.22.22Z" />
            </svg>
          </a>
        </div>
        <p className="font-data text-[10px] uppercase tracking-widest text-dim">
          evidence over vibes · not financial advice
        </p>
      </footer>
    </main>
  );
}
