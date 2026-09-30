import { describe, expect, it } from "vitest";
import { evaluateCoverage, labelRisk, buildRecheck, deriveConfidence } from "@/engine/coverage";
import type { Coverage, ObservationWindow, SourceEvidence } from "@/lib/verdict-types";
import type { SubVerdict, VerdictLevel } from "@/engine/rules";

const source = (key: SourceEvidence["key"], status: SourceEvidence["status"] = "ok"): SourceEvidence => ({
  key, status, endpoint: `/test/${key}`, params: {}, fetchedAt: "2026-09-29T00:00:00.000Z", providerAt: "2026-09-29T00:00:00.000Z",
  httpStatus: status === "ok" ? 200 : null, credits: 1, bodySha256: null, bodyBase64: null, evidenceKind: "receipt-only",
  parserVersion: "test", acceptedRows: 0, rejectedRows: 0, cached: false, reason: status === "ok" ? null : "synthetic failure",
});
const window = (validSwaps: number, rejectedSwaps = 0, lastSwapAt: string | null = "2026-09-29T00:00:00.000Z"): ObservationWindow => ({
  firstSwapAt: validSwaps ? "2026-09-28T23:00:00.000Z" : null, lastSwapAt, validSwaps, rejectedSwaps, duplicateRows: 0,
  requestedLimit: 100, fetchedPages: 1, truncated: false,
});
const cov = (level: Coverage["level"]): Coverage => ({
  level, reasons: [], checkedAt: "2026-09-29T00:00:00.000Z", stale: false, exclusionStatus: "creator-owner-known",
  dimensions: { SAFETY: level, FLOW: level, LIQUIDITY: level, PUMP: level },
});

describe("coverage policy", () => {
  it.each([
    ["LAYAK", "sufficient", "NO_FLAGS_OBSERVED"],
    ["LAYAK", "limited", "INSUFFICIENT_EVIDENCE"],
    ["LAYAK", "insufficient", "INSUFFICIENT_EVIDENCE"],
    ["RAWAN", "sufficient", "CAUTION"],
    ["RAWAN", "insufficient", "CAUTION"],
    ["JANGAN", "sufficient", "HIGH_RISK_FLAGS"],
    ["JANGAN", "limited", "HIGH_RISK_FLAGS"],
    ["BELUM_CUKUP_BUKTI", "sufficient", "INSUFFICIENT_EVIDENCE"],
  ] as const)("verdict %s + coverage %s stamps %s", (verdict, coverage, expected) => {
    // label derives from the composite verdict (never recomputed on its
    // own axis), and positive verdicts still require complete evidence.
    expect(labelRisk(verdict as VerdictLevel, cov(coverage))).toBe(expected);
  });

  it("requires a fresh, complete fifty-swap window", () => {
    const base = [source("search"), source("swaps"), source("pools"), source("lp"), source("security"), source("meta"), source("globalLatest"), source("globalHistorical"), source("fearGreed")];
    expect(evaluateCoverage(base, window(0), "creator-owner-known", "2026-09-29T00:00:00.000Z").level).toBe("insufficient");
    expect(evaluateCoverage(base, window(49), "creator-owner-known", "2026-09-29T00:00:00.000Z").level).toBe("insufficient");
    expect(evaluateCoverage(base, window(50), "creator-owner-known", "2026-09-29T00:00:00.000Z").level).toBe("sufficient");
    expect(evaluateCoverage(base, window(50, 1), "creator-owner-known", "2026-09-29T00:00:00.000Z").level).toBe("limited");
  });

  it("does not turn a failed LP source into clean liquidity coverage", () => {
    const sources = [source("search"), source("swaps"), source("pools"), source("lp", "failed"), source("security"), source("meta"), source("globalLatest"), source("globalHistorical"), source("fearGreed")];
    const result = evaluateCoverage(sources, window(100), "creator-owner-known", "2026-09-29T00:00:00.000Z");
    expect(result.dimensions.LIQUIDITY).not.toBe("sufficient");
    expect(result.reasons.join(" ")).toMatch(/lp/i);
  });

  it("a stale ok-source caps its dimension at limited — never stamps clean", () => {
    const stale = (key: SourceEvidence["key"]): SourceEvidence => ({
      ...source(key, "ok"),
      providerAt: "2026-09-28T23:30:00.000Z", // 30 min before checkedAt
    });
    const sources = [
      source("search"), source("swaps"), source("pools"), source("lp"),
      stale("security"), source("meta"), source("globalLatest"), source("globalHistorical"), source("fearGreed"),
    ];
    const result = evaluateCoverage(sources, window(100), "creator-owner-known", "2026-09-29T00:00:00.000Z");
    expect(result.stale).toBe(true);
    expect(result.dimensions.SAFETY).toBe("limited");
    expect(result.level).not.toBe("sufficient");
    // …and even a rule-clean verdict may not stamp NO_FLAGS_OBSERVED on it.
    expect(labelRisk("LAYAK", result)).toBe("INSUFFICIENT_EVIDENCE");
  });

  it("stale lp source caps LIQUIDITY; stale macro source caps PUMP", () => {
    const stale = (key: SourceEvidence["key"]): SourceEvidence => ({
      ...source(key, "ok"), providerAt: "2026-09-28T23:00:00.000Z",
    });
    const lpStale = evaluateCoverage(
      [source("search"), source("swaps"), source("pools"), stale("lp"), source("security"), source("meta"), source("globalLatest"), source("globalHistorical"), source("fearGreed")],
      window(100), "creator-owner-known", "2026-09-29T00:00:00.000Z",
    );
    expect(lpStale.dimensions.LIQUIDITY).toBe("limited");
    const macroStale = evaluateCoverage(
      [source("search"), source("swaps"), source("pools"), source("lp"), source("security"), source("meta"), stale("fearGreed"), source("globalLatest"), source("globalHistorical")],
      window(100), "creator-owner-known", "2026-09-29T00:00:00.000Z",
    );
    expect(macroStale.dimensions.PUMP).toBe("limited");
    expect(macroStale.dimensions.SAFETY).toBe("sufficient");
  });

  it("confidence is gated by coverage, not just window depth", () => {
    expect(deriveConfidence(150, 0, cov("sufficient"))).toBe("high");
    expect(deriveConfidence(150, 0, { ...cov("limited") })).toBe("medium");
    expect(deriveConfidence(150, 0, { ...cov("insufficient") })).toBe("low");
    expect(deriveConfidence(150, 0, { ...cov("sufficient"), stale: true })).toBe("low");
    expect(deriveConfidence(75, 0, cov("sufficient"))).toBe("medium");
    expect(deriveConfidence(10, 0, cov("sufficient"))).toBe("low");
  });

  it("lists every warning and missing dimension for recheck", () => {
    const subs = [
      { dim: "FLOW", level: "WARN", metrics: [{ name: "top5MakerShare", value: 0.8, threshold: "<0.50", level: "WARN" }] },
      { dim: "LIQUIDITY", level: "INSUFFICIENT", metrics: [{ name: "lpEvents", value: "unknown", threshold: "available", level: "INSUFFICIENT" }] },
    ] as SubVerdict[];
    const checks = buildRecheck(subs, { ...cov("limited"), reasons: ["LP source failed"] });
    expect(checks.map((check) => check.metric)).toEqual(expect.arrayContaining(["top5MakerShare", "lpEvents", "coverage"]));
    expect(checks).toHaveLength(3);
  });
});
