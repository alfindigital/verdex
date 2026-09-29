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
  return records
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
}
