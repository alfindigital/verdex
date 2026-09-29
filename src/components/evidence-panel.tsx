import type { EvidenceSummary, SourceEvidence } from "@/lib/verdict-types";

const EXPLORERS: Record<string, string> = {
  ethereum: "https://etherscan.io/tx/",
  bsc: "https://bscscan.com/tx/",
  base: "https://basescan.org/tx/",
  arbitrum: "https://arbiscan.io/tx/",
  optimism: "https://optimistic.etherscan.io/tx/",
  polygon: "https://polygonscan.com/tx/",
  avalanche: "https://snowtrace.io/tx/",
};

function explorerBase(chain: string): string | null {
  return EXPLORERS[chain.trim().toLowerCase()] ?? null;
}

export function EvidencePanel({
  sources = [],
  evidence = [],
  chain,
}: {
  sources?: SourceEvidence[];
  evidence?: EvidenceSummary[];
  chain: string;
}) {
  return (
    <details className="group border-t border-line">
      <summary className="cursor-pointer select-none px-5 py-3 font-data text-[11px] text-dim transition-colors hover:text-text [&::-webkit-details-marker]:hidden">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
        source evidence · {sources.length} sources · exact hashes
      </summary>
      <div className="space-y-4 border-t border-line p-4 sm:p-5">
        {sources.length === 0 ? (
          <p className="font-data text-xs text-faint">Raw source bodies not retained for this archived assessment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[11px]">
              <thead>
                <tr className="bg-raised text-left font-data text-[9px] uppercase tracking-widest text-faint">
                  <th className="p-2">source</th><th className="p-2">status</th><th className="p-2">provider time</th><th className="p-2">rows</th><th className="p-2">sha256 / note</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.key} className="border-t border-line/40 font-data align-top">
                    <td className="p-2"><span>{source.key}</span><span className="block text-[10px] text-faint">{source.endpoint}</span></td>
                    <td className={`p-2 ${source.status === "ok" ? "text-safe" : source.status === "failed" ? "text-danger" : "text-warn"}`}>{source.status}</td>
                    <td className="p-2 text-faint">{source.providerAt ?? "unknown"}</td>
                    <td className="p-2">{source.acceptedRows} accepted · {source.rejectedRows} rejected</td>
                    <td className="max-w-[28rem] break-all p-2 text-faint">
                      {source.bodySha256 ?? source.reason ?? "no raw body"}
                      {source.bodyBase64 && <span className="mt-1 block text-safe">exact body captured</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {evidence.length > 0 && (
          <div>
            <div className="mb-2 font-data text-[10px] uppercase tracking-widest text-faint">metric receipts</div>
            <ul className="space-y-1 font-data text-[11px] text-dim">
              {evidence.slice(0, 12).map((item, i) => <li key={`${item.source}-${item.metric}-${i}`}>· {item.metric}: {item.explanation} ({item.source} rows {item.rowIndexes.join(", ") || "none"})</li>)}
            </ul>
          </div>
        )}
        <p className="font-data text-[10px] leading-relaxed text-faint">
          Explorer links are emitted only for verified EVM transaction hashes. Unknown chains and malformed hashes stay copy-only.
          {explorerBase(chain) ? " A verified explorer base is configured for this chain." : " This record has no verified explorer mapping."}
        </p>
      </div>
    </details>
  );
}
