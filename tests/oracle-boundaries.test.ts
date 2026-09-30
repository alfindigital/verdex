import { describe, expect, it } from "vitest";
import { labelRisk } from "@/engine/coverage";
import type { Coverage } from "@/lib/verdict-types";
import type { VerdictLevel } from "@/engine/rules";

const coverage = (level: Coverage["level"]): Coverage => ({
  level,
  reasons: [],
  checkedAt: "2026-09-29T00:00:00.000Z",
  stale: false,
  exclusionStatus: "creator-owner-known",
  dimensions: { SAFETY: level, FLOW: level, LIQUIDITY: level, PUMP: level },
});

describe("hand-calculated policy oracle boundaries", () => {
  it.each([
    ["LAYAK", "sufficient", "NO_FLAGS_OBSERVED"],
    ["LAYAK", "limited", "INSUFFICIENT_EVIDENCE"],
    ["LAYAK", "insufficient", "INSUFFICIENT_EVIDENCE"],
    ["RAWAN", "sufficient", "CAUTION"],
    ["RAWAN", "limited", "CAUTION"],
    ["RAWAN", "insufficient", "CAUTION"],
    ["JANGAN", "sufficient", "HIGH_RISK_FLAGS"],
    ["JANGAN", "limited", "HIGH_RISK_FLAGS"],
    ["JANGAN", "insufficient", "HIGH_RISK_FLAGS"],
    ["BELUM_CUKUP_BUKTI", "sufficient", "INSUFFICIENT_EVIDENCE"],
    ["BELUM_CUKUP_BUKTI", "limited", "INSUFFICIENT_EVIDENCE"],
  ] as const)("%s + %s => %s", (verdict, coverageLevel, expected) => {
    expect(labelRisk(verdict as VerdictLevel, coverage(coverageLevel))).toBe(expected);
  });
});
