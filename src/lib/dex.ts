// Normalized types + DEX fetchers over cmc-client.
// Raw CMC field names are abbreviated (ts/tp/ma/v/f/en, lcs, tks...) —
// every normalizer maps them to the public contract in specs/TECH_SPEC.md.

export interface TokenRef {
  platform: string; // 'Solana' | 'BSC' | 'Base' | ... (dex/platform/list `dn`)
  address: string;
  name: string;
  symbol: string;
  // stats carried from dex/search (keeps call count low)
  mcapUsd?: number | null;
  vol24hUsd?: number | null;
  priceChange24h?: number | null;
  liqUsd?: number | null;
}

export interface Swap {
  ts: number;
  side: "buy" | "sell";
  maker: string;
  usd: number;
  tx: string;
  pool: string;
  dex: string;
}

export interface Pool {
  address: string;
  dex: string;
  liqUsd: number;
  vol24h: number;
  t0sym: string;
  t1sym: string;
}

export interface LiqEvent {
  ts: number;
  kind: "add" | "remove";
  usd: number;
  pool: string;
  maker: string;
}

export interface SecurityReport {
  level: string; // 'safe' | 'caution' | 'risky' | ...
  items: { code: string; hit: boolean; level: string }[];
  buyTax: number | null;
  sellTax: number | null;
  flaggedByVendor: boolean;
}

export interface MarketContext {
  btcDom: number | null;
  btcDomDelta7d: number | null;
  fearGreed: number | null;
}

export interface DexClient {
  get<T>(endpoint: string, params?: Record<string, unknown>, opts?: { ttlMs?: number }): Promise<{ data: T; receipt: import("./cmc-client").Receipt }>;
}

// ---------- normalizers (pure, testable) ----------

export function normSwap(raw: Record<string, unknown>): Swap {
  return {
    ts: Number(raw.ts),
    side: raw.tp === "sell" ? "sell" : "buy",
    maker: String(raw.ma ?? ""),
    usd: Number(raw.v ?? 0),
    tx: String(raw.tx ?? ""),
    pool: String(raw.f ?? ""),
    dex: String(raw.en ?? ""),
  };
}

export function normPool(raw: Record<string, unknown>): Pool {
  const t0 = (raw.t0 ?? {}) as Record<string, unknown>;
  const t1 = (raw.t1 ?? {}) as Record<string, unknown>;
  return {
    address: String(raw.fa ?? raw.addr ?? ""),
    dex: String(raw.exn ?? ""),
    liqUsd: Number(raw.liqUsd ?? 0),
    vol24h: Number(raw.v24 ?? 0),
    t0sym: String(t0.sym ?? ""),
    t1sym: String(t1.sym ?? ""),
  };
}

export function normLiqEvent(raw: Record<string, unknown>): LiqEvent {
  return {
    ts: Number(raw.ts),
    kind: raw.tp === "remove" ? "remove" : "add",
    usd: Number(raw.tu ?? 0),
    pool: String(raw.f ?? ""),
    maker: String(raw.m ?? ""),
  };
}

const SECURITY_HIT_CODES = new Set([
  "honeypot",
  "rug_pull",
  "unusual_sell_tax",
  "unusual_buy_tax",
  "wash_trading",
  "whitelist_function",
  "low_liquidity",
]);

export function normSecurity(raw: Record<string, unknown>): SecurityReport {
  const items = ((raw.securityItems ?? []) as Record<string, unknown>[]).map((i) => ({
    code: String(i.riskCode ?? i.code ?? ""),
    hit: Boolean(i.isHit),
    level: String(i.riskyLevel ?? ""),
  }));
  const extra = (raw.extra ?? {}) as Record<string, unknown>;
  const tax = (v: unknown) => (v === undefined || v === null || v === "" ? null : Number(v));
  return {
    level: String(raw.securityLevel ?? "unknown"),
    items: items.filter((i) => SECURITY_HIT_CODES.has(i.code) || i.hit),
    buyTax: tax(extra.buyTax),
    sellTax: tax(extra.sellTax),
    flaggedByVendor: Boolean(extra.isFlaggedByVendor),
  };
}

// ---------- fetchers ----------

export function isAddress(input: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(input) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input);
}

const num = (v: unknown) => (v === undefined || v === null || v === "" ? null : Number(v));

function toRef(t: Record<string, unknown>): TokenRef {
  return {
    platform: String(t.plt),
    address: String(t.addr),
    name: String(t.n),
    symbol: String(t.s),
    mcapUsd: num(t.mc),
    vol24hUsd: num(t.v24h),
    priceChange24h: num(t.pc24h),
    liqUsd: num(t.liq),
  };
}

/** All distinct-address candidates for a query (for ambiguity resolution). */
export async function searchTokenCandidates(client: DexClient, input: string): Promise<{ candidates: TokenRef[]; receipt: import("./cmc-client").Receipt }> {
  const q = input.trim().replace(/^\$/, "");
  const res = await client.get<{ tks?: Record<string, unknown>[] }>("/v1/dex/search", { q });
  const seen = new Set<string>();
  const candidates: TokenRef[] = [];
  for (const t of res.data?.tks ?? []) {
    const ref = toRef(t);
    const k = `${ref.platform}:${ref.address.toLowerCase()}`;
    if (!seen.has(k)) {
      seen.add(k);
      candidates.push(ref);
    }
  }
  return { candidates, receipt: res.receipt };
}

export async function resolveToken(client: DexClient, input: string, platformHint?: string): Promise<TokenRef> {
  const q = input.trim().replace(/^\$/, "");
  const { candidates } = await searchTokenCandidates(client, q);
  const pick = isAddress(q)
    ? candidates.find((t) => t.address.toLowerCase() === q.toLowerCase() && (!platformHint || t.platform.toLowerCase() === platformHint.toLowerCase())) ??
      candidates.find((t) => t.address.toLowerCase() === q.toLowerCase())
    : candidates.find((t) => !platformHint || t.platform.toLowerCase() === platformHint.toLowerCase()) ?? candidates[0];
  if (!pick) throw new TokenNotFoundError(q);
  return pick;
}

export class TokenNotFoundError extends Error {
  constructor(q: string) {
    super(`Token not found: ${q}`);
    this.name = "TokenNotFoundError";
  }
}

export async function getTokenMeta(client: DexClient, ref: TokenRef) {
  const r = await client.get<Record<string, unknown>>("/v1/dex/token", { platform: ref.platform, address: ref.address });
  return r;
}

export async function getSwaps(client: DexClient, ref: TokenRef, limit = 100) {
  const r = await client.get<{ swaps?: Record<string, unknown>[] }>("/v1/dex/tokens/transactions", {
    platform: ref.platform,
    address: ref.address,
    limit,
  });
  return { swaps: (r.data?.swaps ?? []).map(normSwap), receipt: r.receipt };
}

export async function getPools(client: DexClient, ref: TokenRef) {
  const r = await client.get<Record<string, unknown>[]>("/v1/dex/token/pools", { platform: ref.platform, address: ref.address });
  return { pools: (Array.isArray(r.data) ? r.data : []).map(normPool), receipt: r.receipt };
}

export async function getLiqEvents(client: DexClient, ref: TokenRef) {
  const r = await client.get<{ lcs?: Record<string, unknown>[] }>("/v1/dex/liquidity-change/list", {
    platform: ref.platform,
    address: ref.address,
  });
  return { events: (r.data?.lcs ?? []).map(normLiqEvent), receipt: r.receipt };
}

export async function getSecurity(client: DexClient, ref: TokenRef) {
  // quirk: security/detail uses `platformName`, not `platform`
  const r = await client.get<Record<string, unknown>[]>("/v1/dex/security/detail", {
    platformName: ref.platform,
    address: ref.address,
  });
  const first = Array.isArray(r.data) ? r.data[0] : undefined;
  return { security: first ? normSecurity(first) : null, receipt: r.receipt };
}

export async function getMarketContext(client: DexClient): Promise<MarketContext> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400_000).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  const [latest, hist, fg] = await Promise.all([
    client.get<{ btc_dominance?: number }>("/v1/global-metrics/quotes/latest").catch(() => null),
    client
      .get<{ quotes?: { btc_dominance?: number }[] }>("/v1/global-metrics/quotes/historical", {
        time_start: weekAgo,
        time_end: today,
        interval: "daily",
      })
      .catch(() => null),
    client.get<{ value?: number }>("/v3/fear-and-greed/latest").catch(() => null),
  ]);
  const btcDom = latest?.data?.btc_dominance ?? null;
  const histFirst = hist?.data?.quotes?.[0]?.btc_dominance ?? null;
  return {
    btcDom,
    btcDomDelta7d: btcDom !== null && histFirst !== null ? btcDom - histFirst : null,
    fearGreed: fg?.data?.value ?? null,
  };
}
