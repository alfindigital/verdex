// All numbers below are lifted from committed snapshots (snapshots/*.json).
// Reason (R-31 / R-17): nothing in the video may be invented.
import { C } from "./brand";

export type DimLevel = "CLEAN" | "WARN" | "DANGER";

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
      ["top5MakerShare 0.92 vs <0.50", "DANGER"],
      ["LIQUIDITY", "CLEAN"],
      ["PUMP", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-30): one failing row, named. Jev:",
    footAccent: "unavailable in replay — labeled",
  },
  {
    token: "SUSHI",
    chain: "ethereum",
    verdict: "JANGAN",
    label: "AVOID",
    color: C.danger,
    score: 45,
    rows: [
      ["top5MakerShare 0.73 vs <0.50", "DANGER"],
      ["centralizationFlags: mintable", "WARN"],
      ["netBuyRatio -0.03 vs >0", "WARN"],
      ["LIQUIDITY / PUMP", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-26): every failing row is named. Jev:",
    footAccent: "contested",
  },
  {
    token: "GMX",
    chain: "arbitrum",
    verdict: "JANGAN",
    label: "AVOID",
    color: C.danger,
    score: 60,
    rows: [
      ["SAFETY", "CLEAN"],
      ["top5MakerShare 0.81 vs <0.50", "DANGER"],
      ["netBuyRatio -0.28 vs >0", "WARN"],
      ["LIQUIDITY / PUMP", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-30): FLOW danger on blue-chip governance token",
    footAccent: "coverage limited — truncation disclosed",
  },
  {
    token: "AAVE",
    chain: "ethereum · mcap $2.4B",
    verdict: "RAWAN",
    label: "CAUTION",
    color: C.warn,
    score: 70,
    rows: [
      ["centralizationFlags: upgradeable", "WARN"],
      ["top5MakerShare 0.87 vs <0.50", "DANGER"],
      ["LIQUIDITY / PUMP", "CLEAN"],
      ["", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-30): rules caution",
    footAccent: "failing rows named, not hidden",
  },
];

// Recorded SHA-256 prefixes from verdict 0153cafc32e5 (RAY archive, 2026-09-30).
export const RECEIPTS: [string, string, string][] = [
  ["/v1/dex/search", "RAY · Solana", "f7b472e6"],
  ["/v1/dex/tokens/transactions", "100 swaps", "df85aafc"],
  ["/v1/dex/token/pools", "pool depth", "8a05ca4d"],
  ["/v1/dex/liquidity-change/list", "LP events", "42186ccf"],
  ["/v1/dex/security/detail", "risk flags", "8eff059e"],
  ["/v1/dex/token", "creator meta", "fbbaf934"],
  ["/v1/global-metrics/quotes/latest", "market ctx", "2aaae67d"],
  ["/v1/global-metrics/quotes/historical", "market ctx", "d6e5def9"],
  ["/v3/fear-and-greed/latest", "market ctx", "fd47e326"],
];

export const STATS: [string, string][] = [
  ["41", "recorded verdicts on file"],
  ["8", "chains covered"],
  ["369", "recorded API receipts"],
  ["31 · 4 · 6", "recorded caution · avoid · insufficient"],
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
