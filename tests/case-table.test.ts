import { describe, expect, it } from "vitest";
import { filterCaseRows, sortCaseRows, type CaseRow } from "@/lib/case-table";

const row = (over: Partial<CaseRow>): CaseRow => ({
  slug: "x", id: "a1b2c3d4e5f6", symbol: "AAA", name: "Alpha", platform: "ethereum",
  address: "0xabc", verdictKey: "LAYAK", label: "ENTRY-WORTHY", tone: "safe", score: 90, mcapUsd: 1_000_000,
  liqUsd: 50_000, netUsd: 1200, sells: 10, jevProb: 0.1, agreement: "consensus",
  captured: "2026-09-01T00:00:00Z", ...over,
});

const corpus: CaseRow[] = [
  row({ symbol: "AAA", verdictKey: "LAYAK", score: 90, mcapUsd: 5_000_000, netUsd: 100 }),
  row({ symbol: "BBB", name: "Beta", platform: "solana", verdictKey: "JANGAN", score: 30, mcapUsd: null, netUsd: -500 }),
  row({ symbol: "CCC", name: "Gamma", platform: "base", verdictKey: "RAWAN", score: 60, mcapUsd: 800_000, netUsd: 0 }),
];

describe("filterCaseRows", () => {
  it("returns all rows when filters are empty", () => {
    expect(filterCaseRows(corpus, {})).toHaveLength(3);
  });

  it("filters by verdict keys", () => {
    const out = filterCaseRows(corpus, { verdicts: new Set(["JANGAN"]) });
    expect(out).toHaveLength(1);
    expect(out[0].symbol).toBe("BBB");
  });

  it("filters by chain", () => {
    const out = filterCaseRows(corpus, { chains: new Set(["base"]) });
    expect(out).toHaveLength(1);
    expect(out[0].symbol).toBe("CCC");
  });

  it("matches query across symbol, name and address, case-insensitive", () => {
    expect(filterCaseRows(corpus, { q: "beta" })).toHaveLength(1);
    expect(filterCaseRows(corpus, { q: "AAA" })).toHaveLength(1);
    expect(filterCaseRows(corpus, { q: "0XABC" })).toHaveLength(3);
    expect(filterCaseRows(corpus, { q: "zzz" })).toHaveLength(0);
  });

  it("combines filters as AND", () => {
    const out = filterCaseRows(corpus, { verdicts: new Set(["RAWAN", "JANGAN"]), chains: new Set(["solana"]) });
    expect(out).toHaveLength(1);
    expect(out[0].symbol).toBe("BBB");
  });
});

describe("sortCaseRows", () => {
  it("sorts by score descending", () => {
    const out = sortCaseRows(corpus, "score", "desc");
    expect(out.map((r) => r.symbol)).toEqual(["AAA", "CCC", "BBB"]);
  });

  it("sorts ascending when dir=asc", () => {
    const out = sortCaseRows(corpus, "score", "asc");
    expect(out[0].symbol).toBe("BBB");
  });

  it("keeps null mcap last regardless of direction", () => {
    const desc = sortCaseRows(corpus, "mcap", "desc");
    expect(desc.at(-1)?.symbol).toBe("BBB");
    const asc = sortCaseRows(corpus, "mcap", "asc");
    expect(asc.at(-1)?.symbol).toBe("BBB");
    expect(asc[0].symbol).toBe("CCC");
  });

  it("does not mutate input", () => {
    const before = corpus.map((r) => r.symbol);
    sortCaseRows(corpus, "score", "asc");
    expect(corpus.map((r) => r.symbol)).toEqual(before);
  });
});
