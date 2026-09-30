// Deterministic verdict rules — the published thresholds in docs/CLAIMS.md
// are the source of truth; keep the two in sync.

import type { FlowMetrics, LiquidityMetrics, PumpMetrics, SafetyMetrics } from "./metrics";
import type { RecheckCondition, RiskLabel } from "@/lib/verdict-types";

export type SubDim = "SAFETY" | "FLOW" | "LIQUIDITY" | "PUMP";
export type SubLevel = "CLEAN" | "WARN" | "DANGER" | "INSUFFICIENT";
export type VerdictLevel = "LAYAK" | "RAWAN" | "JANGAN" | "BELUM_CUKUP_BUKTI";

export interface MetricRow {
  name: string;
  value: number | string;
  threshold: string;
  level: SubLevel;
}
export interface SubVerdict {
  dim: SubDim;
  level: SubLevel;
  metrics: MetricRow[];
}
export interface Context {
  btcDomDelta7d: number | null;
  fearGreed: number | null;
}
export interface EngineInput {
  safety: SafetyMetrics;
  flow: FlowMetrics;
  liq: LiquidityMetrics;
  pump: PumpMetrics;
  context: Context;
  mcapUsd?: number | null;
}
export interface CompositeResult {
  verdict: VerdictLevel;
  score: number;
  subs: SubVerdict[];
  confidence: "high" | "medium" | "low";
  falsifier: string;
  label?: RiskLabel;
  recheck?: RecheckCondition[];
  v2Subs?: SubVerdict[];
}

/** Shared thresholds — single source for rules AND UI viz tones. */
export const THRESHOLDS = {
  sellTaxDanger: 0.1,
  top5MakerShare: { warn: 0.5, danger: 0.7 },
  // Concentration only DANGERs when breadth is thin: 70%+ top-5 share on a
  // healthy maker count reads as MM/whale flow, not an insider tape.
  top5DangerMakersCap: 20,
  maxSinglePullPct: { warn: 0.15, danger: 0.5 },
  netLpDeltaPct: { warn: 0, danger: -0.1 },
  // Depth under this is de-facto untradeable — exit impossible regardless of
  // contract flags, so it escalates to AVOID like a honeypot outcome.
  dustLiqUsd: 1_000,
  volMcapRatio: { warn: 0.5, danger: 1.0 },
  makersPer100k: { warn: 5, danger: 1 },
  netBuyRatio: { warn: -0.1, danger: -0.3 },
  thirdPartySellsClean: 3,
  // Tape vitality: a market that needs >6 days to accumulate 100 swaps is a
  // dead tape — exit liquidity is nominal regardless of pool depth. Dead
  // (danger) <15/day; thin (warn) <50/day. Corpus evidence: dead/zombie
  // tokens sit at 4–70/day while live majors run 1,300–170,000/day.
  tapeVitality: { warn: 50, danger: 15 },
  // Assets ≥$100M mcap trade across CEX+DEX — their on-chain window is
  // dominated by arbitrage infrastructure, so concentration/direction
  // signals are weakly probative there and cap at WARN (published rule).
  matureAssetMcapUsd: 100_000_000,
} as const;

const DANGER_SAFETY = new Set(["honeypot", "rug_pull", "unusual_sell_tax"]);
const WARN_SAFETY = new Set(["wash_trading", "whitelist_function", "low_liquidity", "unusual_buy_tax"]);
// Named centralization risks — mint/upgrade/pause powers are genuine rug
// vectors (admin can drain or dilute), so they rate a WARN row of their
// own rather than falling into the unclassified bucket.
const CENTRALIZATION_SAFETY = new Set(["mintable", "pausable", "blacklist", "blacklist_function", "upgradeable", "proxy", "owner_change_balance", "hidden_owner"]);

const lvl = (name: string, value: number | string, threshold: string, level: SubLevel): MetricRow => ({ name, value, threshold, level });
const worst = (rows: MetricRow[]): SubLevel => {
  const order: SubLevel[] = ["DANGER", "WARN", "INSUFFICIENT", "CLEAN"];
  for (const l of order) if (rows.some((r) => r.level === l)) return l;
  return "CLEAN";
};

export function evalSafety(s: SafetyMetrics): SubVerdict {
  // INSUFFICIENT only when there is genuinely nothing to evaluate — a report
  // missing its level field but carrying isHit flags must still be scored
  // (honeypot isHit + absent level → JANGAN, never silent BELUM).
  if (s.level === "unknown" && s.hits.length === 0 && s.sellTax === null && s.buyTax === null) {
    return { dim: "SAFETY", level: "INSUFFICIENT", metrics: [lvl("securityLevel", "unknown", "available data", "INSUFFICIENT")] };
  }
  const rows: MetricRow[] = [];
  const dangerHits = s.hits.filter((h) => DANGER_SAFETY.has(h));
  const warnHits = s.hits.filter((h) => WARN_SAFETY.has(h));
  const centralization = s.hits.filter((h) => CENTRALIZATION_SAFETY.has(h));
  const unclassified = s.hits.filter((h) => !DANGER_SAFETY.has(h) && !WARN_SAFETY.has(h) && !CENTRALIZATION_SAFETY.has(h));
  const sellTaxDanger = (s.sellTax ?? 0) > THRESHOLDS.sellTaxDanger;
  const dangerDesc = [...dangerHits, ...(sellTaxDanger ? [`sellTax ${((s.sellTax ?? 0) * 100).toFixed(1)}%`] : [])];
  rows.push(lvl("dangerFlags", dangerDesc.join(",") || "none", "no honeypot/rug_pull/sell-tax>10%", dangerHits.length || sellTaxDanger ? "DANGER" : "CLEAN"));
  rows.push(lvl("warnFlags", warnHits.join(",") || "none", "no wash_trading/whitelist/low_liquidity", warnHits.length ? "WARN" : "CLEAN"));
  rows.push(lvl("centralizationFlags", centralization.join(",") || "none", "no mintable/pausable/upgradeable powers", centralization.length ? "WARN" : "CLEAN"));
  rows.push(lvl("unclassifiedFlags", unclassified.join(",") || "none", "no unclassified isHit codes", unclassified.length ? "WARN" : "CLEAN"));
  // Fail-closed: any securityLevel that isn't "safe" (incl. levels we don't
  // recognize) is a warning — never silently treat the unknown as clean.
  rows.push(lvl("securityLevel", s.level, "safe", s.level === "safe" ? "CLEAN" : "WARN"));
  return { dim: "SAFETY", level: worst(rows), metrics: rows };
}

export function evalFlow(f: FlowMetrics, mature = false): SubVerdict {
  if (f.swapCount < 50) {
    return { dim: "FLOW", level: "INSUFFICIENT", metrics: [lvl("swapCount", f.swapCount, "≥50", "INSUFFICIENT")] };
  }
  // Mature tier (mcap ≥ $100M, THRESHOLDS.matureAssetMcapUsd): cross-venue
  // arbitrage infrastructure dominates on-chain flow for large caps, so
  // concentration and direction read weakly probative — WARN-cap those two
  // rows. Insider-exit signals (0 third-party sells, <5 makers) keep full
  // severity because they're venue-independent. Published in CLAIMS.
  const cap = (l: SubLevel): SubLevel => (mature && l === "DANGER" ? "WARN" : l);
  const rows: MetricRow[] = [
    lvl("mcapTier", mature ? "≥$100M mature" : "<$100M early", "mature flow signals WARN-capped", "CLEAN"),
    lvl("thirdPartySells", f.thirdPartySells, "≥3 (0 sells w/ buys = hidden honeypot)",
      f.thirdPartySells === 0 && f.buyCount >= 20 ? "DANGER" : f.thirdPartySells >= THRESHOLDS.thirdPartySellsClean ? "CLEAN" : "WARN"),
    lvl("uniqueMakers", f.uniqueMakers, "≥20", f.uniqueMakers < 5 ? "DANGER" : f.uniqueMakers < 20 ? "WARN" : "CLEAN"),
    lvl("swapsPerDay", round2(f.swapsPerDay), "≥50/day (<15/day = dead tape, danger)", cap(f.swapsPerDay < THRESHOLDS.tapeVitality.danger ? "DANGER" : f.swapsPerDay < THRESHOLDS.tapeVitality.warn ? "WARN" : "CLEAN")),
    lvl("top5MakerShare", round2(f.top5MakerShare), "<0.50 (>0.70 & <20 makers = danger)", cap(f.top5MakerShare > THRESHOLDS.top5MakerShare.danger && f.uniqueMakers < THRESHOLDS.top5DangerMakersCap ? "DANGER" : f.top5MakerShare >= THRESHOLDS.top5MakerShare.warn ? "WARN" : "CLEAN")),
    lvl("netBuyRatio", round2(f.netBuyRatio), "≥ -0.10", cap(f.netBuyRatio < THRESHOLDS.netBuyRatio.danger ? "DANGER" : f.netBuyRatio < THRESHOLDS.netBuyRatio.warn ? "WARN" : "CLEAN")),
  ];
  return { dim: "FLOW", level: worst(rows), metrics: rows };
}

/** Detail must explain the verdict — V2 applies the same mature cap the composite uses. */
export function evalFlowV2(f: FlowMetrics, mature = false): SubVerdict {
  return evalFlow(f, mature);
}

export function evalLiquidity(l: LiquidityMetrics): SubVerdict {
  if (l.poolCount === 0) {
    return { dim: "LIQUIDITY", level: "INSUFFICIENT", metrics: [lvl("poolCount", 0, "≥1", "INSUFFICIENT")] };
  }
  const lpDeltaPct = l.netLpDeltaUsd !== null && l.totalLiqUsd > 0 ? l.netLpDeltaUsd / l.totalLiqUsd : null;
  const rows: MetricRow[] = [
    lvl("maxSinglePullPct", l.maxSinglePullPct === null ? "unknown" : round2(l.maxSinglePullPct), "<15%", l.maxSinglePullPct === null ? "INSUFFICIENT" : l.maxSinglePullPct > THRESHOLDS.maxSinglePullPct.danger ? "DANGER" : l.maxSinglePullPct >= THRESHOLDS.maxSinglePullPct.warn ? "WARN" : "CLEAN"),
    lvl("netLpDeltaPct", lpDeltaPct === null ? "unknown" : round2(lpDeltaPct), "≥0", lpDeltaPct === null ? "INSUFFICIENT" : lpDeltaPct < THRESHOLDS.netLpDeltaPct.danger ? "DANGER" : lpDeltaPct < THRESHOLDS.netLpDeltaPct.warn ? "WARN" : "CLEAN"),
    lvl("totalLiqUsd", Math.round(l.totalLiqUsd), "≥$10k (<$1k dust = danger)", l.totalLiqUsd < THRESHOLDS.dustLiqUsd ? "DANGER" : l.totalLiqUsd < 10_000 ? "WARN" : "CLEAN"),
  ];
  return { dim: "LIQUIDITY", level: worst(rows), metrics: rows };
}

export function evalLiquidityV2(l: LiquidityMetrics): SubVerdict {
  if (l.poolCount === 0) return { dim: "LIQUIDITY", level: "INSUFFICIENT", metrics: [lvl("poolCount", 0, "≥1", "INSUFFICIENT")] };
  const lpDeltaPct = l.netLpDeltaUsd !== null && l.totalLiqUsd > 0 ? l.netLpDeltaUsd / l.totalLiqUsd : null;
  const removal = l.removalVsCurrentDepth ?? null;
  const rows: MetricRow[] = [
    lvl("removalVsCurrentDepth", removal === null ? "unknown" : round2(removal), "<15% of mapped pool depth", removal === null ? "INSUFFICIENT" : removal > THRESHOLDS.maxSinglePullPct.danger ? "DANGER" : removal >= THRESHOLDS.maxSinglePullPct.warn ? "WARN" : "CLEAN"),
    lvl("netLpDeltaPct", lpDeltaPct === null ? "unknown" : round2(lpDeltaPct), "≥0", lpDeltaPct === null ? "INSUFFICIENT" : lpDeltaPct < THRESHOLDS.netLpDeltaPct.danger ? "DANGER" : lpDeltaPct < THRESHOLDS.netLpDeltaPct.warn ? "WARN" : "CLEAN"),
    lvl("totalLiqUsd", Math.round(l.totalLiqUsd), "≥$10k (<$1k dust = danger)", l.totalLiqUsd < THRESHOLDS.dustLiqUsd ? "DANGER" : l.totalLiqUsd < 10_000 ? "WARN" : "CLEAN"),
  ];
  return { dim: "LIQUIDITY", level: worst(rows), metrics: rows };
}

export function evalPump(p: PumpMetrics, ctx: Context | null): SubVerdict {
  if (p.volMcapRatio === null) {
    return { dim: "PUMP", level: "INSUFFICIENT", metrics: [lvl("volMcapRatio", "n/a", "mcap+vol available", "INSUFFICIENT")] };
  }
  const rows: MetricRow[] = [
    lvl("volMcapRatio", round2(p.volMcapRatio), "<0.5", p.volMcapRatio > THRESHOLDS.volMcapRatio.danger ? "DANGER" : p.volMcapRatio >= THRESHOLDS.volMcapRatio.warn ? "WARN" : "CLEAN"),
    lvl("makersPer100kVol", p.makersPer100kVol === null ? "n/a" : round2(p.makersPer100kVol), "≥1",
      p.makersPer100kVol === null ? "INSUFFICIENT" : p.makersPer100kVol < THRESHOLDS.makersPer100k.danger ? "DANGER" : p.makersPer100kVol < THRESHOLDS.makersPer100k.warn ? "WARN" : "CLEAN"),
  ];
  if (ctx && p.priceChange24h !== null && p.priceChange24h > 0.3 && (ctx.btcDomDelta7d ?? 0) > 0 && (ctx.fearGreed ?? 100) < 30) {
    rows.push(lvl("counterMarketPump", `+${(p.priceChange24h * 100).toFixed(0)}% while BTC.D rising & fear`, "pump with market", "WARN"));
  }
  return { dim: "PUMP", level: worst(rows), metrics: rows };
}

export function composite(i: EngineInput): CompositeResult {
  // One evaluation produces both the verdict and the displayed detail — the
  // V2 evaluators are the only sub-verdict set the UI may show.
  const subs = [evalSafety(i.safety), evalFlow(i.flow, (i.mcapUsd ?? 0) >= THRESHOLDS.matureAssetMcapUsd), evalLiquidityV2(i.liq), evalPump(i.pump, i.context)];
  const levels = subs.map((s) => s.level);
  const dangers = levels.filter((l) => l === "DANGER").length;
  const warns = levels.filter((l) => l === "WARN").length;
  const insuf = levels.filter((l) => l === "INSUFFICIENT").length;

  const safetyOrFlowDanger = subs.filter((s) => (s.dim === "SAFETY" || s.dim === "FLOW") && s.level === "DANGER").length;
  // Dust-depth liquidity is an exit-impossibility signal — same severity class
  // as a honeypot outcome even when the contract itself reports clean.
  const untradeable =
    subs.find((s) => s.dim === "LIQUIDITY")?.metrics.some((m) => m.name === "totalLiqUsd" && m.level === "DANGER") ?? false;

  const score = Math.max(0, Math.min(100, 100 - dangers * 40 - warns * 15 - insuf * 25));

  let verdict: VerdictLevel;
  if (safetyOrFlowDanger > 0 || untradeable) verdict = "JANGAN";
  else if (dangers > 0 || warns >= 2) verdict = "RAWAN";
  else if (insuf > 0) verdict = "BELUM_CUKUP_BUKTI";
  else if (warns === 0 && score >= 70) verdict = "LAYAK"; // CLAIMS: all CLEAN
  else verdict = "RAWAN"; // single WARN dim stays CAUTION, not entry-worthy

  // CMC caps swap history at 100 — "high" means we saw the full window with no gaps.
  const confidence: CompositeResult["confidence"] =
    i.flow.swapCount >= 100 && insuf === 0 ? "high" : i.flow.swapCount >= 50 ? "medium" : "low";

  const falsifier = buildFalsifier(subs, verdict);
  return { verdict, score, subs, confidence, falsifier };
}

function buildFalsifier(subs: SubVerdict[], verdict: VerdictLevel): string {
  const flagged = subs.flatMap((s) => s.metrics.filter((m) => m.level !== "CLEAN"));
  const failing = flagged.filter((m) => m.level === "DANGER" || m.level === "WARN");
  const missing = flagged.filter((m) => m.level === "INSUFFICIENT");
  if (verdict === "LAYAK") {
    return "Flips to RAWAN the moment any single dimension degrades to WARN — e.g. top-5 maker share ≥0.50, one LP pull ≥15% of mapped pool depth, or a warn-level security flag. Any DANGER row flips straight to JANGAN.";
  }
  const missingList = missing.map((m) => `${m.name} (${m.value})`).join(", ");
  if (verdict === "BELUM_CUKUP_BUKTI") {
    const warnNote = failing.length ? ` Also observed but secondary: ${failing.map((m) => `${m.name} (${m.value} vs ${m.threshold})`).join(", ")}.` : "";
    return `Held back by missing evidence${missingList ? `: ${missingList}` : ""}. Resolves only when those sources return usable data — abstention is not a clean bill.${warnNote}`;
  }
  const all = failing.map((m) => `${m.name} (${m.value} vs ${m.threshold})`).join("; ");
  const missingNote = missingList ? ` Missing evidence must also resolve: ${missingList}.` : "";
  return `This ${verdict} verdict flips only when every flagged row recovers inside threshold: ${all}.${missingNote} Partial recovery does not change it.`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
