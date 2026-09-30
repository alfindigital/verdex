// Normalized types + DEX fetchers over cmc-client.
// Raw CMC field names are abbreviated (ts/tp/ma/v/f/en, lcs, tks...) —
// every normalizer maps them to the public contract in specs/TECH_SPEC.md.
import { canonicalAddress, canonicalChain, isEvmChain, tokenIdentity, walletIdentity } from "@/lib/address";
import type { ParsedRows } from "@/lib/verdict-types";

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
  uniqueTraders24h?: number | null; // ut24h — provider count
  logo?: string | null;
}

export interface Swap {
  ts: number;
  side: "buy" | "sell";
  maker: string;
  usd: number;
  tx: string;
  pool: string;
  dex: string;
  // rich fields from the same row — amounts + USD prices per side, block height
  t0a?: string;
  t1a?: string;
  t0sym?: string;
  t1sym?: string;
  a0?: number | null;
  a1?: number | null;
  t0pu?: number | null;
  t1pu?: number | null;
  block?: string | null;
  sourceRowIndex?: number;
  logIndex?: string | null;
}

export interface Pool {
  address: string;
  dex: string;
  liqUsd: number;
  vol24h: number;
  t0sym: string;
  t1sym: string;
  pubAt?: number | null; // pool first-seen timestamp (ms)
  t0liqUsd?: number | null; // provider-reported liquidity on the t0 side
  t1liqUsd?: number | null;
  top?: boolean;
  rank?: number | null; // provider ordering index (bidx)
}

export interface LiqEvent {
  ts: number;
  kind: "add" | "remove";
  usd: number;
  pool: string;
  maker: string;
  tx?: string;
  dex?: string;
  t0sym?: string;
  t1sym?: string;
  a0?: number | null;
  a1?: number | null;
  sourceRowIndex?: number;
  logIndex?: string | null;
}

export interface SecurityItem {
  code: string;
  riskCode: string;
  hit: boolean;
  level: string;
  description: string | null;
  group: string | null;
  order: number | null;
}

export interface SecurityReport {
  level: string; // 'safe' | 'caution' | 'risky' | ...
  items: { code: string; hit: boolean; level: string }[]; // curated hit subset (rules input)
  allItems: SecurityItem[]; // every provider item, descriptions included
  categoryLevel: string | null;
  tags: string[];
  evmFlags: Record<string, string>; // honeypotStatus / unverifiedContractStatus / ...
  buyTax: number | null;
  sellTax: number | null;
  flaggedByVendor: boolean;
}

export interface WindowStat {
  tp: string; // '5m' | '1h' | '4h' | '24h' | '1m' ...
  volUsd: number | null;
  txCount: number | null;
  buyCount: number | null;
  sellCount: number | null;
  buyVolUsd: number | null;
  sellVolUsd: number | null;
  buyTraders: number | null;
  sellTraders: number | null;
  uniqueTraders: number | null;
  priceChange: number | null;
}

export interface TokenProfile {
  decimals: number | null;
  totalSupply: number | null;
  holders: number | null;
  priceUsd: number | null;
  high24hUsd: number | null;
  low24hUsd: number | null;
  priceAt: number | null; // provider price timestamp (ms)
  mcapUsd: number | null;
  liqUsd: number | null;
  listedAt: number | null; // pubAt
  firstPoolAt: number | null; // fpct — first pool created
  riskLevel: string | null; // provider risk level `rl`
  tokenSource: string | null; // `tsrc`
  tradeUrl: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  logo: string | null;
  cmcId: number | null;
  poolCount: number | null; // nps
  windowStats: WindowStat[]; // sts[]
  cexListings: { id: number | null; slug: string | null; name: string; categories: string[] }[]; // cexs[]
  creator: string | null;
  owner: string | null;
}

export interface MarketContext {
  btcDom: number | null;
  btcDomDelta7d: number | null;
  fearGreed: number | null;
  fearGreedClass?: string | null;
  ethDom?: number | null;
  btcDom24hChange?: number | null;
  totalMcapUsd?: number | null;
  totalVol24hUsd?: number | null;
  defiVol24hUsd?: number | null;
  defiMcapUsd?: number | null;
  defi24hChange?: number | null;
  stableVol24hUsd?: number | null;
  stableMcapUsd?: number | null;
  activeCryptos?: number | null;
  activeExchanges?: number | null;
  updatedAt?: string | null;
}

export interface DexClient {
  get<T>(endpoint: string, params?: Record<string, unknown>, opts?: { ttlMs?: number }): Promise<{ data: T; receipt: import("./cmc-client").Receipt }>;
}

// ---------- normalizers (pure, testable) ----------

export function normSwap(raw: Record<string, unknown>): Swap {
  const numOrNull = (v: unknown) => (v === undefined || v === null || v === "" ? null : Number(v));
  return {
    ts: Number(raw.ts),
    side: raw.tp === "sell" ? "sell" : "buy",
    maker: String(raw.ma ?? ""),
    usd: Number(raw.v ?? 0),
    tx: String(raw.tx ?? ""),
    pool: String(raw.f ?? ""),
    dex: String(raw.en ?? ""),
    t0a: raw.t0a == null ? undefined : String(raw.t0a),
    t1a: raw.t1a == null ? undefined : String(raw.t1a),
    t0sym: raw.t0s == null ? undefined : String(raw.t0s),
    t1sym: raw.t1s == null ? undefined : String(raw.t1s),
    a0: numOrNull(raw.a0),
    a1: numOrNull(raw.a1),
    t0pu: numOrNull(raw.t0pu),
    t1pu: numOrNull(raw.t1pu),
    block: raw.h == null ? null : String(raw.h),
    sourceRowIndex: typeof raw.sourceRowIndex === "number" ? raw.sourceRowIndex : undefined,
    logIndex: raw.lgid == null ? null : String(raw.lgid),
  };
}

export function normPool(raw: Record<string, unknown>): Pool {
  const t0 = (raw.t0 ?? {}) as Record<string, unknown>;
  const t1 = (raw.t1 ?? {}) as Record<string, unknown>;
  const numOrNull = (v: unknown) => (v === undefined || v === null || v === "" ? null : Number(v));
  return {
    address: String(raw.fa ?? raw.addr ?? ""),
    dex: String(raw.exn ?? ""),
    liqUsd: Number(raw.liqUsd ?? 0),
    vol24h: Number(raw.v24 ?? 0),
    t0sym: String(t0.sym ?? ""),
    t1sym: String(t1.sym ?? ""),
    pubAt: numOrNull(raw.pubAt),
    t0liqUsd: numOrNull(t0.liqUsd),
    t1liqUsd: numOrNull(t1.liqUsd),
    top: raw.top === undefined ? undefined : Boolean(raw.top),
    rank: numOrNull(raw.bidx),
  };
}

export function normLiqEvent(raw: Record<string, unknown>): LiqEvent {
  const numOrNull = (v: unknown) => (v === undefined || v === null || v === "" ? null : Number(v));
  return {
    ts: Number(raw.ts),
    kind: raw.tp === "remove" ? "remove" : "add",
    usd: Number(raw.tu ?? 0),
    pool: String(raw.f ?? ""),
    maker: String(raw.m ?? ""),
    tx: raw.txn == null ? undefined : String(raw.txn),
    dex: raw.en == null ? undefined : String(raw.en),
    t0sym: raw.t0s == null ? undefined : String(raw.t0s),
    t1sym: raw.t1s == null ? undefined : String(raw.t1s),
    a0: numOrNull(raw.a0),
    a1: numOrNull(raw.a1),
    sourceRowIndex: typeof raw.sourceRowIndex === "number" ? raw.sourceRowIndex : undefined,
    logIndex: raw.lgid == null ? null : String(raw.lgid),
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
  const allItems: SecurityItem[] = ((raw.securityItems ?? []) as Record<string, unknown>[]).map((i) => ({
    code: String(i.riskCode ?? i.code ?? ""),
    riskCode: String(i.riskCode ?? ""),
    hit: Boolean(i.isHit),
    level: String(i.riskyLevel ?? ""),
    description: typeof i.des === "string" && i.des.trim() ? i.des.trim() : typeof i.code === "string" && i.code.trim() ? i.code.trim() : null,
    group: typeof i.groupId === "string" && i.groupId.trim() ? i.groupId.trim() : null,
    order: typeof i.order === "number" ? i.order : null,
  }));
  const items = allItems.map((i) => ({ code: i.code, hit: i.hit, level: i.level }));
  const extra = (raw.extra ?? {}) as Record<string, unknown>;
  const tax = (v: unknown) => (v === undefined || v === null || v === "" ? null : Number(v));
  const evm = (raw.evmDisplay ?? {}) as Record<string, unknown>;
  const evmFlags: Record<string, string> = {};
  for (const [k, v] of Object.entries(evm)) if (typeof v === "string" && v) evmFlags[k] = v;
  return {
    level: String(raw.securityLevel ?? "unknown"),
    items: items.filter((i) => SECURITY_HIT_CODES.has(i.code) || i.hit),
    allItems,
    categoryLevel: typeof raw.categoryLevel === "string" && raw.categoryLevel ? raw.categoryLevel : null,
    tags: Array.isArray(raw.tags) ? (raw.tags as unknown[]).map(String).filter(Boolean) : [],
    evmFlags,
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
    uniqueTraders24h: num(t.ut24h),
    logo: typeof t.l === "string" && t.l ? t.l : null,
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
    const k = tokenIdentity(ref.platform, ref.address) ?? `${ref.platform}:${ref.address}`;
    if (!seen.has(k)) {
      seen.add(k);
      candidates.push(ref);
    }
  }
  return { candidates, receipt: res.receipt };
}

export async function resolveToken(
  client: DexClient,
  input: string,
  platformHint?: string,
): Promise<{ token: TokenRef; receipt: import("./cmc-client").Receipt }> {
  const q = input.trim().replace(/^\$/, "");
  const { candidates, receipt } = await searchTokenCandidates(client, q);
  const requestedChain = platformHint ? canonicalChain(platformHint) : null;
  if (platformHint && !requestedChain) throw new TokenNotFoundError(q);
  const exactAddress = isAddress(q)
    ? candidates.find((t) => tokenIdentity(t.platform, t.address) === tokenIdentity(t.platform, q))
    : undefined;
  const pick = isAddress(q)
    ? exactAddress && (!requestedChain || canonicalChain(exactAddress.platform) === requestedChain) ? exactAddress : undefined
    : candidates.find((t) => !requestedChain || canonicalChain(t.platform) === requestedChain);
  if (!pick) throw new TokenNotFoundError(q);
  return { token: pick, receipt };
}

export class TokenNotFoundError extends Error {
  constructor(q: string) {
    super(`Token not found: ${q}`);
    this.name = "TokenNotFoundError";
  }
}

export async function getTokenMeta(client: DexClient, ref: TokenRef) {
  const r = await client.get<Record<string, unknown>>("/v1/dex/token", { platform: ref.platform, address: ref.address });
  const d = (r.data ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const numOrNull = (v: unknown) => {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  // `crt` = creator, `own` = owner (per CMC dex/token payload, probed).
  // Type-guard: a non-string field must degrade to null, not crash toLowerCase.
  const creator = str(d.crt);
  const owner = str(d.own);
  const windowStats: WindowStat[] = (Array.isArray(d.sts) ? d.sts : [])
    .filter((w): w is Record<string, unknown> => Boolean(w) && typeof w === "object")
    .map((w) => ({
      tp: str(w.tp) ?? "?",
      volUsd: numOrNull(w.vu),
      txCount: numOrNull(w.txs),
      buyCount: numOrNull(w.nb),
      sellCount: numOrNull(w.ns),
      buyVolUsd: numOrNull(w.bvu),
      sellVolUsd: numOrNull(w.svu),
      buyTraders: numOrNull(w.but),
      sellTraders: numOrNull(w.sut),
      uniqueTraders: numOrNull(w.ut),
      priceChange: numOrNull(w.pc),
    }));
  const cexListings = (Array.isArray(d.cexs) ? d.cexs : [])
    .filter((c): c is Record<string, unknown> => Boolean(c) && typeof c === "object")
    .map((c) => ({
      id: numOrNull(c.id),
      slug: str(c.slug),
      name: str(c.n) ?? str(c.slug) ?? "unknown",
      categories: Array.isArray(c.cat) ? (c.cat as unknown[]).map(String).filter(Boolean) : [],
    }));
  const profile: TokenProfile = {
    decimals: numOrNull(d.dec),
    totalSupply: numOrNull(d.ts),
    holders: numOrNull(d.hld),
    priceUsd: numOrNull(d.p),
    high24hUsd: numOrNull(d.ph24h),
    low24hUsd: numOrNull(d.pl24h),
    priceAt: numOrNull(d.pt),
    mcapUsd: numOrNull(d.mcap),
    liqUsd: numOrNull(d.liqUsd),
    listedAt: numOrNull(d.pubAt),
    firstPoolAt: numOrNull(d.fpct ?? d.fpt),
    riskLevel: str(d.rl),
    tokenSource: str(d.tsrc),
    tradeUrl: str(d.turl),
    website: str(d.web),
    twitter: str(d.tw),
    telegram: str(d.tg),
    logo: str(d.lg),
    cmcId: numOrNull(d.cid),
    poolCount: numOrNull(d.nps),
    windowStats,
    cexListings,
    creator,
    owner,
  };
  return { creator, owner, profile, receipt: r.receipt };
}

function finiteNonNegative(value: unknown): number | null {
  if (typeof value === "string" && value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function timestampMs(value: unknown, nowMs: number): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const ms = n < 100_000_000_000 ? n * 1000 : n;
  if (ms > nowMs + 5 * 60_000) return null;
  return ms;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, stableValue(v)]));
  }
  return value;
}

function rowKey(raw: Record<string, unknown>, platform: string): string {
  const tx = typeof raw.tx === "string" ? raw.tx : typeof raw.h === "string" ? raw.h : "";
  const logIndex = raw.lgid == null ? null : String(raw.lgid);
  if (tx && logIndex !== null) return `${canonicalChain(platform) ?? platform}:${tx}:${logIndex}`;
  return JSON.stringify(stableValue(raw));
}

export function parseSwaps(raw: unknown, platform: string, nowMs = Date.now()): ParsedRows<Swap> {
  const source = raw && typeof raw === "object" ? (raw as { swaps?: unknown }).swaps : undefined;
  const list = Array.isArray(source) ? source : [];
  const rows: Swap[] = [];
  const seen = new Set<string>();
  const reasons: string[] = [];
  let rejected = 0;
  let duplicates = 0;
  for (const [sourceRowIndex, candidate] of list.entries()) {
    if (!candidate || typeof candidate !== "object") { rejected++; reasons.push(`swap[${sourceRowIndex}]: row is not an object`); continue; }
    const r = candidate as Record<string, unknown>;
    const side = r.tp === "buy" || r.tp === "sell" ? r.tp : null;
    const ts = timestampMs(r.ts, nowMs);
    const usd = finiteNonNegative(r.v);
    const maker = typeof r.ma === "string" ? r.ma.trim() : "";
    const tx = typeof r.tx === "string" ? r.tx.trim() : typeof r.h === "string" ? r.h.trim() : "";
    if (!side || ts === null || usd === null || !maker || !tx) { rejected++; reasons.push(`swap[${sourceRowIndex}]: invalid side, timestamp, USD, maker, or transaction`); continue; }
    const key = rowKey(r, platform);
    if (seen.has(key)) { duplicates++; continue; }
    seen.add(key);
    const numOrNull = (v: unknown) => {
      if (v === undefined || v === null || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    rows.push({
      ts, side, maker, usd, tx,
      pool: typeof r.f === "string" ? r.f : "",
      dex: typeof r.en === "string" ? r.en : "",
      t0a: typeof r.t0a === "string" ? r.t0a : undefined,
      t1a: typeof r.t1a === "string" ? r.t1a : undefined,
      t0sym: typeof r.t0s === "string" ? r.t0s : undefined,
      t1sym: typeof r.t1s === "string" ? r.t1s : undefined,
      a0: numOrNull(r.a0),
      a1: numOrNull(r.a1),
      t0pu: numOrNull(r.t0pu),
      t1pu: numOrNull(r.t1pu),
      block: r.h == null ? null : String(r.h),
      sourceRowIndex,
      logIndex: r.lgid == null ? null : String(r.lgid),
    });
  }
  return { rows, rejected, duplicates, reasons };
}

export function parseLiquidityEvents(raw: unknown, platform: string, nowMs = Date.now()): ParsedRows<LiqEvent> {
  const source = raw && typeof raw === "object" ? (raw as { lcs?: unknown }).lcs : undefined;
  const list = Array.isArray(source) ? source : [];
  const rows: LiqEvent[] = [];
  const seen = new Set<string>();
  const reasons: string[] = [];
  let rejected = 0;
  let duplicates = 0;
  for (const [sourceRowIndex, candidate] of list.entries()) {
    if (!candidate || typeof candidate !== "object") { rejected++; reasons.push(`liquidity[${sourceRowIndex}]: row is not an object`); continue; }
    const r = candidate as Record<string, unknown>;
    const kind = r.tp === "add" || r.tp === "remove" ? r.tp : null;
    const ts = timestampMs(r.ts, nowMs);
    const usd = finiteNonNegative(r.tu);
    const maker = typeof r.m === "string" ? r.m.trim() : "";
    const pool = typeof r.f === "string" ? r.f.trim() : "";
    const tx = typeof r.tx === "string" ? r.tx.trim() : typeof r.h === "string" ? r.h.trim() : "";
    if (!kind || ts === null || usd === null || !maker || !pool) { rejected++; reasons.push(`liquidity[${sourceRowIndex}]: invalid kind, timestamp, USD, maker, or pool`); continue; }
    const key = rowKey(r, platform);
    if (seen.has(key)) { duplicates++; continue; }
    seen.add(key);
    const numOrNull = (v: unknown) => {
      if (v === undefined || v === null || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    rows.push({
      ts, kind, usd, pool, maker,
      tx: typeof r.txn === "string" ? r.txn : typeof r.tx === "string" ? r.tx : undefined,
      dex: typeof r.en === "string" ? r.en : undefined,
      t0sym: typeof r.t0s === "string" ? r.t0s : undefined,
      t1sym: typeof r.t1s === "string" ? r.t1s : undefined,
      a0: numOrNull(r.a0),
      a1: numOrNull(r.a1),
      sourceRowIndex,
      logIndex: r.lgid == null ? null : String(r.lgid),
    });
  }
  return { rows, rejected, duplicates, reasons };
}

export async function getSwaps(client: DexClient, ref: TokenRef, limit = 100) {
  const r = await client.get<{ swaps?: Record<string, unknown>[] }>("/v1/dex/tokens/transactions", {
    platform: ref.platform,
    address: ref.address,
    limit,
  });
  const parsed = parseSwaps(r.data, ref.platform);
  return { swaps: parsed.rows, rejected: parsed.rejected, duplicates: parsed.duplicates, reasons: parsed.reasons, receipt: r.receipt };
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
  const parsed = parseLiquidityEvents(r.data, ref.platform);
  return { events: parsed.rows, rejected: parsed.rejected, duplicates: parsed.duplicates, reasons: parsed.reasons, receipt: r.receipt };
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

export interface MarketContextResult {
  context: MarketContext;
  receipts: import("./cmc-client").Receipt[];
  failures: { endpoint: string; error: string }[];
}

export async function getMarketContext(client: DexClient): Promise<MarketContextResult> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400_000).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  const receipts: MarketContextResult["receipts"] = [];
  const failures: MarketContextResult["failures"] = [];
  const call = async <T>(endpoint: string, params?: Record<string, unknown>): Promise<T | null> => {
    try {
      const r = await client.get<T>(endpoint, params);
      receipts.push(r.receipt);
      return r.data;
    } catch (e) {
      failures.push({ endpoint, error: e instanceof Error ? e.message : String(e) });
      return null;
    }
  };
  const [latest, hist, fg] = await Promise.all([
    call<Record<string, unknown>>("/v1/global-metrics/quotes/latest"),
    call<{ quotes?: { btc_dominance?: number }[] }>("/v1/global-metrics/quotes/historical", {
      time_start: weekAgo,
      time_end: today,
      interval: "daily",
    }),
    call<{ value?: number; value_classification?: string; update_time?: string }>("/v3/fear-and-greed/latest"),
  ]);
  const numOrNull = (v: unknown) => {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const usd = ((latest as Record<string, unknown> | null)?.quote as Record<string, unknown> | undefined)?.USD as Record<string, unknown> | undefined;
  const btcDom = numOrNull((latest as Record<string, unknown> | null)?.btc_dominance);
  const histFirst = hist?.quotes?.[0]?.btc_dominance ?? null;
  return {
    context: {
      btcDom,
      btcDomDelta7d: btcDom !== null && histFirst !== null ? btcDom - histFirst : null,
      fearGreed: numOrNull(fg?.value),
      fearGreedClass: fg?.value_classification ?? null,
      ethDom: numOrNull((latest as Record<string, unknown> | null)?.eth_dominance),
      btcDom24hChange: numOrNull((latest as Record<string, unknown> | null)?.btc_dominance_24h_percentage_change),
      totalMcapUsd: numOrNull(usd?.total_market_cap),
      totalVol24hUsd: numOrNull(usd?.total_volume_24h),
      defiVol24hUsd: numOrNull(usd?.defi_volume_24h),
      defiMcapUsd: numOrNull(usd?.defi_market_cap),
      defi24hChange: numOrNull(usd?.defi_24h_percentage_change),
      stableVol24hUsd: numOrNull(usd?.stablecoin_volume_24h),
      stableMcapUsd: numOrNull(usd?.stablecoin_market_cap),
      activeCryptos: numOrNull((latest as Record<string, unknown> | null)?.active_cryptocurrencies),
      activeExchanges: numOrNull((latest as Record<string, unknown> | null)?.active_exchanges),
      updatedAt: typeof (latest as Record<string, unknown> | null)?.last_updated === "string" ? String((latest as Record<string, unknown>).last_updated) : null,
    },
    receipts,
    failures,
  };
}
