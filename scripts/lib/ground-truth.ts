// Shared ground-truth labels for eval scripts — public knowledge, not model
// output. Three classes:
//   "dead"  = collapsed / exploited / wound-down → PASS only if JANGAN;
//             RAWAN = soft flag, LAYAK/INSUF = dangerous miss
//   "faded" = abandoned or ~99%-down but still tradeable → must NOT be
//             LAYAK (a green stamp on a zombie is the worst miss)
//   "major" = established, liquid protocol token → must NOT be JANGAN
//             (that would be a false positive screaming "avoid" at a legit asset)
export interface SnapshotRow {
  token: { symbol: string; platform: string; address?: string };
  result: { verdict: string; score: number };
  metrics?: {
    safety?: { level?: string; hits?: string[]; sellTax?: number | null; flaggedByVendor?: boolean };
    liq?: { totalLiqUsd?: number };
    flow?: { swapsPerDay?: number };
  };
  dossier?: { market?: { priceUsd?: number | null; liqUsd?: number | null; mcapUsd?: number | null } | null };
  computedAt?: string;
}

export const LABELS: Record<string, { cls: "dead" | "faded" | "major"; note: string }> = {
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

export type LabelClass = "dead" | "faded" | "major";

export const passFor = (cls: LabelClass, verdict: string): boolean =>
  cls === "dead" ? verdict === "JANGAN"
  : cls === "faded" ? verdict !== "LAYAK" && verdict !== "BELUM_CUKUP_BUKTI"
  : verdict !== "JANGAN"; // major

export const labelKey = (token: { symbol: string; platform: string }) =>
  `${token.symbol.replace(/^\$/, "")}:${token.platform}`;
