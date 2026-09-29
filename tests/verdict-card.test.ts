import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "fs";
import { listSnapshotIds, loadVerdict } from "@/lib/verdict-store";
import { VerdictCard, type VerdictRecord } from "@/components/verdict-card";

const legacyFixture = loadVerdict(listSnapshotIds()[0]);
if (!legacyFixture) throw new Error("snapshot corpus is empty");
if (legacyFixture.schemaVersion) throw new Error("expected a v1 legacy fixture");
const lpFailureFixture = (JSON.parse(readFileSync("tests/fixtures/cmc/synthetic-lp-outage-bundle.json", "utf8")) as { record: VerdictRecord }).record;

describe("VerdictCard evidence framing", () => {
  it("makes replay status and missing raw evidence explicit", () => {
    const html = renderToStaticMarkup(createElement(VerdictCard, { v: legacyFixture }));
    expect(html).toContain("Archived");
    expect(html).toContain("Raw source bodies not retained");
    expect(html).not.toContain("permanent record");
  });

  it("shows unknown liquidity as unknown rather than zero", () => {
    const html = renderToStaticMarkup(createElement(VerdictCard, { v: lpFailureFixture }));
    expect(html).toContain("LP evidence unavailable");
  });
});
