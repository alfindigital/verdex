// Deterministic verdict rules — the published thresholds in docs/CLAIMS.md
// are the source of truth; keep the two in sync.

import type { FlowMetrics, LiquidityMetrics, PumpMetrics, SafetyMetrics } from "./metrics";

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
}

/** Shared thresholds — single source for rules AND UI viz tones. */
export const THRESHOLDS = {
  sellTaxDanger: 0.1,
  top5MakerShare: { warn: 0.5, danger: 0.7 },
  maxSinglePullPct: { warn: 0.15, danger: 0.5 },
  netLpDeltaPct: { warn: 0, danger: -0.1 },
  volMcapRatio: { warn: 0.5, danger: 1.0 },
  makersPer100k: { warn: 5, danger: 1 },
  netBuyRatio: { warnAbove: 0, danger: -0.2 },
  thirdPartySellsClean: 3,
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
    lvl("top5MakerShare", round2(f.top5MakerShare), "<0.50", cap(f.top5MakerShare > THRESHOLDS.top5MakerShare.danger ? "DANGER" : f.top5MakerShare >= THRESHOLDS.top5MakerShare.warn ? "WARN" : "CLEAN")),
    lvl("netBuyRatio", round2(f.netBuyRatio), ">0", cap(f.netBuyRatio < THRESHOLDS.netBuyRatio.danger ? "DANGER" : f.netBuyRatio <= THRESHOLDS.netBuyRatio.warnAbove ? "WARN" : "CLEAN")),
  ];
  return { dim: "FLOW", level: worst(rows), metrics: rows };
}

export function evalLiquidity(l: LiquidityMetrics): SubVerdict {
  if (l.poolCount === 0) {
    return { dim: "LIQUIDITY", level: "INSUFFICIENT", metrics: [lvl("poolCount", 0, "≥1", "INSUFFICIENT")] };
  }
  const lpDeltaPct = l.totalLiqUsd > 0 ? l.netLpDeltaUsd / l.totalLiqUsd : 0;
  const rows: MetricRow[] = [
    lvl("maxSinglePullPct", round2(l.maxSinglePullPct), "<15%", l.maxSinglePullPct > THRESHOLDS.maxSinglePullPct.danger ? "DANGER" : l.maxSinglePullPct >= THRESHOLDS.maxSinglePullPct.warn ? "WARN" : "CLEAN"),
    lvl("netLpDeltaPct", round2(lpDeltaPct), "≥0", lpDeltaPct < THRESHOLDS.netLpDeltaPct.danger ? "DANGER" : lpDeltaPct < THRESHOLDS.netLpDeltaPct.warn ? "WARN" : "CLEAN"),
    lvl("totalLiqUsd", Math.round(l.totalLiqUsd), "≥$10k", l.totalLiqUsd < 10_000 ? "WARN" : "CLEAN"),
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
  const subs = [evalSafety(i.safety), evalFlow(i.flow, (i.mcapUsd ?? 0) >= THRESHOLDS.matureAssetMcapUsd), evalLiquidity(i.liq), evalPump(i.pump, i.context)];
  const levels = subs.map((s) => s.level);
  const dangers = levels.filter((l) => l === "DANGER").length;
  const warns = levels.filter((l) => l === "WARN").length;
  const insuf = levels.filter((l) => l === "INSUFFICIENT").length;

  const safetyOrFlowDanger = subs.filter((s) => (s.dim === "SAFETY" || s.dim === "FLOW") && s.level === "DANGER").length;

  const score = Math.max(0, Math.min(100, 100 - dangers * 40 - warns * 15 - insuf * 25));

  let verdict: VerdictLevel;
  if (safetyOrFlowDanger > 0) verdict = "JANGAN";
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
  if (verdict === "LAYAK") {
    return "This verdict flips to RAWAN if two dimensions degrade to WARN (e.g. top-5 maker share rises above 0.50 or a liquidity pull exceeds 15% of pool depth).";
  }
  const failing = subs
    .filter((s) => s.level === "DANGER" || s.level === "WARN")
    .flatMap((s) => s.metrics.filter((m) => m.level === "DANGER" || m.level === "WARN"));
  const worstMetric = failing.find((m) => m.level === "DANGER") ?? failing[0];
  if (!worstMetric) return `This verdict (${verdict}) requires all four dimensions to score CLEAN.`;
  const all = failing.map((m) => `${m.name} (${m.value} vs ${m.threshold})`).join(", ");
  return `This verdict (${verdict}) flips if ${worstMetric.name} moves back inside ${worstMetric.threshold} — currently ${worstMetric.value}. Failing rows: ${all}.`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
