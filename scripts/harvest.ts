// Harvest live verdicts → committed snapshots/ for durable demo links.
// Usage: pnpm tsx scripts/harvest.ts [query ...]
// Reads keys from .env.local (never logs them).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from "fs";
import path from "path";
import { createCmcClient } from "../src/lib/cmc-client";
import { analyze } from "../src/engine/analyze";
import { slugFor } from "../src/lib/verdict-store";

async function main() {
  for (const line of readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
  if (!process.env.CMC_API_KEY) throw new Error("CMC_API_KEY missing");

  const dataDir = path.join(process.cwd(), "data");
  const snapDir = path.join(process.cwd(), "snapshots");
  const verdictDir = path.join(dataDir, "verdicts");
  mkdirSync(snapDir, { recursive: true });
  mkdirSync(verdictDir, { recursive: true });
  const before = new Set(readdirSync(verdictDir));

  const client = createCmcClient({
    apiKey: process.env.CMC_API_KEY,
    logPath: path.join(dataDir, "api_log.jsonl"),
    cacheDir: path.join(dataDir, "cache"),
  });

  const queries = process.argv.slice(2);
  if (queries.length === 0) {
    console.log("usage: tsx scripts/harvest.ts <query> [query...]");
    process.exit(1);
  }

  for (const q of queries) {
    const at = q.lastIndexOf("@");
    const r = await analyze(client, at > 0 ? { query: q.slice(0, at), platform: q.slice(at + 1) } : { query: q });
    if (r.kind !== "verdict") {
      console.log(`${q}: ${r.kind}${r.kind === "ambiguous" ? ` (${r.candidates.length} candidates)` : ""}`);
      continue;
    }
    writeFileSync(path.join(snapDir, `${r.id}.json`), JSON.stringify(r, null, 2));
    console.log(
      `${q}: ${r.token.symbol} (${r.token.platform}) → ${r.result.verdict} score=${r.result.score} conf=${r.result.confidence} jev=${r.jev.available ? r.jev.riskyProb : "n/a"} id=${r.id}`,
    );
  }

  for (const f of readdirSync(verdictDir)) {
    if (!before.has(f)) copyFileSync(path.join(verdictDir, f), path.join(snapDir, f));
  }

  // Rebuild stable slug index — public demo links (/verdict/gmx-arbitrum)
  // survive re-harvests that mint new snapshot ids.
  const index: Record<string, string> = {};
  for (const f of readdirSync(snapDir)) {
    if (!/^[a-f0-9]{12}\.json$/.test(f)) continue;
    try {
      const r = JSON.parse(readFileSync(path.join(snapDir, f), "utf8"));
      if (r.kind === "verdict") index[slugFor(r.token.symbol, r.token.platform)] = r.id;
    } catch {
      // skip corrupt file
    }
  }
  writeFileSync(path.join(snapDir, "index.json"), JSON.stringify(index, null, 2) + "\n");
  console.log(`index.json: ${Object.keys(index).length} slugs`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
