// Variant B · EVIDENCE TAPE · the product framed as a recorded evidence feed.
// Dial: ENERGY 3 / RHYTHM 3 / MOTION 3. Motif: the scrolling receipt ticker,
// persistent chrome top and bottom; the whole video is the receipt stream.
// The ticker scrolls real endpoints + real sha256 prefixes, never decoration.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { C, F, ensureFonts } from "./brand";
import { CASES, RECEIPTS, STATS, TL, CaseData } from "./data";
import { VoTrack, snap, count } from "./motion";
const mono = F.data;

const TICKER = RECEIPTS.map(([a, , h]) => `${a}  sha256:${h}…`).join("    ·    ") + "    ·    ";

// Persistent chrome: global frame drives the ticker so it never resets.
const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const segW = 4200;
  const x = -((f * 5) % segW);
  const secs = (f / 30).toFixed(1);
  return (
    <>
      <AbsoluteFill style={{ height: 72, borderBottom: `1px solid ${C.line}`, background: C.ink, alignItems: "center", flexDirection: "row", padding: "0 40px", justifyContent: "space-between" }}>
        <div style={{ fontFamily: mono, fontSize: 20, color: C.text, fontWeight: 700, letterSpacing: "0.12em" }}>
          VERDEX <span style={{ color: C.faint }}>/ cmc dex evidence feed</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 20, color: C.faint }}>
          t+{secs}s · verdict 8d3ea1d0c471
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: "auto", height: 66, borderTop: `1px solid ${C.line}`, background: C.ink, alignItems: "center", flexDirection: "row", overflow: "hidden", padding: "0 0 0 40px" }}>
        <div style={{ fontFamily: mono, fontSize: 18, color: C.safe, fontWeight: 700, marginRight: 30, flexShrink: 0 }}>
          receipts ▸
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{ display: "flex", whiteSpace: "nowrap", translate: `${x}px 0px`, fontFamily: mono, fontSize: 19, color: C.faint }}>
            <span>{TICKER}</span>
            <span>{TICKER}</span>
          </div>
        </div>
      </AbsoluteFill>
      {/* progress rail: one deliberate accent showing where we are */}
      <AbsoluteFill style={{ top: 72, bottom: "auto", height: 3, background: C.line }}>
        <div style={{ height: "100%", width: `${(f / 2700) * 100}%`, background: C.safe }} />
      </AbsoluteFill>
    </>
  );
};

// Content area sits between the chrome bars.
const STAGE: React.CSSProperties = {
  backgroundColor: C.ink,
  fontFamily: F.display,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "72px 110px 66px",
};

const Tag: React.FC<{ children: React.ReactNode; at: number }> = ({ children, at }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: "0.28em", textTransform: "uppercase", color: C.safe, fontWeight: 700, ...snap(f, at, 4) }}>
      ▸ {children}
    </div>
  );
};

const HookB: React.FC = () => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <AbsoluteFill style={STAGE}>
      <Tag at={2}>pre-trade reality check</Tag>
      <div style={{ height: 30 }} />
      <div style={{ fontFamily: mono, fontSize: 58, fontWeight: 700, color: C.text, lineHeight: 1.25, ...snap(f, 8, 4) }}>
        &gt; a token can pass every
        <br />
        &gt; contract check.{blink && <span style={{ color: C.safe }}>▌</span>}
      </div>
      <div style={{ fontFamily: mono, fontSize: 58, fontWeight: 700, color: C.danger, marginTop: 26, lineHeight: 1.25, ...snap(f, 62, 4) }}>
        &gt; and still rug you.
      </div>
      <div style={{ fontFamily: mono, fontSize: 24, color: C.dim, marginTop: 56, ...snap(f, 104, 4) }}>
        // structure is not behavior. one simulated trade is not a market.
      </div>
    </AbsoluteFill>
  );
};

const IntroB: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...STAGE, alignItems: "flex-start" }}>
      <Tag at={2}>coinmarketcap dex evidence</Tag>
      <div style={{ fontSize: 190, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 24, ...snap(f, 6, 5, 30) }}>
        VERDEX
      </div>
      <div style={{ fontFamily: mono, fontSize: 30, color: C.dim, marginTop: 26, ...snap(f, 26, 4) }}>
        $ verdex --pre-buy --token &lt;address&gt;
      </div>
      <div style={{ fontFamily: mono, fontSize: 30, color: C.safe, marginTop: 14, fontWeight: 700, ...snap(f, 40, 4) }}>
        → don&apos;t be the exit liquidity.
      </div>
      <div style={{ fontFamily: mono, fontSize: 24, color: C.faint, marginTop: 44, ...snap(f, 58, 4) }}>
        question: is it behaving like a rug right now?
      </div>
    </AbsoluteFill>
  );
};

const MethodB: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    ["SAFETY", "contract flags, surfaced by name", "sell tax >10% · mintable · proxy"],
    ["FLOW", "who is actually trading", "unique makers · top5 share · net buy"],
    ["LIQUIDITY", "is the exit door open", "removal % of pool depth"],
    ["PUMP", "is the move organic", "vol/mcap · makers per $100k"],
  ] as const;
  return (
    <AbsoluteFill style={STAGE}>
      <Tag at={2}>the method</Tag>
      <div style={{ fontSize: 54, fontWeight: 900, color: C.text, marginTop: 26, letterSpacing: "-0.02em", lineHeight: 1.15, ...snap(f, 6, 4) }}>
        The last ~100 real swaps,
        <br />
        <span style={{ color: C.dim }}>read by distinct wallets.</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 40, maxWidth: 1560 }}>
        {rows.map(([n, d, spec], i) => (
          <div
            key={n}
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr 1.1fr",
              alignItems: "center",
              border: `1px solid ${C.line}`,
              background: C.panel,
              padding: "14px 22px",
              ...snap(f, 30 + i * 4, 4),
            }}
          >
            <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: C.safe }}>{n}</span>
            <span style={{ fontSize: 22, color: C.text }}>{d}</span>
            <span style={{ fontFamily: mono, fontSize: 18, color: C.faint, textAlign: "right" }}>{spec}</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: mono, fontSize: 21, color: C.faint, marginTop: 34, ...snap(f, 52, 4) }}>
        // deterministic rules. every threshold published. no model can override them.
      </div>
    </AbsoluteFill>
  );
};

const CaseB: React.FC<{ c: CaseData }> = ({ c }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={STAGE}>
      <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
        <div style={{ minWidth: 640 }}>
          <div style={{ fontFamily: mono, fontSize: 22, color: C.faint, ...snap(f, 2, 4) }}>
            verdict/{c.token.toLowerCase()}-{c.chain.split(" ")[0]}
          </div>
          <div style={{ fontSize: 110, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 10, ...snap(f, 4, 4, 20) }}>
            {c.token}
          </div>
          <div
            style={{
              marginTop: 22,
              display: "inline-block",
              fontFamily: mono,
              fontSize: 44,
              fontWeight: 700,
              color: C.ink,
              background: c.color,
              padding: "10px 26px",
              ...snap(f, 16, 4),
            }}
          >
            {c.label}
          </div>
          <div style={{ fontFamily: mono, fontSize: 64, fontWeight: 700, color: c.color, marginTop: 20, ...snap(f, 24, 4) }}>
            {count(f, 24, c.score)}
            <span style={{ fontSize: 30, color: C.faint }}>/100</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginTop: 60 }}>
          {c.rows.map(([m, l], i) => {
            const col = l === "CLEAN" ? C.safe : l === "WARN" ? C.warn : C.danger;
            return (
              <div
                key={m}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  border: `1px solid ${C.line}`,
                  background: C.panel,
                  padding: "13px 20px",
                  ...snap(f, 34 + i * 4, 4),
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 21, color: C.text }}>{m}</span>
                <span style={{ fontFamily: mono, fontSize: 20, color: col, fontWeight: 700 }}>{l}</span>
              </div>
            );
          })}
          <div style={{ fontFamily: mono, fontSize: 21, color: C.dim, marginTop: 18, ...snap(f, 56, 4) }}>
            {c.foot} <b style={{ color: c.color }}>{c.footAccent}</b>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const VerdictsB: React.FC = () => (
  <>
    {CASES.map((c, i) => (
      <Sequence key={c.token} from={i * 290} durationInFrames={290}>
        <CaseB c={c} />
      </Sequence>
    ))}
  </>
);

const ReceiptsB: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={STAGE}>
      <Tag at={2}>evidence receipts</Tag>
      <div style={{ fontSize: 50, fontWeight: 900, color: C.text, marginTop: 22, letterSpacing: "-0.02em", ...snap(f, 6, 4) }}>
        Recorded sample: nine API calls. <span style={{ color: C.dim }}>Every response hashed.</span>
      </div>
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 6, maxWidth: 1560 }}>
        {RECEIPTS.map(([a, b, c], i) => (
          <div
            key={a}
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 0.9fr 1fr",
              fontFamily: mono,
              fontSize: 20,
              padding: "9px 20px",
              border: `1px solid ${C.line}`,
              background: i % 2 ? C.panel : "transparent",
              ...snap(f, 22 + i * 2, 3),
            }}
          >
            <span style={{ color: C.text }}>{a}</span>
            <span style={{ color: C.dim }}>{b}</span>
            <span style={{ color: C.safe }}>sha256:{c}…</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: mono, fontSize: 20, color: C.faint, marginTop: 22, ...snap(f, 48, 4) }}>
        // replayable. auditable. don&apos;t take our word for it.
      </div>
    </AbsoluteFill>
  );
};

const ScaleB: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={STAGE}>
      <Tag at={2}>the corpus</Tag>
      <div style={{ display: "flex", gap: 18, marginTop: 36 }}>
        {STATS.map(([n, l], i) => (
          <div key={l} style={{ flex: 1, border: `1px solid ${C.line}`, background: C.panel, padding: "28px 26px", ...snap(f, 6 + i * 4, 4) }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: C.text, fontFamily: mono }}>{n}</div>
            <div style={{ fontFamily: mono, fontSize: 18, color: C.dim, marginTop: 8, lineHeight: 1.35 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: mono, fontSize: 23, color: C.dim, marginTop: 44, ...snap(f, 26, 4) }}>
        // AVOID is reserved for trapped markets. majors land at caution.
      </div>
    </AbsoluteFill>
  );
};

const CloseB: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...STAGE, alignItems: "flex-start" }}>
      <div style={{ fontFamily: mono, fontSize: 46, fontWeight: 700, color: C.faint, ...snap(f, 4, 4) }}>
        &gt; structure says: could it rug.
      </div>
      <div style={{ fontFamily: mono, fontSize: 46, fontWeight: 700, color: C.text, marginTop: 16, ...snap(f, 24, 4) }}>
        &gt; verdex says: <span style={{ color: C.danger }}>is it rugging.</span>
      </div>
      <div
        style={{
          marginTop: 60,
          fontFamily: mono,
          fontSize: 34,
          fontWeight: 700,
          color: C.ink,
          background: C.safe,
          padding: "16px 40px",
          ...snap(f, 52, 4),
        }}
      >
        $ open verdex-alpha.vercel.app
      </div>
      <div style={{ fontFamily: mono, fontSize: 21, color: C.faint, marginTop: 36, letterSpacing: "0.18em", ...snap(f, 68, 4) }}>
        #BuildwithCMC · CoinMarketCap API Hackathon
      </div>
    </AbsoluteFill>
  );
};

export const VerdexB: React.FC = () => {
  ensureFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <VoTrack />
      <Sequence from={TL.hook.from} durationInFrames={TL.hook.dur}><HookB /></Sequence>
      <Sequence from={TL.intro.from} durationInFrames={TL.intro.dur}><IntroB /></Sequence>
      <Sequence from={TL.method.from} durationInFrames={TL.method.dur}><MethodB /></Sequence>
      <Sequence from={TL.verdicts.from} durationInFrames={TL.verdicts.dur}><VerdictsB /></Sequence>
      <Sequence from={TL.receipts.from} durationInFrames={TL.receipts.dur}><ReceiptsB /></Sequence>
      <Sequence from={TL.scale.from} durationInFrames={TL.scale.dur}><ScaleB /></Sequence>
      <Sequence from={TL.close.from} durationInFrames={TL.close.dur}><CloseB /></Sequence>
      <Sequence durationInFrames={2700}><Chrome /></Sequence>
    </AbsoluteFill>
  );
};
