// SSR render tests for VerdictCard — mechanical guard against the classes of
// bugs the review caught: boolean fields, null metrics, dead thresholds.
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VerdictCard, type VerdictRecord } from "../src/components/verdict-card";

const floki = JSON.parse(
  readFileSync(join(process.cwd(), "snapshots", "e2c087a9cc2b.json"), "utf8"),
) as VerdictRecord;

const render = (v: VerdictRecord) => renderToStaticMarkup(h(VerdictCard, { v }));

describe("VerdictCard render", () => {
  it("renders stamp, gauge, ledger, falsifier and receipts from a real snapshot", () => {
    const html = render(floki);
    expect(html).toContain("ENTRY-WORTHY");
    expect(html).toContain('aria-label="score 85/100"');
    expect(html).toContain("SAFETY");
    expect(html).toContain("thresholds");
    expect(html).toContain("Falsifier");
    expect(html).toContain("receipts");
  });

  it("renders vendor flag YES when flaggedByVendor is boolean true", () => {
    const v: VerdictRecord = {
      ...floki,
      metrics: { ...floki.metrics, safety: { ...floki.metrics.safety, flaggedByVendor: true } },
    };
    const html = render(v);
    expect(html).toContain("vendor flag");
    expect(html).toContain("YES");
  });

  it("renders em-dash, not fabricated zeros, when pump metrics are null", () => {
    const v: VerdictRecord = {
      ...floki,
      metrics: {
        ...floki.metrics,
        pump: { volMcapRatio: null, makersPer100kVol: null, priceChange24h: null },
      },
    };
    const html = render(v);
    expect(html).toContain("—");
    expect(html).not.toContain("+0.00%");
    expect(html).not.toContain("VOL/MCAP</span>\n          <span class=\"\">0.00%");
  });

  it("renders empty SplitBar as neutral track when buy+sell = 0", () => {
    const v: VerdictRecord = {
      ...floki,
      metrics: {
        ...floki.metrics,
        flow: { ...floki.metrics.flow, buyUsd: 0, sellUsd: 0, buyCount: 0, sellCount: 0 },
      },
    };
    const html = render(v);
    expect(html).toContain('aria-label="no data"');
  });
});
