"use client";

// Verdict dossier — the stamp is the hero; evidence grid, receipts, second opinion.

import { Donut, HBar, LevelMeter, NeedleGauge, ScoreGauge, SplitBar, Stat, fmtNum, fmtPct, fmtUsd } from "./viz";
import { THRESHOLDS } from "@/engine/rules";
import type { Coverage, EvidenceSummary, ObservationWindow, RecheckCondition, SourceEvidence } from "@/lib/verdict-types";
import { LEVEL_TONE, VERDICT_STYLE, RISK_STYLE, type ToneKey } from "@/lib/verdict-display";
import { EvidencePanel } from "@/components/evidence-panel";

export type TokenRef = { platform: string; address: string; name: string; symbol: string; mcapUsd?: number | null; vol24hUsd?: number | null };
export type MetricRow = { name: string; value: number | string; threshold: string; level: string };
export type SubVerdict = { dim: string; level: string; metrics: MetricRow[] };
export type VerdictRecord = {
  kind: "verdict";
  id: string;
  ts: string;
  token: TokenRef;
  metrics: Record<string, Record<string, number | string | boolean | null | (string | number)[]>>;
  result: { verdict: string; score: number; confidence: string; falsifier: string; subs: SubVerdict[]; label?: string; recheck?: RecheckCondition[]; v2Subs?: SubVerdict[] };
  jev: { available: boolean; riskyProb: number | null; dims?: Record<string, number | null> };
  agreement: string;
  narration: { source: string; headline: string; bullets: string[] } | null;
  receipts: { endpoint: string; params: Record<string, unknown>; ts: string; credits: number; sha256: string; cached: boolean }[];
  failures: { endpoint: string; error: string }[];
  schemaVersion?: 2;
  rulesVersion?: string;
  mode?: "live" | "replay";
  computedAt?: string;
  sourceRecordId?: string;
  coverage?: Coverage;
  window?: ObservationWindow;
  sources?: SourceEvidence[];
  evidence?: EvidenceSummary[];
  context?: { btcDom: number | null; btcDomDelta7d: number | null; fearGreed: number | null };
  share?: { kind: "snapshot" | "none"; path: string | null };
};

const HEX: Record<ToneKey, string> = { safe: "var(--color-safe)", warn: "var(--color-warn)", danger: "var(--color-danger)", unknown: "var(--color-unknown)" };
const TEXT: Record<ToneKey, string> = { safe: "text-safe", warn: "text-warn", danger: "text-danger", unknown: "text-unknown" };

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
type MetricsBag = Record<string, number | string | boolean | null | (string | number)[]>;
const age = (iso: string) => {
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return "time unknown";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

function CopyButton({ value, label = "copy" }: { value: string; label?: string }) {
  return (
    <button type="button" onClick={() => void navigator.clipboard?.writeText(value)} className="btn-ghost">
      {label}
    </button>
  );
}

function DownloadButton({ v }: { v: VerdictRecord }) {
  const href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(v))}`;
  return (
    <a href={href} download={`verdex-${v.id}.json`} className="btn-ghost">
      download evidence JSON
    </a>
  );
}

function ReasonList({ v }: { v: VerdictRecord }) {
  const reasons = v.result.recheck?.slice(0, 3).map((r) => `${r.dimension}: ${r.reason}`) ?? v.result.subs.filter((s) => s.level !== "CLEAN").slice(0, 3).map((s) => `${s.dim}: ${s.level.toLowerCase()} evidence`);
  return (
    <div className="border-t border-line bg-raised/40 px-5 py-5 sm:px-6">
      <div className="exhibit-no mb-3">What to inspect next</div>
      {reasons.length > 0 ? (
        <ol className="grid gap-3 text-sm leading-relaxed text-dim md:grid-cols-3">
          {reasons.map((reason, i) => (
            <li key={`${reason}-${i}`} className="border-l-2 border-line pl-3">
              <span className="mr-2 font-data text-[11px] text-accent">0{i + 1}</span>
              {reason}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-dim">No flags in this sample. A new flag or insufficient/stale evidence changes this assessment.</p>
      )}
    </div>
  );
}

function DimPanel({ sub, children }: { sub: SubVerdict; children: React.ReactNode }) {
  const t = LEVEL_TONE[sub.level] ?? "unknown";
  return (
    <div className="flex flex-col border-line p-5 sm:p-6 [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0 lg:border-b-0 lg:[&:nth-child(-n+2)]:border-b lg:odd:border-r">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="deco text-base tracking-normal">{sub.dim}</span>
        <span className="flex items-center gap-2.5">
          <LevelMeter level={sub.level} />
          <span className={`font-data text-[11px] font-bold tracking-widest ${TEXT[t]}`}>{sub.level}</span>
        </span>
      </div>
      {children}
      <details className="mt-auto pt-4">
        <summary className="cursor-pointer select-none font-data text-[10px] uppercase tracking-widest text-dim transition-colors hover:text-text">
          ▸ thresholds
        </summary>
        <table className="mt-2 w-full text-[11px]">
          <tbody>
            {sub.metrics.map((m) => (
              <tr key={m.name} className="border-t border-line/40">
                <td className="py-1.5 pr-2 text-dim">{m.name}</td>
                <td className="num py-1.5 font-data">{String(m.value)}</td>
                <td className="py-1.5 pl-2 text-right font-data text-dim">{m.threshold}</td>
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
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex justify-between font-data text-[11px] text-dim">
          <span>BUY {fmtUsd(buy)} · {fmtNum(num(m.buyCount))}tx</span>
          <span>SELL {fmtUsd(sell)} · {fmtNum(num(m.sellCount))}tx</span>
        </div>
        <SplitBar buy={buy} sell={sell} />
      </div>
      <div>
        <div className="mb-1.5 flex justify-between font-data text-[11px] text-dim">
          <span>NET BUY RATIO</span>
          <span className="text-text">{num(m.netBuyRatio).toFixed(2)}</span>
        </div>
        <NeedleGauge value={num(m.netBuyRatio)} />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 gap-4">
          <Stat k="swaps" v={fmtNum(num(m.swapCount))} />
          <Stat k="makers" v={fmtNum(num(m.uniqueMakers))} />
          <Stat k="observed sell makers" v={fmtNum(num(m.observedSellMakers ?? m.thirdPartySells))} tone={num(m.observedSellMakers ?? m.thirdPartySells) === 0 && num(m.buyCount) >= 20 ? "text-danger" : num(m.observedSellMakers ?? m.thirdPartySells) >= THRESHOLDS.thirdPartySellsClean ? "text-safe" : "text-warn"} />
          <Stat k="net flow" v={fmtUsd(num(m.netBuyUsd))} />
        </div>
        <div className="text-center">
          <Donut share={num(m.top5MakerShare)} label="top-5 maker share" tone={num(m.top5MakerShare) > THRESHOLDS.top5MakerShare.danger ? HEX.danger : num(m.top5MakerShare) >= THRESHOLDS.top5MakerShare.warn ? HEX.warn : HEX.safe} />
          <div className="mt-1 font-data text-[9px] uppercase tracking-widest text-dim">top-5 maker</div>
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
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex justify-between font-data text-[11px] text-dim">
          <span>LP ADDS {fmtNum(adds)}</span>
          <span>LP REMOVES {fmtNum(pulls)}</span>
        </div>
        <SplitBar buy={adds} sell={pulls} />
      </div>
      <div>
        <div className="mb-1.5 flex justify-between font-data text-[11px] text-dim">
          <span>MAX SINGLE PULL</span>
          <span className={pullPct > THRESHOLDS.maxSinglePullPct.danger ? "text-danger" : pullPct >= THRESHOLDS.maxSinglePullPct.warn ? "text-warn" : "text-text"}>{fmtPct(pullPct)}</span>
        </div>
        <HBar value={pullPct} max={1} tone={pullPct > THRESHOLDS.maxSinglePullPct.danger ? "bg-danger" : pullPct >= THRESHOLDS.maxSinglePullPct.warn ? "bg-warn" : "bg-safe"} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Stat k="liquidity" v={fmtUsd(num(m.totalLiqUsd))} />
        <Stat k="pools" v={fmtNum(num(m.poolCount))} />
        <Stat k="net LP Δ" v={m.removalVsCurrentDepth == null ? "—" : fmtUsd(num(m.netLpDeltaUsd))} tone={m.removalVsCurrentDepth == null ? "text-dim" : num(m.netLpDeltaUsd) < 0 ? "text-danger" : "text-safe"} />
      </div>
    </div>
  );
}

function PumpViz({ m }: { m: MetricsBag }) {
  const vr = typeof m.volMcapRatio === "number" ? m.volMcapRatio : null;
  const chg = typeof m.priceChange24h === "number" ? m.priceChange24h : null;
  const mpv = typeof m.makersPer100kVol === "number" ? m.makersPer100kVol : null;
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex justify-between font-data text-[11px] text-dim">
          <span>VOL/MCAP</span>
          <span className={vr == null ? "text-dim" : vr > THRESHOLDS.volMcapRatio.danger ? "text-danger" : vr >= THRESHOLDS.volMcapRatio.warn ? "text-warn" : "text-text"}>
            {vr == null ? "—" : fmtPct(vr, 2)}
          </span>
        </div>
        <HBar value={vr ?? 0} max={1} tone={vr != null && vr > THRESHOLDS.volMcapRatio.danger ? "bg-danger" : vr != null && vr >= THRESHOLDS.volMcapRatio.warn ? "bg-warn" : "bg-safe"} />
      </div>
      <div>
        <div className="mb-1.5 flex justify-between font-data text-[11px] text-dim">
          <span>PRICE Δ 24H</span>
          <span className={chg == null ? "text-dim" : chg >= 0 ? "text-safe" : "text-danger"}>
            {chg == null ? "—" : `${chg >= 0 ? "+" : ""}${(chg * 100).toFixed(2)}%`}
          </span>
        </div>
        {chg != null && <NeedleGauge value={Math.max(-0.5, Math.min(0.5, chg))} min={-0.5} max={0.5} />}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Stat k="makers /$100k win" v={mpv != null ? mpv.toFixed(1) : "—"} />
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
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex justify-between font-data text-[11px] text-dim">
          <span>BUY TAX {bt != null ? fmtPct(bt, 2) : "—"}</span>
          <span>SELL TAX {st != null ? fmtPct(st, 2) : "—"}</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-sm">
          <div className="bg-safe" style={{ width: `${Math.min(100, (bt ?? 0) * 100 * 10)}%` }} />
          <div className="bg-danger" style={{ width: `${Math.min(100, (st ?? 0) * 100 * 10)}%` }} />
          <div className="flex-1 bg-line" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Stat k="security lvl" v={String(m.level ?? "unknown")} tone={String(m.level) === "safe" ? "text-safe" : "text-warn"} />
        <Stat k="flag hits" v={fmtNum(hits.length)} tone={hits.length > 0 ? "text-danger" : "text-safe"} />
        <Stat k="vendor flag" v={flagged ? "YES" : "no"} tone={flagged ? "text-danger" : "text-dim"} />
      </div>
      {hits.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hits.slice(0, 8).map((h, i) => (
            <span key={i} className="rounded-sm border border-danger/40 px-1.5 py-0.5 font-data text-[10px] text-danger">
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
  const isV2 = v.schemaVersion === 2;
  const archived = !isV2 || v.mode === "replay";
  const style = (isV2 && v.result.label ? RISK_STYLE[v.result.label] : undefined) ?? VERDICT_STYLE[v.result.verdict] ?? VERDICT_STYLE.BELUM_CUKUP_BUKTI;
  const tone = style.tone;
  const chg = typeof v.metrics.pump?.priceChange24h === "number" ? (v.metrics.pump.priceChange24h as number) : null;
  const jevScore = v.jev.riskyProb != null ? Math.round((1 - v.jev.riskyProb) * 100) : null;
  const subs = (isV2 && v.result.v2Subs?.length ? v.result.v2Subs : v.result.subs);
  const rawEvidence = v.sources?.some((source) => source.bodyBase64) ?? false;
  const coverage = isV2 ? v.coverage?.level ?? "insufficient" : "archived";

  return (
    <section className="reveal overflow-hidden rounded-md border border-line bg-panel" aria-label={`Verdict for ${v.token.symbol}`}>
      {/* ——— Exhibit header strip ——— */}
      <div className="panel-head">
        <span>
          exhibit · scan/{v.id}
        </span>
        <span className="hidden sm:inline">{v.ts.slice(0, 19).replace("T", " ")}Z</span>
        <span>{archived ? "recorded replay" : "live scan"}</span>
      </div>

      {archived && !isV2 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-warn/30 bg-warn/5 px-5 py-3.5 sm:px-6">
          <span className="paper-tag">archived</span>
          <p className="text-xs leading-relaxed text-warn">
            Archived assessment under legacy rules, captured {new Date(v.ts).toISOString()}.{" "}
            <span className="redact px-2">Raw source bodies not retained.</span>
          </p>
        </div>
      )}

      {/* ——— Cover: stamp is the focal point ——— */}
      <div className="grid gap-6 border-b border-line px-5 py-6 sm:px-6 sm:py-7 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="min-w-0">
          <span className={`stamp stamp-lg stamp-in ${TEXT[tone]}`}>{style.label}</span>
          <h2 className="deco mt-5 text-3xl leading-tight sm:text-4xl">
            {v.token.name}
            <span className="ml-2 align-middle font-data text-sm font-normal uppercase tracking-widest text-dim">
              ${v.token.symbol.replace(/^\$/, "")}
            </span>
          </h2>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <span className="font-data text-[11px] uppercase tracking-widest text-dim">{v.token.platform}</span>
            <span className="mono-strip">
              {v.token.address.slice(0, 12)}<b>…</b>{v.token.address.slice(-8)}
            </span>
            <CopyButton value={v.token.address} label="copy address" />
          </div>
        </div>
        <div className="flex items-center gap-7 lg:justify-self-end">
          <ScoreGauge score={v.result.score} tone={HEX[tone]} size={132} />
          <div className="space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-dim">confidence</div>
              <div className="mt-1 font-data text-base font-bold uppercase">{v.result.confidence}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-dim">agreement</div>
              <div className={`mt-1 font-data text-base font-bold uppercase ${TEXT[tone]}`}>{v.agreement}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:col-span-full lg:border-t lg:border-line lg:pt-5">
          <Stat k="mcap" v={fmtUsd(v.token.mcapUsd)} />
          <Stat k="vol 24h" v={fmtUsd(v.token.vol24hUsd)} />
          <Stat k="liquidity" v={fmtUsd(num(v.metrics.liq?.totalLiqUsd))} />
          <Stat
            k="Δ 24h"
            v={chg == null ? "—" : `${chg >= 0 ? "+" : ""}${(chg * 100).toFixed(2)}%`}
            tone={chg == null ? "text-dim" : chg >= 0 ? "text-safe" : "text-danger"}
          />
        </div>
      </div>

      {/* ——— Provenance strip ——— */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3 font-data text-[10px] uppercase tracking-widest text-dim sm:px-6">
        <span className={`chip ${archived ? "on" : ""}`} style={archived ? undefined : { borderColor: "var(--color-safe)", color: "var(--color-safe)" }}>
          {archived ? "ARCHIVED / REPLAY" : "LIVE SCAN"}
        </span>
        <span className={`chip ${coverage === "sufficient" ? "" : "on"}`} style={coverage === "sufficient" ? { borderColor: "var(--color-safe)", color: "var(--color-safe)" } : { borderColor: "var(--color-warn)", color: "var(--color-warn)" }}>
          coverage: {coverage}
        </span>
        <span>captured {new Date(v.computedAt ?? v.ts).toISOString().slice(0, 16).replace("T", " ")}Z · {age(v.computedAt ?? v.ts)}</span>
        <span className="ml-auto">{rawEvidence ? "raw bodies available" : <span className="redact px-2">raw source bodies not retained</span>}</span>
      </div>

      {/* ——— 4-dimension evidence grid ——— */}
      <div className="grid lg:grid-cols-2">
        {subs.map((s) => (
          <DimPanel key={s.dim} sub={s}>
            {(DIM_VIZ[s.dim] ?? (() => null))(v.metrics[DIM_KEY[s.dim] ?? s.dim.toLowerCase()] ?? {})}
          </DimPanel>
        ))}
      </div>

      {v.coverage?.reasons.some((reason) => /lp|liquidity/i.test(reason)) && (
        <div className="flex items-center gap-3 border-t border-warn/30 bg-warn/5 px-5 py-3.5 sm:px-6">
          <span className="redact w-8 shrink-0" aria-hidden="true">&nbsp;</span>
          <p className="text-xs leading-relaxed text-warn">
            LP evidence unavailable for this sample. Liquidity depth is shown separately; missing LP events are unknown, not zero.
          </p>
        </div>
      )}

      <ReasonList v={v} />

      {/* ——— Second opinion ——— */}
      <div className="border-t border-line bg-raised/60 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="text-[11px] uppercase tracking-[0.14em] text-dim">Second opinion · never overrides rules</span>
          {v.jev.available && jevScore != null ? (
            <>
              <span className="font-data text-xs text-dim">
                risk signal {jevScore}/100 · P(risky)={v.jev.riskyProb?.toFixed(2)}
              </span>
              {v.jev.dims && (
                <div className="flex items-end gap-1.5" title="Second-opinion P(risky) per dimension">
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
                        <span className="font-data text-[8px] uppercase text-dim">{d.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <span className="text-xs text-dim">unavailable — verdict stands on rules alone</span>
          )}
          <span className={`ml-auto rounded-sm border px-2 py-0.5 font-data text-[10px] font-bold uppercase tracking-widest ${TEXT[v.agreement === "consensus" ? "safe" : v.agreement === "contested" ? "danger" : "unknown"]} border-current`}>
            {v.agreement}
          </span>
        </div>
      </div>

      {/* ——— Falsifier + narration ——— */}
      <div className="grid border-t border-line md:grid-cols-2">
        <div className="border-line p-5 md:border-r">
          <p className="font-data text-[11px] uppercase tracking-[0.16em] text-warn">Falsifier — what breaks this verdict</p>
          <p className="mt-2 text-sm leading-relaxed text-dim">{v.result.falsifier}</p>
        </div>
        <div className="border-t border-line p-5 md:border-t-0">
          {v.narration && isV2 ? (
            <>
              <p className="font-data text-[11px] uppercase tracking-[0.16em] text-dim">Narration · {v.narration.source}</p>
              <p className="mt-2 text-sm font-semibold leading-snug">{v.narration.headline}</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-dim">
                {v.narration.bullets.map((b, i) => (
                  <li key={i}>· {b}</li>
                ))}
              </ul>
            </>
          ) : v.narration && !isV2 ? (
            <p className="text-xs leading-relaxed text-dim">Archived narrative is retained in the downloaded record; inspect source evidence and recheck conditions instead of treating historical text as advice.</p>
          ) : (
            <p className="text-xs text-dim">narration unavailable</p>
          )}
        </div>
      </div>

      {v.failures.length > 0 && (
        <div className="border-t border-line px-5 py-3.5 font-data text-[11px] text-dim sm:px-6">
          <span className="text-warn">{v.failures.length} endpoint(s) failed</span>
          {v.failures.map((f, i) => (
            <span key={i} className="ml-3 text-dim">
              {f.endpoint}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5 border-t border-line px-5 py-4 sm:px-6">
        <DownloadButton v={v} />
        {v.share?.path && <CopyButton value={v.share.path} label="copy recorded link" />}
        <span className="font-data text-[10px] text-dim">export preserves the displayed receipt and limitation fields</span>
      </div>

      <EvidencePanel sources={v.sources} evidence={v.evidence} chain={v.token.platform} />

      {/* ——— Receipts ——— */}
      <details className="group border-t border-line">
        <summary className="cursor-pointer select-none px-5 py-3.5 text-sm text-dim transition-colors hover:text-text sm:px-6 [&::-webkit-details-marker]:hidden">
          <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
          receipts — {v.receipts.length} CMC calls · SHA-256
        </summary>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-raised text-left font-data text-[10px] uppercase tracking-widest text-dim">
                <th className="p-2.5">endpoint</th>
                <th className="p-2.5">params</th>
                <th className="p-2.5">cr</th>
                <th className="p-2.5">sha256</th>
                <th className="p-2.5">src</th>
              </tr>
            </thead>
            <tbody>
              {v.receipts.map((r, i) => (
                <tr key={i} className="border-t border-line/40 font-data">
                  <td className="p-2.5">{r.endpoint}</td>
                  <td className="max-w-44 truncate p-2.5 text-dim" title={JSON.stringify(r.params)}>
                    {JSON.stringify(r.params)}
                  </td>
                  <td className="num p-2.5">{r.credits}</td>
                  <td className="p-2.5 text-dim">{r.sha256.slice(0, 12)}…</td>
                  <td className="p-2.5 text-dim">{r.cached ? "cache" : "live"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
