// All numbers below are lifted from committed snapshots (snapshots/*.json).
// Reason (R-31 / R-17): nothing in the video may be invented.
import { C } from "./brand";

export type DimLevel = "CLEAN" | "WARN" | "DANGER" | "INSUFFICIENT";

export interface CaseData {
  token: string;
  chain: string;
  verdict: string;
  label: string;
  color: string;
  score: number;
  rows: [string, DimLevel][];
  foot: string;
  footAccent: string;
}

export const CASES: CaseData[] = [
  {
    token: "RAY",
    chain: "solana",
    verdict: "RAWAN",
    label: "CAUTION",
    color: C.warn,
    score: 85,
    rows: [
      ["SAFETY", "CLEAN"],
      ["top5MakerShare 0.92 vs <0.50", "WARN"],
      ["LIQUIDITY", "CLEAN"],
      ["PUMP", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-30): one warning row, named. Jev:",
    footAccent: "contested · P(risky) 0.21",
  },
  {
    token: "CEL",
    chain: "ethereum",
    verdict: "JANGAN",
    label: "HIGH RISK FLAGS",
    color: C.danger,
    score: 45,
    rows: [
      ["swapsPerDay 13.1 vs ≥50/day", "DANGER"],
      ["top5MakerShare 1.00 vs <0.50", "WARN"],
      ["unclassifiedFlags: pausable,unrenounced", "WARN"],
      ["LIQUIDITY / PUMP", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-30): collapsed lender, dead tape. Jev:",
    footAccent: "lean · P(risky) 0.43",
  },
  {
    token: "TITANO",
    chain: "bsc",
    verdict: "JANGAN",
    label: "HIGH RISK FLAGS",
    color: C.danger,
    score: 0,
    rows: [
      ["totalLiqUsd $0 vs ≥$10k", "DANGER"],
      ["swapCount 0 observed", "INSUFFICIENT"],
      ["securityLevel highRisk", "WARN"],
      ["PUMP", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-30): dust liquidity — no exit exists. Jev:",
    footAccent: "lean · P(risky) 0.64",
  },
  {
    token: "BRETT",
    chain: "base",
    verdict: "LAYAK",
    label: "NO FLAGS OBSERVED",
    color: C.safe,
    score: 100,
    rows: [
      ["SAFETY / FLOW", "CLEAN"],
      ["LIQUIDITY / PUMP", "CLEAN"],
      ["swapsPerDay healthy", "CLEAN"],
      ["", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-30): zero failing rows. Jev:",
    footAccent: "consensus · P(risky) 0.10",
  },
];

// Recorded SHA-256 prefixes from verdict 8bf023dc978a (CEL archive, 2026-09-30).
export const RECEIPTS: [string, string, string][] = [
  ["/v1/dex/search", "CEL · Ethereum", "61476889"],
  ["/v1/dex/tokens/transactions", "100 swaps", "7687d4f5"],
  ["/v1/dex/token/pools", "pool depth", "07b73013"],
  ["/v1/dex/liquidity-change/list", "LP events", "82b5b88b"],
  ["/v1/dex/security/detail", "risk flags", "546347ad"],
  ["/v1/dex/token", "creator meta", "6b2903ec"],
  ["/v1/global-metrics/quotes/latest", "market ctx", "ec4887cd"],
  ["/v1/global-metrics/quotes/historical", "market ctx", "a7b5e8b4"],
  ["/v3/fear-and-greed/latest", "market ctx", "6246986a"],
];

export const STATS: [string, string][] = [
  ["301", "recorded verdicts on file"],
  ["9", "chains covered"],
  ["2,709", "recorded API receipts"],
  ["29,744", "swap events on file"],
];

// Timeline windows (frames @30fps). Shared by every variant so the VO syncs identically.
export const TL = {
  hook: { from: 0, dur: 240 },
  intro: { from: 240, dur: 210 },
  method: { from: 450, dur: 300 },
  verdicts: { from: 750, dur: 870 },
  receipts: { from: 1620, dur: 330 },
  scale: { from: 1950, dur: 330 },
  close: { from: 2280, dur: 420 },
};
