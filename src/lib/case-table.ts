// Pure filter/sort for the case-files table. Serialized rows are built
// server-side in app/page.tsx and handed to the client CaseTable component.

export interface CaseRow {
  slug: string;
  id: string;
  symbol: string;
  name: string;
  platform: string;
  address: string;
  verdictKey: string; // LAYAK | RAWAN | JANGAN | BELUM_CUKUP_BUKTI | v2 label
  label: string; // display label, e.g. "ENTRY-WORTHY" / "NO FLAGS OBSERVED"
  tone: "safe" | "warn" | "danger" | "unknown";
  score: number;
  mcapUsd: number | null;
  liqUsd: number;
  netUsd: number;
  sells: number;
  jevProb: number | null;
  agreement: string;
  captured: string;
}

export type CaseSortKey = "score" | "mcap" | "liq" | "net" | "captured";
export type SortDir = "asc" | "desc";

export interface CaseFilter {
  verdicts?: ReadonlySet<string>;
  chains?: ReadonlySet<string>;
  q?: string;
}

export function filterCaseRows(rows: CaseRow[], f: CaseFilter): CaseRow[] {
  const q = f.q?.trim().toLowerCase();
  return rows.filter((r) => {
    if (f.verdicts && f.verdicts.size > 0 && !f.verdicts.has(r.verdictKey)) return false;
    if (f.chains && f.chains.size > 0 && !f.chains.has(r.platform.toLowerCase())) return false;
    if (q) {
      const hay = `${r.symbol} ${r.name} ${r.address} ${r.platform}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

const NUM: Record<CaseSortKey, (r: CaseRow) => number | null> = {
  score: (r) => r.score,
  mcap: (r) => r.mcapUsd,
  liq: (r) => r.liqUsd,
  net: (r) => r.netUsd,
  captured: (r) => Date.parse(r.captured),
};

export function sortCaseRows(rows: CaseRow[], key: CaseSortKey, dir: SortDir): CaseRow[] {
  const get = NUM[key];
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    const an = av == null || !Number.isFinite(av);
    const bn = bv == null || !Number.isFinite(bv);
    if (an && bn) return 0;
    if (an) return 1; // nulls always last
    if (bn) return -1;
    return (av! - bv!) * sign;
  });
}
