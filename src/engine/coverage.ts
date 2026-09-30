import type { SubVerdict, VerdictLevel } from "@/engine/rules";
import type { Coverage, CoverageLevel, ObservationWindow, RecheckCondition, RiskLabel, SourceEvidence, SourceKey } from "@/lib/verdict-types";

const required = (sources: SourceEvidence[], key: SourceKey): SourceEvidence | undefined => sources.find((source) => source.key === key);
const hasFailed = (source: SourceEvidence | undefined): boolean => !source || ["failed", "unsupported", "invalid", "timeout", "not-captured"].includes(source.status);
const unique = (items: string[]) => [...new Set(items.filter(Boolean))];

function sourceAge(source: SourceEvidence, checkedAt: number): number | null {
  const stamp = source.providerAt ?? source.fetchedAt;
  const time = Date.parse(stamp);
  return Number.isFinite(time) ? checkedAt - time : null;
}

function worstLevel(levels: CoverageLevel[]): CoverageLevel {
  if (levels.includes("insufficient")) return "insufficient";
  if (levels.includes("limited")) return "limited";
  return "sufficient";
}

export function evaluateCoverage(
  sources: SourceEvidence[],
  window: ObservationWindow,
  exclusionStatus: Coverage["exclusionStatus"],
  checkedAt: string,
): Coverage {
  const checkedMs = Date.parse(checkedAt);
  const reasons: string[] = [];
  const staleSources = sources.filter((source) => source.status === "ok" && sourceAge(source, checkedMs) !== null && sourceAge(source, checkedMs)! > 15 * 60_000);
  if (staleSources.length) reasons.push(`stale source: ${staleSources.map((source) => source.key).join(", ")}`);
  const staleKeys = new Set(staleSources.map((source) => source.key));
  // A stale source is degraded evidence, not absent evidence — it caps its
  // dimension at "limited" so a positive stamp can never ride on old data.
  const capStale = (level: CoverageLevel, keys: SourceKey[]): CoverageLevel =>
    level === "sufficient" && keys.some((key) => staleKeys.has(key)) ? "limited" : level;

  const security = required(sources, "security");
  const safety: CoverageLevel = capStale(
    hasFailed(security) ? "insufficient" : security?.status === "empty" ? "limited" : "sufficient",
    ["security", "search"],
  );
  if (safety !== "sufficient") reasons.push("security evidence unavailable, empty, or stale");

  let flow: CoverageLevel = "sufficient";
  const swaps = required(sources, "swaps");
  const spanMs =
    window.firstSwapAt && window.lastSwapAt
      ? Date.parse(window.lastSwapAt) - Date.parse(window.firstSwapAt)
      : null;
  if (hasFailed(swaps) || window.validSwaps === 0 || !window.firstSwapAt || !window.lastSwapAt) flow = "insufficient";
  else if (window.validSwaps < 50) flow = "insufficient";
  else if (window.rejectedSwaps > 0 || exclusionStatus !== "creator-owner-known") flow = "limited";
  // A truncated sample is a scope fact, not automatically a defect: 100 rows
  // spanning ≥15 min is a workable window; 100 rows spanning seconds is a
  // sliver that can't bear a verdict. Only the thin case costs coverage.
  else if (window.truncated && spanMs !== null && spanMs < 15 * 60_000) flow = "limited";
  const lastAge = window.lastSwapAt ? checkedMs - Date.parse(window.lastSwapAt) : null;
  if (lastAge === null || !Number.isFinite(lastAge) || lastAge > 15 * 60_000) {
    flow = "insufficient";
    reasons.push("swap window is missing or stale");
  }
  if (window.validSwaps < 50) reasons.push(`only ${window.validSwaps} valid swaps observed; 50 required for a sufficient window`);
  if (window.truncated) {
    const spanMin = spanMs !== null && spanMs >= 0 ? Math.round(spanMs / 60_000) : null;
    reasons.push(`swap sample truncated at the ${window.requestedLimit}-row endpoint cap${spanMin !== null ? ` (observed span ~${spanMin}m)` : ""}`);
  }
  if (window.rejectedSwaps > 0) reasons.push(`${window.rejectedSwaps} swap rows rejected`);
  if (exclusionStatus !== "creator-owner-known") reasons.push("creator/owner exclusion coverage is incomplete");
  if (hasFailed(swaps)) reasons.push("swap source failed or was not captured");
  flow = capStale(flow, ["swaps"]);

  const pools = required(sources, "pools");
  const lp = required(sources, "lp");
  let liquidity: CoverageLevel = "sufficient";
  if (hasFailed(pools)) liquidity = "insufficient";
  else if (hasFailed(lp)) liquidity = "limited";
  else if (pools?.status === "empty" || lp?.status === "empty") liquidity = "limited";
  liquidity = capStale(liquidity, ["pools", "lp"]);
  if (liquidity !== "sufficient") reasons.push("liquidity pool or LP-change evidence is incomplete");

  const macroKeys: SourceKey[] = ["meta", "globalLatest", "globalHistorical", "fearGreed"];
  const missingMacro = macroKeys.filter((key) => hasFailed(required(sources, key)));
  const pump: CoverageLevel = capStale(
    missingMacro.length === macroKeys.length ? "insufficient" : missingMacro.length ? "limited" : "sufficient",
    macroKeys,
  );
  if (missingMacro.length) reasons.push(`pump context unavailable: ${missingMacro.join(", ")}`);

  const dimensions = { SAFETY: safety, FLOW: flow, LIQUIDITY: liquidity, PUMP: pump };
  const stale = staleSources.length > 0 || flow === "insufficient" && reasons.some((reason) => reason.includes("stale"));
  return { level: worstLevel(Object.values(dimensions)), reasons: unique(reasons), checkedAt, stale, exclusionStatus, dimensions };
}

export function labelRisk(verdict: VerdictLevel, coverage: Coverage): RiskLabel {
  if (verdict === "JANGAN") return "HIGH_RISK_FLAGS";
  if (verdict === "RAWAN") return "CAUTION";
  // positive or unresolved verdicts require complete AND fresh evidence —
  // a failed, limited, or stale source can never stamp NO_FLAGS_OBSERVED.
  if (verdict === "BELUM_CUKUP_BUKTI" || coverage.level !== "sufficient" || coverage.stale) return "INSUFFICIENT_EVIDENCE";
  return "NO_FLAGS_OBSERVED";
}

/**
 * Confidence in the evidence behind this verdict — window depth gated by
 * coverage. Never a claim about outcome prediction.
 */
export function deriveConfidence(swapCount: number, insufDims: number, coverage: Coverage): "high" | "medium" | "low" {
  const base = swapCount >= 100 && insufDims === 0 ? "high" : swapCount >= 50 ? "medium" : "low";
  if (coverage.level === "insufficient" || coverage.stale) return "low";
  if (coverage.level === "limited" && base === "high") return "medium";
  return base;
}

export function buildRecheck(subs: SubVerdict[], coverage: Coverage): RecheckCondition[] {
  const checks: RecheckCondition[] = [];
  for (const sub of subs) {
    for (const metric of sub.metrics) {
      if (metric.level === "CLEAN") continue;
      checks.push({ dimension: sub.dim, metric: metric.name, observed: metric.value, requirement: metric.threshold, reason: `${sub.dim} evidence requires review` });
    }
  }
  for (const reason of coverage.reasons) checks.push({ dimension: "COVERAGE", metric: "coverage", observed: coverage.level, requirement: "sufficient, fresh sources", reason });
  if (coverage.level !== "sufficient" && checks.length === 0) checks.push({ dimension: "COVERAGE", metric: "coverage", observed: coverage.level, requirement: "sufficient, fresh sources", reason: "required evidence is incomplete" });
  return checks;
}
