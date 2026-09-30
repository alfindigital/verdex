// Labeled-set evaluation: replays verdicts against a small hand-labeled
// ground truth drawn from the committed corpus. Not statistical proof —
// an honesty check: dead/untradeable tokens should not score well, mature
// majors should never be AVOID, and every miss is printed, not hidden.
//
//   npx tsx scripts/eval-verdicts.ts
import { readFileSync, readdirSync } from "fs";
import path from "path";

interface Snap { token: { symbol: string; platform: string }; result: { verdict: string; score: number }; }

// Ground truth — public knowledge, not model output:
//   "bad"   = collapsed/dead/untradeable project → acceptable: JANGAN, tolerable: RAWAN
//   "major" = established protocol token → must NOT be JANGAN
const LABELS: Record<string, { cls: "bad" | "major"; note: string }> = {
  "TITANO:BSC": { cls: "bad", note: "rebasing scheme collapsed 2022" },
  "VGX:Ethereum": { cls: "bad", note: "Voyager bankruptcy, delisted" },
  "FTX Token:Ethereum": { cls: "bad", note: "FTX collapse — still trades thin" },
  "CEL:Ethereum": { cls: "bad", note: "Celsius bankruptcy token" },
  "AAVE:Ethereum": { cls: "major", note: "top-3 lending protocol" },
  "UNI:Ethereum": { cls: "major", note: "Uniswap governance" },
  "LINK:Ethereum": { cls: "major", note: "Chainlink" },
  "MKR:Ethereum": { cls: "major", note: "MakerDAO/Sky" },
  "COMP:Ethereum": { cls: "major", note: "Compound governance" },
  "SNX:Ethereum": { cls: "major", note: "Synthetix" },
  "CRV:Ethereum": { cls: "major", note: "Curve" },
  "LDO:Ethereum": { cls: "major", note: "Lido" },
  "OP:Optimism": { cls: "major", note: "Optimism governance" },
  "ARB:Arbitrum": { cls: "major", note: "Arbitrum governance" },
  "GRT:Ethereum": { cls: "major", note: "The Graph" },
  "ENS:Ethereum": { cls: "major", note: "ENS" },
};

const snapDir = path.resolve("snapshots");
const rows: { sym: string; plat: string; cls: string; verdict: string; score: number; ok: boolean; note: string }[] = [];
const seen = new Set<string>();

for (const f of readdirSync(snapDir)) {
  if (!f.endsWith(".json") || f === "index.json") continue;
  let rec: Snap;
  try { rec = JSON.parse(readFileSync(path.join(snapDir, f), "utf8")); } catch { continue; }
  if (rec.token?.symbol == null || rec.result?.verdict == null) continue;
  const sym = rec.token.symbol.replace(/^\$/, "");
  const key = `${sym}:${rec.token.platform}`;
  const label = LABELS[key];
  if (!label || seen.has(key)) continue;
  seen.add(key);
  const v = rec.result.verdict;
  const ok = label.cls === "bad" ? v === "JANGAN" : v !== "JANGAN";
  rows.push({ sym, plat: rec.token.platform, cls: label.cls, verdict: v, score: rec.result.score, ok, note: label.note });
}

const bad = rows.filter((r) => r.cls === "bad");
const majors = rows.filter((r) => r.cls === "major");
const caught = bad.filter((r) => r.verdict === "JANGAN").length;
const falsePos = majors.filter((r) => r.verdict === "JANGAN").length;
const tolerable = bad.filter((r) => r.verdict === "RAWAN").length;
const cleanMiss = bad.filter((r) => r.verdict === "LAYAK" || r.verdict === "BELUM_CUKUP_BUKTI");

console.log(`labeled set: ${bad.length} collapsed/dead · ${majors.length} majors (of ${seen.size} matched in corpus)`);
console.log("");
for (const r of rows.sort((a, b) => (a.cls === b.cls ? a.sym.localeCompare(b.sym) : a.cls === "bad" ? -1 : 1))) {
  console.log(`  ${r.ok ? "PASS" : "MISS"}  ${r.sym.padEnd(10)} ${r.plat.padEnd(10)} ${r.verdict.padEnd(18)} score=${r.score}  — ${r.note}`);
}
console.log("");
console.log(`dead-token capture (JANGAN): ${caught}/${bad.length} · soft-flag (RAWAN): ${tolerable} · clean misses: ${cleanMiss.length}`);
console.log(`major false-positive (AVOID on established token): ${falsePos}/${majors.length}`);
for (const m of cleanMiss) console.log(`  !! missed dead token scored ${m.verdict}: ${m.sym}`);
const missing = Object.keys(LABELS).filter((k) => !seen.has(k));
if (missing.length) console.log(`labeled-but-absent from corpus: ${missing.join(", ")}`);
