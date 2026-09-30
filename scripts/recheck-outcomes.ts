// Outcome recheck: refetches /v1/dex/token for every labeled snapshot and
// diffs current price/liquidity/volume against the captured dossier values.
// This is the honest follow-up loop Claude's review asked for — "did the
// flagged tokens actually do badly?" — computed over whatever elapsed time
// the captures allow (stamped per row; a real 24h/7d verdict needs the key
// to still be alive then).
//
//   CMC_API_KEY=... npx tsx scripts/recheck-outcomes.ts
// Output: table + data/recheck-<ts>.json (local — data/ is gitignored).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { LABELS, labelKey, type SnapshotRow } from "./lib/ground-truth";

const key = process.env.CMC_API_KEY;
const base = process.env.CMC_BASE_URL ?? "https://pro-api.coinmarketcap.com";
if (!key) {
  console.error("CMC_API_KEY required — recheck is a live follow-up, not replay");
  process.exit(2);
}

const snapDir = path.resolve("snapshots");
const targets: { key: string; rec: SnapshotRow; cls: string; note: string }[] = [];
const seen = new Set<string>();
for (const f of readdirSync(snapDir)) {
  if (!f.endsWith(".json") || f === "index.json") continue;
  let rec: SnapshotRow;
  try { rec = JSON.parse(readFileSync(path.join(snapDir, f), "utf8")); } catch { continue; }
  const k = labelKey(rec.token);
  const label = LABELS[k];
  if (!label || !rec.token?.address || seen.has(k)) continue;
  seen.add(k);
  targets.push({ key: k, rec, cls: label.cls, note: label.note });
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : v == null ? null : Number.isFinite(Number(v)) ? Number(v) : null);

async function main() {

interface Row {
  key: string; cls: string; verdict: string; score: number;
  elapsedH: number | null;
  priceThen: number | null; priceNow: number | null; priceDeltaPct: number | null;
  liqThen: number | null; liqNow: number | null; liqDeltaPct: number | null;
  vol24hNow: number | null; httpStatus: number; error: string | null;
}

const rows: Row[] = [];
for (const t of targets) {
  const { rec } = t;
  const then = rec.dossier?.market ?? null;
  const elapsedH = rec.computedAt ? (Date.now() - Date.parse(rec.computedAt)) / 36e5 : null;
  const row: Row = {
    key: t.key, cls: t.cls, verdict: rec.result.verdict, score: rec.result.score,
    elapsedH,
    priceThen: then?.priceUsd ?? null, priceNow: null, priceDeltaPct: null,
    liqThen: then?.liqUsd ?? null, liqNow: null, liqDeltaPct: null,
    vol24hNow: null, httpStatus: 0, error: null,
  };
  try {
    const url = new URL(base + "/v1/dex/token");
    url.searchParams.set("platform", rec.token.platform);
    url.searchParams.set("address", rec.token.address!);
    const res = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": key, Accept: "application/json" } });
    row.httpStatus = res.status;
    const body = await res.json().catch(() => null);
    const d = Array.isArray(body?.data) ? body.data[0] : body?.data;
    if (d) {
      row.priceNow = num(d.p);
      row.liqNow = num(d.liqUsd);
      row.vol24hNow = num(d.v24h ?? d.vol24h);
      if (row.priceThen && row.priceNow) row.priceDeltaPct = ((row.priceNow - row.priceThen) / row.priceThen) * 100;
      if (row.liqThen && row.liqNow) row.liqDeltaPct = ((row.liqNow - row.liqThen) / row.liqThen) * 100;
    } else {
      row.error = "empty data";
    }
  } catch (e) {
    row.error = String(e).slice(0, 120);
  }
  rows.push(row);
  await new Promise((r) => setTimeout(r, 350)); // be polite to the quota
}

const pct = (v: number | null) => (v === null ? "   —  " : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`.padStart(7));
console.log(`\noutcome recheck — ${rows.length} labeled tokens · elapsed since capture varies per row\n`);
console.log(`${"token".padEnd(26)} ${"cls".padEnd(6)} ${"verdict".padEnd(18)} ${"Δh".padStart(5)} ${"priceΔ".padStart(8)} ${"liqΔ".padStart(8)} ${"status".padStart(6)}`);
for (const r of rows.sort((a, b) => (a.cls.localeCompare(b.cls) || a.key.localeCompare(b.key)))) {
  console.log(`${r.key.padEnd(26)} ${r.cls.padEnd(6)} ${r.verdict.padEnd(18)} ${(r.elapsedH === null ? "  —" : r.elapsedH.toFixed(1)).padStart(5)} ${pct(r.priceDeltaPct)} ${pct(r.liqDeltaPct)} ${String(r.httpStatus).padStart(6)}${r.error ? " " + r.error : ""}`);
}

// Aggregate: does the verdict separate outcomes? median priceΔ per verdict.
const byVerdict = new Map<string, number[]>();
for (const r of rows) if (r.priceDeltaPct !== null) {
  const a = byVerdict.get(r.verdict) ?? [];
  a.push(r.priceDeltaPct);
  byVerdict.set(r.verdict, a);
}
const med = (a: number[]) => a.length ? a.sort((x, y) => x - y)[Math.floor(a.length / 2)] : null;
console.log(`\nmedian priceΔ by verdict (n=${rows.filter((r) => r.priceDeltaPct !== null).length} with both prices):`);
for (const [v, a] of [...byVerdict].sort()) {
  const dumped = a.filter((x) => x < -15).length;
  console.log(`  ${v.padEnd(18)} n=${String(a.length).padStart(2)}  median ${pct(med(a))}  · dumped<-15%: ${dumped}`);
}
const failed = rows.filter((r) => r.error || r.httpStatus !== 200);
if (failed.length) console.log(`\nfetch failures: ${failed.length} — ${failed.map((f) => `${f.key}(${f.httpStatus || f.error})`).join(", ")}`);

const outDir = path.resolve("data");
mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, `recheck-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`);
writeFileSync(file, JSON.stringify({ generatedAt: new Date().toISOString(), note: "outcome deltas vs captured dossier values — elapsed window per row, not a fixed 24h/7d horizon", rows }, null, 2));
console.log(`\nwrote ${path.relative(process.cwd(), file)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
