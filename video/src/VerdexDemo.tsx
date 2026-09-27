import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { C, F, ensureFonts } from "./brand";
import { Kicker, VerdictStamp, DimTag, rise, easeOut } from "./bits";

const BG: React.CSSProperties = {
  backgroundColor: C.ink,
  fontFamily: F.display,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "0 120px",
};

// ——— Scene 1 · Hook (8s) ———
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={BG}>
      <Kicker>pre-trade reality check</Kicker>
      <div style={{ height: 40 }} />
      <div style={{ fontSize: 84, fontWeight: 800, color: C.text, lineHeight: 1.08, ...rise(f, 8) }}>
        A token can pass every
        <br />
        contract check.
      </div>
      <div
        style={{
          fontSize: 84,
          fontWeight: 800,
          color: C.danger,
          lineHeight: 1.08,
          marginTop: 18,
          ...rise(f, 62),
        }}
      >
        And still rug you.
      </div>
      <div style={{ fontFamily: F.data, fontSize: 26, color: C.dim, marginTop: 56, ...rise(f, 120) }}>
        Structure is not behavior. One simulated trade is not a market.
      </div>
    </AbsoluteFill>
  );
};

// ——— Scene 2 · Product intro (7s) ———
export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...BG, alignItems: "center", textAlign: "center", padding: 0 }}>
      <div style={{ fontFamily: F.data, fontSize: 24, letterSpacing: "0.5em", color: C.faint, ...rise(f, 4) }}>
        C O I N M A R K E T C A P &nbsp;D E X &nbsp;E V I D E N C E
      </div>
      <div style={{ fontSize: 190, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 30, ...rise(f, 14) }}>
        VERDEX
      </div>
      <div style={{ fontSize: 44, fontWeight: 600, color: C.dim, marginTop: 26, ...rise(f, 42) }}>
        Don&apos;t be the exit liquidity.
      </div>
      <div
        style={{
          fontFamily: F.data,
          fontSize: 26,
          color: C.safe,
          marginTop: 50,
          padding: "14px 28px",
          border: `1px solid ${C.safe}44`,
          ...rise(f, 76),
        }}
      >
        is it behaving like a rug right now?
      </div>
    </AbsoluteFill>
  );
};

// ——— Scene 3 · Method (10s) ———
export const Method: React.FC = () => {
  const f = useCurrentFrame();
  const pillars = [
    ["SAFETY", "contract flags, surfaced by name"],
    ["FLOW", "who is actually trading"],
    ["LIQUIDITY", "is the exit door open"],
    ["PUMP", "is the move organic"],
  ] as const;
  return (
    <AbsoluteFill style={BG}>
      <Kicker>the method</Kicker>
      <div style={{ height: 36 }} />
      <div style={{ fontSize: 60, fontWeight: 800, color: C.text, lineHeight: 1.15, ...rise(f, 6) }}>
        We read the last ~100 real swaps
        <br />
        <span style={{ color: C.dim }}>by distinct wallets on CMC DEX data.</span>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 60 }}>
        {pillars.map(([name, desc], i) => (
          <div
            key={name}
            style={{
              flex: 1,
              border: `1px solid ${C.line}`,
              borderTop: `3px solid ${C.safe}`,
              background: C.panel,
              padding: "26px 22px",
              ...rise(f, 66 + i * 14),
            }}
          >
            <div style={{ fontFamily: F.data, fontSize: 24, fontWeight: 700, color: C.text }}>{name}</div>
            <div style={{ fontSize: 20, color: C.dim, marginTop: 10, lineHeight: 1.35 }}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 22, color: C.faint, marginTop: 44, ...rise(f, 130) }}>
        Deterministic rules. Every threshold published. No model can override them.
      </div>
    </AbsoluteFill>
  );
};

// ——— Scene 4 · Verdict arc (3 × ~9.6s) ———
const CaseCard: React.FC<{
  token: string;
  chain: string;
  verdict: string;
  verdictLabel: string;
  color: string;
  score: number;
  lines: [string, string][];
  foot: React.ReactNode;
}> = ({ token, chain, verdict, verdictLabel, color, score, lines, foot }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={BG}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 26, ...rise(f, 4) }}>
        <span style={{ fontSize: 64, fontWeight: 800, color: C.text }}>{token}</span>
        <span style={{ fontFamily: F.data, fontSize: 24, color: C.faint }}>{chain}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 40, marginTop: 26 }}>
        <VerdictStamp label={verdictLabel} color={color} frame={f} at={16} size={110} />
        <div style={{ fontFamily: F.data, fontSize: 40, color, fontWeight: 700, paddingBottom: 14, ...rise(f, 30) }}>
          {score}/100
        </div>
        <span style={{ fontFamily: F.data, fontSize: 20, color: C.faint, paddingBottom: 18, ...rise(f, 34) }}>
          verdict {verdict}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 44, maxWidth: 1500 }}>
        {lines.map(([m, l], i) => (
          <DimTag key={m} name={m} level={l} frame={f} at={64 + i * 16} />
        ))}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 24, color: C.dim, marginTop: 42, ...rise(f, 64 + lines.length * 16 + 14) }}>
        {foot}
      </div>
    </AbsoluteFill>
  );
};

export const Verdicts: React.FC = () => (
  <>
    <Sequence durationInFrames={290}>
      <CaseCard
        token="GMX"
        chain="arbitrum"
        verdict="LAYAK"
        verdictLabel="ENTRY-WORTHY"
        color={C.safe}
        score={100}
        lines={[
          ["SAFETY", "CLEAN"],
          ["FLOW", "CLEAN"],
          ["LIQUIDITY", "CLEAN"],
          ["PUMP", "CLEAN"],
        ]}
        foot={<span>Jev second opinion: <b style={{ color: C.safe }}>0.10 · consensus</b>. The engine says yes when evidence is clean.</span>}
      />
    </Sequence>
    <Sequence from={290} durationInFrames={290}>
      <CaseCard
        token="SUSHI"
        chain="ethereum"
        verdict="JANGAN"
        verdictLabel="AVOID"
        color={C.danger}
        score={45}
        lines={[
          ["top5MakerShare 0.73 vs <0.50", "DANGER"],
          ["centralizationFlags: mintable", "WARN"],
          ["netBuyRatio −0.03 vs >0", "WARN"],
          ["LIQUIDITY / PUMP", "CLEAN"],
        ]}
        foot={<span>Every failing row is named in the falsifier. Jev: <b style={{ color: C.warn }}>contested</b>.</span>}
      />
    </Sequence>
    <Sequence from={580} durationInFrames={290}>
      <CaseCard
        token="AAVE"
        chain="ethereum · mcap $2.4B"
        verdict="RAWAN"
        verdictLabel="CAUTION"
        color={C.warn}
        score={70}
        lines={[
          ["centralizationFlags: upgradeable", "WARN"],
          ["top5MakerShare 0.76, mature tier", "WARN"],
          ["netBuyRatio −0.14, mature tier", "WARN"],
          ["LIQUIDITY / PUMP", "CLEAN"],
        ]}
        foot={<span>Rules: caution. Jev: 0.27. <b style={{ color: C.warn }}>Contested.</b> The disagreement is shown, never hidden.</span>}
      />
    </Sequence>
  </>
);

// ——— Scene 5 · Receipts (11s) ———
export const Receipts: React.FC = () => {
  const f = useCurrentFrame();
  // Real SHA-256 prefixes from verdict 8d3ea1d0c471 (GMX) — no fabricated data.
  const rows = [
    ["/v1/dex/search", "GMX · Arbitrum", "e8517296"],
    ["/v1/dex/tokens/transactions", "100 swaps", "8a6b0f55"],
    ["/v1/dex/token/pools", "pool depth", "cabe41d1"],
    ["/v1/dex/liquidity-change/list", "LP events", "4b1b7fa4"],
    ["/v1/dex/security/detail", "risk flags", "e9a5b0b1"],
    ["/v1/dex/token", "creator meta", "4708ce14"],
    ["/v1/global-metrics/quotes/historical", "market ctx", "9b364428"],
    ["/v3/fear-and-greed/latest", "market ctx", "acb39ab9"],
    ["/v1/global-metrics/quotes/latest", "market ctx", "8bd80c85"],
  ];
  return (
    <AbsoluteFill style={BG}>
      <Kicker>evidence receipts</Kicker>
      <div style={{ fontSize: 56, fontWeight: 800, color: C.text, marginTop: 30, lineHeight: 1.15, ...rise(f, 6) }}>
        Nine API calls per verdict.
        <br />
        <span style={{ color: C.dim }}>Every response hashed.</span>
      </div>
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 8, maxWidth: 1500 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            fontFamily: F.data,
            fontSize: 18,
            padding: "8px 20px",
            color: C.faint,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            ...rise(f, 48),
          }}
        >
          <span>endpoint</span>
          <span>payload</span>
          <span>sha256</span>
        </div>
        {rows.map(([a, b, c], i) => (
          <div
            key={a}
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              fontFamily: F.data,
              fontSize: 21,
              padding: "11px 20px",
              border: `1px solid ${C.line}`,
              background: C.panel,
              ...rise(f, 56 + i * 9),
            }}
          >
            <span style={{ color: C.text }}>{a}</span>
            <span style={{ color: C.dim }}>{b}</span>
            <span style={{ color: C.faint }}>{c}…</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 20, color: C.faint, marginTop: 26, ...rise(f, 140) }}>
        receipts shown: verdict 8d3ea1d0c471 · /verdict/gmx-arbitrum
      </div>
      <div style={{ fontFamily: F.data, fontSize: 24, color: C.safe, marginTop: 14, ...rise(f, 150) }}>
        Replayable. Auditable. Don&apos;t take our word for it.
      </div>
    </AbsoluteFill>
  );
};

// ——— Scene 6 · Scale (11s) ———
export const Scale: React.FC = () => {
  const f = useCurrentFrame();
  const stats: [string, string][] = [
    ["34", "verdicts on file"],
    ["7", "chains covered"],
    ["306", "API receipts"],
    ["30 · 3 · 1", "caution · avoid · entry-worthy"],
  ];
  return (
    <AbsoluteFill style={BG}>
      <Kicker>the corpus</Kicker>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 50, maxWidth: 1400 }}>
        {stats.map(([n, l], i) => (
          <div key={l} style={{ border: `1px solid ${C.line}`, background: C.panel, padding: "34px 34px", ...rise(f, 10 + i * 16) }}>
            <div style={{ fontSize: 76, fontWeight: 900, color: C.text, letterSpacing: "-0.02em", fontFamily: F.data }}>{n}</div>
            <div style={{ fontSize: 24, color: C.dim, marginTop: 8 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 24, color: C.dim, marginTop: 46, ...rise(f, 90) }}>
        AVOID is reserved for trapped markets. Majors land at caution.
      </div>
    </AbsoluteFill>
  );
};

// ——— Scene 7 · Close (14s) ———
export const Close: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = interpolate(f % 60, [0, 30, 60], [1, 1.04, 1]);
  return (
    <AbsoluteFill style={{ ...BG, alignItems: "center", textAlign: "center", padding: 0 }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: C.text, lineHeight: 1.15, ...rise(f, 6) }}>
        Structure says <span style={{ color: C.faint }}>could it rug.</span>
      </div>
      <div style={{ fontSize: 72, fontWeight: 800, color: C.text, lineHeight: 1.15, marginTop: 14, ...rise(f, 34) }}>
        Verdex says <span style={{ color: C.danger }}>is it rugging.</span>
      </div>
      <div
        style={{
          marginTop: 70,
          fontFamily: F.data,
          fontSize: 34,
          fontWeight: 700,
          color: C.ink,
          background: C.safe,
          padding: "18px 44px",
          scale: `${pulse}`,
          opacity: interpolate(f, [80, 96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut }),
        }}
      >
        verdex-alpha.vercel.app
      </div>
      <div style={{ fontFamily: F.data, fontSize: 22, color: C.faint, marginTop: 40, letterSpacing: "0.2em", ...rise(f, 110) }}>
        #BuildwithCMC · CoinMarketCap API Hackathon
      </div>
    </AbsoluteFill>
  );
};

export const VerdexDemo: React.FC = () => {
  ensureFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Sequence durationInFrames={240}><Hook /></Sequence>
      <Sequence from={240} durationInFrames={210}><Intro /></Sequence>
      <Sequence from={450} durationInFrames={300}><Method /></Sequence>
      <Sequence from={750} durationInFrames={870}><Verdicts /></Sequence>
      <Sequence from={1620} durationInFrames={330}><Receipts /></Sequence>
      <Sequence from={1950} durationInFrames={330}><Scale /></Sequence>
      <Sequence from={2280} durationInFrames={420}><Close /></Sequence>
    </AbsoluteFill>
  );
};
