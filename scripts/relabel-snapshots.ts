// Recompute the derived display label on stored snapshots via the same
// labelRisk() used by analyze(), then verify zero label/verdict divergence.
// Needed after rules changes when replay dedupe ties (same capture ts +
// rulesVersion) leave older records — with stale labels — in place.
import { labelRisk } from "../src/engine/coverage";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";

const snapDir = path.resolve("snapshots");
const files = readdirSync(snapDir).filter((f) => /^[a-f0-9]{12}\.json$/.test(f));

let fixed = 0;
for (const f of files) {
  const p = path.join(snapDir, f);
  const rec = JSON.parse(readFileSync(p, "utf8"));
  if (rec?.kind !== "verdict") continue;
  const want = labelRisk(rec.result.verdict, rec.coverage);
  if (rec.result.label !== want) {
    rec.result.label = want;
    writeFileSync(p, JSON.stringify(rec, null, 2));
    fixed++;
  }
}
console.log(`labels recomputed: ${fixed}`);

let bad = 0;
for (const f of files) {
  const rec = JSON.parse(readFileSync(path.join(snapDir, f), "utf8"));
  if (rec?.kind !== "verdict") continue;
  const exp = labelRisk(rec.result.verdict, rec.coverage);
  if (rec.result.label !== exp) {
    bad++;
    console.log(`MISMATCH ${f} verdict=${rec.result.verdict} label=${rec.result.label}`);
  }
}
console.log(`remaining mismatches: ${bad}`);
process.exit(bad ? 1 : 0);
