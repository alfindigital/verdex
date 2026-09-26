import type { Swap, Pool, LiqEvent, SecurityReport } from "@/lib/dex";

export interface FlowMetrics {
  swapCount: number;
  buyCount: number;
  sellCount: number;
  buyUsd: number;
  sellUsd: number;
  netBuyUsd: number;
  netBuyRatio: number; // (buy-sell)/total
  uniqueMakers: number;
  top5MakerShare: number; // share of total USD by top-5 makers
  thirdPartySells: number; // distinct non-creator, non-pool makers with ≥1 sell
}

export interface LiquidityMetrics {
  poolCount: number;
  totalLiqUsd: number;
  netLpDeltaUsd: number;
  maxSinglePullPct: number; // largest remove / pool liq
  addCount: number;
  removeCount: number;
}

export interface PumpMetrics {
  volMcapRatio: number | null;
  makersPer100kVol: number | null;
  priceChange24h: number | null;
}

export interface SafetyMetrics {
  level: string;
  hits: string[]; // riskCodes with isHit=true
  buyTax: number | null;
  sellTax: number | null;
  flaggedByVendor: boolean;
}

export function flowMetrics(swaps: Swap[], poolAddrs: string[] = [], creator?: string): FlowMetrics {
  const poolSet = new Set(poolAddrs.map((a) => a.toLowerCase()));
  const creatorLc = creator?.toLowerCase();
  let buyUsd = 0;
  let sellUsd = 0;
  let buyCount = 0;
  let sellCount = 0;
  const makerUsd = new Map<string, number>();
  const sellers = new Set<string>();

  for (const s of swaps) {
    const m = s.maker.toLowerCase();
    if (s.side === "buy") {
      buyUsd += s.usd;
      buyCount++;
    } else {
      sellUsd += s.usd;
      sellCount++;
      if (m !== creatorLc && !poolSet.has(m)) sellers.add(m);
    }
    // Pools are infrastructure, not traders — excluded from maker stats so a
    // pool address in `ma` can't inflate breadth or concentration.
    if (!poolSet.has(m)) makerUsd.set(m, (makerUsd.get(m) ?? 0) + s.usd);
  }

  const totalUsd = buyUsd + sellUsd;
  const top5 = [...makerUsd.values()].sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b, 0);

  return {
    swapCount: swaps.length,
    buyCount,
    sellCount,
    buyUsd,
    sellUsd,
    netBuyUsd: buyUsd - sellUsd,
    netBuyRatio: totalUsd > 0 ? (buyUsd - sellUsd) / totalUsd : 0,
    uniqueMakers: makerUsd.size,
    top5MakerShare: totalUsd > 0 ? top5 / totalUsd : 1,
    thirdPartySells: sellers.size,
  };
}

export function liquidityMetrics(events: LiqEvent[], pools: Pool[]): LiquidityMetrics {
  const totalLiqUsd = pools.reduce((a, p) => a + p.liqUsd, 0);
  const liqByPool = new Map(pools.map((p) => [p.address.toLowerCase(), p.liqUsd]));
  let addUsd = 0;
  let removeUsd = 0;
  let addCount = 0;
  let removeCount = 0;
  let maxPull = 0;
  for (const e of events) {
    if (e.kind === "add") {
      addUsd += e.usd;
      addCount++;
    } else {
      removeUsd += e.usd;
      removeCount++;
      // CLAIMS: "remove terbesar vs pool size" — the pool being pulled, not
      // total liquidity (a big pull on a small pool would otherwise dilute).
      // Unknown pools fall back to total rather than hiding the pull.
      const denom = liqByPool.get(e.pool.toLowerCase()) ?? totalLiqUsd;
      if (denom > 0) maxPull = Math.max(maxPull, e.usd / denom);
    }
  }
  return {
    poolCount: pools.length,
    totalLiqUsd,
    netLpDeltaUsd: addUsd - removeUsd,
    maxSinglePullPct: maxPull,
    addCount,
    removeCount,
  };
}

export function pumpMetrics(
  swaps: Swap[],
  stats: { mcapUsd?: number | null; vol24hUsd?: number | null; priceChange24h?: number | null },
  poolAddrs: string[] = [],
): PumpMetrics {
  const { mcapUsd, vol24hUsd, priceChange24h } = stats;
  const poolSet = new Set(poolAddrs.map((a) => a.toLowerCase()));
  const makers = new Set(swaps.map((s) => s.maker.toLowerCase()).filter((m) => !poolSet.has(m))).size;
  // Same-window maker density: unique makers per $100k of OBSERVED swap USD.
  // (Dividing windowed makers by full 24h volume would flag every liquid
  // token — numerator capped at ~100 while denominator scales with volume.)
  const windowUsd = swaps.reduce((a, s) => a + s.usd, 0);
  return {
    volMcapRatio: mcapUsd && mcapUsd > 0 && vol24hUsd != null ? vol24hUsd / mcapUsd : null,
    makersPer100kVol: windowUsd > 0 ? makers / (windowUsd / 100_000) : null,
    priceChange24h: priceChange24h ?? null,
  };
}

export function safetyMetrics(sec: SecurityReport | null): SafetyMetrics {
  if (!sec) return { level: "unknown", hits: [], buyTax: null, sellTax: null, flaggedByVendor: false };
  // CMC tax values are observed as fractions (0.003 = 0.3%). If a payload ever
  // arrives as a percent number (>1), normalize to fraction — a tax can never
  // legitimately exceed 100%, so >1 unambiguously means "percent units".
  const frac = (v: number | null): number | null => (v == null ? null : v > 1 ? v / 100 : v);
  return {
    level: sec.level,
    hits: sec.items.filter((i) => i.hit).map((i) => i.code),
    buyTax: frac(sec.buyTax),
    sellTax: frac(sec.sellTax),
    flaggedByVendor: sec.flaggedByVendor,
  };
}
