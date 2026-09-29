import { createHash } from "node:crypto";
import type { AnalyzeResult } from "@/engine/analyze";
import type { SourceEvidence } from "@/lib/verdict-types";

export type VerdictV2Record = Extract<AnalyzeResult, { kind: "verdict" }>;

export interface EvidenceBundle {
  schemaVersion: 2;
  record: VerdictV2Record;
  manifest: {
    capturedAt: string;
    rulesVersion: string;
    parserVersion: string;
    origin: "real-capture" | "synthetic-fixture";
    completeRawEvidence: boolean;
  };
}

export function encodeExactBody(body: string | Uint8Array | ArrayBuffer): { bodyBase64: string; bodySha256: string; byteLength: number } {
  const bytes = typeof body === "string" ? Buffer.from(body, "utf8") : body instanceof ArrayBuffer ? Buffer.from(new Uint8Array(body)) : Buffer.from(body);
  return {
    bodyBase64: bytes.toString("base64"),
    bodySha256: createHash("sha256").update(bytes).digest("hex"),
    byteLength: bytes.byteLength,
  };
}

export function sourceEvidenceFromBody(
  source: Omit<SourceEvidence, "bodyBase64" | "bodySha256" | "evidenceKind">,
  body: string | Uint8Array | ArrayBuffer,
): SourceEvidence {
  const encoded = encodeExactBody(body);
  return { ...source, bodyBase64: encoded.bodyBase64, bodySha256: encoded.bodySha256, evidenceKind: "exact-body" };
}

function error(message: string, errors: string[]) { errors.push(message); }

export function verifyBundle(bundle: EvidenceBundle): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!bundle || typeof bundle !== "object") return { ok: false, errors: ["bundle is not an object"] };
  if (bundle.schemaVersion !== 2) error("bundle schemaVersion must be 2", errors);
  if (!bundle.record || bundle.record.schemaVersion !== 2) error("record schemaVersion must be 2", errors);
  if (!bundle.manifest || !["real-capture", "synthetic-fixture"].includes(bundle.manifest.origin)) error("manifest origin is invalid", errors);
  if (bundle.manifest?.rulesVersion !== bundle.record?.rulesVersion) error("manifest rulesVersion does not match record", errors);
  if (!Array.isArray(bundle.record?.sources)) error("record.sources must be an array", errors);
  const sources = Array.isArray(bundle.record?.sources) ? bundle.record.sources : [];
  let rawBytes = 0;
  let missingBody = false;
  for (const source of sources) {
    if (!source || typeof source !== "object") { error("source entry is not an object", errors); continue; }
    const exact = source.evidenceKind === "exact-body";
    if (!exact) {
      if (source.status === "ok") missingBody = true;
      continue;
    }
    if (typeof source.bodyBase64 !== "string" || typeof source.bodySha256 !== "string") {
      error(`${source.key}: exact-body source is missing bytes or hash`, errors);
      missingBody = true;
      continue;
    }
    let bytes: Buffer;
    try { bytes = Buffer.from(source.bodyBase64, "base64"); } catch { error(`${source.key}: bodyBase64 is invalid`, errors); continue; }
    rawBytes += bytes.byteLength;
    if (bytes.byteLength > 512 * 1024) error(`${source.key}: body exceeds 512 KiB`, errors);
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash !== source.bodySha256) error(`${source.key}: body hash mismatch`, errors);
    try { JSON.parse(bytes.toString("utf8")); } catch { error(`${source.key}: exact body is not valid JSON`, errors); }
  }
  if (rawBytes > 4 * 1024 * 1024) error("raw evidence exceeds 4 MiB bundle limit", errors);
  if (bundle.manifest?.completeRawEvidence && missingBody) error("manifest claims complete raw evidence but at least one source body is absent", errors);
  if (bundle.manifest?.completeRawEvidence && sources.some((source) => source.status !== "ok")) error("complete raw evidence cannot contain failed or unavailable sources", errors);
  return { ok: errors.length === 0, errors };
}
