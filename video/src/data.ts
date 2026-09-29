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
    token: "GMX",
    chain: "arbitrum",
    verdict: "LAYAK",
    label: "ENTRY-WORTHY",
    color: C.safe,
    score: 100,
    rows: [
      ["SAFETY", "CLEAN"],
      ["FLOW", "CLEAN"],
      ["LIQUIDITY", "CLEAN"],
      ["PUMP", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-26): Jev second opinion",
    footAccent: "0.10 · consensus",
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
    token: "AAVE",
    chain: "ethereum · mcap $2.4B",
    verdict: "RAWAN",
    label: "CAUTION",
    color: C.warn,
    score: 70,
    rows: [
      ["centralizationFlags: upgradeable", "WARN"],
      ["top5MakerShare 0.76, mature tier", "WARN"],
      ["netBuyRatio -0.14, mature tier", "WARN"],
      ["LIQUIDITY / PUMP", "CLEAN"],
    ],
    foot: "Recorded archive (2026-09-26): rules caution. Jev: 0.27.",
    footAccent: "Contested, shown not hidden",
  },
];

// Recorded SHA-256 prefixes from verdict 8d3ea1d0c471 (GMX archive).
export const RECEIPTS: [string, string, string][] = [
  ["/v1/dex/search", "GMX · Arbitrum", "e8517296"],
  ["/v1/dex/tokens/transactions", "100 swaps", "8a6b0f55"],
  ["/v1/dex/token/pools", "pool depth", "cabe41d1"],
  ["/v1/dex/liquidity-change/list", "LP events", "4b1b7fa4"],
  ["/v1/dex/security/detail", "risk flags", "e9a5b0b1"],
  ["/v1/dex/token", "creator meta", "4708ce14"],
  ["/v1/global-metrics/quotes/historical", "market ctx", "9b364428"],
  ["/v3/fear-and-greed/latest", "market ctx", "acb39ab9"],
  ["/v1/global-metrics/quotes/latest", "market ctx", "8bd80c85"],
];

export const STATS: [string, string][] = [
  ["34", "recorded verdicts on file"],
  ["7", "chains covered"],
  ["306", "recorded API receipts"],
  ["30 · 3 · 1", "recorded caution · avoid · entry-worthy"],
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
