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
