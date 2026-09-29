export const VERDICT_STYLE: Record<string, { label: string; tone: "safe" | "warn" | "danger" | "unknown" }> = {
  LAYAK: { label: "ENTRY-WORTHY", tone: "safe" },
  RAWAN: { label: "CAUTION", tone: "warn" },
  JANGAN: { label: "AVOID", tone: "danger" },
  BELUM_CUKUP_BUKTI: { label: "INSUFFICIENT", tone: "unknown" },
};
