import Image from "next/image";
import Link from "next/link";
import { Checker } from "@/components/checker";
import { listSnapshotIds, loadVerdict } from "@/lib/verdict-store";
import { VERDICT_STYLE } from "@/components/verdict-card";
import { fmtNum, fmtUsd, num, Stat } from "@/components/viz";

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

const TEXT: Record<string, string> = {
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

  const totalSwaps = snapshots.reduce((a, v) => a + num(v.metrics.flow?.swapCount), 0);
  const totalReceipts = snapshots.reduce((a, v) => a + v.receipts.length, 0);
  const chains = new Set(snapshots.map((v) => v.token.platform)).size;
  const avgScore = snapshots.length
    ? Math.round(snapshots.reduce((a, v) => a + v.result.score, 0) / snapshots.length)
    : 0;

  return (
    <main className="relative z-[1] mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6">
      <a
        href="#scan"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-safe focus:px-3 focus:py-2 focus:font-data focus:text-xs focus:font-bold focus:text-ink"
      >
        Skip to scanner
      </a>

      {/* ——— Top bar ——— */}
      <header className="flex items-center justify-between border-b border-line pb-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Verdex" width={28} height={28} className="rounded-sm" />
          <span className="font-data text-sm font-bold tracking-[0.3em]">VERDEX</span>
          <span className="hidden font-data text-[10px] uppercase tracking-widest text-faint sm:inline">
            pre-trade DEX forensics
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-data text-[10px] uppercase tracking-widest text-dim">
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-safe" : "bg-warn"}`} aria-hidden="true" />
            {live ? "live" : "snapshot"}
          </span>
          <a
            href="https://github.com/alfindigital/verdex"
            rel="noopener noreferrer"
            className="font-data text-[10px] uppercase tracking-widest text-dim transition-colors hover:text-safe"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      {/* ——— Scan console ——— */}
      <section id="scan" className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="rounded-md border border-line bg-panel">
          <div className="border-b border-line px-4 py-2 font-data text-[10px] uppercase tracking-[0.2em] text-faint">
            <span className="text-safe">verdex@cmc</span>:~$ scan
          </div>
          <div className="p-4">
            <Checker live={live} />
          </div>
        </div>

        {/* ——— Aside: engine stats, always real numbers ——— */}
        <aside className="flex flex-col rounded-md border border-line bg-panel">
          <div className="border-b border-line px-4 py-2 font-data text-[10px] uppercase tracking-[0.2em] text-faint">
            engine
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-1">
            <Stat k="verdicts on file" v={String(snapshots.length)} />
            <Stat k="swaps analyzed" v={fmtNum(totalSwaps)} />
            <Stat k="CMC receipts" v={fmtNum(totalReceipts)} />
            <Stat k="chains" v={String(chains)} sub={[...new Set(snapshots.map((v) => v.token.platform.toLowerCase()))].join(" · ") || "—"} />
            <Stat k="avg score" v={String(avgScore)} />
          </div>
          <div className="mt-auto border-t border-line p-4">
            <div className="font-data text-[10px] uppercase tracking-widest text-faint">verdict logic</div>
            <div className="mt-2 space-y-1.5 font-data text-[10px] leading-relaxed text-dim">
              <div><span className="text-danger">AVOID</span> ← DANGER in SAFETY|FLOW</div>
              <div><span className="text-warn">CAUTION</span> ← any DANGER, ≥2 WARN, or score&lt;70</div>
              <div><span className="text-safe">ENTRY</span> ← all CLEAN + score≥70</div>
              <div><span className="text-unknown">INSUFFICIENT</span> ← data missing</div>
            </div>
          </div>
        </aside>
      </section>

      {/* ——— Case files: dense data table ——— */}
      {snapshots.length > 0 && (
        <section className="mt-8">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-data text-[10px] uppercase tracking-[0.25em] text-faint">case_files/</h2>
            <span className="font-data text-[10px] text-faint">{snapshots.length} records</span>
          </div>
          <div className="overflow-x-auto rounded-md border border-line bg-panel">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-line bg-raised font-data text-[9px] uppercase tracking-widest text-faint">
                  <th className="px-4 py-2.5">verdict</th>
                  <th className="px-4 py-2.5">token</th>
                  <th className="px-4 py-2.5">chain</th>
                  <th className="px-4 py-2.5 text-right">mcap</th>
                  <th className="px-4 py-2.5 text-right">liq</th>
                  <th className="px-4 py-2.5 text-right">net flow</th>
                  <th className="px-4 py-2.5 text-right">3p sells</th>
                  <th className="px-4 py-2.5 text-right">score</th>
                  <th className="px-4 py-2.5">jev</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((v) => {
                  const st = VERDICT_STYLE[v.result.verdict] ?? VERDICT_STYLE.BELUM_CUKUP_BUKTI;
                  const tone = TEXT[st.tone] ?? TEXT.unknown;
                  const net = num(v.metrics.flow?.netBuyUsd);
                  return (
                    <tr key={v.id} className="group border-b border-line/50 last:border-b-0 hover:bg-raised">
                      <td className="px-4 py-3">
                        <span className={`stamp text-[9px] ${tone}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/verdict/${v.id}`} className="font-semibold hover:text-safe">
                          {v.token.symbol.replace(/^\$/, "")}
                        </Link>
                        <span className="ml-1.5 hidden font-data text-[10px] text-faint xl:inline">
                          {v.token.address.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-4 py-3 font-data text-[11px] uppercase text-dim">{v.token.platform}</td>
                      <td className="num px-4 py-3 text-right font-data text-xs">{fmtUsd(v.token.mcapUsd)}</td>
                      <td className="num px-4 py-3 text-right font-data text-xs">{fmtUsd(num(v.metrics.liq?.totalLiqUsd))}</td>
                      <td className={`num px-4 py-3 text-right font-data text-xs ${net >= 0 ? "text-safe" : "text-danger"}`}>
                        {net >= 0 ? "+" : ""}{fmtUsd(net)}
                      </td>
                      <td className="num px-4 py-3 text-right font-data text-xs">
                        {fmtNum(num(v.metrics.flow?.thirdPartySells))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`num font-data text-base font-bold ${tone}`}>{v.result.score}</span>
                      </td>
                      <td className="px-4 py-3 font-data text-[10px] text-dim">
                        {v.jev.riskyProb != null ? `P=${v.jev.riskyProb.toFixed(2)}` : "—"}
                        <span className={`ml-1 ${v.agreement === "consensus" ? "text-safe" : v.agreement === "contested" ? "text-danger" : "text-faint"}`}>
                          {v.agreement === "consensus" ? "✓" : v.agreement === "contested" ? "✗" : "·"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/verdict/${v.id}`} className="font-data text-xs text-faint transition-colors group-hover:text-safe">
                          open →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 font-data text-[10px] text-faint">
            every row = committed evidence · SHA-256 receipts per CMC call · falsifier per verdict
          </p>
        </section>
      )}

      {/* ——— Method, compressed to a data row ——— */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-line bg-panel">
          <div className="border-b border-line px-4 py-2 font-data text-[10px] uppercase tracking-[0.2em] text-faint">
            pipeline
          </div>
          <ol className="font-data text-[11px] leading-relaxed text-dim">
            {[
              "resolve → dex/search (address|ticker|ambiguous=list)",
              "evidence → swaps×100 · pools · lpΔ · security",
              "score → SAFETY·FLOW·LIQ·PUMP published thresholds",
              "audit → jev 2nd opinion (consensus|contested|lean)",
              "publish → falsifier + sha256 receipts",
            ].map((s, i) => (
              <li key={i} className="flex gap-3 border-b border-line/40 px-4 py-2 last:border-b-0">
                <span className="text-safe">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-md border border-line bg-panel">
          <div className="border-b border-line px-4 py-2 font-data text-[10px] uppercase tracking-[0.2em] text-faint">
            cmc endpoints
          </div>
          <div className="flex flex-wrap content-start gap-1.5 p-4">
            {ENDPOINTS.map((e) => (
              <code key={e} className="rounded-sm border border-line bg-raised px-2 py-1 font-data text-[10px] text-dim">
                /v1/{e}
              </code>
            ))}
            <p className="mt-2 w-full font-data text-[10px] leading-relaxed text-faint">
              rules = verdict · jev = labeled second opinion · not financial advice
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 font-data text-[10px] uppercase tracking-widest text-faint">
        <span>build with cmc hackathon · markets &amp; trading tools</span>
        <span>don&apos;t be the exit liquidity</span>
      </footer>
    </main>
  );
}
