import { describe, expect, it, vi } from "vitest";
import { createLiveGuard } from "../src/lib/live-guard";

const quotaClient = (credits_left: number | null | Error) => ({
  get: vi.fn(async () => {
    if (credits_left instanceof Error) throw credits_left;
    return { data: { usage: { current_month: { credits_left } } } };
  }),
});

describe("live-guard", () => {
  it("per-IP cap blocks after PER_IP requests in a day", () => {
    const g = createLiveGuard({ perIpCap: 3, globalCap: 100 });
    expect(g.allowIp("1.1.1.1")).toBe(true);
    expect(g.allowIp("1.1.1.1")).toBe(true);
    expect(g.allowIp("1.1.1.1")).toBe(true);
    expect(g.allowIp("1.1.1.1")).toBe(false);
    expect(g.allowIp("2.2.2.2")).toBe(true); // other IPs unaffected
  });

  it("global cap blocks across all IPs", () => {
    const g = createLiveGuard({ perIpCap: 1000, globalCap: 5 });
    for (let i = 0; i < 5; i++) expect(g.allowIp(`10.0.0.${i}`)).toBe(true);
    expect(g.allowIp("10.0.0.9")).toBe(false); // 6th distinct IP → global ceiling
  });

  it("quotaOk: healthy balance allows, low balance blocks, probe error fails open", async () => {
    const g = createLiveGuard({ quotaFloor: 1000 });
    const ok = quotaClient(5000);
    expect(await g.quotaOk(ok)).toBe(true);
    expect(ok.get).toHaveBeenCalledTimes(1);
    expect(await g.quotaOk(ok)).toBe(true); // cached — no second probe
    expect(ok.get).toHaveBeenCalledTimes(1);

    const g2 = createLiveGuard({ quotaFloor: 1000 });
    expect(await g2.quotaOk(quotaClient(500))).toBe(false); // below floor → block

    const g3 = createLiveGuard({ quotaFloor: 1000 });
    expect(await g3.quotaOk(quotaClient(new Error("key/info down")))).toBe(true); // fail open
    expect(await g3.quotaOk(quotaClient(null))).toBe(true); // unknown balance → allow
  });
});
