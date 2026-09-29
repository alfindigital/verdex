import { ImageResponse } from "next/og";
import { listSnapshotIds, listSnapshotSlugs, loadVerdict } from "@/lib/verdict-store";

export const runtime = "nodejs";
export const dynamicParams = true;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  const ids = [...listSnapshotIds(), ...listSnapshotSlugs()];
  return [...new Set(ids)].map((id) => ({ id }));
}

const COLORS: Record<string, string> = {
  LAYAK: "#3dd68c",
  RAWAN: "#f0b23c",
  JANGAN: "#f2555a",
  BELUM_CUKUP_BUKTI: "#9aa392",
};
const LABEL: Record<string, string> = {
  LAYAK: "ENTRY-WORTHY",
  RAWAN: "CAUTION",
  JANGAN: "AVOID",
  BELUM_CUKUP_BUKTI: "INSUFFICIENT EVIDENCE",
};
const V2_LABEL: Record<string, string> = {
  NO_FLAGS_OBSERVED: "NO FLAGS OBSERVED",
  CAUTION: "CAUTION",
  HIGH_RISK_FLAGS: "HIGH RISK FLAGS",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT EVIDENCE",
};

export default async function Og({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = loadVerdict(id);
  const verdict = v?.result.verdict ?? "BELUM_CUKUP_BUKTI";
  const displayLabel = v?.schemaVersion === 2 && v.result.label ? V2_LABEL[v.result.label] ?? "INSUFFICIENT EVIDENCE" : LABEL[verdict] ?? LABEL.BELUM_CUKUP_BUKTI;
  const color = COLORS[verdict] ?? COLORS.BELUM_CUKUP_BUKTI;
  const receipt = v?.receipts[0]?.sha256?.slice(0, 12) ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0c0a",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              background: "#eae8da",
              color: "#1b1d16",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              padding: "8px 18px",
              transform: "rotate(-1deg)",
            }}
          >
            VERDEX · EVIDENCE DOSSIER
          </div>
          <div style={{ display: "flex", color: "#8b947f", fontSize: 22 }}>exhibit/{v?.id ?? id}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              color,
              fontSize: displayLabel.length > 14 ? 76 : 96,
              fontWeight: 900,
              lineHeight: 1.05,
              border: `5px solid ${color}`,
              borderRadius: 8,
              padding: "10px 28px",
              transform: "rotate(-2deg)",
            }}
          >
            {displayLabel}
          </div>
          <div style={{ color: "#eef1e7", fontSize: 40, marginTop: 36 }}>
            {v ? `${v.token.symbol} on ${v.token.platform} — ${v.schemaVersion === 2 ? (v.mode === "replay" ? "recorded replay" : "live scan") : `legacy score ${v.result.score}/100`}` : "verdict not found"}
          </div>
          {receipt && (
            <div style={{ display: "flex", color: "#8b947f", fontSize: 22, marginTop: 18, letterSpacing: 2 }}>
              sha256 {receipt}… · every CMC call receipted
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", color: "#8b947f", fontSize: 22 }}>
          <div>Don&apos;t be the exit liquidity</div>
          <div>CoinMarketCap DEX data · not financial advice</div>
        </div>
      </div>
    ),
    size,
  );
}
