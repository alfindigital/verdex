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
}
export interface CompositeResult {
  verdict: VerdictLevel;
  score: number;
  subs: SubVerdict[];
  confidence: "high" | "medium" | "low";
  falsifier: string;
}

const DANGER_SAFETY = new Set(["honeypot", "rug_pull"]);
const WARN_SAFETY = new Set(["wash_trading", "whitelist_function", "low_liquidity"]);

const lvl = (name: string, value: number | string, threshold: string, level: SubLevel): MetricRow => ({ name, value, threshold, level });
const worst = (rows: MetricRow[]): SubLevel => {
  const order: SubLevel[] = ["DANGER", "WARN", "INSUFFICIENT", "CLEAN"];
  for (const l of order) if (rows.some((r) => r.level === l)) return l;
  return "CLEAN";
};

export function evalSafety(s: SafetyMetrics): SubVerdict {
  if (s.level === "unknown") {
    return { dim: "SAFETY", level: "INSUFFICIENT", metrics: [lvl("securityLevel", "unknown", "available data", "INSUFFICIENT")] };
  }
  const rows: MetricRow[] = [];
  const dangerHits = s.hits.filter((h) => DANGER_SAFETY.has(h));
  const warnHits = s.hits.filter((h) => WARN_SAFETY.has(h));
  rows.push(lvl("dangerFlags", dangerHits.join(",") || "none", "no honeypot/rug_pull/sell-tax>10%", dangerHits.length || (s.sellTax ?? 0) > 10 ? "DANGER" : "CLEAN"));
  rows.push(lvl("warnFlags", warnHits.join(",") || "none", "no wash_trading/whitelist/low_liquidity", warnHits.length ? "WARN" : "CLEAN"));
  rows.push(lvl("securityLevel", s.level, "safe", s.level === "safe" ? "CLEAN" : s.level === "caution" || s.level === "risky" ? "WARN" : "CLEAN"));
  return { dim: "SAFETY", level: worst(rows), metrics: rows };
}

export function evalFlow(f: FlowMetrics): SubVerdict {
  if (f.swapCount < 50) {
    return { dim: "FLOW", level: "INSUFFICIENT", metrics: [lvl("swapCount", f.swapCount, "≥50", "INSUFFICIENT")] };
  }
  const rows: MetricRow[] = [
    lvl("thirdPartySells", f.thirdPartySells, "≥3 (0 sells w/ buys = hidden honeypot)",
      f.thirdPartySells === 0 && f.buyCount >= 20 ? "DANGER" : f.thirdPartySells >= 3 ? "CLEAN" : "WARN"),
    lvl("uniqueMakers", f.uniqueMakers, "≥20", f.uniqueMakers < 5 ? "DANGER" : f.uniqueMakers < 20 ? "WARN" : "CLEAN"),
    lvl("top5MakerShare", round2(f.top5MakerShare), "<0.50", f.top5MakerShare > 0.7 ? "DANGER" : f.top5MakerShare >= 0.5 ? "WARN" : "CLEAN"),
    lvl("netBuyRatio", round2(f.netBuyRatio), ">0", f.netBuyRatio < -0.2 ? "WARN" : "CLEAN"),
  ];
  return { dim: "FLOW", level: worst(rows), metrics: rows };
}

export function evalLiquidity(l: LiquidityMetrics): SubVerdict {
  if (l.poolCount === 0) {
    return { dim: "LIQUIDITY", level: "INSUFFICIENT", metrics: [lvl("poolCount", 0, "≥1", "INSUFFICIENT")] };
  }
  const lpDeltaPct = l.totalLiqUsd > 0 ? l.netLpDeltaUsd / l.totalLiqUsd : 0;
  const rows: MetricRow[] = [
    lvl("maxSinglePullPct", round2(l.maxSinglePullPct), "<15%", l.maxSinglePullPct > 0.5 ? "DANGER" : l.maxSinglePullPct >= 0.15 ? "WARN" : "CLEAN"),
    lvl("netLpDeltaPct", round2(lpDeltaPct), "≥0", lpDeltaPct < -0.1 ? "DANGER" : lpDeltaPct < 0 ? "WARN" : "CLEAN"),
    lvl("totalLiqUsd", Math.round(l.totalLiqUsd), "≥$10k", l.totalLiqUsd < 10_000 ? "WARN" : "CLEAN"),
  ];
  return { dim: "LIQUIDITY", level: worst(rows), metrics: rows };
}

export function evalPump(p: PumpMetrics, ctx: Context | null): SubVerdict {
  if (p.volMcapRatio === null) {
    return { dim: "PUMP", level: "INSUFFICIENT", metrics: [lvl("volMcapRatio", "n/a", "mcap+vol available", "INSUFFICIENT")] };
  }
  const rows: MetricRow[] = [
    lvl("volMcapRatio", round2(p.volMcapRatio), "<0.5", p.volMcapRatio > 1.0 ? "DANGER" : p.volMcapRatio >= 0.5 ? "WARN" : "CLEAN"),
    lvl("makersPer100kVol", p.makersPer100kVol === null ? "n/a" : round2(p.makersPer100kVol), "≥1",
      p.makersPer100kVol !== null && p.makersPer100kVol < 1 ? "DANGER" : p.makersPer100kVol !== null && p.makersPer100kVol < 5 ? "WARN" : "CLEAN"),
  ];
  if (ctx && p.priceChange24h !== null && p.priceChange24h > 30 && (ctx.btcDomDelta7d ?? 0) > 0 && (ctx.fearGreed ?? 100) < 30) {
    rows.push(lvl("counterMarketPump", `+${p.priceChange24h}% while BTC.D rising & fear`, "pump with market", "WARN"));
  }
  return { dim: "PUMP", level: worst(rows), metrics: rows };
}

export function composite(i: EngineInput): CompositeResult {
  const subs = [evalSafety(i.safety), evalFlow(i.flow), evalLiquidity(i.liq), evalPump(i.pump, i.context)];
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
  else if (score >= 70) verdict = "LAYAK";
  else verdict = "RAWAN";

  const confidence: CompositeResult["confidence"] =
    i.flow.swapCount >= 200 && insuf === 0 ? "high" : i.flow.swapCount >= 50 ? "medium" : "low";

  const falsifier = buildFalsifier(subs, verdict);
  return { verdict, score, subs, confidence, falsifier };
}

function buildFalsifier(subs: SubVerdict[], verdict: VerdictLevel): string {
  const bad = subs.filter((s) => s.level === "DANGER" || s.level === "WARN");
  if (verdict === "LAYAK") {
    return "This verdict flips to RAWAN if two dimensions degrade to WARN (e.g. top-5 maker share rises above 0.50 or a liquidity pull exceeds 15% of pool depth).";
  }
  const worstMetric = bad
    .flatMap((s) => s.metrics)
    .find((m) => m.level === "DANGER") ?? bad.flatMap((s) => s.metrics)[0];
  if (!worstMetric) return `This verdict (${verdict}) requires all four dimensions to score CLEAN.`;
  return `This verdict (${verdict}) flips if ${worstMetric.name} moves back inside ${worstMetric.threshold} — currently ${worstMetric.value}.`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
