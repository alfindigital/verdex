// Replay a capture-evidence.ts sources file through the production analyze()
// pipeline and emit a verifiable EvidenceBundle (schemaVersion 2,
// manifest.origin "real-capture"). With --live-compare it also runs one
// authorized live analyze() and reports label/score agreement.
// Usage:
//   pnpm tsx scripts/replay-capture.ts <capture.json> --out <bundle.json> [--live-compare]
// Reads keys from .env.local only for --live-compare (never logs them).

import { createHash } from "crypto";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { analyze, type AnalyzeResult } from "../src/engine/analyze";
import { sourceEvidenceFromBody, verifyBundle, type EvidenceBundle } from "../src/engine/evidence";
import { CmcError, createCmcClient } from "../src/lib/cmc-client";
import type { DexClient } from "../src/lib/dex";
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

function arg(name: string): string | null {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] ?? null : null;
}

function loadEnvLocal() {
  try {
    for (const line of readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    // .env.local optional; only needed for --live-compare
  }
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

async function main() {
  const input = process.argv[2];
  const out = arg("--out");
  const liveCompare = process.argv.includes("--live-compare");
  if (!input || !out) {
    console.error("Usage: pnpm tsx scripts/replay-capture.ts <capture.json> --out <bundle.json> [--live-compare]");
    process.exitCode = 2;
    return;
  }
  const capture = JSON.parse(readFileSync(path.resolve(input), "utf8")) as CaptureFile;
  if (capture.schemaVersion !== 1 || !Array.isArray(capture.sources)) {
    console.error("ERROR input is not a capture-evidence sources file (schemaVersion 1)");
    process.exitCode = 2;
    return;
  }

  const capturedMs = Date.parse(capture.capturedAt);
  const replayed = await analyze(replayClient(capture), { query: capture.address, platform: capture.platform }, {
    now: () => capturedMs,
    jev: async () => ({ available: false, riskyProb: null }),
    narrate: async () => undefined,
  });
  if (replayed.kind !== "verdict") {
    console.error(`ERROR replay produced kind=${replayed.kind}, not a verdict`);
    process.exitCode = 1;
    return;
  }

  const byEndpoint = new Map(capture.sources.map((s) => [s.endpoint, s]));
  const sources: SourceEvidence[] = replayed.sources.map((source) => {
    const cap = byEndpoint.get(source.endpoint);
    if (cap?.ok && cap.bodyBase64) {
      return sourceEvidenceFromBody(source, Buffer.from(cap.bodyBase64, "base64"));
    }
    return source;
  });
  const record = { ...replayed, sources };
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
  if (!check.ok) {
    for (const e of check.errors) console.error(`ERROR ${e}`);
    process.exitCode = 1;
    return;
  }
  const outFile = path.resolve(out);
  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(bundle, null, 2) + "\n", "utf8");

  console.log(`REPLAY ${capture.platform}/${capture.address}`);
  console.log(`  verdict=${record.result.verdict} label=${record.result.label ?? "n/a"} score=${record.result.score} coverage=${record.coverage.level}`);
  console.log(`  sources=${sources.map((s) => `${s.key}:${s.status}${s.evidenceKind === "exact-body" ? "+body" : ""}`).join(", ")}`);
  console.log(`  completeRawEvidence=${bundle.manifest.completeRawEvidence} -> wrote ${outFile}`);

  if (liveCompare) {
    loadEnvLocal();
    if (!process.env.CMC_API_KEY) {
      console.error("WARN --live-compare requested but CMC_API_KEY missing; skipped");
      return;
    }
    const live = createCmcClient({
      apiKey: process.env.CMC_API_KEY,
      logPath: path.join(process.cwd(), "data", "api_log.jsonl"),
      cacheDir: path.join(process.cwd(), "data", "cache"),
    });
    const fresh = await analyze(live, { query: capture.address, platform: capture.platform }, {
      jev: async () => ({ available: false, riskyProb: null }),
      narrate: async () => undefined,
    }) as Extract<AnalyzeResult, { kind: "verdict" }> | { kind: string };
    if (fresh.kind !== "verdict") {
      console.log(`  live-compare: live analyze returned kind=${fresh.kind}`);
      return;
    }
    const sameLabel = fresh.result.label === record.result.label;
    const sameVerdict = fresh.result.verdict === record.result.verdict;
    const metricKeys = ["uniqueMakers", "top5MakerShare", "netBuyRatio", "thirdPartySells"] as const;
    const metricDiffs = metricKeys
      .map((k) => `${k}=${record.metrics.flow[k]}->${fresh.metrics.flow[k]}`)
      .join(" ");
    console.log(`  live-compare: verdict ${record.result.verdict}->${fresh.result.verdict} (${sameVerdict ? "MATCH" : "DIFF"}) label ${record.result.label ?? "n/a"}->${fresh.result.label ?? "n/a"} (${sameLabel ? "MATCH" : "DIFF"})`);
    console.log(`  live-compare flow: ${metricDiffs}`);
    console.log(`  live-compare note: same token, ${Math.round((Date.now() - capturedMs) / 1000)}s after capture; swap-window drift can legitimately move metrics`);
  }
}

void main().catch((error) => {
  console.error(`ERROR replay failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
