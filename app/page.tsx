import Link from "next/link";
import { Checker } from "@/components/checker";
import { listSnapshotIds, loadVerdict } from "@/lib/verdict-store";
import { VERDICT_STYLE } from "@/components/verdict-card";

export const dynamic = "force-dynamic";

const ENDPOINTS = [
  "dex/search",
  "dex/tokens/transactions",
  "dex/token/pools",
  "dex/liquidity-change/list",
  "dex/security/detail",
  "global-metrics/quotes",
  "fear-and-greed/latest",
];

const PIPELINE = [
  { n: "01", t: "Resolve", d: "Address or ticker. Ambiguous names surface candidates — never silently picked." },
  { n: "02", t: "Fetch evidence", d: "Swap-level DEX flow, pool depth, LP adds/pulls, security flags — all CoinMarketCap." },
  { n: "03", t: "Score 4 dimensions", d: "SAFETY · FLOW · LIQUIDITY · PUMP on published thresholds — including the check nobody automates: are there real third-party sells?" },
  { n: "04", t: "Cross-examine", d: "Jev (TypeSafe) re-judges the same metrics — consensus, contested, or lean. Never overrides the rules." },
  { n: "05", t: "Publish falsifier", d: "Every verdict states what evidence would flip it, plus SHA-256 receipts per API call." },
];

const TONE_TEXT: Record<string, string> = {
  safe: "text-safe",
  warn: "text-warn",
  danger: "text-danger",
  unknown: "text-unknown",
};

export default function Home() {
  const live = process.env.VERDEX_LIVE === "1";
  const snapshots = listSnapshotIds()
    .map((id) => loadVerdict(id))
    .filter((v): v is NonNullable<typeof v> => v !== null);

  return (
    <main className="relative z-[1] mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-6">
      <a
        href="#checker"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-safe focus:px-3 focus:py-2 focus:font-data focus:text-xs focus:font-bold focus:text-ink"
      >
        Skip to token checker
      </a>

      <header className="flex items-center justify-between">
        <span className="font-data text-sm font-bold tracking-[0.25em]">VERDEX</span>
        <span className="flex items-center gap-2 font-data text-[11px] uppercase tracking-widest text-dim">
          <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-safe" : "bg-warn"}`} aria-hidden="true" />
          {live ? "live CMC data" : "snapshot mode"}
        </span>
      </header>

      {/* ——— Hero: asymmetric, verdict-stamp energy ——— */}
      <section className="mt-14 sm:mt-20">
        <h1 className="max-w-[16ch] text-balance text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
          Don&apos;t be the
          <br />
          <span className="text-danger">exit liquidity</span>.
        </h1>
        <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-dim">
          Paste a DEX token. Get an auditable verdict — computed from CoinMarketCap swap flow, liquidity, and
          security evidence, then cross-examined by an independent decision model. Structure tells you{" "}
          <em className="text-text">could it rug</em>. Verdex tells you <em className="text-text">is it rugging</em>.
        </p>
      </section>

      <section id="checker" className="mt-8 scroll-mt-8">
        <Checker live={live} />
      </section>

      {/* ——— Case files: committed verdicts as ledger rows ——— */}
      {snapshots.length > 0 && (
        <section className="mt-16">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-data text-[11px] uppercase tracking-[0.22em] text-faint">Case files — committed evidence</h2>
            <span className="font-data text-[11px] text-faint">{snapshots.length} verdicts</span>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-panel">
            {snapshots.map((v) => {
              const st = VERDICT_STYLE[v.result.verdict] ?? VERDICT_STYLE.BELUM_CUKUP_BUKTI;
              const tone = TONE_TEXT[st.tone] ?? TONE_TEXT.unknown;
              return (
                <Link
                  key={v.id}
                  href={`/verdict/${v.id}`}
                  className="case-row group flex items-center gap-4 border-b border-line/60 px-4 py-4 last:border-b-0 hover:bg-raised sm:px-5"
                >
                  <span className={`stamp shrink-0 text-[10px] ${tone}`}>{st.label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{v.token.symbol}</span>
                    <span className="ml-2 font-data text-[11px] uppercase text-faint">{v.token.platform}</span>
                    <span className="mt-0.5 hidden truncate font-data text-[11px] text-faint sm:block">
                      {v.token.address}
                    </span>
                  </span>
                  <span className="num font-data text-xl font-bold">
                    {v.result.score}
                    <span className="text-xs text-faint">/100</span>
                  </span>
                  <span className="hidden font-data text-[11px] text-faint sm:block">
                    {v.agreement} · {v.receipts.length} receipts
                  </span>
                  <span className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-text">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ——— Pipeline as a numbered chain ——— */}
      <section className="mt-16">
        <h2 className="mb-3 font-data text-[11px] uppercase tracking-[0.22em] text-faint">How a verdict is reached</h2>
        <ol className="rounded-lg border border-line bg-panel">
          {PIPELINE.map((s) => (
            <li key={s.n} className="flex gap-4 border-b border-line/60 px-5 py-4 last:border-b-0">
              <span className="num shrink-0 font-data text-sm font-bold text-safe">{s.n}</span>
              <div>
                <p className="font-semibold leading-snug">{s.t}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-dim">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ——— Endpoint receipts strip ——— */}
      <section className="mt-10">
        <h2 className="mb-3 font-data text-[11px] uppercase tracking-[0.22em] text-faint">CoinMarketCap endpoints used</h2>
        <div className="flex flex-wrap gap-1.5">
          {ENDPOINTS.map((e) => (
            <code key={e} className="rounded-sm border border-line bg-panel px-2 py-1 font-data text-[11px] text-dim">
              /v1/{e}
            </code>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-faint">
          Deterministic rules are the verdict. Jev is the second opinion — consensus or contested, always labeled.
          Not financial advice.
        </p>
      </section>

      <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 font-data text-[11px] uppercase tracking-widest text-faint">
        <span>Build with CMC hackathon · Markets &amp; Trading Tools</span>
        <a
          href="https://github.com/alfindigital/verdex"
          className="text-dim transition-colors hover:text-safe"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      </footer>
    </main>
  );
}
