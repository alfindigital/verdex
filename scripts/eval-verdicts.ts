// Labeled-set evaluation: replays verdicts against a small hand-labeled
// ground truth drawn from the committed corpus. Not statistical proof —
// an honesty check: dead/untradeable tokens should not score well, mature
// majors should never be AVOID, and every miss is printed, not hidden.
//
//   npx tsx scripts/eval-verdicts.ts
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { LABELS, passFor, labelKey, type SnapshotRow, type LabelClass } from "./lib/ground-truth";

const snapDir = path.resolve("snapshots");
const rows: { sym: string; plat: string; cls: string; verdict: string; score: number; ok: boolean; note: string }[] = [];
const seen = new Set<string>();

for (const f of readdirSync(snapDir)) {
  if (!f.endsWith(".json") || f === "index.json") continue;
  let rec: SnapshotRow;
  try { rec = JSON.parse(readFileSync(path.join(snapDir, f), "utf8")); } catch { continue; }
  if (rec.token?.symbol == null || rec.result?.verdict == null) continue;
  const sym = rec.token.symbol.replace(/^\$/, "");
  const key = labelKey(rec.token);
  const label = LABELS[key];
  if (!label || seen.has(key)) continue;
  seen.add(key);
  const v = rec.result.verdict;
  rows.push({ sym, plat: rec.token.platform, cls: label.cls, verdict: v, score: rec.result.score, ok: passFor(label.cls as LabelClass, v), note: label.note });
}

const dead = rows.filter((r) => r.cls === "dead");
const faded = rows.filter((r) => r.cls === "faded");
const majors = rows.filter((r) => r.cls === "major");
const deadCaught = dead.filter((r) => r.verdict === "JANGAN").length;
const deadSoft = dead.filter((r) => r.verdict === "RAWAN").length;
const deadMiss = dead.filter((r) => !r.ok);
const fadedGreen = faded.filter((r) => !r.ok);
const majorAvoid = majors.filter((r) => !r.ok);
const majorLayak = majors.filter((r) => r.verdict === "LAYAK").length;

console.log(`labeled set: ${dead.length} dead · ${faded.length} faded · ${majors.length} majors = ${rows.length} labels (matched in 130-corpus)`);
console.log("");
const order = { dead: 0, faded: 1, major: 2 } as Record<string, number>;
for (const r of rows.sort((a, b) => (order[a.cls] - order[b.cls]) || a.sym.localeCompare(b.sym))) {
  console.log(`  ${r.ok ? "PASS" : "MISS"}  [${r.cls.padEnd(5)}] ${r.sym.padEnd(10)} ${r.plat.padEnd(10)} ${r.verdict.padEnd(18)} score=${r.score}  — ${r.note}`);
}
console.log("");
console.log(`dead caught (JANGAN): ${deadCaught}/${dead.length} · soft-flag (RAWAN): ${deadSoft} · dangerous misses: ${deadMiss.length}`);
console.log(`faded flagged (not LAYAK/INSUF): ${faded.length - fadedGreen.length}/${faded.length} · stamped green: ${fadedGreen.length}`);
console.log(`major false-positives (AVOID): ${majorAvoid.length}/${majors.length} · majors stamped ENTRY-WORTHY: ${majorLayak}/${majors.length}`);
for (const m of [...deadMiss, ...fadedGreen, ...majorAvoid]) console.log(`  !! ${m.cls} miss: ${m.sym} (${m.plat}) → ${m.verdict} — ${m.note}`);
const missing = Object.keys(LABELS).filter((k) => !seen.has(k));
if (missing.length) console.log(`labeled-but-absent from corpus: ${missing.join(", ")}`);
