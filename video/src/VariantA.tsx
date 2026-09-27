// Variant A · SLAMCUT · kinetic type, hard cuts, verdict stamps that hit.
// Dial: ENERGY 3 / RHYTHM 2 / MOTION 3. Motif: the stamp slam + 12f shake,
// repeated at every verdict so the verdict itself is the recurring gesture.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { C, F, ensureFonts } from "./brand";
import { CASES, RECEIPTS, STATS, TL, CaseData } from "./data";
import { VoTrack, snap, slam, wipeX, shakeX, count, easeOut } from "./motion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const BG: React.CSSProperties = {
  backgroundColor: C.ink,
  fontFamily: F.display,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "0 110px",
};

// Thin accent bar sweeps the screen in the first 7 frames of every scene:
// the "cut" signature that replaces slow fades.
const CutBar: React.FC<{ color?: string }> = ({ color = C.text }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 7], [-20, 1920], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: x,
        width: 8,
        background: color,
        opacity: f > 7 ? 0 : 1,
      }}
    />
  );
};

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: F.data,
        fontSize: 22,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color: C.faint,
        fontWeight: 500,
        ...snap(f, 2, 4),
      }}
    >
      {children}
    </div>
  );
};

// Word-by-word slam: each word lands with overshoot, 3f stagger.
const SlamWords: React.FC<{ words: string[]; at: number; size: number; color?: string }> = ({
  words,
  at,
  size,
  color = C.text,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0 24px", lineHeight: 1.05 }}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            fontSize: size,
            fontWeight: 900,
            color,
            letterSpacing: "-0.02em",
            display: "inline-block",
            ...slam(f, at + i * 3),
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );
};

const HookA: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={BG}>
      <CutBar />
      <Kicker>pre-trade reality check</Kicker>
      <div style={{ height: 36 }} />
      <SlamWords words={["A", "token", "can", "pass", "every"]} at={8} size={92} />
      <SlamWords words={["contract", "check."]} at={23} size={92} />
      <div style={{ height: 22 }} />
      <div style={{ ...slam(f, 66), display: "inline-block", translate: `${shakeX(f, 74, 16)}px 0px` }}>
        <span style={{ fontSize: 92, fontWeight: 900, color: C.danger, letterSpacing: "-0.02em" }}>
          And still rug you.
        </span>
      </div>
      <div style={{ fontFamily: F.data, fontSize: 26, color: C.dim, marginTop: 60, ...snap(f, 108, 6) }}>
        Structure is not behavior. One simulated trade is not a market.
      </div>
    </AbsoluteFill>
  );
};

const IntroA: React.FC = () => {
  const f = useCurrentFrame();
  const letters = "VERDEX".split("");
  return (
    <AbsoluteFill style={{ ...BG, alignItems: "center", textAlign: "center", padding: 0 }}>
      <CutBar color={C.safe} />
      <div style={{ fontFamily: F.data, fontSize: 24, letterSpacing: "0.5em", color: C.faint, ...snap(f, 2, 4) }}>
        COINMARKETCAP DEX EVIDENCE
      </div>
      <div style={{ display: "flex", marginTop: 26 }}>
        {letters.map((l, i) => (
          <span
            key={i}
            style={{
              fontSize: 200,
              fontWeight: 900,
              color: C.text,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              display: "inline-block",
              ...slam(f, 6 + i * 2, 1.6),
            }}
          >
            {l}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 46, fontWeight: 600, color: C.dim, marginTop: 24, ...wipeX(f, 30, 7) }}>
        Don&apos;t be the exit liquidity.
      </div>
      <div
        style={{
          fontFamily: F.data,
          fontSize: 26,
          color: C.safe,
          marginTop: 46,
          padding: "14px 28px",
          border: `1px solid ${C.safe}44`,
          ...snap(f, 52, 5),
        }}
      >
        is it behaving like a rug right now?
      </div>
    </AbsoluteFill>
  );
};

const MethodA: React.FC = () => {
  const f = useCurrentFrame();
  const pillars = [
    ["SAFETY", "contract flags, surfaced by name"],
    ["FLOW", "who is actually trading"],
    ["LIQUIDITY", "is the exit door open"],
    ["PUMP", "is the move organic"],
  ] as const;
  return (
    <AbsoluteFill style={BG}>
      <CutBar />
      <Kicker>the method</Kicker>
      <div style={{ height: 32 }} />
      <SlamWords words={["The", "last", "~100", "real", "swaps,"]} at={6} size={66} />
      <div style={{ fontSize: 66, fontWeight: 900, color: C.dim, letterSpacing: "-0.02em", marginTop: 8, ...snap(f, 24, 5) }}>
        by distinct wallets on CMC DEX data.
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 52 }}>
        {pillars.map(([name, desc], i) => (
          <div
            key={name}
            style={{
              flex: 1,
              border: `1px solid ${C.line}`,
              borderTop: `3px solid ${C.safe}`,
              background: C.panel,
              padding: "24px 22px",
              ...snap(f, 44 + i * 4, 5),
            }}
          >
            <div style={{ fontFamily: F.data, fontSize: 24, fontWeight: 700, color: C.text }}>{name}</div>
            <div style={{ fontSize: 20, color: C.dim, marginTop: 10, lineHeight: 1.35 }}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 22, color: C.faint, marginTop: 40, ...snap(f, 66, 5) }}>
        Deterministic rules. Every threshold published. No model can override them.
      </div>
    </AbsoluteFill>
  );
};

const CaseA: React.FC<{ c: CaseData }> = ({ c }) => {
  const f = useCurrentFrame();
  const sx = shakeX(f, 26, 18);
  return (
    <AbsoluteFill style={BG}>
      <CutBar color={c.color} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, ...snap(f, 2, 4) }}>
        <span style={{ fontSize: 70, fontWeight: 900, color: C.text, letterSpacing: "-0.02em" }}>{c.token}</span>
        <span style={{ fontFamily: F.data, fontSize: 24, color: C.faint }}>{c.chain}</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 44,
          marginTop: 20,
          translate: `${sx}px 0px`,
        }}
      >
        <div style={{ ...slam(f, 18, 1.7) }}>
          <span style={{ fontSize: 120, fontWeight: 900, color: c.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {c.label}
          </span>
        </div>
        <div style={{ fontFamily: F.data, fontSize: 52, color: c.color, fontWeight: 700, paddingBottom: 10, ...snap(f, 30, 5) }}>
          {count(f, 30, c.score)}/100
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 38, maxWidth: 1500 }}>
        {c.rows.map(([m, l], i) => {
          const col = l === "CLEAN" ? C.safe : l === "WARN" ? C.warn : C.danger;
          return (
            <div
              key={m}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: `1px solid ${C.line}`,
                borderLeft: `4px solid ${col}`,
                background: C.panel,
                padding: "12px 20px",
                ...wipeX(f, 44 + i * 4, 6),
                opacity: interpolate(f, [44 + i * 4, 48 + i * 4], [0, 1], clamp),
              }}
            >
              <span style={{ fontFamily: F.data, fontSize: 23, color: C.text }}>{m}</span>
              <span style={{ fontFamily: F.data, fontSize: 20, color: col, fontWeight: 700 }}>{l}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 24, color: C.dim, marginTop: 34, ...snap(f, 68, 5) }}>
        {c.foot} <b style={{ color: c.color }}>{c.footAccent}</b>
      </div>
    </AbsoluteFill>
  );
};

const VerdictsA: React.FC = () => (
  <>
    {CASES.map((c, i) => (
      <Sequence key={c.token} from={i * 290} durationInFrames={290}>
        <CaseA c={c} />
      </Sequence>
    ))}
  </>
);

const ReceiptsA: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={BG}>
      <CutBar />
      <Kicker>evidence receipts</Kicker>
      <div style={{ fontSize: 58, fontWeight: 900, color: C.text, marginTop: 26, lineHeight: 1.12, letterSpacing: "-0.02em", ...wipeX(f, 6, 7) }}>
        Nine API calls per verdict.
        <br />
        <span style={{ color: C.dim }}>Every response hashed.</span>
      </div>
      <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 7, maxWidth: 1500 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            fontFamily: F.data,
            fontSize: 18,
            padding: "6px 20px",
            color: C.faint,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            ...snap(f, 20, 4),
          }}
        >
          <span>endpoint</span>
          <span>payload</span>
          <span>sha256</span>
        </div>
        {RECEIPTS.map(([a, b, c], i) => (
          <div
            key={a}
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              fontFamily: F.data,
              fontSize: 21,
              padding: "10px 20px",
              border: `1px solid ${C.line}`,
              background: C.panel,
              ...snap(f, 26 + i * 3, 4),
            }}
          >
            <span style={{ color: C.text }}>{a}</span>
            <span style={{ color: C.dim }}>{b}</span>
            <span style={{ color: C.faint }}>{c}…</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 20, color: C.faint, marginTop: 24, ...snap(f, 60, 4) }}>
        receipts shown: verdict 8d3ea1d0c471 · /verdict/gmx-arbitrum
      </div>
      <div style={{ fontFamily: F.data, fontSize: 24, color: C.safe, marginTop: 12, ...snap(f, 68, 4) }}>
        Replayable. Auditable. Don&apos;t take our word for it.
      </div>
    </AbsoluteFill>
  );
};

const ScaleA: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={BG}>
      <CutBar />
      <Kicker>the corpus</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 44, maxWidth: 1400 }}>
        {STATS.map(([n, l], i) => (
          <div key={l} style={{ border: `1px solid ${C.line}`, background: C.panel, padding: "30px 34px", ...snap(f, 6 + i * 5, 5) }}>
            <div style={{ fontSize: 78, fontWeight: 900, color: C.text, letterSpacing: "-0.02em", fontFamily: F.data }}>{n}</div>
            <div style={{ fontSize: 24, color: C.dim, marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 24, color: C.dim, marginTop: 42, ...snap(f, 32, 5) }}>
        AVOID is reserved for trapped markets. Majors land at caution.
      </div>
    </AbsoluteFill>
  );
};

const CloseA: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...BG, alignItems: "center", textAlign: "center", padding: 0 }}>
      <CutBar color={C.safe} />
      <SlamWords words={["Structure", "says"]} at={4} size={76} />
      <div style={{ fontSize: 76, fontWeight: 900, color: C.faint, letterSpacing: "-0.02em", ...snap(f, 14, 5) }}>
        could it rug.
      </div>
      <div style={{ height: 18 }} />
      <div style={{ ...slam(f, 34), display: "inline-block", translate: `${shakeX(f, 42, 14)}px 0px` }}>
        <span style={{ fontSize: 76, fontWeight: 900, color: C.text, letterSpacing: "-0.02em" }}>
          Verdex says <span style={{ color: C.danger }}>is it rugging.</span>
        </span>
      </div>
      <div
        style={{
          marginTop: 64,
          fontFamily: F.data,
          fontSize: 36,
          fontWeight: 700,
          color: C.ink,
          background: C.safe,
          padding: "18px 44px",
          ...slam(f, 62, 1.3),
        }}
      >
        verdex-alpha.vercel.app
      </div>
      <div style={{ fontFamily: F.data, fontSize: 22, color: C.faint, marginTop: 38, letterSpacing: "0.2em", ...snap(f, 80, 5) }}>
        #BuildwithCMC · CoinMarketCap API Hackathon
      </div>
    </AbsoluteFill>
  );
};

export const VerdexA: React.FC = () => {
  ensureFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <VoTrack />
      <Sequence {...{ from: TL.hook.from, durationInFrames: TL.hook.dur }}><HookA /></Sequence>
      <Sequence from={TL.intro.from} durationInFrames={TL.intro.dur}><IntroA /></Sequence>
      <Sequence from={TL.method.from} durationInFrames={TL.method.dur}><MethodA /></Sequence>
      <Sequence from={TL.verdicts.from} durationInFrames={TL.verdicts.dur}><VerdictsA /></Sequence>
      <Sequence from={TL.receipts.from} durationInFrames={TL.receipts.dur}><ReceiptsA /></Sequence>
      <Sequence from={TL.scale.from} durationInFrames={TL.scale.dur}><ScaleA /></Sequence>
      <Sequence from={TL.close.from} durationInFrames={TL.close.dur}><CloseA /></Sequence>
    </AbsoluteFill>
  );
};
