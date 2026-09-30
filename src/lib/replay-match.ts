import { canonicalChain, tokenIdentity } from "@/lib/address";
import type { ScanBody } from "@/lib/scan-policy";

export interface ReplayRecordLike {
  id: string;
  token: { platform: string; address: string; symbol: string; name: string };
  [key: string]: unknown;
}

function queryMatches(record: ReplayRecordLike, query: string): boolean {
  const q = query.trim().toLowerCase();
  return [record.token.address, record.token.symbol, record.token.name]
    .filter(Boolean)
    .some((value) => value.toLowerCase() === q || (value === record.token.symbol && value.toLowerCase() === q.replace(/^\$/, "")));
}

export function matchReplayRecords<T extends ReplayRecordLike>(records: T[], body: ScanBody): T[] {
  const requestedChain = body.platform ? canonicalChain(body.platform) : null;
  const requestedIdentity = body.selection ? tokenIdentity(body.selection.platform, body.selection.address) : null;
  const matches = records
    .filter((record) => {
      if (!queryMatches(record, body.query)) return false;
      if (requestedChain && canonicalChain(record.token.platform) !== requestedChain) return false;
      if (body.selection) {
        if (!requestedIdentity) return false;
        return tokenIdentity(record.token.platform, record.token.address) === requestedIdentity;
      }
      return true;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  // Duplicate records of the SAME token identity (e.g. a v1 snapshot beside the
  // newer v2 capture) are not ambiguity — serve the newest/best record.
  // Ambiguity only means two DIFFERENT token identities matched.
  const identities = new Set(matches.map((r) => tokenIdentity(r.token.platform, r.token.address)));
  if (identities.size === 1 && matches.length > 1) {
    const best = [...matches].sort(
      (a, b) =>
        ((b as { schemaVersion?: number }).schemaVersion ?? 0) - ((a as { schemaVersion?: number }).schemaVersion ?? 0) ||
        ((b as { ts?: string }).ts ?? "").localeCompare((a as { ts?: string }).ts ?? ""),
    );
    return [best[0]];
  }
  return matches;
}
