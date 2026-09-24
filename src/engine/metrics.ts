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
    if (s.side === "buy") {
      buyUsd += s.usd;
      buyCount++;
    } else {
      sellUsd += s.usd;
      sellCount++;
      const m = s.maker.toLowerCase();
      if (m !== creatorLc && !poolSet.has(m)) sellers.add(s.maker);
    }
    makerUsd.set(s.maker, (makerUsd.get(s.maker) ?? 0) + s.usd);
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
      if (totalLiqUsd > 0) maxPull = Math.max(maxPull, e.usd / totalLiqUsd);
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
): PumpMetrics {
  const { mcapUsd, vol24hUsd, priceChange24h } = stats;
  const makers = new Set(swaps.map((s) => s.maker)).size;
  return {
    volMcapRatio: mcapUsd && mcapUsd > 0 && vol24hUsd != null ? vol24hUsd / mcapUsd : null,
    makersPer100kVol: vol24hUsd && vol24hUsd > 0 ? makers / (vol24hUsd / 100_000) : null,
    priceChange24h: priceChange24h ?? null,
  };
}

export function safetyMetrics(sec: SecurityReport | null): SafetyMetrics {
  if (!sec) return { level: "unknown", hits: [], buyTax: null, sellTax: null, flaggedByVendor: false };
  return {
    level: sec.level,
    hits: sec.items.filter((i) => i.hit).map((i) => i.code),
    buyTax: sec.buyTax,
    sellTax: sec.sellTax,
    flaggedByVendor: sec.flaggedByVendor,
  };
}
