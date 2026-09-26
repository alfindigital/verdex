import { describe, it, expect } from "vitest";
import { evalSafety, evalFlow, evalLiquidity, evalPump, composite, type EngineInput } from "@/engine/rules";
import type { FlowMetrics, LiquidityMetrics, PumpMetrics, SafetyMetrics } from "@/engine/metrics";

const fm = (o: Partial<FlowMetrics>): FlowMetrics => ({
  swapCount: 100, buyCount: 60, sellCount: 40, buyUsd: 1000, sellUsd: 800,
  netBuyUsd: 200, netBuyRatio: 0.11, uniqueMakers: 30, top5MakerShare: 0.4, thirdPartySells: 8, ...o,
});
const lm = (o: Partial<LiquidityMetrics>): LiquidityMetrics => ({
  poolCount: 1, totalLiqUsd: 10000, netLpDeltaUsd: 500, maxSinglePullPct: 0.05, addCount: 4, removeCount: 1, ...o,
});
const pm = (o: Partial<PumpMetrics>): PumpMetrics => ({ volMcapRatio: 0.2, makersPer100kVol: 8, priceChange24h: 5, ...o });
const sm = (o: Partial<SafetyMetrics>): SafetyMetrics => ({ level: "safe", hits: [], buyTax: 0, sellTax: 0, flaggedByVendor: false, ...o });

const input = (o: Partial<EngineInput>): EngineInput => ({
  flow: fm({}), liq: lm({}), pump: pm({}), safety: sm({}),
  context: { btcDomDelta7d: 0, fearGreed: 50 }, ...o,
});

describe("evalSafety", () => {
  it("danger on honeypot/rug_pull/sell-tax hits", () => {
    expect(evalSafety(sm({ hits: ["honeypot"] })).level).toBe("DANGER");
    expect(evalSafety(sm({ hits: ["rug_pull"] })).level).toBe("DANGER");
    expect(evalSafety(sm({ sellTax: 0.15 })).level).toBe("DANGER");
  });
  it("warn on caution level or warn-level hits", () => {
    expect(evalSafety(sm({ level: "caution" })).level).toBe("WARN");
    expect(evalSafety(sm({ hits: ["wash_trading"] })).level).toBe("WARN");
    expect(evalSafety(sm({ hits: ["low_liquidity"] })).level).toBe("WARN");
  });
  it("clean when safe & no hits", () => {
    expect(evalSafety(sm({})).level).toBe("CLEAN");
  });
  it("insufficient when no report exists at all", () => {
    expect(evalSafety(sm({ level: "unknown", buyTax: null, sellTax: null })).level).toBe("INSUFFICIENT");
  });
  it("level-less report carrying isHit flags is still scored (no silent BELUM)", () => {
    // BUG-1 regression: "unknown" level + real hits → evaluate, don't drop.
    expect(evalSafety(sm({ level: "unknown", hits: ["honeypot"] })).level).toBe("DANGER");
    expect(evalSafety(sm({ level: "unknown", hits: ["wash_trading"] })).level).toBe("WARN");
    expect(evalSafety(sm({ level: "unknown", sellTax: 0.15 })).level).toBe("DANGER");
  });
  it("fails closed: unrecognized non-safe level → WARN, not CLEAN", () => {
    expect(evalSafety(sm({ level: "malicious" })).level).toBe("WARN");
    expect(evalSafety(sm({ level: "danger" })).level).toBe("WARN");
  });
  it("unclassified isHit codes surface as WARN (no silent dead signals)", () => {
    const v = evalSafety(sm({ hits: ["proxy_admin_upgradeable"] }));
    expect(v.level).toBe("WARN");
    const row = v.metrics.find((m) => m.name === "unclassifiedFlags");
    expect(row?.value).toContain("proxy_admin_upgradeable");
    expect(row?.level).toBe("WARN");
  });
  it("sell-tax-triggered danger names the tax, not 'none'", () => {
    const v = evalSafety(sm({ sellTax: 0.15 }));
    const row = v.metrics.find((m) => m.name === "dangerFlags");
    expect(row?.level).toBe("DANGER");
    expect(row?.value).toContain("sellTax");
  });
});

describe("evalFlow", () => {
  it("insufficient when swaps < 50", () => {
    expect(evalFlow(fm({ swapCount: 30 })).level).toBe("INSUFFICIENT");
  });
  it("danger: zero third-party sells with buys present (honeypot shape)", () => {
    expect(evalFlow(fm({ thirdPartySells: 0, buyCount: 80 })).level).toBe("DANGER");
  });
  it("danger: top5 maker share > 0.70", () => {
    expect(evalFlow(fm({ top5MakerShare: 0.8 })).level).toBe("DANGER");
  });
  it("warn: unique makers 5-19, or 1-2 third-party sells", () => {
    expect(evalFlow(fm({ uniqueMakers: 10 })).level).toBe("WARN");
    expect(evalFlow(fm({ thirdPartySells: 1 })).level).toBe("WARN");
  });
  it("clean: distributed flow", () => {
    expect(evalFlow(fm({})).level).toBe("CLEAN");
  });
});

describe("evalLiquidity", () => {
  it("insufficient when no pools", () => {
    expect(evalLiquidity(lm({ poolCount: 0 })).level).toBe("INSUFFICIENT");
  });
  it("danger: single pull > 50%", () => {
    expect(evalLiquidity(lm({ maxSinglePullPct: 0.6 })).level).toBe("DANGER");
  });
  it("danger: net lp delta < -10% of pool", () => {
    expect(evalLiquidity(lm({ netLpDeltaUsd: -2000, totalLiqUsd: 10000 })).level).toBe("DANGER");
  });
  it("clean otherwise", () => {
    expect(evalLiquidity(lm({})).level).toBe("CLEAN");
  });
});

describe("evalPump", () => {
  it("insufficient when volMcap missing", () => {
    expect(evalPump(pm({ volMcapRatio: null }), { btcDomDelta7d: 0, fearGreed: 50 }).level).toBe("INSUFFICIENT");
  });
  it("danger: volMcap > 1.0 or makersPer100k < 1", () => {
    expect(evalPump(pm({ volMcapRatio: 1.5 }), null).level).toBe("DANGER");
    expect(evalPump(pm({ makersPer100kVol: 0.5 }), null).level).toBe("DANGER");
  });
  it("warn: price+30% while BTC.D rising & F&G low (counter-market pump)", () => {
    expect(evalPump(pm({ priceChange24h: 0.45 }), { btcDomDelta7d: 1.2, fearGreed: 25 }).level).toBe("WARN");
  });
  it("clean baseline", () => {
    expect(evalPump(pm({}), null).level).toBe("CLEAN");
  });
  it("makersPer100kVol null → INSUFFICIENT row, never silent CLEAN (BUG-2)", () => {
    // Empty/all-zero-usd window: wash-trading signal un-evaluated → honest
    // INSUFFICIENT rather than fabricated clean.
    const v = evalPump(pm({ makersPer100kVol: null }), null);
    expect(v.level).toBe("INSUFFICIENT");
    expect(v.metrics.find((m) => m.name === "makersPer100kVol")?.level).toBe("INSUFFICIENT");
  });
});

describe("composite", () => {
  it("JANGAN when SAFETY or FLOW is DANGER (danger dominates insufficient)", () => {
    expect(composite(input({ safety: sm({ hits: ["honeypot"] }), pump: pm({ volMcapRatio: null }) })).verdict).toBe("JANGAN");
    expect(composite(input({ flow: fm({ thirdPartySells: 0 }) })).verdict).toBe("JANGAN");
  });
  it("RAWAN when LIQ/PUMP danger or ≥2 WARN", () => {
    expect(composite(input({ liq: lm({ maxSinglePullPct: 0.6 }) })).verdict).toBe("RAWAN");
    expect(
      composite(input({ flow: fm({ uniqueMakers: 10 }), pump: pm({ priceChange24h: 0.45 }), context: { btcDomDelta7d: 1.5, fearGreed: 20 } })).verdict,
    ).toBe("RAWAN");
  });
  it("BELUM_CUKUP_BUKTI when a dim is INSUFFICIENT and no danger", () => {
    expect(composite(input({ safety: sm({ level: "unknown", buyTax: null, sellTax: null }) })).verdict).toBe("BELUM_CUKUP_BUKTI");
  });
  it("LAYAK when all clean and score ≥70", () => {
    expect(composite(input({})).verdict).toBe("LAYAK");
  });
  it("a single WARN dim is RAWAN, not LAYAK (CLAIMS: all CLEAN)", () => {
    expect(composite(input({ flow: fm({ uniqueMakers: 10 }) })).verdict).toBe("RAWAN");
    const r = composite(input({ liq: lm({ totalLiqUsd: 5000 }) }));
    expect(r.verdict).toBe("RAWAN");
    expect(r.score).toBe(85);
  });
  it("score penalizes danger/warn", () => {
    const r = composite(input({ safety: sm({ hits: ["honeypot"] }), flow: fm({ uniqueMakers: 10 }) }));
    expect(r.score).toBeLessThan(60);
  });
  it("confidence reflects data depth", () => {
    expect(composite(input({})).confidence).toBe("high"); // 100 swaps = full CMC window
    expect(composite(input({ flow: fm({ swapCount: 75 }) })).confidence).toBe("medium");
    expect(composite(input({ flow: fm({ swapCount: 10 }) })).confidence).toBe("low");
  });
  it("falsifier names concrete flip conditions", () => {
    const r = composite(input({ flow: fm({ thirdPartySells: 0 }) }));
    expect(r.falsifier).toMatch(/third.?party.?sell/i);
  });
});
