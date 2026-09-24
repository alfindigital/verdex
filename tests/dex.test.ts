import { describe, it, expect } from "vitest";
import { normSwap, normPool, normLiqEvent, normSecurity, isAddress, resolveToken, TokenNotFoundError, type DexClient } from "@/lib/dex";

// fixtures = real CMC response shapes probed 24 Sep 2026 (trimmed)
const RAW_SWAP = { ts: "1790235901000", tp: "sell", ma: "GHHktoepDkShfcqYDVyVTJBx3ja71oWH7QBzsxYN71U9", v: 218.016, tx: "rqfcFoK", f: "pAMMBay", en: "PumpSwap" };
const RAW_POOL = { addr: "EvAFQ", v24: "2218.43", exn: "PumpSwap", liqUsd: "32932.62", fa: "pAMMBay", t0: { sym: "NULL" }, t1: { sym: "wSOL" } };
const RAW_LC = { ts: "1789712342000", tp: "add", en: "PumpSwap", f: "pAMMBay", tu: 190.08, m: "6Bc3H" };
const RAW_SEC = {
  securityLevel: "safe",
  extra: { isFlaggedByVendor: false, buyTax: "0", sellTax: "0" },
  securityItems: [
    { riskCode: "honeypot", isHit: false, riskyLevel: "g" },
    { riskCode: "rug_pull", isHit: true, riskyLevel: "r" },
  ],
};

describe("normalizers", () => {
  it("maps raw swap fields", () => {
    const s = normSwap(RAW_SWAP);
    expect(s).toMatchObject({ side: "sell", maker: "GHHktoepDkShfcqYDVyVTJBx3ja71oWH7QBzsxYN71U9", usd: 218.016, dex: "PumpSwap" });
    expect(s.ts).toBe(1790235901000);
  });
  it("maps raw pool fields", () => {
    const p = normPool(RAW_POOL);
    expect(p).toMatchObject({ dex: "PumpSwap", liqUsd: 32932.62, vol24h: 2218.43, t0sym: "NULL", t1sym: "wSOL" });
  });
  it("maps liquidity events; remove detection", () => {
    expect(normLiqEvent(RAW_LC)).toMatchObject({ kind: "add", usd: 190.08, pool: "pAMMBay", maker: "6Bc3H" });
    expect(normLiqEvent({ ...RAW_LC, tp: "remove" }).kind).toBe("remove");
  });
  it("maps security report; keeps hit flags + taxes", () => {
    const s = normSecurity(RAW_SEC);
    expect(s.level).toBe("safe");
    expect(s.items.find((i) => i.code === "rug_pull")?.hit).toBe(true);
    expect(s.buyTax).toBe(0);
    expect(s.sellTax).toBe(0);
    expect(s.flaggedByVendor).toBe(false);
  });
});

describe("isAddress", () => {
  it("detects EVM + Solana addresses, rejects tickers", () => {
    expect(isAddress("0x55d398326f99059fF775485246999027B3197955")).toBe(true);
    expect(isAddress("So11111111111111111111111111111111111111112")).toBe(true);
    expect(isAddress("PEPE")).toBe(false);
    expect(isAddress("$BONK")).toBe(false);
  });
});

describe("resolveToken", () => {
  const stubClient = (tks: Record<string, unknown>[]): DexClient => ({
    get: async <T,>() => ({ data: { tks } as T, receipt: {} as never }),
  });

  it("resolves ticker → top result", async () => {
    const c = stubClient([{ plt: "Solana", addr: "SoX", n: "Foo", s: "FOO" }]);
    const t = await resolveToken(c, "FOO");
    expect(t).toMatchObject({ platform: "Solana", address: "SoX", symbol: "FOO" });
  });
  it("resolves address → exact addr match, honoring platform hint", async () => {
    const c = stubClient([
      { plt: "BSC", addr: "0xAaA", n: "X", s: "X" },
      { plt: "Base", addr: "0xaaa", n: "X", s: "X" },
    ]);
    const t = await resolveToken(c, "0xaaa", "Base");
    expect(t.platform).toBe("Base");
  });
  it("throws TokenNotFoundError on empty search", async () => {
    const c = stubClient([]);
    await expect(resolveToken(c, "NOPE")).rejects.toBeInstanceOf(TokenNotFoundError);
  });
  it("strips $ prefix", async () => {
    let q = "";
    const c: DexClient = { get: async <T,>(_e: string, p?: Record<string, unknown>) => { q = String(p?.q); return { data: { tks: [] } as T, receipt: {} as never }; } };
    await resolveToken(c, "$FOO").catch(() => {});
    expect(q).toBe("FOO");
  });
});
