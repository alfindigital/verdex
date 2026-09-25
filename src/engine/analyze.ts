// Orchestrator: input → resolve → fetch → metrics → rules → Jev → narrate.
// Every endpoint failure degrades that dimension to INSUFFICIENT — a verdict
// is never blocked by one bad call, and failures are surfaced in the record.

import { createHash } from "crypto";
import type { Receipt } from "@/lib/cmc-client";
import {
  isAddress,
  resolveToken,
  searchTokenCandidates,
  getSwaps,
  getPools,
  getLiqEvents,
  getSecurity,
  getMarketContext,
  TokenNotFoundError,
  type DexClient,
  type TokenRef,
} from "@/lib/dex";
import { flowMetrics, liquidityMetrics, pumpMetrics, safetyMetrics, type FlowMetrics, type LiquidityMetrics, type PumpMetrics, type SafetyMetrics } from "@/engine/metrics";
import { composite, type CompositeResult } from "@/engine/rules";
import { jevSecondOpinion, agreement, type JevOpinion, type Agreement } from "@/lib/jev";
import { narrate, type Narration } from "@/engine/narrator";

export interface AnalyzeQuery {
  query: string;
  platform?: string;
  pick?: number; // index into candidates when caller already resolved ambiguity
}
export interface AnalyzeDeps {
  jev?: (metrics: Record<string, unknown>) => Promise<JevOpinion>;
  narrate?: (symbol: string, platform: string, r: CompositeResult) => Promise<Narration | undefined>;
  now?: () => number;
}
export interface FailedCall {
  endpoint: string;
  error: string;
}

export type AnalyzeResult =
  | { kind: "notFound"; query: string }
  | { kind: "ambiguous"; query: string; candidates: TokenRef[] }
  | {
      kind: "verdict";
      id: string;
      ts: string;
      token: TokenRef;
      metrics: { flow: FlowMetrics; liq: LiquidityMetrics; pump: PumpMetrics; safety: SafetyMetrics };
      result: CompositeResult;
      jev: JevOpinion;
      agreement: Agreement;
      narration: Narration | null;
      receipts: Receipt[];
      failures: FailedCall[];
    };

export async function analyze(client: DexClient, q: AnalyzeQuery, deps: AnalyzeDeps = {}): Promise<AnalyzeResult> {
  const now = deps.now ?? Date.now;
  const jev = deps.jev ?? jevSecondOpinion;
  const narrateFn = deps.narrate ?? narrate;
  const receipts: Receipt[] = [];
  const failures: FailedCall[] = [];

  // --- resolve ---
  let token: TokenRef;
  try {
    if (isAddress(q.query.trim())) {
      const r = await resolveToken(client, q.query, q.platform);
      token = r;
    } else {
      const { candidates, receipt } = await searchTokenCandidates(client, q.query);
      receipts.push(receipt);
      const plat = q.platform?.toLowerCase();
      const filtered = plat ? candidates.filter((c) => c.platform.toLowerCase() === plat) : candidates;
      if (filtered.length === 0) return { kind: "notFound", query: q.query };
      if (filtered.length > 1 && q.pick === undefined) return { kind: "ambiguous", query: q.query, candidates: filtered };
      token = filtered[q.pick ?? 0];
    }
  } catch (e) {
    if (e instanceof TokenNotFoundError) return { kind: "notFound", query: q.query };
    throw e;
  }

  // --- fetch (each independent, failure → null) ---
  const guarded = async <T>(endpoint: string, fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (e) {
      failures.push({ endpoint, error: e instanceof Error ? e.message : String(e) });
      return null;
    }
  };

  const [swapsR, poolsR, liqR, secR, ctx] = await Promise.all([
    guarded("/v1/dex/tokens/transactions", () => getSwaps(client, token)),
    guarded("/v1/dex/token/pools", () => getPools(client, token)),
    guarded("/v1/dex/liquidity-change/list", () => getLiqEvents(client, token)),
    guarded("/v1/dex/security/detail", () => getSecurity(client, token)),
    getMarketContext(client).catch(() => ({ btcDom: null, btcDomDelta7d: null, fearGreed: null })),
  ]);
  for (const r of [swapsR, poolsR, liqR, secR]) if (r?.receipt) receipts.push(r.receipt);

  const swaps = swapsR?.swaps ?? [];
  const pools = poolsR?.pools ?? [];
  const events = liqR?.events ?? [];
  const sec = secR === null ? null : (secR?.security ?? null);

  // --- metrics → rules ---
  const metrics = {
    flow: flowMetrics(swaps, pools.map((p) => p.address)),
    liq: liquidityMetrics(events, pools),
    pump: pumpMetrics(swaps, token),
    safety: safetyMetrics(sec),
  };
  const result = composite({
    safety: metrics.safety,
    flow: metrics.flow,
    liq: metrics.liq,
    pump: metrics.pump,
    context: { btcDomDelta7d: ctx.btcDomDelta7d, fearGreed: ctx.fearGreed },
  });

  // --- Jev cross-examination + narration (both optional, never blocking) ---
  const metricsSummary = {
    ...metrics.flow,
    ...metrics.liq,
    ...metrics.pump,
    securityLevel: metrics.safety.level,
    securityHits: metrics.safety.hits,
    rulesVerdict: result.verdict,
  };
  const [jevOp, narration] = await Promise.all([
    jev(metricsSummary).catch(() => ({ available: false, riskyProb: null }) as JevOpinion),
    narrateFn(token.symbol, token.platform, result).catch(() => undefined),
  ]);

  const id = createHash("sha256").update(`${token.address}:${now()}`).digest("hex").slice(0, 12);
  return {
    kind: "verdict",
    id,
    ts: new Date(now()).toISOString(),
    token,
    metrics,
    result,
    jev: jevOp,
    agreement: agreement(result.verdict, jevOp.riskyProb),
    narration: narration ?? null,
    receipts,
    failures,
  };
}
