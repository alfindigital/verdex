import { describe, expect, it } from "vitest";
import { parseScanBody, resolveScanMode } from "@/lib/scan-policy";

describe("scan policy", () => {
  it.each([
    [{}, "replay"],
    [{ VERDEX_V2: "1" }, "replay"],
    [{ VERDEX_LIVE: "1" }, "replay"],
    [{ VERDEX_V2: "1", VERDEX_LIVE: "1" }, "v2-live"],
  ])("resolves mode from both flags", (env, expected) => {
    expect(resolveScanMode(env)).toBe(expected);
  });

  it.each([
    [{ query: "" }, "query required"],
    [{ query: "x".repeat(129) }, "1..128"],
    [{ query: "ETH", pick: 0 }, "pick is no longer accepted"],
    [{ query: "ETH", selection: { platform: "Ethereum" } }, "selection must contain"],
    [{ query: "ETH", platform: 1 }, "platform must"],
    [{ query: "ETH", platform: "not-a-chain" }, "platform must"],
  ])("rejects invalid body %j", (body, message) => {
    const result = parseScanBody(body);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(message);
  });

  it("rejects a request body over the 4 KB route budget", () => {
    const result = parseScanBody({ query: "ETH", note: "x".repeat(4090) }, 4100);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("4096 bytes");
  });

  it("returns stable identity selection", () => {
    expect(parseScanBody({ query: "$ETH", selection: { platform: "Ethereum", address: "0xabc" } })).toEqual({
      ok: true,
      value: { query: "$ETH", platform: undefined, selection: { platform: "Ethereum", address: "0xabc" } },
    });
  });
});
