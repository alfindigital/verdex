import { existsSync, readFileSync } from "fs";
import path from "path";

const root = process.cwd();
const required = [
  "docs/evidence/2026-09-29-capability-check.md",
  "docs/evidence/validation-matrix.md",
  "tests/fixtures/cmc/README.md",
  "tests/fixtures/cmc/synthetic-lp-outage-bundle.json",
  "docs/DEMO-WALKTHROUGH.md",
];
const missing = required.filter((file) => !existsSync(path.join(root, file)));
if (missing.length) throw new Error(`missing documented paths: ${missing.join(", ")}`);

const finalPack = ["README.md", "docs/SUBMISSION-CHECKLIST.md"].filter((file) => existsSync(path.join(root, file)));
const placeholders = finalPack.filter((file) => readFileSync(path.join(root, file), "utf8").includes("XXXX"));
if (placeholders.length) throw new Error(`submission placeholder remains in final pack: ${placeholders.join(", ")}`);

const readme = readFileSync(path.join(root, "README.md"), "utf8");
for (const endpoint of ["/v1/dex/search", "/v1/dex/tokens/transactions", "/v1/dex/token/pools", "/v1/dex/security/detail"]) {
  if (!readme.includes(endpoint)) throw new Error(`README endpoint missing: ${endpoint}`);
}
console.log(`docs OK: ${required.length} required paths, ${finalPack.length} final-pack files, no placeholders`);
