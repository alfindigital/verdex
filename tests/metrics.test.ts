import { describe, it, expect } from "vitest";
import { flowMetrics, liquidityMetrics, pumpMetrics, safetyMetrics } from "@/engine/metrics";
import type { Swap, Pool, LiqEvent, SecurityReport } from "@/lib/dex";

const swap = (side: "buy" | "sell", maker: string, usd: number, pool = "P1"): Swap => ({
  ts: 1, side, maker, usd, tx: "t", pool, dex: "d",
});

describe("flowMetrics", () => {
  it("computes net buy, unique makers, top5 share, third-party sells", () => {
    const swaps = [
      swap("buy", "A", 100), swap("buy", "B", 50), swap("buy", "C", 50),
      swap("sell", "D", 40), swap("sell", "E", 20), swap("sell", "F", 10),
    ];
    const m = flowMetrics(swaps, []);
    expect(m.buyUsd).toBe(200);
    expect(m.sellUsd).toBe(70);
    expect(m.netBuyUsd).toBe(130);
    expect(m.uniqueMakers).toBe(6);
    expect(m.thirdPartySells).toBe(3);
    expect(m.top5MakerShare).toBeCloseTo(260 / 270); // top5 makers hold 260 of 270 USD
    expect(m.swapCount).toBe(6);
  });

  it("honeypot shape: many buys, zero sells", () => {
    const swaps = Array.from({ length: 60 }, (_, i) => swap("buy", `m${i}`, 10));
    const m = flowMetrics(swaps, []);
    expect(m.thirdPartySells).toBe(0);
    expect(m.buyCount).toBe(60);
    expect(m.sellCount).toBe(0);
    expect(m.uniqueMakers).toBe(60);
  });

  it("excludes creator wallet from third-party sells", () => {
    const swaps = [swap("buy", "U1", 10), swap("buy", "U2", 10), swap("sell", "CREATOR", 99)];
    const m = flowMetrics(swaps, [], "CREATOR");
    expect(m.thirdPartySells).toBe(0);
    expect(m.uniqueMakers).toBe(3);
  });

  it("wash pattern: 2 makers cycling → top5 share = 1", () => {
    const swaps = [swap("buy", "X", 500), swap("sell", "X", 480), swap("buy", "Y", 300), swap("sell", "Y", 290)];
    const m = flowMetrics(swaps, []);
    expect(m.uniqueMakers).toBe(2);
    expect(m.top5MakerShare).toBe(1);
  });

  it("maker keys are case-insensitive; pools excluded from maker stats", () => {
    const swaps = [
      swap("buy", "0xAbC", 100, "0xPOOL"),
      swap("sell", "0xabc", 60, "0xPOOL"),
      swap("buy", "0xPOOL", 999, "0xPOOL"),
    ];
    const m = flowMetrics(swaps, ["0xPOOL"]);
    // "0xAbC" and "0xabc" are one maker; the pool itself is not a maker.
    expect(m.uniqueMakers).toBe(1);
    expect(m.thirdPartySells).toBe(1);
  });
});

describe("liquidityMetrics", () => {
  const pools: Pool[] = [{ address: "P1", dex: "d", liqUsd: 10000, vol24h: 0, t0sym: "T", t1sym: "S" }];
  const ev = (kind: "add" | "remove", usd: number): LiqEvent => ({ ts: 1, kind, usd, pool: "P1", maker: "m" });

  it("net delta + max single pull", () => {
    const m = liquidityMetrics([ev("add", 1000), ev("add", 500), ev("remove", 3000)], pools);
    expect(m.netLpDeltaUsd).toBe(-1500);
    expect(m.maxSinglePullPct).toBeCloseTo(0.3);
    expect(m.poolCount).toBe(1);
    expect(m.totalLiqUsd).toBe(10000);
  });
  it("max pull is measured against the pool being pulled, not total liquidity", () => {
    const twoPools: Pool[] = [
      { address: "P1", dex: "d", liqUsd: 10000, vol24h: 0, t0sym: "T", t1sym: "S" },
      { address: "P2", dex: "d", liqUsd: 100000, vol24h: 0, t0sym: "T", t1sym: "S" },
    ];
    // $3k pulled from the $10k pool = 30% (vs 2.7% if diluted by total).
    const m = liquidityMetrics([{ ts: 1, kind: "remove", usd: 3000, pool: "P1", maker: "m" }], twoPools);
    expect(m.maxSinglePullPct).toBeCloseTo(0.3);
    // Unknown pool falls back to total liquidity.
    const m2 = liquidityMetrics([{ ts: 1, kind: "remove", usd: 3000, pool: "P9", maker: "m" }], twoPools);
    expect(m2.maxSinglePullPct).toBeCloseTo(3000 / 110000);
  });
  it("no pools → insufficient-ish zeros", () => {
    const m = liquidityMetrics([], []);
    expect(m.poolCount).toBe(0);
    expect(m.totalLiqUsd).toBe(0);
  });
});

describe("pumpMetrics", () => {
  it("vol/mcap + makers per 100k of WINDOW usd (not 24h vol)", () => {
    const swaps = Array.from({ length: 40 }, (_, i) => swap("buy", `m${i}`, 250));
    const m = pumpMetrics(swaps, { mcapUsd: 1_000_000, vol24hUsd: 10_000, priceChange24h: 15 });
    expect(m.volMcapRatio).toBeCloseTo(0.01);
    // 40 makers × $250 = $10k window → 40 / (10k/100k) = 400
    expect(m.makersPer100kVol).toBeCloseTo(400);
    expect(m.priceChange24h).toBe(15);
  });
  it("high-volume liquid token is not flagged wash — denominator is the window", () => {
    // 55 makers, $80k observed window, but $9.2M 24h volume (CAKE-shaped).
    // Old formula: 55/(9.2M/100k)=0.6 → DANGER. Same-window: 55/(80k/100k)=68.75.
    const swaps = Array.from({ length: 55 }, (_, i) => swap(i % 2 ? "sell" : "buy", `m${i}`, 1454));
    const m = pumpMetrics(swaps, { mcapUsd: 300_000_000, vol24hUsd: 9_200_000 });
    expect(m.makersPer100kVol).toBeGreaterThan(5);
  });
  it("actual wash window still flagged: few makers, big window usd", () => {
    const swaps = [swap("buy", "w1", 200_000), swap("sell", "w1", 190_000), swap("buy", "w2", 150_000)];
    const m = pumpMetrics(swaps, { mcapUsd: 1_000_000, vol24hUsd: 500_000 });
    expect(m.makersPer100kVol).toBeLessThan(1); // 2 makers / $540k
  });
  it("extreme vol/mcap flags wash", () => {
    const m = pumpMetrics([], { mcapUsd: 50_000, vol24hUsd: 80_000, priceChange24h: 400 });
    expect(m.volMcapRatio).toBeCloseTo(1.6);
  });
});

describe("safetyMetrics", () => {
  it("hit flags surface; level passthrough", () => {
    const sec: SecurityReport = {
      level: "caution",
      items: [
        { code: "honeypot", hit: true, level: "r" },
        { code: "wash_trading", hit: false, level: "g" },
      ],
      buyTax: 0, sellTax: 15, flaggedByVendor: false,
    };
    const m = safetyMetrics(sec);
    expect(m.hits).toContain("honeypot");
    expect(m.level).toBe("caution");
    expect(m.sellTax).toBe(0.15);
  });
  it("null security → insufficient", () => {
    const m = safetyMetrics(null);
    expect(m.level).toBe("unknown");
    expect(m.hits).toEqual([]);
  });
});
