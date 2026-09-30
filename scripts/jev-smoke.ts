// Smoke-check the Jev/TypeSafe oracle path end-to-end with synthetic metrics.
// Sends ONLY the computed metric summary — the same boundary analyze() uses.
// Usage: pnpm tsx scripts/jev-smoke.ts   (reads TYPESAFE_API_KEYS from .env.local)

import { readFileSync } from "fs";
import path from "path";
import { jevCrossExamine, agreement } from "../src/lib/jev";

async function main() {
  try {
    for (const line of readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    // env may already be set
  }
  const op = await jevCrossExamine({
    swapCount: 100,
    uniqueMakers: 61,
    top5MakerShare: 0.52,
    netBuyRatio: 0.92,
    thirdPartySells: 16,
    liqTotalUsd: 34_000_000,
    lpAdds: 8,
    lpRemoves: 0,
    volMcapRatio: 0.0008,
    securityLevel: "unknown",
    securityHits: [],
  });
  console.log("jev opinion:", JSON.stringify(op, null, 2));
  console.log(
    "agreement vs RAWAN:",
    agreement("RAWAN", op, [
      { dim: "SAFETY", level: "INSUFFICIENT" },
      { dim: "FLOW", level: "WARN" },
      { dim: "LIQUIDITY", level: "CLEAN" },
      { dim: "PUMP", level: "CLEAN" },
    ]),
  );
}

void main();
