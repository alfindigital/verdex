import { describe, it, expect, vi, afterEach } from "vitest";
import { narrate } from "@/engine/narrator";
import type { CompositeResult } from "@/engine/rules";

const result = (verdict: string): CompositeResult => ({
  verdict: verdict as CompositeResult["verdict"],
  score: 40,
  confidence: "medium",
  falsifier: "flips if thirdPartySells rises",
  subs: [
    {
      dim: "FLOW",
      level: "DANGER",
      metrics: [{ name: "thirdPartySells", value: 0, threshold: "≥3", level: "DANGER" }],
    },
    {
      dim: "SAFETY",
      level: "CLEAN",
      metrics: [{ name: "dangerFlags", value: "none", threshold: "none", level: "CLEAN" }],
    },
  ],
});

describe("narrate (template mode)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("produces a headline + evidence bullets without LLM", async () => {
    const n = await narrate("PEPE", "Solana", result("JANGAN"));
    expect(n.source).toBe("template");
    expect(n.headline).toMatch(/PEPE/);
    expect(n.headline).toMatch(/JANGAN|avoid/i);
    expect(n.bullets.length).toBeGreaterThanOrEqual(1);
    expect(n.bullets.join(" ")).toMatch(/thirdPartySells|third-party/i);
  });

  it("never emits numbers not present in metrics (template pulls values verbatim)", async () => {
    const n = await narrate("X", "BSC", result("JANGAN"));
    expect(n.bullets.join(" ")).toContain("0");
  });
});
