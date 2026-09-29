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
  LAYAK: "#10b981",
  RAWAN: "#f59e0b",
  JANGAN: "#ef4444",
  BELUM_CUKUP_BUKTI: "#a3a3a3",
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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0a",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ color: "#737373", fontSize: 28, marginBottom: 12 }}>Verdex · evidence-backed verdict</div>
        <div style={{ color, fontSize: 96, fontWeight: 900, lineHeight: 1 }}>{displayLabel}</div>
        <div style={{ color: "#e5e5e5", fontSize: 44, marginTop: 24 }}>
          {v ? `${v.token.symbol} on ${v.token.platform} — ${v.schemaVersion === 2 ? (v.mode === "replay" ? "recorded replay" : "live scan") : `legacy score ${v.result.score}/100`}` : "verdict not found"}
        </div>
        <div style={{ color: "#525252", fontSize: 24, marginTop: 32 }}>
          Don&apos;t be the exit liquidity · powered by CoinMarketCap DEX data
        </div>
      </div>
    ),
    size,
  );
}
