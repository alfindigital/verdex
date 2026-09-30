import type { Swap, Pool, LiqEvent, SecurityReport } from "@/lib/dex";
import { walletIdentity, canonicalChain } from "@/lib/address";

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
  observedSellMakers?: number;
  swapsPerDay: number; // tape vitality — observed swaps/day across the window span
}

export interface LiquidityMetrics {
  poolCount: number;
  totalLiqUsd: number;
  // LP-event-derived fields are null when the LP source failed or was never
  // captured — "not observed" must never render as "zero observed".
  netLpDeltaUsd: number | null;
  maxSinglePullPct: number | null; // largest remove / pool liq
  addCount: number | null;
  removeCount: number | null;
  removalVsCurrentDepth?: number | null;
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

export function flowMetrics(swaps: Swap[], poolAddrs: string[] = [], excluded: string | string[] = [], platform = "Ethereum"): FlowMetrics {
  const chain = canonicalChain(platform) ?? platform;
  const poolSet = new Set(poolAddrs.map((a) => walletIdentity(chain, a)));
  const excludedSet = new Set((Array.isArray(excluded) ? excluded : excluded ? [excluded] : []).filter(Boolean).map((a) => walletIdentity(chain, a)));
  let buyUsd = 0;
  let sellUsd = 0;
  let buyCount = 0;
  let sellCount = 0;
  const makerUsd = new Map<string, number>();
  const sellers = new Set<string>();
  let minTs = Infinity;
  let maxTs = 0;

  for (const s of swaps) {
    if (s.ts < minTs) minTs = s.ts;
    if (s.ts > maxTs) maxTs = s.ts;
    const m = walletIdentity(chain, s.maker);
    if (s.side === "buy") {
      buyUsd += s.usd;
      buyCount++;
    } else {
      sellUsd += s.usd;
      sellCount++;
      if (s.usd > 0 && !excludedSet.has(m) && !poolSet.has(m)) sellers.add(m);
    }
    // Pools are infrastructure, not traders — excluded from maker stats so a
    // pool address in `ma` can't inflate breadth or concentration.
    if (!poolSet.has(m)) makerUsd.set(m, (makerUsd.get(m) ?? 0) + s.usd);
  }

  const eligibleUsd = [...makerUsd.values()].reduce((a, b) => a + b, 0);
  const top5 = [...makerUsd.values()].sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b, 0);
  const totalUsd = buyUsd + sellUsd;
  // A market that needs days to fill the 100-swap window is a dead tape —
  // exit capacity is nominal even when pool depth reports a real number.
  // Span of zero (dense burst) reads as maximally alive, not thin.
  const spanDays = (maxTs - minTs) / 86_400_000;
  const swapsPerDay = swaps.length > 1 && spanDays > 0 ? swaps.length / spanDays : swaps.length;

  return {
    swapCount: swaps.length,
    buyCount,
    sellCount,
    buyUsd,
    sellUsd,
    netBuyUsd: buyUsd - sellUsd,
    netBuyRatio: totalUsd > 0 ? (buyUsd - sellUsd) / totalUsd : 0,
    uniqueMakers: makerUsd.size,
    top5MakerShare: eligibleUsd > 0 ? top5 / eligibleUsd : 1,
    thirdPartySells: sellers.size,
    observedSellMakers: sellers.size,
    swapsPerDay,
  };
}

export function liquidityMetrics(events: LiqEvent[], pools: Pool[], lpObserved = true): LiquidityMetrics {
  const totalLiqUsd = pools.reduce((a, p) => a + p.liqUsd, 0);
  if (!lpObserved) {
    return {
      poolCount: pools.length,
      totalLiqUsd,
      netLpDeltaUsd: null,
      maxSinglePullPct: null,
      addCount: null,
      removeCount: null,
      removalVsCurrentDepth: null,
    };
  }
  const liqByPool = new Map(pools.map((p) => [p.address.toLowerCase(), p.liqUsd]));
  let addUsd = 0;
  let removeUsd = 0;
  let addCount = 0;
  let removeCount = 0;
  let maxPull = 0;
  let unknownPoolMapping = false;
  for (const e of events) {
    if (e.kind === "add") {
      addUsd += e.usd;
      addCount++;
    } else {
      removeUsd += e.usd;
      removeCount++;
      // V2 only reports a ratio when the event maps to a known pool. Falling
      // back to aggregate depth would make an unknown event look smaller.
      const denom = liqByPool.get(e.pool.toLowerCase());
      if (denom === undefined || denom <= 0 || !Number.isFinite(denom)) unknownPoolMapping = true;
      else maxPull = Math.max(maxPull, e.usd / denom);
    }
  }
  return {
    poolCount: pools.length,
    totalLiqUsd,
    netLpDeltaUsd: addUsd - removeUsd,
    maxSinglePullPct: maxPull,
    addCount,
    removeCount,
    removalVsCurrentDepth: pools.length === 0 || unknownPoolMapping ? null : maxPull,
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
