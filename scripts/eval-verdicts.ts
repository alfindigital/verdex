// Labeled-set evaluation: replays verdicts against a small hand-labeled
// ground truth drawn from the committed corpus. Not statistical proof —
// an honesty check: dead/untradeable tokens should not score well, mature
// majors should never be AVOID, and every miss is printed, not hidden.
//
//   npx tsx scripts/eval-verdicts.ts
import { readFileSync, readdirSync } from "fs";
import path from "path";

interface Snap { token: { symbol: string; platform: string }; result: { verdict: string; score: number }; }

// Ground truth — public knowledge, not model output. Three classes:
//   "dead"  = collapsed / exploited / wound-down → PASS only if JANGAN;
//             RAWAN = soft flag, LAYAK/INSUF = dangerous miss
//   "faded" = abandoned or ~99%-down but still tradeable → must NOT be
//             LAYAK (a green stamp on a zombie is the worst miss)
//   "major" = established, liquid protocol token → must NOT be JANGAN
//             (that would be a false positive screaming "avoid" at a legit asset)
const LABELS: Record<string, { cls: "dead" | "faded" | "major"; note: string }> = {
  // --- dead / collapsed ---
  "TITANO:BSC": { cls: "dead", note: "rebasing scheme collapsed 2022" },
  "VGX:Ethereum": { cls: "dead", note: "Voyager bankruptcy, delisted" },
  "FTX Token:Ethereum": { cls: "dead", note: "FTX collapse — still trades thin" },
  "CEL:Ethereum": { cls: "dead", note: "Celsius bankruptcy token" },
  "FEI:Ethereum": { cls: "dead", note: "Tribe DAO wound down, FEI deprecated" },
  "NORMIE:Base": { cls: "dead", note: "minting exploit May 2024, token nuked" },
  // --- faded / zombie ---
  "HOGE:Ethereum": { cls: "faded", note: "meme -99% from ATH, dormant community" },
  "DFYN:Polygon": { cls: "faded", note: "Dfyn DEX abandoned, token -99%" },
  "MBOX:BSC": { cls: "faded", note: "MOBOX gamefi faded" },
  "Cheems:BSC": { cls: "faded", note: "meme faded" },
  "boden:Solana": { cls: "faded", note: "jeo boden meme collapsed post-2024" },
  "MICHI:Solana": { cls: "faded", note: "meme faded from ATH" },
  "WEN:Solana": { cls: "faded", note: "meme airdrop faded" },
  // --- established majors (must never be AVOID) ---
  "AAVE:Ethereum": { cls: "major", note: "top-3 lending protocol" },
  "AAVE:Polygon": { cls: "major", note: "AAVE on Polygon" },
  "UNI:Ethereum": { cls: "major", note: "Uniswap governance" },
  "LINK:Ethereum": { cls: "major", note: "Chainlink" },
  "MKR:Ethereum": { cls: "major", note: "MakerDAO/Sky" },
  "COMP:Ethereum": { cls: "major", note: "Compound governance" },
  "SNX:Ethereum": { cls: "major", note: "Synthetix" },
  "SNX:Optimism": { cls: "major", note: "Synthetix on Optimism" },
  "CRV:Ethereum": { cls: "major", note: "Curve" },
  "LDO:Ethereum": { cls: "major", note: "Lido" },
  "OP:Optimism": { cls: "major", note: "Optimism governance" },
  "ARB:Arbitrum": { cls: "major", note: "Arbitrum governance" },
  "GRT:Ethereum": { cls: "major", note: "The Graph" },
  "ENS:Ethereum": { cls: "major", note: "ENS" },
  "PENDLE:Ethereum": { cls: "major", note: "Pendle yield trading" },
  "GMX:Arbitrum": { cls: "major", note: "GMX perp DEX" },
  "JUP:Solana": { cls: "major", note: "Jupiter aggregator" },
  "RAY:Solana": { cls: "major", note: "Raydium" },
  "PYTH:Solana": { cls: "major", note: "Pyth oracle" },
  "ONDO:Ethereum": { cls: "major", note: "Ondo RWA" },
  "MORPHO:Ethereum": { cls: "major", note: "Morpho lending" },
  "DYDX:Ethereum": { cls: "major", note: "dYdX" },
  "YFI:Ethereum": { cls: "major", note: "Yearn" },
  "1INCH:Ethereum": { cls: "major", note: "1inch aggregator" },
  "Cake:BSC": { cls: "major", note: "PancakeSwap" },
  "SUSHI:Ethereum": { cls: "major", note: "Sushi" },
  "POL:Ethereum": { cls: "major", note: "Polygon" },
  "INJ:Ethereum": { cls: "major", note: "Injective" },
  "JTO:Solana": { cls: "major", note: "Jito" },
  "ORCA:Solana": { cls: "major", note: "Orca" },
  "DRIFT:Solana": { cls: "major", note: "Drift perp DEX" },
  "W:Solana": { cls: "major", note: "Wormhole" },
  "EIGEN:Ethereum": { cls: "major", note: "EigenLayer" },
  "ENA:Ethereum": { cls: "major", note: "Ethena" },
  "COW:Gnosis": { cls: "major", note: "CoW Protocol" },
  "GNO:Gnosis": { cls: "major", note: "Gnosis" },
  "AERO:Base": { cls: "major", note: "Aerodrome — largest Base DEX" },
  "VELO:Optimism": { cls: "major", note: "Velodrome — largest OP DEX" },
  "WLD:Ethereum": { cls: "major", note: "Worldcoin" },
  "XVS:BSC": { cls: "major", note: "Venus lending" },
  "TWT:BSC": { cls: "major", note: "Trust Wallet" },
  "QUICK:Polygon": { cls: "major", note: "QuickSwap" },
  "JOE:Avalanche": { cls: "major", note: "Trader Joe" },
  "KWENTA:Optimism": { cls: "major", note: "Kwenta" },
  "SAFE:Ethereum": { cls: "major", note: "Safe (Gnosis Safe)" },
  "SAND:Ethereum": { cls: "major", note: "The Sandbox" },
};

const snapDir = path.resolve("snapshots");
const rows: { sym: string; plat: string; cls: string; verdict: string; score: number; ok: boolean; note: string }[] = [];
const seen = new Set<string>();

const passFor = (cls: string, verdict: string): boolean =>
  cls === "dead" ? verdict === "JANGAN"
  : cls === "faded" ? verdict !== "LAYAK" && verdict !== "BELUM_CUKUP_BUKTI"
  : verdict !== "JANGAN"; // major

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
  rows.push({ sym, plat: rec.token.platform, cls: label.cls, verdict: v, score: rec.result.score, ok: passFor(label.cls, v), note: label.note });
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
