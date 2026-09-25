// Verdex terminal verdict card — dense data-viz layout, minimal prose.

import { Donut, HBar, LevelMeter, NeedleGauge, ScoreGauge, SplitBar, Stat, fmtNum, fmtPct, fmtUsd } from "./viz";
import { THRESHOLDS } from "@/engine/rules";

export type TokenRef = { platform: string; address: string; name: string; symbol: string; mcapUsd?: number | null; vol24hUsd?: number | null };
export type MetricRow = { name: string; value: number | string; threshold: string; level: string };
export type SubVerdict = { dim: string; level: string; metrics: MetricRow[] };
export type VerdictRecord = {
  kind: "verdict";
  id: string;
  ts: string;
  token: TokenRef;
  metrics: Record<string, Record<string, number | string | boolean | null | (string | number)[]>>;
  result: { verdict: string; score: number; confidence: string; falsifier: string; subs: SubVerdict[] };
  jev: { available: boolean; riskyProb: number | null; dims?: Record<string, number | null> };
  agreement: string;
  narration: { source: string; headline: string; bullets: string[] } | null;
  receipts: { endpoint: string; params: Record<string, unknown>; ts: string; credits: number; sha256: string; cached: boolean }[];
  failures: { endpoint: string; error: string }[];
};

type ToneKey = "safe" | "warn" | "danger" | "unknown";
const HEX: Record<ToneKey, string> = { safe: "#34d399", warn: "#fbbf24", danger: "#f87171", unknown: "#8a9189" };
const TEXT: Record<ToneKey, string> = { safe: "text-safe", warn: "text-warn", danger: "text-danger", unknown: "text-unknown" };

export const VERDICT_STYLE: Record<string, { label: string; tone: ToneKey }> = {
  LAYAK: { label: "ENTRY-WORTHY", tone: "safe" },
  RAWAN: { label: "CAUTION", tone: "warn" },
  JANGAN: { label: "AVOID", tone: "danger" },
  BELUM_CUKUP_BUKTI: { label: "INSUFFICIENT", tone: "unknown" },
};
const LEVEL_TONE: Record<string, ToneKey> = { CLEAN: "safe", WARN: "warn", DANGER: "danger", INSUFFICIENT: "unknown" };

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
type MetricsBag = Record<string, number | string | boolean | null | (string | number)[]>;
const shortAddr = (a: string) => (a.length > 20 ? `${a.slice(0, 10)}…${a.slice(-8)}` : a);

function DimPanel({ sub, children }: { sub: SubVerdict; children: React.ReactNode }) {
  const t = LEVEL_TONE[sub.level] ?? "unknown";
  return (
    <div className="flex flex-col border-line p-4 sm:p-5 [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0 lg:border-b-0 lg:[&:nth-child(-n+2)]:border-b lg:odd:border-r">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-data text-xs font-bold tracking-[0.2em] text-faint">{sub.dim}</span>
        <span className="flex items-center gap-2.5">
          <LevelMeter level={sub.level} />
          <span className={`font-data text-[10px] font-bold tracking-widest ${TEXT[t]}`}>{sub.level}</span>
        </span>
      </div>
      {children}
      <details className="mt-auto pt-3">
        <summary className="cursor-pointer select-none font-data text-[10px] uppercase tracking-widest text-faint transition-colors hover:text-dim">
          ▸ thresholds
        </summary>
        <table className="mt-2 w-full text-[11px]">
          <tbody>
            {sub.metrics.map((m) => (
              <tr key={m.name} className="border-t border-line/40">
                <td className="py-1 pr-2 text-faint">{m.name}</td>
                <td className="num py-1 font-data">{String(m.value)}</td>
                <td className="py-1 pl-2 text-right font-data text-faint">{m.threshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function FlowViz({ m }: { m: MetricsBag }) {
  const buy = num(m.buyUsd);
  const sell = num(m.sellUsd);
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex justify-between font-data text-[10px] text-faint">
          <span>BUY {fmtUsd(buy)} · {fmtNum(num(m.buyCount))}tx</span>
          <span>SELL {fmtUsd(sell)} · {fmtNum(num(m.sellCount))}tx</span>
        </div>
        <SplitBar buy={buy} sell={sell} />
      </div>
      <div>
        <div className="mb-1 flex justify-between font-data text-[10px] text-faint">
          <span>NET BUY RATIO</span>
          <span className="text-text">{num(m.netBuyRatio).toFixed(2)}</span>
        </div>
        <NeedleGauge value={num(m.netBuyRatio)} />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3">
          <Stat k="swaps" v={fmtNum(num(m.swapCount))} />
          <Stat k="makers" v={fmtNum(num(m.uniqueMakers))} />
          <Stat k="3rd-party sells" v={fmtNum(num(m.thirdPartySells))} tone={num(m.thirdPartySells) === 0 && num(m.buyCount) >= 20 ? "text-danger" : num(m.thirdPartySells) >= THRESHOLDS.thirdPartySellsClean ? "text-safe" : "text-warn"} />
          <Stat k="net flow" v={fmtUsd(num(m.netBuyUsd))} />
        </div>
        <div className="text-center">
          <Donut share={num(m.top5MakerShare)} label="top-5 maker share" tone={num(m.top5MakerShare) > THRESHOLDS.top5MakerShare.danger ? HEX.danger : num(m.top5MakerShare) >= THRESHOLDS.top5MakerShare.warn ? HEX.warn : HEX.safe} />
          <div className="mt-1 font-data text-[9px] uppercase tracking-widest text-faint">top-5 maker</div>
        </div>
      </div>
    </div>
  );
}

function LiqViz({ m }: { m: MetricsBag }) {
  const adds = num(m.addCount);
  const pulls = num(m.removeCount);
  const pullPct = num(m.maxSinglePullPct);
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex justify-between font-data text-[10px] text-faint">
          <span>LP ADDS {fmtNum(adds)}</span>
          <span>LP REMOVES {fmtNum(pulls)}</span>
        </div>
        <SplitBar buy={adds} sell={pulls} />
      </div>
      <div>
        <div className="mb-1 flex justify-between font-data text-[10px] text-faint">
          <span>MAX SINGLE PULL</span>
          <span className={pullPct > THRESHOLDS.maxSinglePullPct.danger ? "text-danger" : pullPct >= THRESHOLDS.maxSinglePullPct.warn ? "text-warn" : "text-text"}>{fmtPct(pullPct)}</span>
        </div>
        <HBar value={pullPct} max={1} tone={pullPct > THRESHOLDS.maxSinglePullPct.danger ? "bg-danger" : pullPct >= THRESHOLDS.maxSinglePullPct.warn ? "bg-warn" : "bg-safe"} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat k="liquidity" v={fmtUsd(num(m.totalLiqUsd))} />
        <Stat k="pools" v={fmtNum(num(m.poolCount))} />
        <Stat k="net LP Δ" v={fmtUsd(num(m.netLpDeltaUsd))} tone={num(m.netLpDeltaUsd) < 0 ? "text-danger" : "text-safe"} />
      </div>
    </div>
  );
}

function PumpViz({ m }: { m: MetricsBag }) {
  const vr = typeof m.volMcapRatio === "number" ? m.volMcapRatio : null;
  const chg = typeof m.priceChange24h === "number" ? m.priceChange24h : null;
  const mpv = typeof m.makersPer100kVol === "number" ? m.makersPer100kVol : null;
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex justify-between font-data text-[10px] text-faint">
          <span>VOL/MCAP</span>
          <span className={vr == null ? "text-faint" : vr > THRESHOLDS.volMcapRatio.danger ? "text-danger" : vr >= THRESHOLDS.volMcapRatio.warn ? "text-warn" : "text-text"}>
            {vr == null ? "—" : fmtPct(vr, 2)}
          </span>
        </div>
        <HBar value={vr ?? 0} max={1} tone={vr != null && vr > THRESHOLDS.volMcapRatio.danger ? "bg-danger" : vr != null && vr >= THRESHOLDS.volMcapRatio.warn ? "bg-warn" : "bg-safe"} />
      </div>
      <div>
        <div className="mb-1 flex justify-between font-data text-[10px] text-faint">
          <span>PRICE Δ 24H</span>
          <span className={chg == null ? "text-faint" : chg >= 0 ? "text-safe" : "text-danger"}>
            {chg == null ? "—" : `${chg >= 0 ? "+" : ""}${(chg * 100).toFixed(2)}%`}
          </span>
        </div>
        {chg != null && <NeedleGauge value={Math.max(-0.5, Math.min(0.5, chg))} min={-0.5} max={0.5} />}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat k="makers /$100k vol" v={mpv != null ? mpv.toFixed(1) : "—"} />
        <Stat k="vol/mcap" v={vr != null ? vr.toFixed(4) : "—"} />
      </div>
    </div>
  );
}

function SafetyViz({ m }: { m: MetricsBag }) {
  const hits = Array.isArray(m.hits) ? (m.hits as (string | number)[]) : [];
  const flagged = m.flaggedByVendor === true;
  const bt = typeof m.buyTax === "number" ? m.buyTax : null;
  const st = typeof m.sellTax === "number" ? m.sellTax : null;
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex justify-between font-data text-[10px] text-faint">
          <span>BUY TAX {bt != null ? fmtPct(bt, 2) : "—"}</span>
          <span>SELL TAX {st != null ? fmtPct(st, 2) : "—"}</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-sm">
          <div className="bg-safe" style={{ width: `${Math.min(100, (bt ?? 0) * 100 * 10)}%` }} />
          <div className="bg-danger" style={{ width: `${Math.min(100, (st ?? 0) * 100 * 10)}%` }} />
          <div className="flex-1 bg-line" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat k="security lvl" v={String(m.level ?? "unknown")} tone={String(m.level) === "safe" ? "text-safe" : "text-warn"} />
        <Stat k="flag hits" v={fmtNum(hits.length)} tone={hits.length > 0 ? "text-danger" : "text-safe"} />
        <Stat k="vendor flag" v={flagged ? "YES" : "no"} tone={flagged ? "text-danger" : "text-dim"} />
      </div>
      {hits.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {hits.slice(0, 8).map((h, i) => (
            <span key={i} className="rounded-sm border border-danger/40 px-1.5 py-0.5 font-data text-[9px] text-danger">
              {String(h)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const DIM_VIZ: Record<string, (m: MetricsBag) => React.ReactNode> = {
  FLOW: (m) => <FlowViz m={m} />,
  LIQUIDITY: (m) => <LiqViz m={m} />,
  PUMP: (m) => <PumpViz m={m} />,
  SAFETY: (m) => <SafetyViz m={m} />,
};

const DIM_KEY: Record<string, string> = { FLOW: "flow", LIQUIDITY: "liq", PUMP: "pump", SAFETY: "safety" };

export function VerdictCard({ v }: { v: VerdictRecord }) {
  const style = VERDICT_STYLE[v.result.verdict] ?? VERDICT_STYLE.BELUM_CUKUP_BUKTI;
  const tone = style.tone;
  const chg = typeof v.metrics.pump?.priceChange24h === "number" ? (v.metrics.pump.priceChange24h as number) : null;
  const jevScore = v.jev.riskyProb != null ? Math.round((1 - v.jev.riskyProb) * 100) : null;

  return (
    <section className="reveal overflow-hidden rounded-md border border-line bg-panel" aria-label={`Verdict for ${v.token.symbol}`}>
      {/* ——— Scan header ——— */}
      <div className="border-b border-line bg-raised px-4 py-2 font-data text-[10px] uppercase tracking-[0.2em] text-faint">
        verdex://scan/{v.id} · {v.ts.slice(0, 19).replace("T", " ")}Z · deterministic rules
      </div>

      {/* ——— Token + verdict band ——— */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5 border-b border-line px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <span className={`stamp ${TEXT[tone]}`}>{style.label}</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            {v.token.name} <span className="font-data text-dim">${v.token.symbol.replace(/^\$/, "")}</span>
          </h2>
          <p className="mt-1 font-data text-[11px] text-faint">
            {v.token.platform.toUpperCase()} · {shortAddr(v.token.address)}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <ScoreGauge score={v.result.score} tone={HEX[tone]} />
          <div>
            <div className="font-data text-[10px] uppercase tracking-widest text-faint">confidence</div>
            <div className="font-data text-sm font-bold uppercase">{v.result.confidence}</div>
            <div className={`mt-2 font-data text-[10px] uppercase tracking-widest ${TEXT[tone]}`}>{v.agreement}</div>
          </div>
        </div>
        <div className="ml-auto grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Stat k="mcap" v={fmtUsd(v.token.mcapUsd)} />
          <Stat k="vol 24h" v={fmtUsd(v.token.vol24hUsd)} />
          <Stat k="liquidity" v={fmtUsd(num(v.metrics.liq?.totalLiqUsd))} />
          <Stat
            k="Δ 24h"
            v={chg == null ? "—" : `${chg >= 0 ? "+" : ""}${(chg * 100).toFixed(2)}%`}
            tone={chg == null ? "text-faint" : chg >= 0 ? "text-safe" : "text-danger"}
          />
        </div>
      </div>

      {/* ——— 4-dimension evidence grid ——— */}
      <div className="grid lg:grid-cols-2">
        {v.result.subs.map((s) => (
          <DimPanel key={s.dim} sub={s}>
            {(DIM_VIZ[s.dim] ?? (() => null))(v.metrics[DIM_KEY[s.dim] ?? s.dim.toLowerCase()] ?? {})}
          </DimPanel>
        ))}
      </div>

      {/* ——— Second opinion band ——— */}
      <div className="border-t border-line bg-raised/60 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="font-data text-[10px] uppercase tracking-[0.2em] text-faint">Jev · 2nd opinion</span>
          {v.jev.available && jevScore != null ? (
            <>
              <div className="flex items-center gap-2 font-data text-xs">
                <span className="text-faint">rules</span>
                <div className="w-28"><HBar value={v.result.score} max={100} tone={tone === "safe" ? "bg-safe" : tone === "warn" ? "bg-warn" : tone === "danger" ? "bg-danger" : "bg-unknown"} height={5} /></div>
                <span className="num font-bold">{v.result.score}</span>
              </div>
              <div className="flex items-center gap-2 font-data text-xs">
                <span className="text-faint">jev</span>
                <div className="w-28"><HBar value={jevScore} max={100} tone="bg-text/60" height={5} /></div>
                <span className="num font-bold">{jevScore}</span>
                <span className="text-faint">P(risky)={v.jev.riskyProb?.toFixed(2)}</span>
              </div>
              {v.jev.dims && (
                <div className="flex items-end gap-1.5" title="Jev P(risky) per dimension">
                  {(["SAFETY", "FLOW", "LIQUIDITY", "PUMP"] as const).map((d) => {
                    const p = v.jev.dims?.[d];
                    return (
                      <div key={d} className="flex flex-col items-center gap-0.5">
                        <div className="flex h-6 w-2.5 items-end rounded-sm bg-line/50">
                          {p != null && (
                            <div
                              className={`w-full rounded-sm ${p > 0.5 ? "bg-danger/80" : "bg-safe/80"}`}
                              style={{ height: `${Math.round(p * 100)}%` }}
                            />
                          )}
                        </div>
                        <span className="font-data text-[8px] uppercase text-faint">{d.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <span className="font-data text-xs text-faint">unavailable — verdict stands on rules alone</span>
          )}
          <span className={`ml-auto rounded-sm border px-1.5 py-0.5 font-data text-[10px] font-bold uppercase tracking-widest ${TEXT[v.agreement === "consensus" ? "safe" : v.agreement === "contested" ? "danger" : "unknown"]} border-current`}>
            {v.agreement}
          </span>
        </div>
      </div>

      {/* ——— Falsifier + narration ——— */}
      <div className="grid border-t border-line md:grid-cols-2">
        <div className="border-line p-4 sm:p-5 md:border-r">
          <p className="font-data text-[10px] uppercase tracking-[0.2em] text-warn">Falsifier</p>
          <p className="mt-1.5 font-data text-xs leading-relaxed text-dim">{v.result.falsifier}</p>
        </div>
        <div className="border-t border-line p-4 sm:p-5 md:border-t-0">
          {v.narration ? (
            <>
              <p className="font-data text-[10px] uppercase tracking-[0.2em] text-faint">AI narration · {v.narration.source}</p>
              <p className="mt-1.5 text-sm font-semibold leading-snug">{v.narration.headline}</p>
              <ul className="mt-1.5 space-y-1 font-data text-[11px] leading-relaxed text-dim">
                {v.narration.bullets.map((b, i) => (
                  <li key={i}>· {b}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="font-data text-xs text-faint">narration unavailable</p>
          )}
        </div>
      </div>

      {v.failures.length > 0 && (
        <div className="border-t border-line px-5 py-3 font-data text-[11px] text-dim">
          <span className="text-warn">{v.failures.length} endpoint(s) failed</span>
          {v.failures.map((f, i) => (
            <span key={i} className="ml-3 text-faint">
              {f.endpoint}
            </span>
          ))}
        </div>
      )}

      {/* ——— Receipts ——— */}
      <details className="group border-t border-line">
        <summary className="cursor-pointer select-none px-5 py-3 font-data text-[11px] text-dim transition-colors hover:text-text [&::-webkit-details-marker]:hidden">
          <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
          receipts — {v.receipts.length} CMC calls · SHA-256
        </summary>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-raised text-left font-data text-[9px] uppercase tracking-widest text-faint">
                <th className="p-2">endpoint</th>
                <th className="p-2">params</th>
                <th className="p-2">cr</th>
                <th className="p-2">sha256</th>
                <th className="p-2">src</th>
              </tr>
            </thead>
            <tbody>
              {v.receipts.map((r, i) => (
                <tr key={i} className="border-t border-line/40 font-data">
                  <td className="p-2">{r.endpoint}</td>
                  <td className="max-w-44 truncate p-2 text-faint" title={JSON.stringify(r.params)}>
                    {JSON.stringify(r.params)}
                  </td>
                  <td className="num p-2">{r.credits}</td>
                  <td className="p-2 text-dim">{r.sha256.slice(0, 12)}…</td>
                  <td className="p-2 text-faint">{r.cached ? "cache" : "live"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
