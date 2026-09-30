// Dossier assembly — the full read-through of provider fields attached to a
// verdict record. Pure function over already-fetched normalized data; every
// value traces to a source row, absent fields stay null (never zero-fill).

import type { MarketContext, Pool, Swap, LiqEvent, SecurityReport, TokenProfile, TokenRef } from "@/lib/dex";
import { walletIdentity, canonicalChain } from "@/lib/address";
import type { TokenDossier, DossierPoolRow, DossierSwapRow, DossierLpRow, DossierSecurityItem } from "@/lib/verdict-types";

const DAY = 86_400_000;
const TP_ORDER = ["5m", "15m", "1h", "4h", "24h", "1m", "7d"];

interface DossierInput {
  token: TokenRef;
  profile: TokenProfile | null;
  pools: Pool[];
  swaps: Swap[];
  events: LiqEvent[];
  sec: SecurityReport | null;
  ctx: MarketContext;
  nowMs: number;
}

const iso = (ms: number | null | undefined): string | null =>
  typeof ms === "number" && Number.isFinite(ms) && ms > 0 ? new Date(ms).toISOString() : null;

const daysOld = (ms: number | null | undefined, nowMs: number): number | null =>
  typeof ms === "number" && Number.isFinite(ms) && ms > 0 && nowMs > ms
    ? Math.round(((nowMs - ms) / DAY) * 10) / 10
    : null;

function poolRow(pool: Pool, nowMs: number): DossierPoolRow {
  return {
    address: pool.address,
    dex: pool.dex,
    pair: `${pool.t0sym}/${pool.t1sym}`,
    liqUsd: pool.liqUsd,
    vol24h: pool.vol24h,
    t0liqUsd: pool.t0liqUsd ?? null,
    t1liqUsd: pool.t1liqUsd ?? null,
    ageDays: daysOld(pool.pubAt, nowMs),
    top: pool.top ?? false,
    rank: pool.rank ?? null,
  };
}

function swapRow(swap: Swap, chain: string, tokenId: string | null): DossierSwapRow {
  // Identify which side is the scanned token by address identity — never by
  // symbol, since symbols collide across wrappers (WETH vs ETH etc).
  const t0IsToken = tokenId !== null && swap.t0a !== undefined && walletIdentity(chain, swap.t0a) === tokenId;
  const t1IsToken = tokenId !== null && swap.t1a !== undefined && walletIdentity(chain, swap.t1a) === tokenId;
  return {
    ts: new Date(swap.ts).toISOString(),
    side: swap.side,
    usd: swap.usd,
    maker: swap.maker,
    dex: swap.dex,
    tx: swap.tx,
    tokenAmount: t0IsToken ? swap.a0 ?? null : t1IsToken ? swap.a1 ?? null : null,
    counterAmount: t0IsToken ? swap.a1 ?? null : t1IsToken ? swap.a0 ?? null : null,
    counterSymbol: t0IsToken ? swap.t1sym ?? null : t1IsToken ? swap.t0sym ?? null : null,
    tokenPriceUsd: t0IsToken ? swap.t0pu ?? null : t1IsToken ? swap.t1pu ?? null : null,
  };
}

function lpRow(event: LiqEvent): DossierLpRow {
  return {
    ts: new Date(event.ts).toISOString(),
    kind: event.kind,
    usd: event.usd,
    dex: event.dex ?? null,
    maker: event.maker,
    tx: event.tx ?? null,
  };
}

function securityBlock(sec: SecurityReport | null): TokenDossier["security"] {
  if (!sec) return null;
  const items: DossierSecurityItem[] = [...sec.allItems]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .map((i) => ({ code: i.code, hit: i.hit, level: i.level, description: i.description, group: i.group }));
  return {
    level: sec.level,
    categoryLevel: sec.categoryLevel,
    items,
    hitCount: items.filter((i) => i.hit).length,
    checkCount: items.length,
    evmFlags: sec.evmFlags,
    tags: sec.tags,
  };
}

export function buildDossier(input: DossierInput): TokenDossier {
  const { token, profile, pools, swaps, events, sec, ctx, nowMs } = input;
  const chain = canonicalChain(token.platform) ?? token.platform;
  const tokenId = walletIdentity(chain, token.address);

  const marketPrice = profile?.priceUsd ?? null;
  const listedAt = profile?.listedAt ?? null;

  return {
    profile: {
      logo: profile?.logo ?? token.logo ?? null,
      cmcId: profile?.cmcId ?? null,
      decimals: profile?.decimals ?? null,
      totalSupply: profile?.totalSupply ?? null,
      holders: profile?.holders ?? null,
      listedAt: iso(listedAt),
      firstPoolAt: iso(profile?.firstPoolAt),
      ageDays: daysOld(listedAt, nowMs),
      riskLevel: profile?.riskLevel ?? null,
      tokenSource: profile?.tokenSource ?? null,
      tradeUrl: profile?.tradeUrl ?? null,
      website: profile?.website ?? null,
      twitter: profile?.twitter ?? null,
      telegram: profile?.telegram ?? null,
      creator: profile?.creator ?? null,
      owner: profile?.owner ?? null,
      cexListingCount: profile?.cexListings.length ?? 0,
      cexNames: (profile?.cexListings ?? []).slice(0, 8).map((c) => c.name),
    },
    market: {
      priceUsd: marketPrice,
      high24hUsd: profile?.high24hUsd ?? null,
      low24hUsd: profile?.low24hUsd ?? null,
      mcapUsd: profile?.mcapUsd ?? token.mcapUsd ?? null,
      liqUsd: profile?.liqUsd ?? token.liqUsd ?? null,
      vol24hUsd: token.vol24hUsd ?? null,
      uniqueTraders24h: token.uniqueTraders24h ?? null,
      priceChange24h: token.priceChange24h ?? null,
    },
    windowStats: [...(profile?.windowStats ?? [])].sort(
      (a, b) => (TP_ORDER.indexOf(a.tp) === -1 ? 99 : TP_ORDER.indexOf(a.tp)) - (TP_ORDER.indexOf(b.tp) === -1 ? 99 : TP_ORDER.indexOf(b.tp)),
    ),
    pools: pools.map((p) => poolRow(p, nowMs)).sort((a, b) => b.liqUsd - a.liqUsd).slice(0, 12),
    topSwaps: [...swaps].sort((a, b) => b.usd - a.usd).slice(0, 8).map((s) => swapRow(s, chain, tokenId)),
    recentSwaps: [...swaps].sort((a, b) => b.ts - a.ts).slice(0, 8).map((s) => swapRow(s, chain, tokenId)),
    lpEvents: [...events].sort((a, b) => b.ts - a.ts).slice(0, 10).map(lpRow),
    security: securityBlock(sec),
    global: {
      ethDom: ctx.ethDom ?? null,
      btcDom: ctx.btcDom ?? null,
      btcDom24hChange: ctx.btcDom24hChange ?? null,
      totalMcapUsd: ctx.totalMcapUsd ?? null,
      defiVol24hUsd: ctx.defiVol24hUsd ?? null,
      defiMcapUsd: ctx.defiMcapUsd ?? null,
      stableMcapUsd: ctx.stableMcapUsd ?? null,
      fearGreed: ctx.fearGreed ?? null,
      fearGreedClass: ctx.fearGreedClass ?? null,
    },
  };
}
