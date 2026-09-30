export type ParsedRows<T> = {
  rows: T[];
  rejected: number;
  duplicates: number;
  reasons: string[];
};

export type SourceKey = "search" | "swaps" | "pools" | "lp" | "security" | "meta" | "globalLatest" | "globalHistorical" | "fearGreed";
export type SourceStatus = "ok" | "empty" | "failed" | "unsupported" | "invalid" | "timeout" | "not-captured";
export type CoverageLevel = "sufficient" | "limited" | "insufficient";
export type RiskLabel = "NO_FLAGS_OBSERVED" | "CAUTION" | "HIGH_RISK_FLAGS" | "INSUFFICIENT_EVIDENCE";

export interface SourceEvidence {
  key: SourceKey;
  status: SourceStatus;
  endpoint: string;
  params: Record<string, string | number>;
  fetchedAt: string;
  providerAt: string | null;
  httpStatus: number | null;
  credits: number | null;
  bodySha256: string | null;
  bodyBase64: string | null;
  evidenceKind: "exact-body" | "receipt-only" | "none";
  parserVersion: string;
  acceptedRows: number;
  rejectedRows: number;
  cached: boolean;
  reason: string | null;
}

export interface ObservationWindow {
  firstSwapAt: string | null;
  lastSwapAt: string | null;
  validSwaps: number;
  rejectedSwaps: number;
  duplicateRows: number;
  requestedLimit: number;
  fetchedPages: number;
  truncated: boolean;
}

export interface Coverage {
  level: CoverageLevel;
  reasons: string[];
  checkedAt: string;
  stale: boolean;
  exclusionStatus: "creator-owner-known" | "partial" | "unknown";
  dimensions: Record<"SAFETY" | "FLOW" | "LIQUIDITY" | "PUMP", CoverageLevel>;
}

export interface RecheckCondition {
  dimension: "SAFETY" | "FLOW" | "LIQUIDITY" | "PUMP" | "COVERAGE";
  metric: string;
  observed: number | string | null;
  requirement: string;
  reason: string;
}

export interface EvidenceSummary {
  source: SourceKey;
  rowIndexes: number[];
  metric: string;
  explanation: string;
}

/**
 * TokenDossier — the richer, read-only "everything the sources said" view.
 * Values are provider-reported fields carried through the normalizers; they
 * are observations, not independently verified claims. Absent fields are
 * null/absent — never fabricated as zero.
 */
export interface DossierPoolRow {
  address: string;
  dex: string;
  pair: string;
  liqUsd: number;
  vol24h: number;
  t0liqUsd: number | null;
  t1liqUsd: number | null;
  ageDays: number | null;
  top: boolean;
  rank: number | null;
}

export interface DossierSwapRow {
  ts: string;
  side: "buy" | "sell";
  usd: number;
  maker: string;
  dex: string;
  tx: string;
  tokenAmount: number | null; // amount on the scanned-token side
  counterAmount: number | null;
  counterSymbol: string | null;
  tokenPriceUsd: number | null;
}

export interface DossierLpRow {
  ts: string;
  kind: "add" | "remove";
  usd: number;
  dex: string | null;
  maker: string;
  tx: string | null;
}

export interface DossierSecurityItem {
  code: string;
  hit: boolean;
  level: string;
  description: string | null;
  group: string | null;
}

export interface TokenDossier {
  profile: {
    logo: string | null;
    cmcId: number | null;
    decimals: number | null;
    totalSupply: number | null;
    holders: number | null;
    listedAt: string | null;
    firstPoolAt: string | null;
    ageDays: number | null;
    riskLevel: string | null; // provider `rl` — not a Verdex verdict
    tokenSource: string | null;
    tradeUrl: string | null;
    website: string | null;
    twitter: string | null;
    telegram: string | null;
    creator: string | null;
    owner: string | null;
    cexListingCount: number;
    cexNames: string[]; // up to 8 names
  };
  market: {
    priceUsd: number | null;
    high24hUsd: number | null;
    low24hUsd: number | null;
    mcapUsd: number | null;
    liqUsd: number | null;
    vol24hUsd: number | null;
    uniqueTraders24h: number | null; // ut24h from search
    priceChange24h: number | null;
  };
  windowStats: {
    tp: string;
    volUsd: number | null;
    txCount: number | null;
    buyCount: number | null;
    sellCount: number | null;
    buyVolUsd: number | null;
    sellVolUsd: number | null;
    uniqueTraders: number | null;
    priceChange: number | null;
  }[];
  pools: DossierPoolRow[]; // sorted by liqUsd desc
  topSwaps: DossierSwapRow[]; // top-N by usd
  recentSwaps: DossierSwapRow[]; // newest-N
  lpEvents: DossierLpRow[]; // newest-N
  security: {
    level: string;
    categoryLevel: string | null;
    items: DossierSecurityItem[];
    hitCount: number;
    checkCount: number;
    evmFlags: Record<string, string>;
    tags: string[];
  } | null;
  global: {
    ethDom: number | null;
    btcDom: number | null;
    btcDom24hChange: number | null;
    totalMcapUsd: number | null;
    defiVol24hUsd: number | null;
    defiMcapUsd: number | null;
    stableMcapUsd: number | null;
    fearGreed: number | null;
    fearGreedClass: string | null;
  };
}
