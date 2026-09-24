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

export default function Home() {
  const snapshots = listSnapshotIds()
    .map((id) => loadVerdict(id))
    .filter((v): v is NonNullable<typeof v> => v !== null);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Verdex</h1>
        <p className="mt-2 text-neutral-400">
          Don&apos;t be the exit liquidity. Paste a token address or ticker — get a deterministic, evidence-backed verdict
          computed from CoinMarketCap DEX data, cross-examined by Jev.
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          Structure tells you <em>could it rug</em>. Verdex tells you <em>is it rugging</em>.
        </p>
      </header>

      <Checker />

      {snapshots.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Recent verdicts — real CMC data
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {snapshots.map((v) => {
              const st = VERDICT_STYLE[v.result.verdict] ?? VERDICT_STYLE.BELUM_CUKUP_BUKTI;
              return (
                <Link
                  key={v.id}
                  href={`/verdict/${v.id}`}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition hover:border-emerald-600"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {v.token.symbol} <span className="text-xs text-neutral-500">{v.token.platform}</span>
                    </span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${st.cls}`}>{st.label}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                    <span>
                      score {v.result.score}/100 · {v.agreement}
                    </span>
                    <span className="font-mono">{v.receipts.length} receipts</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">How a verdict is reached</h2>
        <ol className="space-y-2 text-sm text-neutral-300">
          <li>
            <span className="font-mono text-emerald-400">1.</span> Resolve token — address or ticker; ambiguous names show
            candidates, never silently picked.
          </li>
          <li>
            <span className="font-mono text-emerald-400">2.</span> Fetch swap-level DEX data, pool depth, LP adds/pulls, and
            security flags — all from CoinMarketCap.
          </li>
          <li>
            <span className="font-mono text-emerald-400">3.</span> Score 4 dimensions with published thresholds: SAFETY ·
            FLOW · LIQUIDITY · PUMP. Including the check nobody automates:{" "}
            <em>are there real third-party sells?</em>
          </li>
          <li>
            <span className="font-mono text-emerald-400">4.</span> Jev (TypeSafe) cross-examines the same metrics —
            consensus, contested, or lean. Never overrides the rules.
          </li>
          <li>
            <span className="font-mono text-emerald-400">5.</span> Every verdict ships a falsifier and SHA-256 receipts
            for each API call. Auditable down to the response body.
          </li>
        </ol>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-800 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">CMC endpoints used</h2>
        <div className="flex flex-wrap gap-2">
          {ENDPOINTS.map((e) => (
            <code key={e} className="rounded bg-neutral-900 px-2 py-1 text-xs text-neutral-300">
              /v1/{e}
            </code>
          ))}
        </div>
      </section>

      <footer className="mt-10 flex items-center justify-between border-t border-neutral-800 pt-6 text-xs text-neutral-500">
        <span>Built for the Build with CMC hackathon · Markets &amp; Trading Tools</span>
        <a href="https://github.com/alfindigital/verdex" className="hover:text-neutral-300">
          GitHub ↗
        </a>
      </footer>
    </main>
  );
}
