import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdirSync, writeFileSync } from "fs";
import { createCmcClient } from "@/lib/cmc-client";
import { analyze } from "@/engine/analyze";
import { CmcError } from "@/lib/cmc-client";
import { listSnapshotIds, loadVerdict } from "@/lib/verdict-store";
import { createLiveGuard } from "@/lib/live-guard";
import { matchReplayRecords } from "@/lib/replay-match";
import { parseScanBody, resolveScanMode } from "@/lib/scan-policy";

export const runtime = "nodejs";

const dataDir = process.env.VERCEL ? "/tmp/verdex" : path.join(process.cwd(), "data");

function client() {
  const apiKey = process.env.CMC_API_KEY;
  const fallbackApiKey = process.env.CMC_FALLBACK_API_KEY;
  if (!apiKey && !fallbackApiKey) throw new Error("CMC_API_KEY missing");
  return createCmcClient({
    apiKey: apiKey ?? "",
    fallbackApiKey,
    logPath: path.join(dataDir, "api_log.jsonl"),
    cacheDir: path.join(dataDir, "cache"),
  });
}

function persist(record: unknown & { id?: string }) {
  try {
    if (!record.id) return;
    const dir = path.join(dataDir, "verdicts");
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, `${record.id}.json`), JSON.stringify(record, null, 2));
  } catch {
    // persistence is best-effort (read-only fs on some hosts)
  }
}

// Live-scan abuse caps: per-IP AND a global daily ceiling across all IPs —
// the global cap is the one that actually protects the monthly CMC quota
// (30/IP × N distinct IPs alone could burn 2,700+ credits/day). On top of
// that, quotaOk() probes /v1/key/info and hard-stops live mode when the
// monthly balance drops below 1,000 credits — snapshots always survive.
// In-memory = per-serverless-instance; a floor, not a hard limit — documented.
const guard = createLiveGuard();

export async function POST(req: NextRequest) {
  const rawBytes = await req.arrayBuffer().catch(() => new ArrayBuffer(0));
  if (rawBytes.byteLength > 4096) {
    return NextResponse.json({ error: "request body exceeds 4096 bytes" }, { status: 400 });
  }
  let raw: unknown;
  try {
    raw = JSON.parse(new TextDecoder().decode(rawBytes));
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const parsed = parseScanBody(raw, rawBytes.byteLength);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const body = parsed.value;
  const mode = resolveScanMode(process.env);

  // Replay is the safe default and remains available when live flags or
  // credentials are absent. Candidate order is stable by exact record id.
  if (mode === "replay") {
    const records = listSnapshotIds().map((id) => loadVerdict(id)).filter((v): v is NonNullable<typeof v> => Boolean(v));
    const matches = matchReplayRecords(records, body);
    if (matches.length === 1) return NextResponse.json({ ...matches[0], replayed: true, mode: "replay" });
    if (matches.length > 1) {
      return NextResponse.json({ kind: "ambiguous", query: body.query, candidates: matches.map((v) => v.token) });
    }
    return NextResponse.json(
      {
        kind: "notFound",
        query: body.query,
        snapshots: records.map((v) => ({ id: v.id, symbol: v.token.symbol, platform: v.token.platform, address: v.token.address, verdict: v.result.verdict })),
      },
      { status: 404 },
    );
  }

  // Rightmost XFF entry is the IP Vercel's edge actually saw — the leftmost
  // is client-supplied and spoofable, so trusting it would bypass the cap.
  const ip = req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ?? "anon";
  if (!guard.allowIp(ip)) {
    return NextResponse.json(
      { error: `live-scan cap reached (${guard.PER_IP}/day/IP, ${guard.GLOBAL}/day global). Committed snapshots on the homepage cover the demo.` },
      { status: 429 },
    );
  }

  try {
    const cmc = client();
    if (!(await guard.quotaOk(cmc))) {
      return NextResponse.json(
        { error: `live-scan paused — CMC monthly credit balance under ${guard.QUOTA_FLOOR}. Committed snapshots on the homepage cover the demo.` },
        { status: 429 },
      );
    }
    const r = await analyze(cmc, { query: body.query, platform: body.platform, selection: body.selection });
    if (r.kind === "verdict") persist(r);
    return NextResponse.json(r, { status: r.kind === "notFound" ? 404 : 200 });
  } catch (e) {
    if (e instanceof CmcError) return NextResponse.json({ error: `cmc ${e.code}: ${e.message}` }, { status: 502 });
    if (e instanceof Error && /API_KEY|createCmcClient/.test(e.message)) {
      return NextResponse.json({ error: "live scan unavailable; use a recorded example" }, { status: 503 });
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[a-z0-9-]{1,64}$/.test(id)) return NextResponse.json({ error: "id required" }, { status: 400 });
  const v = loadVerdict(id); // committed snapshots + runtime verdicts, same as the page
  if (!v) return NextResponse.json({ error: "verdict not found" }, { status: 404 });
  return NextResponse.json(v);
}
