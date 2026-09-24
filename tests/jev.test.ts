import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { jevSecondOpinion, jevRoute, agreement } from "@/lib/jev";

const okJson = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) }) as Response;

describe("jevSecondOpinion", () => {
  beforeEach(() => vi.stubEnv("TYPESAFE_API_KEY", "apikey_test"));
  afterEach(() => vi.unstubAllEnvs());

  it("returns risky probability from noul response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okJson({ output: { risky: { noul: 0.91 } }, usage: { input_tokens: 300, output_tokens: 20 } })));
    const r = await jevSecondOpinion({ swapCount: 100, uniqueMakers: 3, top5MakerShare: 0.9, thirdPartySells: 0 });
    expect(r.available).toBe(true);
    expect(r.riskyProb).toBeCloseTo(0.91);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.typesafe.ai/v1/systemone",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("unavailable when no key", async () => {
    vi.stubEnv("TYPESAFE_API_KEY", "");
    const r = await jevSecondOpinion({ swapCount: 10 });
    expect(r.available).toBe(false);
  });

  it("unavailable on http error — never throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}), text: async () => "err" }) as Response));
    const r = await jevSecondOpinion({ swapCount: 10 });
    expect(r.available).toBe(false);
  });

  it("unavailable on malformed body", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okJson({ output: {} })));
    const r = await jevSecondOpinion({ swapCount: 10 });
    expect(r.available).toBe(false);
  });
});

describe("jevRoute", () => {
  beforeEach(() => vi.stubEnv("TYPESAFE_API_KEY", "apikey_test"));
  afterEach(() => vi.unstubAllEnvs());

  it("picks a candidate token via choice response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okJson({ output: { pick: { choice: "PEPE on Solana" } } })));
    const r = await jevRoute("is pepe safe", ["PEPE on Solana", "PEPE on BSC"]);
    expect(r.available).toBe(true);
    expect(r.choice).toBe("PEPE on Solana");
  });

  it("unavailable without key", async () => {
    vi.stubEnv("TYPESAFE_API_KEY", "");
    expect((await jevRoute("x", ["a", "b"])).available).toBe(false);
  });
});

describe("agreement", () => {
  it("consensus when Jev risky-prob matches rules direction", () => {
    expect(agreement("JANGAN", 0.91)).toBe("consensus");
    expect(agreement("LAYAK", 0.1)).toBe("consensus");
  });
  it("contested on disagreement", () => {
    expect(agreement("LAYAK", 0.9)).toBe("contested");
    expect(agreement("JANGAN", 0.1)).toBe("contested");
  });
  it("lean on middle ground", () => {
    expect(agreement("RAWAN", 0.5)).toBe("lean");
  });
  it("unavailable passthrough", () => {
    expect(agreement("JANGAN", null)).toBe("unavailable");
  });
});
