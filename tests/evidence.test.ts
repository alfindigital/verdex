import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { encodeExactBody, verifyBundle, type EvidenceBundle } from "@/engine/evidence";

const fixturePath = path.join(process.cwd(), "tests/fixtures/cmc/synthetic-lp-outage-bundle.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as EvidenceBundle;

describe("evidence bundles", () => {
  it("verifies the checked-in synthetic bundle and distinguishes incomplete raw evidence", () => {
    const result = verifyBundle(fixture);
    expect(result.ok).toBe(true);
    expect(fixture.manifest.completeRawEvidence).toBe(false);
    expect(fixture.manifest.origin).toBe("synthetic-fixture");
  });

  it("rejects changed raw bytes", () => {
    const bundle = structuredClone(fixture);
    const source = bundle.record.sources.find((item) => item.evidenceKind === "exact-body")!;
    source.bodyBase64 = Buffer.from('{"data":"tampered"}', "utf8").toString("base64");
    expect(verifyBundle(bundle).ok).toBe(false);
  });

  it("hashes exact UTF-8 bytes before JSON parsing", () => {
    const body = '{"x":"é"}';
    const encoded = encodeExactBody(body);
    expect(encoded.bodyBase64).toBe(Buffer.from(body, "utf8").toString("base64"));
    expect(encoded.bodySha256).toHaveLength(64);
  });

  it("rejects a bundle that claims complete raw evidence while a source body is absent", () => {
    const bundle = structuredClone(fixture);
    bundle.manifest.completeRawEvidence = true;
    expect(verifyBundle(bundle).ok).toBe(false);
  });
});
