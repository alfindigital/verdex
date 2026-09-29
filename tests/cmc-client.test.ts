import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { createCmcClient, CmcError } from "@/lib/cmc-client";

const API_KEY = "test-secret-key-abc123";

function fakeFetchOk(payload: unknown = { hello: 1 }, credits = 3) {
  const calls: RequestInit[] = [];
  const fn = async (_url: string, init?: RequestInit) => {
    calls.push(init ?? {});
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: payload,
        status: { error_code: 0, credit_count: credits, timestamp: "2026-09-25T00:00:00Z" },
      }),
      text: async () => JSON.stringify({ data: payload, status: { error_code: 0, credit_count: credits } }),
    } as Response;
  };
  return { fn: fn as typeof fetch, calls };
}

describe("cmc-client", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "verdex-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("returns data + receipt with endpoint/params/credits/sha256", async () => {
    const { fn } = fakeFetchOk({ price: 123 });
    const c = createCmcClient({ apiKey: API_KEY, logPath: path.join(dir, "api_log.jsonl"), cacheDir: path.join(dir, "cache"), fetchImpl: fn });
    const r = await c.get<{ price: number }>("/v1/dex/token", { platform: "BSC", address: "0xabc" });
    expect(r.data.price).toBe(123);
    expect(r.receipt.endpoint).toBe("/v1/dex/token");
    expect(r.receipt.params).toEqual({ platform: "BSC", address: "0xabc" });
    expect(r.receipt.credits).toBe(3);
    expect(r.receipt.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(r.receipt.ts).toBeTruthy();
  });

  it("sends the key in the auth header but never writes it to receipt or log", async () => {
    const { fn, calls } = fakeFetchOk();
    const logPath = path.join(dir, "api_log.jsonl");
    const c = createCmcClient({ apiKey: API_KEY, logPath, cacheDir: path.join(dir, "cache"), fetchImpl: fn });
    await c.get("/v1/test", { a: 1 });
    expect((calls[0].headers as Record<string, string>)["X-CMC_PRO_API_KEY"]).toBe(API_KEY);
    const log = readFileSync(logPath, "utf8");
    expect(log).not.toContain(API_KEY);
    expect(log).toContain("/v1/test");
  });

  it("serves cache hit without a second fetch", async () => {
    let n = 0;
    const counting = async (u: string, i?: RequestInit) => {
      n++;
      const { fn } = fakeFetchOk();
      return fn(u, i);
    };
    const c = createCmcClient({ apiKey: API_KEY, logPath: path.join(dir, "l.jsonl"), cacheDir: path.join(dir, "cache"), fetchImpl: counting as typeof fetch });
    await c.get("/v1/x", { q: 1 }, { ttlMs: 60_000 });
    const r2 = await c.get("/v1/x", { q: 1 }, { ttlMs: 60_000 });
    expect(n).toBe(1);
    expect(r2.receipt.cached).toBe(true);
  });

  it("throws CmcError on nonzero error_code", async () => {
    const fn = async () =>
      ({
        ok: true,
        status: 200,
        json: async () => ({ status: { error_code: 1006, error_message: "plan restricted" } }),
        text: async () => JSON.stringify({ status: { error_code: 1006, error_message: "plan restricted" } }),
      }) as Response;
    const c = createCmcClient({ apiKey: API_KEY, logPath: path.join(dir, "l.jsonl"), cacheDir: dir, fetchImpl: fn as typeof fetch });
    await expect(c.get("/v1/locked")).rejects.toBeInstanceOf(CmcError);
    await expect(c.get("/v1/locked")).rejects.toMatchObject({ code: 1006 });
  });

  it("throws on HTTP error status", async () => {
    const fn = async () => ({ ok: false, status: 403, json: async () => ({}), text: async () => "forbidden" }) as Response;
    const c = createCmcClient({ apiKey: API_KEY, logPath: path.join(dir, "l.jsonl"), cacheDir: dir, fetchImpl: fn as typeof fetch });
    await expect(c.get("/v1/x")).rejects.toThrow();
  });

  it("uses a 6 second attempt deadline and at most one transport retry", async () => {
    const timeouts: number[] = [];
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout").mockImplementation((ms: number) => {
      timeouts.push(ms);
      return new AbortController().signal;
    });
    let calls = 0;
    const fn = async () => {
      calls++;
      return { ok: false, status: 503, text: async () => "upstream unavailable" } as Response;
    };
    const c = createCmcClient({ apiKey: API_KEY, logPath: path.join(dir, "l.jsonl"), cacheDir: dir, fetchImpl: fn as typeof fetch });
    await expect(c.get("/v1/slow")).rejects.toBeInstanceOf(CmcError);
    expect(calls).toBe(2);
    expect(timeouts.every((ms) => ms <= 6_000)).toBe(true);
    timeoutSpy.mockRestore();
  });

  it("appends one jsonl line per live call", async () => {
    const { fn } = fakeFetchOk();
    const logPath = path.join(dir, "l.jsonl");
    const c = createCmcClient({ apiKey: API_KEY, logPath, cacheDir: dir, fetchImpl: fn });
    await c.get("/v1/a");
    await c.get("/v1/b");
    const lines = readFileSync(logPath, "utf8").trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]).endpoint).toBe("/v1/a");
  });

  it("falls back to secondary key when primary key hits 429 rate limit", async () => {
    const FALLBACK_KEY = "fallback-key-xyz789";
    const calls: RequestInit[] = [];
    const fn = async (_url: string, init?: RequestInit) => {
      calls.push(init ?? {});
      const key = (init?.headers as Record<string, string>)["X-CMC_PRO_API_KEY"];
      if (key === API_KEY) {
        return {
          ok: false,
          status: 429,
          text: async () => JSON.stringify({ status: { error_code: 1008, error_message: "Rate limit" } }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ data: { price: 999 }, status: { error_code: 0, credit_count: 1 } }),
      } as Response;
    };

    const c = createCmcClient({
      apiKey: API_KEY,
      fallbackApiKey: FALLBACK_KEY,
      logPath: path.join(dir, "l.jsonl"),
      cacheDir: dir,
      fetchImpl: fn as typeof fetch,
    });

    const res = await c.get<{ price: number }>("/v1/price");
    expect(res.data.price).toBe(999);
    expect(calls).toHaveLength(2);
    expect((calls[0].headers as Record<string, string>)["X-CMC_PRO_API_KEY"]).toBe(API_KEY);
    expect((calls[1].headers as Record<string, string>)["X-CMC_PRO_API_KEY"]).toBe(FALLBACK_KEY);
  });

  it("falls back to secondary key when primary key returns envelope error 1008 (credit limit reached)", async () => {
    const FALLBACK_KEY = "fallback-key-xyz789";
    const calls: RequestInit[] = [];
    const fn = async (_url: string, init?: RequestInit) => {
      calls.push(init ?? {});
      const key = (init?.headers as Record<string, string>)["X-CMC_PRO_API_KEY"];
      if (key === API_KEY) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ status: { error_code: 1008, error_message: "Credit limit reached" } }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ data: { ok: true }, status: { error_code: 0, credit_count: 1 } }),
      } as Response;
    };

    const c = createCmcClient({
      apiKeys: [API_KEY, FALLBACK_KEY],
      logPath: path.join(dir, "l.jsonl"),
      cacheDir: dir,
      fetchImpl: fn as typeof fetch,
    });

    const res = await c.get<{ ok: boolean }>("/v1/check");
    expect(res.data.ok).toBe(true);
    expect(calls).toHaveLength(2);
    expect((calls[0].headers as Record<string, string>)["X-CMC_PRO_API_KEY"]).toBe(API_KEY);
    expect((calls[1].headers as Record<string, string>)["X-CMC_PRO_API_KEY"]).toBe(FALLBACK_KEY);
  });

  it("falls back to secondary key when primary key /v1/key/info reports low credits", async () => {
    const FALLBACK_KEY = "fallback-key-xyz789";
    const calls: RequestInit[] = [];
    const fn = async (_url: string, init?: RequestInit) => {
      calls.push(init ?? {});
      const key = (init?.headers as Record<string, string>)["X-CMC_PRO_API_KEY"];
      if (key === API_KEY) {
        return {
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              data: { usage: { current_month: { credits_left: 250 } } },
              status: { error_code: 0, credit_count: 1 },
            }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            data: { usage: { current_month: { credits_left: 15000 } } },
            status: { error_code: 0, credit_count: 1 },
          }),
      } as Response;
    };

    const c = createCmcClient({
      apiKey: `${API_KEY},${FALLBACK_KEY}`,
      logPath: path.join(dir, "l.jsonl"),
      cacheDir: dir,
      quotaFloor: 1000,
      fetchImpl: fn as typeof fetch,
    });

    const res = await c.get<{ usage: { current_month: { credits_left: number } } }>("/v1/key/info");
    expect(res.data.usage.current_month.credits_left).toBe(15000);
    expect((calls[0].headers as Record<string, string>)["X-CMC_PRO_API_KEY"]).toBe(API_KEY);
    expect((calls[1].headers as Record<string, string>)["X-CMC_PRO_API_KEY"]).toBe(FALLBACK_KEY);
  });
});

