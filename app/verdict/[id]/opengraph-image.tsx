import { ImageResponse } from "next/og";
import { loadVerdict } from "@/lib/verdict-store";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

export default async function Og({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = loadVerdict(id);
  const verdict = v?.result.verdict ?? "BELUM_CUKUP_BUKTI";
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
        <div style={{ color, fontSize: 96, fontWeight: 900, lineHeight: 1 }}>{LABEL[verdict]}</div>
        <div style={{ color: "#e5e5e5", fontSize: 44, marginTop: 24 }}>
          {v ? `${v.token.symbol} on ${v.token.platform} — score ${v.result.score}/100` : "verdict not found"}
        </div>
        <div style={{ color: "#525252", fontSize: 24, marginTop: 32 }}>
          Don&apos;t be the exit liquidity · powered by CoinMarketCap DEX data
        </div>
      </div>
    ),
    size,
  );
}
