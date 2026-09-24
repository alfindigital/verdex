import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analyze, type AnalyzeDeps } from "@/engine/analyze";
import type { DexClient } from "@/lib/dex";

const receipt = (endpoint: string) => ({ endpoint, params: {}, ts: "t", credits: 1, sha256: "x", cached: false });

const fakeSearch = (tks: Record<string, unknown>[]) => ({
  data: { tks },
  receipt: receipt("/v1/dex/search"),
});

const SOL_TOKEN = { plt: "Solana", addr: "SoLAddr1111111111111111111111111111111", n: "Pepe", s: "PEPE", mc: 5_000_000, v24h: 200_000, pc24h: 12, liq: 300_000 };
const BSC_TOKEN = { plt: "BSC", addr: "0x00000000000000000000000000000000000000aa", n: "Pepe", s: "PEPE", mc: 1_000_000, v24h: 10_000, pc24h: -3, liq: 50_000 };

function mkClient(handlers: Record<string, (params: Record<string, unknown>) => unknown>): DexClient {
  return {
    get: vi.fn(async (endpoint: string, params: Record<string, unknown> = {}) => {
      const h = handlers[endpoint];
      if (!h) throw new Error(`unmocked ${endpoint}`);
      return { data: h(params), receipt: receipt(endpoint) };
    }),
  } as DexClient;
}

const healthyHandlers: Record<string, (p: Record<string, unknown>) => unknown> = {
  "/v1/dex/search": () => fakeSearch([SOL_TOKEN]).data,
  "/v1/dex/tokens/transactions": () => ({
    swaps: Array.from({ length: 120 }, (_, i) => ({
      ts: 1700000000 + i,
      tp: i % 3 === 0 ? "sell" : "buy",
      ma: `maker${i}`,
      v: 50 + (i % 10),
      tx: `tx${i}`,
      f: "pool1",
      en: "raydium",
    })),
  }),
  "/v1/dex/token/pools": () => [{ fa: "pool1", exn: "raydium", liqUsd: 300_000, v24: 200_000, t0: { sym: "PEPE" }, t1: { sym: "SOL" } }],
  "/v1/dex/liquidity-change/list": () => ({ lcs: [{ ts: 1, tp: "add", tu: 5000, f: "pool1", m: "lp1" }] }),
  "/v1/dex/security/detail": () => [{ securityLevel: "safe", securityItems: [], extra: {} }],
};

const deps = (): AnalyzeDeps => ({ jev: async () => ({ available: false, riskyProb: null }), narrate: async () => undefined, now: () => 1700000000000 });

describe("analyze", () => {
  beforeEach(() => vi.stubEnv("TYPESAFE_API_KEY", ""));
  afterEach(() => vi.unstubAllEnvs());

  it("address input → full verdict with receipts from every endpoint", async () => {
    const client = mkClient(healthyHandlers);
    const r = await analyze(client, { query: "SoLAddr1111111111111111111111111111111" }, deps());
    expect(r.kind).toBe("verdict");
    if (r.kind !== "verdict") return;
    expect(r.token.symbol).toBe("PEPE");
    expect(r.result.verdict).toBe("LAYAK");
    expect(r.receipts.map((x) => x.endpoint)).toContain("/v1/dex/tokens/transactions");
    expect(r.jev.available).toBe(false);
  });

  it("name input with >1 candidate → ambiguous, never silent pick", async () => {
    const client = mkClient({
      ...healthyHandlers,
      "/v1/dex/search": () => fakeSearch([SOL_TOKEN, BSC_TOKEN]).data,
    });
    const r = await analyze(client, { query: "PEPE" }, deps());
    expect(r.kind).toBe("ambiguous");
    if (r.kind !== "ambiguous") return;
    expect(r.candidates).toHaveLength(2);
  });

  it("name input with 1 candidate resolves", async () => {
    const client = mkClient(healthyHandlers);
    const r = await analyze(client, { query: "PEPE" }, deps());
    expect(r.kind).toBe("verdict");
  });

  it("platform hint disambiguates", async () => {
    const client = mkClient({
      ...healthyHandlers,
      "/v1/dex/search": () => fakeSearch([SOL_TOKEN, BSC_TOKEN]).data,
    });
    const r = await analyze(client, { query: "PEPE", platform: "Solana" }, deps());
    expect(r.kind).toBe("verdict");
    if (r.kind === "verdict") expect(r.token.platform).toBe("Solana");
  });

  it("unknown name → notFound", async () => {
    const client = mkClient({ "/v1/dex/search": () => fakeSearch([]).data });
    const r = await analyze(client, { query: "NOPECOIN" }, deps());
    expect(r.kind).toBe("notFound");
  });

  it("endpoint failure on non-critical call → INSUFFICIENT, not crash", async () => {
    const client = mkClient({
      ...healthyHandlers,
      "/v1/dex/security/detail": () => {
        throw new Error("cmc 500");
      },
    });
    const r = await analyze(client, { query: "PEPE" }, deps());
    expect(r.kind).toBe("verdict");
    if (r.kind === "verdict") expect(r.result.verdict).toBe("BELUM_CUKUP_BUKTI");
  });
});
