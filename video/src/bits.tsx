import React from "react";
import { useCurrentFrame, Easing, interpolate } from "remotion";
import { C, F } from "./brand";

// Small shared pieces. Every one exists because a scene needs it (C-3).

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

export function rise(frame: number, at: number, span = 18, dist = 26) {
  return {
    opacity: interpolate(frame, [at, at + span], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOut,
    }),
    translate: interpolate(frame, [at, at + span], [`0px ${dist}px`, "0px 0px"], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOut,
    }),
  };
}

export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = C.faint,
}) => (
  <div
    style={{
      fontFamily: F.data,
      fontSize: 22,
      letterSpacing: "0.32em",
      textTransform: "uppercase",
      color,
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

export const VerdictStamp: React.FC<{ label: string; color: string; frame: number; at: number; size?: number }> = ({
  label,
  color,
  frame,
  at,
  size = 120,
}) => {
  // Stamp slams in then settles: the verdict is the weight of evidence landing.
  const p = interpolate(frame, [at, at + 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 1.6, 0.4, 1),
  });
  return (
    <div
      style={{
        fontFamily: F.display,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        color,
        scale: `${0.6 + 0.4 * p}`,
        opacity: p,
        letterSpacing: "-0.02em",
      }}
    >
      {label}
    </div>
  );
};

export const DimTag: React.FC<{ name: string; level: string; frame: number; at: number }> = ({
  name,
  level,
  frame,
  at,
}) => {
  const color =
    level === "CLEAN" ? C.safe : level === "WARN" ? C.warn : level === "DANGER" ? C.danger : C.cold;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: `1px solid ${C.line}`,
        background: C.panel,
        padding: "14px 20px",
        ...rise(frame, at),
      }}
    >
      <span style={{ fontFamily: F.data, fontSize: 24, color: C.text, fontWeight: 500 }}>{name}</span>
      <span style={{ fontFamily: F.data, fontSize: 20, color, fontWeight: 700 }}>{level}</span>
    </div>
  );
};
