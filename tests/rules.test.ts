import { describe, it, expect } from "vitest";
import { evalSafety, evalFlow, evalFlowV2, evalLiquidity, evalLiquidityV2, evalPump, composite, type EngineInput } from "@/engine/rules";
import type { FlowMetrics, LiquidityMetrics, PumpMetrics, SafetyMetrics } from "@/engine/metrics";

const fm = (o: Partial<FlowMetrics>): FlowMetrics => ({
  swapCount: 100, buyCount: 60, sellCount: 40, buyUsd: 1000, sellUsd: 800,
  netBuyUsd: 200, netBuyRatio: 0.11, uniqueMakers: 30, top5MakerShare: 0.4, thirdPartySells: 8, swapsPerDay: 500, ...o,
});
const lm = (o: Partial<LiquidityMetrics>): LiquidityMetrics => ({
  poolCount: 1, totalLiqUsd: 10000, netLpDeltaUsd: 500, maxSinglePullPct: 0.05, addCount: 4, removeCount: 1,
  removalVsCurrentDepth: 0.05, ...o,
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
  it("centralization flags (mintable/upgradeable) → named WARN row", () => {
    const v = evalSafety(sm({ hits: ["mintable", "upgradeable"] }));
    const row = v.metrics.find((m) => m.name === "centralizationFlags");
    expect(row?.level).toBe("WARN");
    expect(row?.value).toContain("mintable");
    // no longer reported as generic unclassified
    expect(v.metrics.find((m) => m.name === "unclassifiedFlags")?.value).toBe("none");
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
  it("danger: top5 maker share > 0.70 with thin maker breadth (insider tape)", () => {
    expect(evalFlow(fm({ top5MakerShare: 0.8, uniqueMakers: 10 })).level).toBe("DANGER");
    const row = evalFlow(fm({ top5MakerShare: 0.8, uniqueMakers: 10 })).metrics.find((m) => m.name === "top5MakerShare");
    expect(row?.level).toBe("DANGER");
  });
  it("warn-only: high top5 share on a broad tape reads as whale/MM flow", () => {
    const row = evalFlow(fm({ top5MakerShare: 0.8, uniqueMakers: 30 })).metrics.find((m) => m.name === "top5MakerShare");
    expect(row?.level).toBe("WARN");
  });
  it("netBuyRatio: mild red day is clean; material outflow warns; heavy exits danger", () => {
    expect(evalFlow(fm({ netBuyRatio: -0.05 })).metrics.find((m) => m.name === "netBuyRatio")?.level).toBe("CLEAN");
    expect(evalFlow(fm({ netBuyRatio: -0.15 })).metrics.find((m) => m.name === "netBuyRatio")?.level).toBe("WARN");
    expect(evalFlow(fm({ netBuyRatio: -0.35 })).metrics.find((m) => m.name === "netBuyRatio")?.level).toBe("DANGER");
  });
  it("warn: unique makers 5-19, or 1-2 third-party sells", () => {
    expect(evalFlow(fm({ uniqueMakers: 10 })).level).toBe("WARN");
    expect(evalFlow(fm({ thirdPartySells: 1 })).level).toBe("WARN");
  });
  it("danger: dead tape — <15 swaps/day means exit is nominal even with liquidity", () => {
    // Collapsed-project tokens (CEL 13/day, HOGE 4/day) trade dust forever;
    // live majors run ≥1,300/day. Vitality is venue-independent evidence.
    expect(evalFlow(fm({ swapsPerDay: 10 })).level).toBe("DANGER");
    const row = evalFlow(fm({ swapsPerDay: 10 })).metrics.find((m) => m.name === "swapsPerDay");
    expect(row?.level).toBe("DANGER");
    expect(evalFlow(fm({ swapsPerDay: 30 })).metrics.find((m) => m.name === "swapsPerDay")?.level).toBe("WARN");
    expect(evalFlow(fm({ swapsPerDay: 200 })).metrics.find((m) => m.name === "swapsPerDay")?.level).toBe("CLEAN");
  });
  it("mature tier: dead tape caps at WARN (CEX flow absorbs vitality)", () => {
    expect(evalFlow(fm({ swapsPerDay: 5 }), true).metrics.find((m) => m.name === "swapsPerDay")?.level).toBe("WARN");
  });
  it("clean: distributed flow", () => {
    expect(evalFlow(fm({})).level).toBe("CLEAN");
  });
  it("mature tier (mcap≥$100M): concentration/direction danger caps at WARN", () => {
    // Arb-infra dominated DEX flow of a large cap is weak evidence —
    // never DANGER on these two rows alone (CLAIMS published rule).
    const f = fm({ top5MakerShare: 0.8, netBuyRatio: -0.35 });
    expect(evalFlow(f).level).toBe("DANGER"); // early tier unchanged
    const v = evalFlow(f, true);
    expect(v.level).toBe("WARN");
    expect(v.metrics.find((m) => m.name === "top5MakerShare")?.level).toBe("WARN");
    expect(v.metrics.find((m) => m.name === "netBuyRatio")?.level).toBe("WARN");
    expect(v.metrics.find((m) => m.name === "mcapTier")?.value).toContain("mature");
  });
  it("mature tier: insider-exit signals keep full severity", () => {
    // Zero third-party sells is venue-independent — still DANGER.
    expect(evalFlow(fm({ thirdPartySells: 0, buyCount: 80 }), true).level).toBe("DANGER");
  });
  it("V2 detail applies the same mature cap the verdict used", () => {
    // Detail must reproduce the verdict's own evaluation — an uncapped V2
    // panel showing DANGER while the verdict said RAWAN contradicts itself.
    const f = fm({ top5MakerShare: 0.8, netBuyRatio: -0.35 });
    expect(evalFlowV2(f).level).toBe("DANGER");
    expect(evalFlowV2(f, true).level).toBe("WARN");
  });
  it("composite wires mcapUsd → mature tier", () => {
    const mature = composite(input({ mcapUsd: 250_000_000, flow: fm({ top5MakerShare: 0.8, netBuyRatio: -0.35 }) }));
    expect(mature.subs.find((s) => s.dim === "FLOW")?.level).toBe("WARN");
    const early = composite(input({ mcapUsd: 5_000_000, flow: fm({ top5MakerShare: 0.8, netBuyRatio: -0.35 }) }));
    expect(early.subs.find((s) => s.dim === "FLOW")?.level).toBe("DANGER");
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
  it("dust depth (<$1k) is DANGER — pools exist but exit is impossible", () => {
    expect(evalLiquidity(lm({ totalLiqUsd: 500 })).level).toBe("DANGER");
    expect(evalLiquidityV2(lm({ totalLiqUsd: 0 })).level).toBe("DANGER");
  });
  it("V2 leaves unknown pool mapping unavailable", () => {
    const l = lm({ maxSinglePullPct: 0, removalVsCurrentDepth: null });
    expect(evalLiquidityV2(l).metrics.find((row) => row.name === "removalVsCurrentDepth")?.level).toBe("INSUFFICIENT");
  });
  it("unobserved LP events are INSUFFICIENT rows, never clean zeros", () => {
    // LP source failed/not-captured → metrics carry nulls; the dimension
    // must abstain instead of printing "0 pulls observed".
    const dead = lm({ netLpDeltaUsd: null, maxSinglePullPct: null, addCount: null, removeCount: null, removalVsCurrentDepth: null });
    const v2 = evalLiquidityV2(dead);
    expect(v2.level).toBe("INSUFFICIENT");
    expect(v2.metrics.filter((m) => m.level === "INSUFFICIENT").map((m) => m.name)).toEqual(["removalVsCurrentDepth", "netLpDeltaPct"]);
    expect(evalLiquidity(dead).metrics.filter((m) => m.level === "INSUFFICIENT").map((m) => m.name)).toEqual(["maxSinglePullPct", "netLpDeltaPct"]);
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
  it("JANGAN on dead tape — FLOW danger via swapsPerDay escalates (CEL-class)", () => {
    const c = composite(input({ flow: fm({ swapsPerDay: 12 }) }));
    expect(c.verdict).toBe("JANGAN");
  });
  it("JANGAN on dust liquidity — untradeable is honeypot-class severity", () => {
    // TITANO regression: $0 depth across pools must not read as mere CAUTION.
    const r = composite(input({ liq: lm({ totalLiqUsd: 0 }) }));
    expect(r.verdict).toBe("JANGAN");
    expect(composite(input({ liq: lm({ totalLiqUsd: 999 }) })).verdict).toBe("JANGAN");
  });
  it("RAWAN when LIQ/PUMP danger or ≥2 WARN", () => {
    expect(composite(input({ liq: lm({ maxSinglePullPct: 0.6, removalVsCurrentDepth: 0.6 }) })).verdict).toBe("RAWAN");
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
  it("falsifier lists every failing row, not just the worst one", () => {
    // AAVE-shaped input: two FLOW rows fail — both must appear.
    const r = composite(input({ flow: fm({ top5MakerShare: 0.8, netBuyRatio: -0.35, thirdPartySells: 8 }) }));
    expect(r.falsifier).toContain("top5MakerShare");
    expect(r.falsifier).toContain("netBuyRatio");
  });
  it("LAYAK falsifier matches the actual rule — one WARN flips, not two", () => {
    // Verdict code: warns === 0 is required for LAYAK, so the falsifier may
    // never claim "two dimensions degrade".
    const r = composite(input({}));
    expect(r.verdict).toBe("LAYAK");
    expect(r.falsifier).toMatch(/single dimension|any single/i);
    expect(r.falsifier).not.toMatch(/two dimensions/i);
  });
  it("BELUM_CUKUP_BUKTI falsifier names the missing evidence", () => {
    const r = composite(input({ safety: sm({ level: "unknown", buyTax: null, sellTax: null }) }));
    expect(r.verdict).toBe("BELUM_CUKUP_BUKTI");
    expect(r.falsifier).toContain("securityLevel");
    expect(r.falsifier).toMatch(/missing evidence/i);
  });
});
