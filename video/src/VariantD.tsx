// Variant D · DOSSIER · the product framed as a forensic evidence desk.
// Direction-A DNA: Fraunces serif display, rotated ink stamps, paper exhibit
// tags, EX-nn numbering, dotted rules, redaction bars, hash fingerprint strip.
// Dial: ENERGY 2 / RHYTHM 3 / MOTION 2 — deliberate, editorial, weighty.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { C, F, ensureFonts } from "./brand";
import { CASES, RECEIPTS, STATS, TL, CaseData } from "./data";
import { VoTrack, snap, slam, count } from "./motion";

const serif = F.serif;
const mono = F.data;

// ——— Direction-A primitives (ported from app/globals.css) ———

// Rotated double-bordered serif stamp — the verdict as an ink seal.
const Stamp: React.FC<{ children: React.ReactNode; color: string; frame: number; at: number; size?: number }> = ({
  children,
  color,
  frame,
  at,
  size = 64,
}) => (
  <div
    style={{
      display: "inline-block",
      fontFamily: serif,
      fontWeight: 640,
      fontSize: size,
      letterSpacing: "0.09em",
      textTransform: "uppercase",
      color,
      border: `3px solid ${color}`,
      boxShadow: `inset 0 0 0 2px ${color}66`,
      borderRadius: 4,
      padding: "0.32em 0.85em",
      lineHeight: 1,
      transform: "rotate(-2.5deg)",
      whiteSpace: "nowrap",
      ...slam(frame, at, 1.35),
    }}
  >
    {children}
  </div>
);

// Paper evidence tag — dark ink on paper, slight tilt.
const PaperTag: React.FC<{ children: React.ReactNode; frame: number; at: number }> = ({ children, frame, at }) => (
  <div
    style={{
      display: "inline-block",
      background: C.paper,
      color: C.paperInk,
      fontFamily: mono,
      fontSize: 19,
      fontWeight: 500,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      padding: "0.3em 0.75em",
      borderRadius: 2,
      transform: "rotate(-1deg)",
      boxShadow: "0 4px 14px -4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.35)",
      ...snap(frame, at, 5),
    }}
  >
    {children}
  </div>
);

// Exhibit header: EX-nn — dotted rule — title.
const Exhibit: React.FC<{ no: string; title: string; frame: number; at: number }> = ({ no, title, frame, at }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 22, width: "100%", ...snap(frame, at, 5) }}>
    <span style={{ fontFamily: mono, fontSize: 21, letterSpacing: "0.18em", color: C.accent, whiteSpace: "nowrap" }}>
      EX-{no}
    </span>
    <span style={{ flex: 1, borderTop: `1px dotted ${C.lineBright}` }} />
    <span style={{ fontFamily: serif, fontWeight: 560, fontSize: 34, color: C.text, letterSpacing: "0.01em" }}>
      {title}
    </span>
  </div>
);

// Redaction bar — visible honesty for data that is not retained.
const Redact: React.FC<{ w: number; frame: number; at: number }> = ({ w, frame, at }) => (
  <div
    style={{
      display: "inline-block",
      width: w,
      height: 26,
      background: `repeating-linear-gradient(-45deg, ${C.panel} 0px, ${C.panel} 8px, ${C.line} 8px, ${C.line} 10px)`,
      border: `1px solid ${C.line}`,
      borderRadius: 2,
      ...snap(frame, at, 5),
    }}
  />
);

// Fingerprint strip: real recorded sha256 prefixes as the texture of proof.
const HashStrip: React.FC<{ frame: number; at: number }> = ({ frame, at }) => (
  <div style={{ display: "flex", gap: 10, ...snap(frame, at, 6) }}>
    {RECEIPTS.slice(0, 9).map(([, , h], i) => (
      <div
        key={i}
        style={{
          fontFamily: mono,
          fontSize: 15,
          color: i % 3 === 0 ? C.safe : C.faint,
          letterSpacing: "0.06em",
        }}
      >
        {h}
      </div>
    ))}
  </div>
);

const STAGE: React.CSSProperties = {
  backgroundColor: C.ink,
  fontFamily: F.display,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "80px 120px",
};

// ——— Scenes ———

const HookD: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={STAGE}>
      <PaperTag frame={f} at={2}>exhibit · pre-trade reality check</PaperTag>
      <div style={{ height: 44 }} />
      <div style={{ fontFamily: serif, fontWeight: 560, fontSize: 92, color: C.text, lineHeight: 1.12, letterSpacing: "-0.01em", maxWidth: 1500, ...snap(f, 10, 6, 24) }}>
        A token can pass every
        <br />
        contract check.
      </div>
      <div style={{ fontFamily: serif, fontWeight: 560, fontSize: 92, color: C.danger, lineHeight: 1.12, letterSpacing: "-0.01em", marginTop: 20, ...snap(f, 66, 6, 24) }}>
        And still rug you.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 64, ...snap(f, 110, 5) }}>
        <Redact w={220} frame={f} at={112} />
        <span style={{ fontFamily: mono, fontSize: 23, color: C.dim }}>
          structure is not behavior. one simulated trade is not a market.
        </span>
      </div>
    </AbsoluteFill>
  );
};

const IntroD: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...STAGE, alignItems: "flex-start" }}>
      <PaperTag frame={f} at={2}>coinmarketcap dex evidence</PaperTag>
      <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 210, color: C.text, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 30, ...snap(f, 8, 6, 30) }}>
        Verdex
      </div>
      <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 480, fontSize: 52, color: C.dim, marginTop: 24, ...snap(f, 30, 5) }}>
        Don&apos;t be the exit liquidity.
      </div>
      <div style={{ display: "flex", gap: 26, alignItems: "center", marginTop: 52 }}>
        <PaperTag frame={f} at={50}>34 recorded verdicts</PaperTag>
        <span style={{ fontFamily: mono, fontSize: 23, color: C.faint, ...snap(f, 58, 5) }}>
          is it behaving like a rug — right now?
        </span>
      </div>
    </AbsoluteFill>
  );
};

const MethodD: React.FC = () => {
  const f = useCurrentFrame();
  const rows: [string, string, string][] = [
    ["01", "SAFETY", "contract flags, surfaced by name"],
    ["02", "FLOW", "who is actually trading"],
    ["03", "LIQUIDITY", "is the exit door open"],
    ["04", "PUMP", "is the move organic"],
  ];
  return (
    <AbsoluteFill style={STAGE}>
      <Exhibit no="00" title="The method" frame={f} at={2} />
      <div style={{ fontFamily: serif, fontWeight: 560, fontSize: 62, color: C.text, lineHeight: 1.15, marginTop: 34, ...snap(f, 8, 5) }}>
        The last ~100 real swaps,
        <br />
        <span style={{ color: C.dim }}>read by distinct wallets.</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 40, maxWidth: 1500 }}>
        {rows.map(([no, n, d], i) => (
          <div
            key={n}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 240px 1fr",
              alignItems: "baseline",
              padding: "16px 4px",
              borderTop: `1px dotted ${C.lineBright}`,
              ...snap(f, 32 + i * 5, 5),
            }}
          >
            <span style={{ fontFamily: mono, fontSize: 20, color: C.accent, letterSpacing: "0.18em" }}>EX-{no}</span>
            <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: C.text }}>{n}</span>
            <span style={{ fontFamily: serif, fontWeight: 480, fontSize: 27, color: C.dim }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: mono, fontSize: 21, color: C.faint, marginTop: 36, ...snap(f, 56, 5) }}>
        deterministic rules · every threshold published · no model can override them
      </div>
    </AbsoluteFill>
  );
};

const CaseD: React.FC<{ c: CaseData; idx: number }> = ({ c, idx }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={STAGE}>
      <Exhibit no={`0${idx + 1}`} title={`verdict/${c.token.toLowerCase()}-${c.chain.split(" ")[0]}`} frame={f} at={2} />
      <div style={{ display: "flex", gap: 70, alignItems: "flex-start", marginTop: 40 }}>
        <div style={{ minWidth: 660 }}>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 118, color: C.text, letterSpacing: "-0.02em", lineHeight: 1, ...snap(f, 6, 5, 22) }}>
            {c.token}
          </div>
          <div style={{ fontFamily: mono, fontSize: 23, color: C.dim, marginTop: 14, ...snap(f, 12, 4) }}>
            {c.chain}
          </div>
          <div style={{ marginTop: 34 }}>
            <Stamp color={c.color} frame={f} at={18} size={62}>
              {c.label}
            </Stamp>
          </div>
          <div style={{ fontFamily: mono, fontSize: 60, fontWeight: 700, color: c.color, marginTop: 34, ...snap(f, 30, 4) }}>
            {count(f, 30, c.score)}
            <span style={{ fontSize: 28, color: C.faint }}>/100</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: 30 }}>
          {c.rows.map(([m, l], i) => {
            const col = l === "CLEAN" ? C.safe : l === "WARN" ? C.warn : C.danger;
            return (
              <div
                key={m}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "15px 4px",
                  borderTop: `1px dotted ${C.lineBright}`,
                  ...snap(f, 38 + i * 4, 4),
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 21, color: C.text }}>{m}</span>
                <span style={{ fontFamily: mono, fontSize: 20, color: col, fontWeight: 700 }}>{l}</span>
              </div>
            );
          })}
          <div style={{ fontFamily: mono, fontSize: 20, color: C.dim, marginTop: 24, ...snap(f, 58, 4) }}>
            {c.foot} <b style={{ color: c.color }}>{c.footAccent}</b>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const VerdictsD: React.FC = () => (
  <>
    {CASES.map((c, i) => (
      <Sequence key={c.token} from={i * 290} durationInFrames={290}>
        <CaseD c={c} idx={i} />
      </Sequence>
    ))}
  </>
);

const ReceiptsD: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={STAGE}>
      <Exhibit no="05" title="Evidence receipts" frame={f} at={2} />
      <div style={{ fontFamily: serif, fontWeight: 560, fontSize: 56, color: C.text, marginTop: 30, lineHeight: 1.15, ...snap(f, 8, 5) }}>
        Nine API calls. <span style={{ color: C.dim }}>Every response hashed.</span>
      </div>
      <div style={{ marginTop: 34, maxWidth: 1560 }}>
        {RECEIPTS.map(([a, b, h], i) => (
          <div
            key={a}
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 0.8fr 1fr",
              fontFamily: mono,
              fontSize: 20,
              padding: "10px 4px",
              borderTop: `1px dotted ${C.lineBright}`,
              ...snap(f, 24 + i * 2, 3),
            }}
          >
            <span style={{ color: C.text }}>{a}</span>
            <span style={{ color: C.dim }}>{b}</span>
            <span style={{ color: C.safe }}>sha256:{h}…</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 30 }}>
        <HashStrip frame={f} at={50} />
      </div>
    </AbsoluteFill>
  );
};

const ScaleD: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={STAGE}>
      <Exhibit no="06" title="The corpus" frame={f} at={2} />
      <div style={{ display: "flex", gap: 20, marginTop: 44 }}>
        {STATS.map(([n, l], i) => (
          <div
            key={l}
            style={{
              flex: 1,
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              padding: "30px 28px",
              transform: `rotate(${i % 2 ? 0.4 : -0.5}deg)`,
              boxShadow: "0 18px 34px -20px rgba(0,0,0,0.7)",
              ...snap(f, 8 + i * 5, 5),
            }}
          >
            <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 70, color: C.text, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: mono, fontSize: 18, color: C.dim, marginTop: 12, lineHeight: 1.4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 480, fontSize: 34, color: C.dim, marginTop: 52, ...snap(f, 30, 5) }}>
        AVOID is reserved for trapped markets — majors land at caution.
      </div>
    </AbsoluteFill>
  );
};

const CloseD: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...STAGE, alignItems: "flex-start" }}>
      <div style={{ fontFamily: serif, fontWeight: 560, fontSize: 64, color: C.dim, lineHeight: 1.2, ...snap(f, 6, 5) }}>
        Structure says: <span style={{ color: C.faint }}>could it rug.</span>
      </div>
      <div style={{ fontFamily: serif, fontWeight: 560, fontSize: 64, color: C.text, lineHeight: 1.2, marginTop: 12, ...snap(f, 26, 5) }}>
        Verdex says: <span style={{ color: C.danger }}>is it rugging.</span>
      </div>
      <div style={{ marginTop: 64 }}>
        <Stamp color={C.safe} frame={f} at={50} size={52}>
          verdex-alpha.vercel.app
        </Stamp>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 48 }}>
        <PaperTag frame={f} at={66}>#BuildwithCMC</PaperTag>
        <span style={{ fontFamily: mono, fontSize: 20, color: C.faint, letterSpacing: "0.14em", ...snap(f, 72, 5) }}>
          COINMARKETCAP API HACKATHON
        </span>
      </div>
      <div style={{ marginTop: 40 }}>
        <HashStrip frame={f} at={80} />
      </div>
    </AbsoluteFill>
  );
};

export const VerdexD: React.FC = () => {
  ensureFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <VoTrack />
      <Sequence from={TL.hook.from} durationInFrames={TL.hook.dur}><HookD /></Sequence>
      <Sequence from={TL.intro.from} durationInFrames={TL.intro.dur}><IntroD /></Sequence>
      <Sequence from={TL.method.from} durationInFrames={TL.method.dur}><MethodD /></Sequence>
      <Sequence from={TL.verdicts.from} durationInFrames={TL.verdicts.dur}><VerdictsD /></Sequence>
      <Sequence from={TL.receipts.from} durationInFrames={TL.receipts.dur}><ReceiptsD /></Sequence>
      <Sequence from={TL.scale.from} durationInFrames={TL.scale.dur}><ScaleD /></Sequence>
      <Sequence from={TL.close.from} durationInFrames={TL.close.dur}><CloseD /></Sequence>
    </AbsoluteFill>
  );
};
