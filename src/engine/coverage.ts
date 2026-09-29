import type { SubVerdict } from "@/engine/rules";
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

  const security = required(sources, "security");
  const safety: CoverageLevel = hasFailed(security) ? "insufficient" : security?.status === "empty" ? "limited" : "sufficient";
  if (safety !== "sufficient") reasons.push("security evidence unavailable or empty");

  let flow: CoverageLevel = "sufficient";
  const swaps = required(sources, "swaps");
  if (hasFailed(swaps) || window.validSwaps === 0 || !window.firstSwapAt || !window.lastSwapAt) flow = "insufficient";
  else if (window.validSwaps < 50) flow = "insufficient";
  else if (window.rejectedSwaps > 0 || window.truncated || exclusionStatus !== "creator-owner-known") flow = "limited";
  const lastAge = window.lastSwapAt ? checkedMs - Date.parse(window.lastSwapAt) : null;
  if (lastAge === null || !Number.isFinite(lastAge) || lastAge > 15 * 60_000) {
    flow = "insufficient";
    reasons.push("swap window is missing or stale");
  }
  if (window.validSwaps < 50) reasons.push(`only ${window.validSwaps} valid swaps observed; 50 required for a sufficient window`);
  if (window.rejectedSwaps > 0) reasons.push(`${window.rejectedSwaps} swap rows rejected`);
  if (exclusionStatus !== "creator-owner-known") reasons.push("creator/owner exclusion coverage is incomplete");
  if (hasFailed(swaps)) reasons.push("swap source failed or was not captured");

  const pools = required(sources, "pools");
  const lp = required(sources, "lp");
  let liquidity: CoverageLevel = "sufficient";
  if (hasFailed(pools)) liquidity = "insufficient";
  else if (hasFailed(lp)) liquidity = "limited";
  else if (pools?.status === "empty" || lp?.status === "empty") liquidity = "limited";
  if (liquidity !== "sufficient") reasons.push("liquidity pool or LP-change evidence is incomplete");

  const macroKeys: SourceKey[] = ["meta", "globalLatest", "globalHistorical", "fearGreed"];
  const missingMacro = macroKeys.filter((key) => hasFailed(required(sources, key)));
  const pump: CoverageLevel = missingMacro.length === macroKeys.length ? "insufficient" : missingMacro.length ? "limited" : "sufficient";
  if (missingMacro.length) reasons.push(`pump context unavailable: ${missingMacro.join(", ")}`);

  const dimensions = { SAFETY: safety, FLOW: flow, LIQUIDITY: liquidity, PUMP: pump };
  const stale = staleSources.length > 0 || flow === "insufficient" && reasons.some((reason) => reason.includes("stale"));
  return { level: worstLevel(Object.values(dimensions)), reasons: unique(reasons), checkedAt, stale, exclusionStatus, dimensions };
}

export function labelRisk(subs: SubVerdict[], coverage: Coverage): RiskLabel {
  if (subs.some((sub) => sub.dim === "SAFETY" && sub.level === "DANGER")) return "HIGH_RISK_FLAGS";
  if (subs.some((sub) => sub.level === "DANGER" || sub.level === "WARN")) return "CAUTION";
  if (coverage.level !== "sufficient") return "INSUFFICIENT_EVIDENCE";
  return "NO_FLAGS_OBSERVED";
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
