// Shared reusable components for all 3 Verdex variants.
// Each exists because scenes need it — no decorative scaffolding (C-3).
import React from "react";
import { Easing, interpolate } from "remotion";
import { C, F } from "../brand";
import { DimLevel } from "../data";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// ─────────────────────────────────────────────
// ScoreRing — SVG animated circular score gauge
// ─────────────────────────────────────────────
interface ScoreRingProps {
  score: number;
  color: string;
  frame: number;
  at: number;
  size?: number;
  span?: number;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  color,
  frame,
  at,
  size = 160,
  span = 22,
}) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const animated = interpolate(frame, [at, at + span], [0, score], {
    ...clamp,
    easing: easeOut,
  });
  const dashOffset = circ - (circ * animated) / 100;
  const displayScore = Math.round(animated);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.line}
          strokeWidth={8}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
        />
      </svg>
      {/* Score label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: F.data,
            fontSize: size * 0.28,
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}
        >
          {displayScore}
        </span>
        <span
          style={{
            fontFamily: F.data,
            fontSize: size * 0.1,
            color: C.faint,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          /100
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// DimBar — dimension level indicator row
// ─────────────────────────────────────────────
interface DimBarProps {
  name: string;
  level: DimLevel;
  frame: number;
  at: number;
  mono?: boolean; // true = monospace label style (α)
}

const LEVEL_COLOR: Record<DimLevel, string> = {
  CLEAN: C.safe,
  WARN: C.warn,
  DANGER: C.danger,
  INSUFFICIENT: C.faint,
};

export const DimBar: React.FC<DimBarProps> = ({ name, level, frame, at, mono = false }) => {
  const barWidth = interpolate(frame, [at, at + 16], [0, 100], {
    ...clamp,
    easing: easeOut,
  });
  const opacity = interpolate(frame, [at, at + 10], [0, 1], clamp);
  const color = LEVEL_COLOR[level] ?? C.cold;

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 0",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <span
        style={{
          fontFamily: mono ? F.data : F.display,
          fontSize: mono ? 18 : 20,
          fontWeight: 500,
          color: C.dim,
          width: 280,
          flexShrink: 0,
          letterSpacing: mono ? "0.05em" : undefined,
          textTransform: "uppercase",
        }}
      >
        {name}
      </span>
      {/* Bar track */}
      <div
        style={{
          flex: 1,
          height: 4,
          background: C.line,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${barWidth}%`,
            background: color,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: F.data,
          fontSize: 16,
          fontWeight: 700,
          color,
          width: 70,
          textAlign: "right",
          letterSpacing: "0.08em",
        }}
      >
        {level}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────
// ReceiptRow — single API receipt row
// ─────────────────────────────────────────────
interface ReceiptRowProps {
  endpoint: string;
  label: string;
  hash: string;
  frame: number;
  at: number;
}

export const ReceiptRow: React.FC<ReceiptRowProps> = ({ endpoint, label, hash, frame, at }) => {
  const opacity = interpolate(frame, [at, at + 8], [0, 1], clamp);
  const translate = interpolate(frame, [at, at + 8], ["0px 6px", "0px 0px"], {
    ...clamp,
    easing: easeOut,
  });

  return (
    <div
      style={{
        opacity,
        translate,
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 24,
        alignItems: "center",
        padding: "8px 0",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <span style={{ fontFamily: F.data, fontSize: 15, color: C.dim }}>{endpoint}</span>
      <span style={{ fontFamily: F.data, fontSize: 14, color: C.faint, textAlign: "right" }}>
        {label}
      </span>
      <span style={{ fontFamily: F.data, fontSize: 14, color: C.safe, minWidth: 100 }}>
        sha256:{hash}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────
// VerdictLabel — verdict badge, styled by variant
// ─────────────────────────────────────────────
interface VerdictLabelProps {
  label: string;
  color: string;
  frame: number;
  at: number;
  size?: number;
  variant?: "alpha" | "beta" | "gamma";
}

export const VerdictLabel: React.FC<VerdictLabelProps> = ({
  label,
  color,
  frame,
  at,
  size = 36,
  variant = "gamma",
}) => {
  const opacity = interpolate(frame, [at, at + 8], [0, 1], clamp);

  const borderStyle = variant === "gamma" ? `1px solid ${color}` : "none";
  const bg =
    variant === "alpha"
      ? "transparent"
      : variant === "beta"
      ? color + "22"
      : "transparent";

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        fontFamily: variant === "alpha" ? F.data : F.display,
        fontWeight: 900,
        fontSize: size,
        color,
        border: borderStyle,
        background: bg,
        padding: variant === "gamma" ? "6px 18px" : undefined,
        letterSpacing: variant === "alpha" ? "0.18em" : "-0.01em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
};
