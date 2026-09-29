// Variant C · VERDICT FIELD · poster minimalism. One focal element per beat.
// Dial: ENERGY 3 / RHYTHM 3 / MOTION 3. Motif: the color-field wipe · the
// verdict's own color floods the screen at reveal, then recedes to a bar.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { C, F, ensureFonts } from "./brand";
import { CASES, RECEIPTS, STATS, TL, CaseData } from "./data";
import { VoTrack, snap, wipeX, count, easeOut } from "./motion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const BG: React.CSSProperties = {
  backgroundColor: C.ink,
  fontFamily: F.display,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "0 100px",
};

const Micro: React.FC<{ children: React.ReactNode; at: number; color?: string }> = ({ children, at, color = C.faint }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ fontFamily: F.data, fontSize: 20, letterSpacing: "0.3em", textTransform: "uppercase", color, ...snap(f, at, 4) }}>
      {children}
    </div>
  );
};

const HookC: React.FC = () => {
  const f = useCurrentFrame();
  // Red field floods in at the punchline, then recedes to an underline bar.
  const flood = interpolate(f, [62, 70, 82, 96], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={BG}>
      <Micro at={2}>pre-trade reality check</Micro>
      <div style={{ height: 44 }} />
      <div style={{ fontSize: 96, fontWeight: 900, color: C.text, lineHeight: 1.06, letterSpacing: "-0.03em", ...snap(f, 8, 5, 20) }}>
        A token can pass
        <br />
        every contract check.
      </div>
      <div style={{ position: "relative", marginTop: 30 }}>
        <div
          style={{
            position: "absolute",
            inset: -18,
            background: C.danger,
            opacity: flood,
          }}
        />
        <div style={{ position: "relative", fontSize: 96, fontWeight: 900, color: f >= 62 && f < 96 ? C.ink : C.danger, lineHeight: 1.06, letterSpacing: "-0.03em", ...wipeX(f, 62, 5) }}>
          And still rug you.
        </div>
        <div style={{ height: 6, background: C.danger, marginTop: 18, ...wipeX(f, 96, 8) }} />
      </div>
      <div style={{ fontFamily: F.data, fontSize: 25, color: C.dim, marginTop: 56, ...snap(f, 116, 5) }}>
        Structure is not behavior. One simulated trade is not a market.
      </div>
    </AbsoluteFill>
  );
};

const IntroC: React.FC = () => {
  const f = useCurrentFrame();
  const barW = interpolate(f, [50, 62], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill style={BG}>
      <Micro at={2}>coinmarketcap dex evidence</Micro>
      <div style={{ fontSize: 230, fontWeight: 900, color: C.text, letterSpacing: "-0.04em", lineHeight: 0.95, marginTop: 30, ...snap(f, 6, 5, 30) }}>
        VERDEX
      </div>
      <div style={{ width: 560 * barW, height: 8, background: C.safe, marginTop: 10 }} />
      <div style={{ fontSize: 48, fontWeight: 600, color: C.dim, marginTop: 36, ...snap(f, 30, 5) }}>
        Don&apos;t be the exit liquidity.
      </div>
      <div style={{ fontFamily: F.data, fontSize: 26, color: C.safe, marginTop: 44, ...snap(f, 56, 5) }}>
        is it behaving like a rug right now?
      </div>
    </AbsoluteFill>
  );
};

const MethodC: React.FC = () => {
  const f = useCurrentFrame();
  const pillars = ["SAFETY", "FLOW", "LIQUIDITY", "PUMP"] as const;
  return (
    <AbsoluteFill style={BG}>
      <Micro at={2}>the method</Micro>
      <div style={{ fontSize: 74, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", marginTop: 34, lineHeight: 1.1, ...snap(f, 6, 5, 20) }}>
        ~100 real swaps.
        <br />
        <span style={{ color: C.dim }}>Four questions.</span>
      </div>
      <div style={{ display: "flex", gap: 0, marginTop: 54 }}>
        {pillars.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && <div style={{ width: 1, background: C.line, alignSelf: "stretch", margin: "0 34px" }} />}
            <div style={{ ...snap(f, 32 + i * 5, 4) }}>
              <div style={{ fontFamily: F.data, fontSize: 30, fontWeight: 700, color: C.text }}>{p}</div>
              <div style={{ width: 44, height: 4, background: C.safe, margin: "14px auto 0", ...wipeX(f, 40 + i * 5, 5) }} />
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 22, color: C.faint, marginTop: 60, ...snap(f, 60, 5) }}>
        Deterministic rules. Every threshold published. No model can override them.
      </div>
    </AbsoluteFill>
  );
};

const CaseC: React.FC<{ c: CaseData }> = ({ c }) => {
  const f = useCurrentFrame();
  // Field flood: verdict color covers the screen at the reveal, then
  // recedes to a side bar while the evidence list rolls.
  const floodP = interpolate(f, [16, 24, 40, 54], [0, 1, 1, 0], clamp);
  const failing = c.rows.filter(([, l]) => l !== "CLEAN");
  const clean = c.rows.length - failing.length;
  return (
    <AbsoluteFill style={{ ...BG, alignItems: "flex-start", textAlign: "left" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: c.color,
          opacity: floodP * 0.16,
        }}
      />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: c.color, ...wipeX(f, 50, 8) }} />
      <Micro at={2} color={C.faint}>
        {c.token} · {c.chain}
      </Micro>
      <div style={{ fontSize: 150, fontWeight: 900, color: c.color, letterSpacing: "-0.04em", lineHeight: 0.95, marginTop: 22, ...snap(f, 14, 5, 30) }}>
        {c.label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 14, ...snap(f, 26, 4) }}>
        <span style={{ fontFamily: F.data, fontSize: 90, fontWeight: 700, color: C.text }}>{count(f, 26, c.score)}</span>
        <span style={{ fontFamily: F.data, fontSize: 34, color: C.faint }}>/100 · verdict {c.verdict}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 40, maxWidth: 1400 }}>
        {failing.map(([m, l], i) => {
          const col = l === "WARN" ? C.warn : C.danger;
          return (
            <div key={m} style={{ display: "flex", gap: 24, alignItems: "center", ...snap(f, 56 + i * 4, 4) }}>
              <span style={{ fontFamily: F.data, fontSize: 19, fontWeight: 700, color: col, width: 90 }}>{l}</span>
              <span style={{ fontFamily: F.data, fontSize: 22, color: C.text }}>{m}</span>
            </div>
          );
        })}
        {clean > 0 && (
          <div style={{ fontFamily: F.data, fontSize: 20, color: C.faint, ...snap(f, 56 + failing.length * 4, 4) }}>
            {clean === 4 ? "all four dimensions" : `${clean} dimension${clean > 1 ? "s" : ""}`} clean
          </div>
        )}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 23, color: C.dim, marginTop: 40, ...snap(f, 84, 4) }}>
        {c.foot} <b style={{ color: c.color }}>{c.footAccent}</b>
      </div>
    </AbsoluteFill>
  );
};

const VerdictsC: React.FC = () => (
  <>
    {CASES.map((c, i) => (
      <Sequence key={c.token} from={i * 290} durationInFrames={290}>
        <CaseC c={c} />
      </Sequence>
    ))}
  </>
);

const ReceiptsC: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={BG}>
      <Micro at={2}>evidence receipts</Micro>
      <div style={{ fontSize: 68, fontWeight: 900, color: C.text, marginTop: 30, letterSpacing: "-0.03em", lineHeight: 1.1, ...snap(f, 6, 5, 20) }}>
        Recorded sample: nine API calls.
        <br />
        <span style={{ color: C.dim }}>Every response hashed.</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 44, maxWidth: 1400, justifyContent: "center" }}>
        {RECEIPTS.map(([a, , h], i) => (
          <div
            key={a}
            style={{
              fontFamily: F.data,
              fontSize: 19,
              color: C.dim,
              border: `1px solid ${C.line}`,
              padding: "10px 18px",
              ...snap(f, 26 + i * 3, 4),
            }}
          >
            <span style={{ color: C.text }}>{a}</span> <span style={{ color: C.faint }}>{h}…</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: F.data, fontSize: 22, color: C.faint, marginTop: 40, ...snap(f, 60, 4) }}>
        recorded verdict 8d3ea1d0c471 · /verdict/gmx-arbitrum
      </div>
      <div style={{ fontFamily: F.data, fontSize: 25, color: C.safe, marginTop: 16, fontWeight: 700, ...snap(f, 68, 4) }}>
        Replayable. Auditable.
      </div>
    </AbsoluteFill>
  );
};

const ScaleC: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={BG}>
      <Micro at={2}>the corpus</Micro>
      <div style={{ display: "flex", alignItems: "baseline", gap: 70, marginTop: 40 }}>
        {STATS.map(([n, l], i) => (
          <div key={l} style={{ textAlign: "center", ...snap(f, 6 + i * 5, 4, 20) }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", fontFamily: F.data }}>{n}</div>
            <div style={{ fontFamily: F.data, fontSize: 20, color: C.dim, marginTop: 10 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ width: 420, height: 5, background: C.safe, marginTop: 52, ...wipeX(f, 34, 8) }} />
      <div style={{ fontFamily: F.data, fontSize: 23, color: C.dim, marginTop: 40, ...snap(f, 44, 4) }}>
        AVOID is reserved for trapped markets. Majors land at caution.
      </div>
    </AbsoluteFill>
  );
};

const CloseC: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={BG}>
      <div style={{ fontSize: 80, fontWeight: 900, color: C.faint, letterSpacing: "-0.03em", lineHeight: 1.1, ...snap(f, 4, 5, 20) }}>
        Structure says could it rug.
      </div>
      <div style={{ fontSize: 80, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 12, ...wipeX(f, 30, 6) }}>
        Verdex says <span style={{ color: C.danger }}>is it rugging.</span>
      </div>
      <div
        style={{
          marginTop: 70,
          fontFamily: F.data,
          fontSize: 36,
          fontWeight: 700,
          color: C.ink,
          background: C.safe,
          padding: "20px 48px",
          ...snap(f, 58, 5),
        }}
      >
        verdex-alpha.vercel.app
      </div>
      <div style={{ fontFamily: F.data, fontSize: 22, color: C.faint, marginTop: 40, letterSpacing: "0.2em", ...snap(f, 76, 5) }}>
        #BuildwithCMC · CoinMarketCap API Hackathon
      </div>
    </AbsoluteFill>
  );
};

export const VerdexC: React.FC = () => {
  ensureFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <VoTrack />
      <Sequence from={TL.hook.from} durationInFrames={TL.hook.dur}><HookC /></Sequence>
      <Sequence from={TL.intro.from} durationInFrames={TL.intro.dur}><IntroC /></Sequence>
      <Sequence from={TL.method.from} durationInFrames={TL.method.dur}><MethodC /></Sequence>
      <Sequence from={TL.verdicts.from} durationInFrames={TL.verdicts.dur}><VerdictsC /></Sequence>
      <Sequence from={TL.receipts.from} durationInFrames={TL.receipts.dur}><ReceiptsC /></Sequence>
      <Sequence from={TL.scale.from} durationInFrames={TL.scale.dur}><ScaleC /></Sequence>
      <Sequence from={TL.close.from} durationInFrames={TL.close.dur}><CloseC /></Sequence>
    </AbsoluteFill>
  );
};
