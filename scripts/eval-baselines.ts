// Baseline comparison: runs the same 59-label ground truth through naive
// one-signal judges and prints the same metrics Verdex is evaluated on.
// This answers "is the rules engine better than a dumb threshold?" — every
// cell is computed from the committed evidence, no new API calls.
//
//   npx tsx scripts/eval-baselines.ts
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { LABELS, passFor, labelKey, type SnapshotRow, type LabelClass } from "./lib/ground-truth";

type Baseline = (r: SnapshotRow) => string;

// Naive "security API says so" judge — approximates a GoPlus-style check:
// vendor danger level or a hard flag → AVOID; any hit at all → caution.
const baseSecurity: Baseline = (r) => {
  const s = r.metrics?.safety;
  if (!s) return "BELUM_CUKUP_BUKTI";
  const hard = (s.hits ?? []).some((h) => ["honeypot", "rug_pull", "unusual_sell_tax"].includes(h))
    || (s.sellTax ?? 0) > 0.1
    || s.flaggedByVendor === true;
  if (hard || s.level === "danger") return "JANGAN";
  if ((s.hits ?? []).length > 0 || s.level !== "safe") return "RAWAN";
  return "LAYAK";
};

// Naive "liquidity below $X → avoid" judges, two cutoffs.
const baseLiq = (cut: number): Baseline => (r) => {
  const liq = r.metrics?.liq?.totalLiqUsd;
  if (liq === undefined) return "BELUM_CUKUP_BUKTI";
  if (liq < cut) return "JANGAN";
  if (liq < cut * 5) return "RAWAN";
  return "LAYAK";
};

const BASELINES: { name: string; fn: Baseline }[] = [
  { name: "verdex-rules", fn: (r) => r.result.verdict },
  { name: "sec-flags-only", fn: baseSecurity },
  { name: "liq<$10k→avoid", fn: baseLiq(10_000) },
  { name: "liq<$50k→avoid", fn: baseLiq(50_000) },
];

const snapDir = path.resolve("snapshots");
const labeled: { key: string; rec: SnapshotRow; cls: LabelClass; note: string }[] = [];
const seen = new Set<string>();
for (const f of readdirSync(snapDir)) {
  if (!f.endsWith(".json") || f === "index.json") continue;
  let rec: SnapshotRow;
  try { rec = JSON.parse(readFileSync(path.join(snapDir, f), "utf8")); } catch { continue; }
  const key = labelKey(rec.token);
  const label = LABELS[key];
  if (!label || seen.has(key)) continue;
  seen.add(key);
  labeled.push({ key, rec, cls: label.cls, note: label.note });
}

interface Tally { caught: number; soft: number; deadMiss: number; fadedGreen: number; majorFP: number; majorLayak: number }
const tally = (verdicts: Map<string, string>): Tally => {
  const t: Tally = { caught: 0, soft: 0, deadMiss: 0, fadedGreen: 0, majorFP: 0, majorLayak: 0 };
  for (const { key, cls } of labeled) {
    const v = verdicts.get(key) ?? "BELUM_CUKUP_BUKTI";
    if (cls === "dead") {
      if (v === "JANGAN") t.caught++;
      else if (v === "RAWAN") t.soft++;
      else t.deadMiss++; // LAYAK/INSUF on a collapsed token = dangerous
    } else if (cls === "faded") {
      if (!passFor(cls, v)) t.fadedGreen++;
    } else {
      if (v === "JANGAN") t.majorFP++;
      if (v === "LAYAK") t.majorLayak++;
    }
  }
  return t;
};

const nDead = labeled.filter((l) => l.cls === "dead").length;
const nFaded = labeled.filter((l) => l.cls === "faded").length;
const nMajor = labeled.filter((l) => l.cls === "major").length;
console.log(`baseline comparison — ${labeled.length} labeled (${nDead} dead · ${nFaded} faded · ${nMajor} major)`);
console.log("lower is better: dead-missed, faded-green, major-FP. dead-caught & major-LAYAK higher is better.\n");
console.log(`${"judge".padEnd(18)} ${"deadJANGAN".padStart(10)} ${"deadRAWAN".padStart(10)} ${"deadMiss".padStart(9)} ${"fadedGreen".padStart(11)} ${"majorFP".padStart(8)} ${"majorLAYAK".padStart(10)}`);

for (const b of BASELINES) {
  const verdicts = new Map<string, string>();
  for (const { key, rec } of labeled) verdicts.set(key, b.fn(rec));
  const t = tally(verdicts);
  console.log(`${b.name.padEnd(18)} ${String(`${t.caught}/${nDead}`).padStart(10)} ${String(`${t.soft}/${nDead}`).padStart(10)} ${String(t.deadMiss).padStart(9)} ${String(`${t.fadedGreen}/${nFaded}`).padStart(11)} ${String(`${t.majorFP}/${nMajor}`).padStart(8)} ${String(`${t.majorLayak}/${nMajor}`).padStart(10)}`);
  // Show the misses so nothing is hidden — per judge, per class.
  for (const { key, cls, note } of labeled) {
    const v = verdicts.get(key) ?? "?";
    const bad = (cls === "dead" && (v === "LAYAK" || v === "BELUM_CUKUP_BUKTI"))
      || (cls === "faded" && !passFor(cls, v))
      || (cls === "major" && v === "JANGAN");
    if (bad) console.log(`    miss[${cls}] ${key} → ${v}  — ${note}`);
  }
}
console.log("\nNotes: baselines share Verdex's captured evidence (CMC security flags");
console.log("are the vendor-flag class a GoPlus-style check would see). Verdex adds");
console.log("flow-tape, liquidity-depth, vitality and coverage on top — the deltas");
console.log("above are what the extra evidence buys. Indication, not proof.");
