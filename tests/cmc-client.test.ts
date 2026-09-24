import { describe, it, expect, beforeEach, afterEach } from "vitest";
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
});
