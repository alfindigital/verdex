import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { jevCrossExamine, jevRoute, agreement } from "@/lib/jev";

const okJson = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) }) as Response;

const metrics = { swapCount: 100, uniqueMakers: 3, top5MakerShare: 0.9, thirdPartySells: 0 };

describe("jevCrossExamine", () => {
  beforeEach(() => vi.stubEnv("TYPESAFE_API_KEY", "apikey_test"));
  afterEach(() => vi.unstubAllEnvs());

  it("returns per-dimension risky probabilities from noul answers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        okJson({
          answers: {
            safety: { noul: 0.95 },
            flow: { noul: 0.9 },
            liquidity: { noul: 0.4 },
            pump: { noul: 0.8 },
          },
          usage: { input_tokens: 300, output_tokens: 20 },
        }),
      ),
    );
    const r = await jevCrossExamine(metrics);
    expect(r.available).toBe(true);
    expect(r.dims).toEqual({ SAFETY: 0.95, FLOW: 0.9, LIQUIDITY: 0.4, PUMP: 0.8 });
    expect(r.riskyProb).toBeCloseTo((0.95 + 0.9 + 0.4 + 0.8) / 4);
    expect(r.tokensUsed).toBe(300);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.typesafe.ai/v1/systemone",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("sends four independent noul questions in one call", async () => {
    const spy = vi.fn(async (_u?: unknown, _init?: unknown) =>
      okJson({ answers: { safety: { noul: 0.5 }, flow: { noul: 0.5 }, liquidity: { noul: 0.5 }, pump: { noul: 0.5 } } }),
    );
    vi.stubGlobal("fetch", spy);
    await jevCrossExamine(metrics);
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string);
    expect(Object.keys(body.questions).sort()).toEqual(["flow", "liquidity", "pump", "safety"]);
    for (const q of Object.values(body.questions) as { type: string }[]) {
      expect(q.type).toBe("noul");
    }
  });

  it("partial answers → riskyProb is mean of present dims", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => okJson({ answers: { safety: { noul: 0.9 }, flow: { noul: 0.3 } } })),
    );
    const r = await jevCrossExamine(metrics);
    expect(r.available).toBe(true);
    expect(r.riskyProb).toBeCloseTo(0.6);
    expect(r.dims?.PUMP).toBeNull();
  });

  it("unavailable when no key", async () => {
    vi.stubEnv("TYPESAFE_API_KEY", "");
    const r = await jevCrossExamine(metrics);
    expect(r.available).toBe(false);
  });

  it("rotates across keys — succeeds on second key after first fails", async () => {
    vi.stubEnv("TYPESAFE_API_KEY", "k1,k2,k3");
    const spy = vi
      .fn(async (_u?: unknown, _init?: unknown) => ({} as Response))
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}), text: async () => "err" } as Response)
      .mockResolvedValueOnce(
        okJson({ answers: { safety: { noul: 0.2 }, flow: { noul: 0.2 }, liquidity: { noul: 0.2 }, pump: { noul: 0.2 } } }),
      );
    vi.stubGlobal("fetch", spy);
    const r = await jevCrossExamine(metrics);
    expect(r.available).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);
    const auth2 = ((spy.mock.calls[1][1] as RequestInit).headers as Record<string, string>).authorization;
    expect(auth2).toBe("Bearer k2");
  });

  it("unavailable when all keys fail — never throws", async () => {
    vi.stubEnv("TYPESAFE_API_KEY", "k1,k2");
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}), text: async () => "e" }) as Response));
    const r = await jevCrossExamine(metrics);
    expect(r.available).toBe(false);
    expect(r.error).toContain("500");
  });

  it("unavailable on malformed body — no noul values", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okJson({ answers: {} })));
    const r = await jevCrossExamine(metrics);
    expect(r.available).toBe(false);
  });
});

describe("jevRoute", () => {
  beforeEach(() => vi.stubEnv("TYPESAFE_API_KEY", "apikey_test"));
  afterEach(() => vi.unstubAllEnvs());

  it("picks a candidate token via choice response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => okJson({ answers: { pick: { choice: "PEPE on Solana" } } })));
    const r = await jevRoute("is pepe safe", ["PEPE on Solana", "PEPE on BSC"]);
    expect(r.available).toBe(true);
    expect(r.choice).toBe("PEPE on Solana");
  });

  it("unavailable without key", async () => {
    vi.stubEnv("TYPESAFE_API_KEY", "");
    expect((await jevRoute("x", ["a", "b"])).available).toBe(false);
  });
});

describe("agreement (per-dimension)", () => {
  const subs = (levels: Record<string, string>) =>
    Object.entries(levels).map(([dim, level]) => ({ dim, level }));

  it("consensus when ≥3 dims agree with rules sign", () => {
    const jev = {
      available: true,
      riskyProb: 0.7,
      dims: { SAFETY: 0.9, FLOW: 0.8, LIQUIDITY: 0.6, PUMP: 0.2 },
    };
    expect(agreement("JANGAN", jev, subs({ SAFETY: "DANGER", FLOW: "WARN", LIQUIDITY: "WARN", PUMP: "CLEAN" }))).toBe(
      "consensus",
    );
  });

  it("contested when <3 dims agree", () => {
    const jev = {
      available: true,
      riskyProb: 0.4,
      dims: { SAFETY: 0.1, FLOW: 0.2, LIQUIDITY: 0.3, PUMP: 0.1 },
    };
    expect(agreement("JANGAN", jev, subs({ SAFETY: "DANGER", FLOW: "WARN", LIQUIDITY: "WARN", PUMP: "CLEAN" }))).toBe(
      "contested",
    );
  });

  it("INSUFFICIENT dims are excluded — falls back to band when <3 comparable", () => {
    const jev = { available: true, riskyProb: 0.9, dims: { SAFETY: 0.9, FLOW: null } };
    // only 2 comparable dims → falls through to riskyProb band → consensus (JANGAN + high prob)
    expect(
      agreement("JANGAN", jev, subs({ SAFETY: "DANGER", FLOW: "INSUFFICIENT", LIQUIDITY: "INSUFFICIENT", PUMP: "INSUFFICIENT" })),
    ).toBe("consensus");
  });

  it("aggregate contradiction beats dim-consensus — contested, never hidden", () => {
    // AAVE case: dims match 3/4 → dim-level consensus, but riskyProb 0.24
    // vs JANGAN verdict is a real fight — badge must show contested.
    const jev = {
      available: true,
      riskyProb: 0.2425,
      dims: { SAFETY: 0.58, FLOW: 0.16, LIQUIDITY: 0.09, PUMP: 0.14 },
    };
    expect(
      agreement("JANGAN", jev, subs({ SAFETY: "WARN", FLOW: "DANGER", LIQUIDITY: "CLEAN", PUMP: "CLEAN" })),
    ).toBe("contested");
  });

  it("legacy band still works without dims/subs", () => {
    expect(agreement("JANGAN", { available: true, riskyProb: 0.91 })).toBe("consensus");
    expect(agreement("LAYAK", { available: true, riskyProb: 0.1 })).toBe("consensus");
    expect(agreement("LAYAK", { available: true, riskyProb: 0.9 })).toBe("contested");
    expect(agreement("RAWAN", { available: true, riskyProb: 0.5 })).toBe("lean");
    expect(agreement("JANGAN", { available: false, riskyProb: null })).toBe("unavailable");
  });
});
