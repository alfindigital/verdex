import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { createCmcClient } from "@/lib/cmc-client";
import { analyze } from "@/engine/analyze";
import { CmcError } from "@/lib/cmc-client";

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

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { query?: string; platform?: string; pick?: number } | null;
  if (!body?.query?.trim()) {
    return NextResponse.json({ error: "query required (token address or name/ticker)" }, { status: 400 });
  }
  try {
    const r = await analyze(client(), { query: body.query, platform: body.platform, pick: body.pick });
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
  const file = path.join(dataDir, "verdicts", `${id}.json`);
  if (!existsSync(file)) return NextResponse.json({ error: "verdict not found" }, { status: 404 });
  return NextResponse.json(JSON.parse(readFileSync(file, "utf8")));
}
