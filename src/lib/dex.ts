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
}

export interface Swap {
  ts: number;
  side: "buy" | "sell";
  maker: string;
  usd: number;
  tx: string;
  pool: string;
  dex: string;
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
}

export interface LiqEvent {
  ts: number;
  kind: "add" | "remove";
  usd: number;
  pool: string;
  maker: string;
  sourceRowIndex?: number;
  logIndex?: string | null;
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
    sourceRowIndex: typeof raw.sourceRowIndex === "number" ? raw.sourceRowIndex : undefined,
    logIndex: raw.lgid == null ? null : String(raw.lgid),
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
  // `crt` = creator, `own` = owner (per CMC dex/token payload, probed).
  // Type-guard: a non-string field must degrade to null, not crash toLowerCase.
  const creator = typeof d.crt === "string" && d.crt.trim() ? d.crt.trim() : null;
  const owner = typeof d.own === "string" && d.own.trim() ? d.own.trim() : null;
  return { creator, owner, receipt: r.receipt };
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
    rows.push({ ts, side, maker, usd, tx, pool: typeof r.f === "string" ? r.f : "", dex: typeof r.en === "string" ? r.en : "", sourceRowIndex, logIndex: r.lgid == null ? null : String(r.lgid) });
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
    rows.push({ ts, kind, usd, pool, maker, sourceRowIndex, logIndex: r.lgid == null ? null : String(r.lgid) });
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
    call<{ btc_dominance?: number }>("/v1/global-metrics/quotes/latest"),
    call<{ quotes?: { btc_dominance?: number }[] }>("/v1/global-metrics/quotes/historical", {
      time_start: weekAgo,
      time_end: today,
      interval: "daily",
    }),
    call<{ value?: number }>("/v3/fear-and-greed/latest"),
  ]);
  const btcDom = latest?.btc_dominance ?? null;
  const histFirst = hist?.quotes?.[0]?.btc_dominance ?? null;
  return {
    context: {
      btcDom,
      btcDomDelta7d: btcDom !== null && histFirst !== null ? btcDom - histFirst : null,
      fearGreed: fg?.value ?? null,
    },
    receipts,
    failures,
  };
}
