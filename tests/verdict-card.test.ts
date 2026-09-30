import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "fs";
import { VerdictCard, type VerdictRecord } from "@/components/verdict-card";

// Static v1-shaped fixture (pre-schemaVersion record) — the live corpus is
// all v2 now, so the legacy display path is exercised from this file.
const legacyFixture = JSON.parse(readFileSync("tests/fixtures/cmc/legacy-v1-snapshot.json", "utf8")) as VerdictRecord;
const lpFailureFixture = (JSON.parse(readFileSync("tests/fixtures/cmc/synthetic-lp-outage-bundle.json", "utf8")) as { record: VerdictRecord }).record;

describe("VerdictCard evidence framing", () => {
  it("makes replay status and missing raw evidence explicit", () => {
    const html = renderToStaticMarkup(createElement(VerdictCard, { v: legacyFixture }));
    expect(html).toContain("Archived");
    expect(html).toContain("Raw source bodies not retained");
    expect(html).not.toContain("permanent record");
    expect(html).toContain("download=\"verdex-");
  });

  it("shows unknown liquidity as unknown rather than zero", () => {
    const html = renderToStaticMarkup(createElement(VerdictCard, { v: lpFailureFixture }));
    expect(html).toContain("LP evidence unavailable");
  });

  it("renders missing LP event metrics as unknown, not zeros", () => {
    const html = renderToStaticMarkup(createElement(VerdictCard, { v: lpFailureFixture }));
    expect(html).not.toContain("LP ADDS 0");
    expect(html).not.toContain("LP REMOVES 0");
    expect(html).toContain("LP ADDS —");
    expect(html).toContain("LP REMOVES —");
  });
});
