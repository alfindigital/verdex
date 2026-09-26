import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdirSync, writeFileSync } from "fs";
import { createCmcClient } from "@/lib/cmc-client";
import { analyze } from "@/engine/analyze";
import { CmcError } from "@/lib/cmc-client";
import { listSnapshotIds, loadVerdict } from "@/lib/verdict-store";

export const runtime = "nodejs";

const dataDir = process.env.VERCEL ? "/tmp/verdex" : path.join(process.cwd(), "data");

function client() {
  const apiKey = process.env.CMC_API_KEY;
  if (!apiKey) throw new Error("CMC_API_KEY missing");
  return createCmcClient({
    apiKey,
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

// Live-scan abuse cap: max N live analyses per IP per UTC day. In-memory =
// per-instance on serverless (a floor, not a hard global limit) — documented.
const LIVE_DAILY_CAP = 30;
const liveHits = new Map<string, { day: string; n: number }>();
function allowLive(ip: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  // Bound the map: on day rollover, flush stale-day entries once they pile up.
  if (liveHits.size > 10_000) {
    for (const [k, v] of liveHits) if (v.day !== day) liveHits.delete(k);
  }
  const e = liveHits.get(ip);
  if (!e || e.day !== day) {
    liveHits.set(ip, { day, n: 1 });
    return true;
  }
  if (e.n >= LIVE_DAILY_CAP) return false;
  e.n++;
  return true;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { query?: unknown; platform?: unknown; pick?: unknown } | null;
  if (typeof body?.query !== "string" || !body.query.trim()) {
    return NextResponse.json({ error: "query required (token address or name/ticker)" }, { status: 400 });
  }
  if (body.platform !== undefined && typeof body.platform !== "string") {
    return NextResponse.json({ error: "platform must be a string" }, { status: 400 });
  }
  if (body.pick !== undefined && (typeof body.pick !== "number" || !Number.isInteger(body.pick) || body.pick < 0 || body.pick > 49)) {
    return NextResponse.json({ error: "pick must be an integer 0..49" }, { status: 400 });
  }
  const platform = body.platform as string | undefined;
  const pick = body.pick as number | undefined;

  // Demo mode (VERDEX_LIVE unset): serve committed snapshots only — the demo
  // can never fail on a judge's machine or burn API credits.
  if (process.env.VERDEX_LIVE !== "1") {
    const q = body.query.trim().toLowerCase();
    const plat = platform?.trim().toLowerCase();
    const match = listSnapshotIds()
      .map((id) => loadVerdict(id))
      .find(
        (v) =>
          v &&
          (!plat || v.token.platform.toLowerCase() === plat) &&
          (v.token.address.toLowerCase() === q ||
            v.token.symbol.toLowerCase() === q ||
            v.token.symbol.toLowerCase() === q.replace(/^\$/, "") ||
            v.token.name.toLowerCase() === q),
      );
    if (match) return NextResponse.json({ ...match, replayed: true });
    return NextResponse.json(
      {
        error: "demo mode: live API disabled (VERDEX_LIVE=0). Try a showcased token:",
        snapshots: listSnapshotIds()
          .map((id) => loadVerdict(id))
          .filter(Boolean)
          .map((v) => ({ id: v!.id, symbol: v!.token.symbol, platform: v!.token.platform, address: v!.token.address, verdict: v!.result.verdict })),
      },
      { status: 403 },
    );
  }

  // Rightmost XFF entry is the IP Vercel's edge actually saw — the leftmost
  // is client-supplied and spoofable, so trusting it would bypass the cap.
  const ip = req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ?? "anon";
  if (!allowLive(ip)) {
    return NextResponse.json(
      { error: `live-scan cap reached (${LIVE_DAILY_CAP}/day/IP). Committed snapshots on the homepage cover the demo.` },
      { status: 429 },
    );
  }

  try {
    const r = await analyze(client(), { query: body.query, platform, pick });
    if (r.kind === "verdict") persist(r);
    return NextResponse.json(r, { status: r.kind === "notFound" ? 404 : 200 });
  } catch (e) {
    if (e instanceof CmcError) return NextResponse.json({ error: `cmc ${e.code}: ${e.message}` }, { status: 502 });
    return NextResponse.json({ error: e instanceof Error ? e.message : "internal" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[a-f0-9]{12}$/.test(id)) return NextResponse.json({ error: "id required" }, { status: 400 });
  const v = loadVerdict(id); // committed snapshots + runtime verdicts, same as the page
  if (!v) return NextResponse.json({ error: "verdict not found" }, { status: 404 });
  return NextResponse.json(v);
}
