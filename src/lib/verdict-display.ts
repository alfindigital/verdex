export type ToneKey = "safe" | "warn" | "danger" | "unknown";

export const VERDICT_STYLE: Record<string, { label: string; tone: ToneKey }> = {
  LAYAK: { label: "ENTRY-WORTHY", tone: "safe" },
  RAWAN: { label: "CAUTION", tone: "warn" },
  JANGAN: { label: "AVOID", tone: "danger" },
  BELUM_CUKUP_BUKTI: { label: "INSUFFICIENT", tone: "unknown" },
};

export const RISK_STYLE: Record<string, { label: string; tone: ToneKey }> = {
  NO_FLAGS_OBSERVED: { label: "NO FLAGS OBSERVED", tone: "safe" },
  CAUTION: { label: "CAUTION", tone: "warn" },
  HIGH_RISK_FLAGS: { label: "HIGH RISK FLAGS", tone: "danger" },
  INSUFFICIENT_EVIDENCE: { label: "INSUFFICIENT EVIDENCE", tone: "unknown" },
};

export const LEVEL_TONE: Record<string, ToneKey> = {
  CLEAN: "safe",
  WARN: "warn",
  DANGER: "danger",
  INSUFFICIENT: "unknown",
};

/** Display label+tone for a verdict record: v2 risk label wins when present. */
export function displayFor(v: { schemaVersion?: number; result: { verdict: string; label?: string } }): { label: string; tone: ToneKey } {
  return (
    (v.schemaVersion === 2 && v.result.label ? RISK_STYLE[v.result.label] : undefined) ??
    VERDICT_STYLE[v.result.verdict] ??
    VERDICT_STYLE.BELUM_CUKUP_BUKTI
  );
}
