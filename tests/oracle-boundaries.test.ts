import { describe, expect, it } from "vitest";
import { labelRisk } from "@/engine/coverage";
import type { Coverage } from "@/lib/verdict-types";

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
    ["CLEAN", "sufficient", "NO_FLAGS_OBSERVED"],
    ["CLEAN", "limited", "INSUFFICIENT_EVIDENCE"],
    ["CLEAN", "insufficient", "INSUFFICIENT_EVIDENCE"],
    ["WARN", "sufficient", "CAUTION"],
    ["WARN", "limited", "CAUTION"],
    ["WARN", "insufficient", "CAUTION"],
    ["DANGER", "sufficient", "HIGH_RISK_FLAGS"],
    ["DANGER", "limited", "HIGH_RISK_FLAGS"],
    ["DANGER", "insufficient", "HIGH_RISK_FLAGS"],
    ["INSUFFICIENT", "sufficient", "NO_FLAGS_OBSERVED"],
  ] as const)("%s + %s => %s", (level, coverageLevel, expected) => {
    expect(labelRisk([{ dim: "SAFETY", level, metrics: [] }], coverage(coverageLevel))).toBe(expected);
  });
});
