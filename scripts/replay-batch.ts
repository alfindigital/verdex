// Batch replay: every capture in data/captures without a bundle in data/bundles
// is replayed through the production analyze() pipeline (same logic as
// replay-capture.ts), then each bundle's record is extracted into snapshots/,
// deduped by canonical token identity, and the slug index is rebuilt.
//
//   pnpm tsx scripts/replay-batch.ts
import { createHash } from "crypto";
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { analyze } from "../src/engine/analyze";
import { sourceEvidenceFromBody, verifyBundle, type EvidenceBundle } from "../src/engine/evidence";
import { CmcError } from "../src/lib/cmc-client";
import { tokenIdentity } from "../src/lib/address";
import type { DexClient } from "../src/lib/dex";
import { slugFor } from "../src/lib/verdict-store";
import type { SourceEvidence } from "../src/lib/verdict-types";

interface CapturedSource {
  endpoint: string;
  params: Record<string, string | number>;
  capturedAt: string;
  status: number | null;
  ok: boolean;
  bodyBase64: string | null;
  bodySha256: string | null;
  reason: string | null;
}
interface CaptureFile {
  schemaVersion: 1;
  capturedAt: string;
  platform: string;
  address: string;
  sources: CapturedSource[];
}

function replayClient(capture: CaptureFile): DexClient {
  const byEndpoint = new Map(capture.sources.map((s) => [s.endpoint, s]));
  return {
    async get<T>(endpoint: string, params: Record<string, unknown> = {}) {
      const cap = byEndpoint.get(endpoint);
      if (!cap) throw new CmcError(0, `no captured body for ${endpoint}`, endpoint);
      if (!cap.ok || !cap.bodyBase64) throw new CmcError(cap.status ?? 500, cap.reason ?? `capture failed for ${endpoint}`, endpoint);
      const bodyText = Buffer.from(cap.bodyBase64, "base64").toString("utf8");
      const env = JSON.parse(bodyText) as { data?: T; status?: { error_code?: number | string; error_message?: string | null; credit_count?: number; timestamp?: string } };
      const code = Number(env.status?.error_code ?? 0);
      if (code !== 0) throw new CmcError(code, env.status?.error_message ?? "CMC error", endpoint);
      const receipt = {
        endpoint,
        params: Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b))),
        ts: env.status?.timestamp ?? cap.capturedAt,
        credits: env.status?.credit_count ?? 0,
        sha256: createHash("sha256").update(bodyText).digest("hex"),
        cached: false,
      };
      return { data: env.data as T, receipt };
    },
  };
}

// Prefer newer capture ts; on a tie (same frozen evidence), prefer the record
// produced by the newer rulesVersion so threshold recalibrations propagate.
function better(a: any, b: any): boolean {
  const ta = Date.parse(a.ts), tb = Date.parse(b.ts);
  if (ta !== tb) return ta > tb;
  const rv = (r: any) => String(r?.rulesVersion ?? "0").split(".").map(Number);
  const [aMaj, aMin] = rv(a), [bMaj, bMin] = rv(b);
  return aMaj !== bMaj ? aMaj > bMaj : aMin > bMin;
}

async function main() {
  const capDir = path.resolve("data/captures");
  const bundleDir = path.resolve("data/bundles");
  const snapDir = path.resolve("snapshots");
  mkdirSync(bundleDir, { recursive: true });
  mkdirSync(snapDir, { recursive: true });

  const captures = readdirSync(capDir).filter((f) => f.endsWith(".json")).sort();
  let replayed = 0, skippedBundle = 0, failed = 0;
  for (const file of captures) {
    const bundlePath = path.join(bundleDir, file);
    if (existsSync(bundlePath)) { skippedBundle++; continue; }
    try {
      const capture = JSON.parse(readFileSync(path.join(capDir, file), "utf8")) as CaptureFile;
      if (capture.schemaVersion !== 1 || !Array.isArray(capture.sources)) throw new Error("bad capture schema");
      const capturedMs = Date.parse(capture.capturedAt);
      const result = await analyze(replayClient(capture), { query: capture.address, platform: capture.platform }, {
        now: () => capturedMs,
        jev: async () => ({ available: false, riskyProb: null }),
        narrate: async () => undefined,
      });
      if (result.kind !== "verdict") { console.log(`[skip] ${file}: kind=${result.kind}`); failed++; continue; }
      const byEndpoint = new Map(capture.sources.map((s) => [s.endpoint, s]));
      const sources: SourceEvidence[] = result.sources.map((source) => {
        const cap = byEndpoint.get(source.endpoint);
        return cap?.ok && cap.bodyBase64 ? sourceEvidenceFromBody(source, Buffer.from(cap.bodyBase64, "base64")) : source;
      });
      const record = { ...result, sources, mode: "replay" as const };
      const bundle: EvidenceBundle = {
        schemaVersion: 2,
        record,
        manifest: {
          capturedAt: capture.capturedAt,
          rulesVersion: record.rulesVersion,
          parserVersion: "v1-normalizer",
          origin: "real-capture",
          completeRawEvidence: sources.every((s) => s.status === "ok" && s.evidenceKind === "exact-body"),
        },
      };
      const check = verifyBundle(bundle);
      if (!check.ok) { console.log(`[fail] ${file}: ${check.errors.join("; ")}`); failed++; continue; }
      writeFileSync(bundlePath, JSON.stringify(bundle, null, 2) + "\n", "utf8");
      replayed++;
      console.log(`[replay] ${file} → ${record.token.symbol} ${record.result.verdict} score=${record.result.score} cov=${record.coverage.level}`);
    } catch (e) {
      console.log(`[fail] ${file}: ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }
  console.log(`replay: ${replayed} new, ${skippedBundle} existing bundles, ${failed} failed`);

  // Extract records → snapshots, dedupe by canonical identity (keep newest ts).
  const best = new Map<string, { file: string; rec: any }>();
  for (const f of readdirSync(snapDir)) {
    if (!/^[a-f0-9]{12}\.json$/.test(f)) continue;
    try {
      const rec = JSON.parse(readFileSync(path.join(snapDir, f), "utf8"));
      if (rec?.kind !== "verdict") continue;
      const k = tokenIdentity(rec.token.platform, rec.token.address) ?? `${rec.token.platform}:${rec.token.address}`;
      const prev = best.get(k);
      if (!prev || better(rec, prev.rec)) best.set(k, { file: f, rec });
    } catch { /* corrupt file — leave alone */ }
  }
  for (const f of readdirSync(bundleDir).filter((x) => x.endsWith(".json"))) {
    try {
      const bundle = JSON.parse(readFileSync(path.join(bundleDir, f), "utf8"));
      const rec = bundle?.record;
      if (rec?.kind !== "verdict") continue;
      const k = tokenIdentity(rec.token.platform, rec.token.address) ?? `${rec.token.platform}:${rec.token.address}`;
      const prev = best.get(k);
      if (!prev || better(rec, prev.rec)) best.set(k, { file: `bundle:${f}`, rec });
    } catch { /* skip corrupt */ }
  }
  // Rewrite snapshot dir: keep only winners.
  const keep = new Set<string>();
  for (const { rec } of best.values()) {
    writeFileSync(path.join(snapDir, `${rec.id}.json`), JSON.stringify(rec, null, 2));
    keep.add(`${rec.id}.json`);
  }
  const { rmSync } = await import("fs");
  for (const f of readdirSync(snapDir)) {
    if (/^[a-f0-9]{12}\.json$/.test(f) && !keep.has(f)) rmSync(path.join(snapDir, f));
  }
  // Rebuild slug index.
  const index: Record<string, string> = {};
  for (const { rec } of best.values()) index[slugFor(rec.token.symbol, rec.token.platform)] = rec.id;
  writeFileSync(path.join(snapDir, "index.json"), JSON.stringify(index, null, 2) + "\n");
  const byChain = new Map<string, number>();
  const byVerdict = new Map<string, number>();
  for (const { rec } of best.values()) {
    byChain.set(rec.token.platform, (byChain.get(rec.token.platform) ?? 0) + 1);
    byVerdict.set(rec.result.verdict, (byVerdict.get(rec.result.verdict) ?? 0) + 1);
  }
  console.log(`snapshots: ${best.size} unique identities`);
  console.log(`chains: ${[...byChain.entries()].map(([k, v]) => `${k}=${v}`).join(", ")}`);
  console.log(`verdicts: ${[...byVerdict.entries()].map(([k, v]) => `${k}=${v}`).join(", ")}`);
}

void main().catch((e) => { console.error("ERROR", e instanceof Error ? e.message : e); process.exitCode = 1; });
