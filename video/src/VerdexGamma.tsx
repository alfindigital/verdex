// VerdexGamma.tsx — Variant γ: CLEAN EVIDENCE
// Apple keynote aesthetic. Dual voice (River male + Sarah female).
// Clean geometric layout, smooth rise animations. All data from data.ts.
import React, { useEffect } from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { C, F, ensureFonts } from './brand';
import { CASES, RECEIPTS } from './data';
import { TL_GAMMA, clamp } from './timeline';
import { ScoreRing } from './components/ScoreRing';
import { DimBar } from './components/DimBar';
import { ReceiptRow } from './components/ReceiptRow';
import { VerdictLabel } from './components/VerdictLabel';

// Motion helpers — smooth, clean (γ style)
const gRise = (frame: number, at: number, span = 20) => ({
  opacity: interpolate(frame, [at, at + span], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [at, at + span], [20, 0], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}px`,
});

const gScaleUp = (frame: number, at: number, span = 20) => ({
  scale: `${interpolate(frame, [at, at + span], [0.92, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}`,
  opacity: interpolate(frame, [at, at + span], [0, 1], clamp),
});

// Clean white-on-dark base
const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: C.panel,
      fontFamily: F.display,
      color: C.text,
      overflow: 'hidden',
    }}
  >
    {/* Thin top accent bar */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: C.safe }} />
    {children}
  </AbsoluteFill>
);

// Eyebrow label
const Eyebrow: React.FC<{ children: React.ReactNode; at: number }> = ({ children, at }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      ...gRise(frame, at),
      fontFamily: F.data,
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '0.16em',
      color: C.safe,
      textTransform: 'uppercase',
      marginBottom: 16,
    }}>
      {children}
    </div>
  );
};

// ── Scenes ────────────────────────────────────────────────────────────────────

const S01: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px' }}>
        <div>
          <Eyebrow at={10}>The Problem</Eyebrow>
          <div style={{
            ...gRise(frame, 20),
            fontFamily: F.display,
            fontSize: 52,
            fontWeight: 600,
            color: C.text,
            lineHeight: 1.3,
          }}>
            Every day, someone buys a<br />token that passed every audit.
          </div>
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S02: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px' }}>
        <div>
          <div style={{ ...gRise(frame, 8), fontSize: 52, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>
            And loses everything.
          </div>
          <div style={{ ...gRise(frame, 30), fontSize: 36, color: C.faint, marginTop: 24, lineHeight: 1.5 }}>
            Because audits check structure.<br />Not behavior.
          </div>
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S03: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 160px' }}>
        <div style={{ ...gRise(frame, 8), textAlign: 'center' }}>
          <div style={{ fontFamily: F.data, fontSize: 16, color: C.safe, letterSpacing: '0.1em', marginBottom: 20 }}>THE SOLUTION</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: C.text }}>
            Verdex checks <span style={{ color: C.safe }}>behavior.</span>
          </div>
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S04: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ ...gScaleUp(frame, 8) }}>
          <div style={{ fontFamily: F.display, fontSize: 96, fontWeight: 800, color: C.safe, letterSpacing: '0.1em', textAlign: 'center' }}>
            VERDEX
          </div>
        </div>
        <div style={{ ...gRise(frame, 32), fontFamily: F.data, fontSize: 20, color: C.faint, letterSpacing: '0.08em' }}>
          Pre-trade forensic evidence · CoinMarketCap DEX data
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S05: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px', flexDirection: 'column', gap: 28 }}>
        <Eyebrow at={6}>How It Works</Eyebrow>
        <div style={{ ...gRise(frame, 16), fontFamily: F.display, fontSize: 40, color: C.text }}>
          Give Verdex a token address.
        </div>
        <div style={{ ...gRise(frame, 32), fontFamily: F.data, fontSize: 22, color: C.dim, lineHeight: 1.6 }}>
          It reads the actual trading activity —<br />
          the last 100 swaps by distinct wallets.<br />
          Plus liquidity events, security flags.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S06: React.FC = () => {
  const frame = useCurrentFrame();
  const dims = [
    { name: 'SAFETY', desc: 'centralization, flags, creator' },
    { name: 'FLOW', desc: 'buy/sell balance, maker share' },
    { name: 'LIQUIDITY', desc: 'pool depth, LP changes' },
    { name: 'PUMP', desc: 'price vs volume correlation' },
  ];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px', flexDirection: 'column', gap: 20 }}>
        <Eyebrow at={6}>4 Forensic Dimensions</Eyebrow>
        {dims.map(({ name, desc }, i) => (
          <div key={name} style={{
            ...gRise(frame, 18 + i * 14),
            display: 'flex',
            alignItems: 'baseline',
            gap: 20,
          }}>
            <div style={{ fontFamily: F.data, fontSize: 22, fontWeight: 700, color: C.safe, width: 120 }}>{name}</div>
            <div style={{ fontFamily: F.display, fontSize: 20, color: C.faint }}>{desc}</div>
          </div>
        ))}
      </AbsoluteFill>
    </Base>
  );
};

const S07: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px', flexDirection: 'column', gap: 24 }}>
        <Eyebrow at={6}>Output</Eyebrow>
        {[
          { level: 'CLEAN', color: C.safe, desc: 'threshold met' },
          { level: 'WARN', color: C.warn, desc: 'needs attention' },
          { level: 'DANGER', color: C.danger, desc: 'threshold breached' },
        ].map(({ level, color, desc }, i) => (
          <div key={level} style={{ ...gRise(frame, 18 + i * 16), display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
            <div style={{ fontFamily: F.data, fontSize: 22, fontWeight: 700, color, width: 100 }}>{level}</div>
            <div style={{ fontFamily: F.display, fontSize: 20, color: C.faint }}>{desc}</div>
          </div>
        ))}
        <div style={{ ...gRise(frame, 68), fontFamily: F.data, fontSize: 18, color: C.faint, borderTop: `1px solid ${C.line}`, paddingTop: 20, marginTop: 8 }}>
          Composite → ENTRY-WORTHY · CAUTION · AVOID
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S08: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px', flexDirection: 'column' }}>
        <Eyebrow at={6}>Case File #001</Eyebrow>
        <div style={{ ...gRise(frame, 18), fontFamily: F.display, fontSize: 72, fontWeight: 800, color: C.text }}>
          GMX
        </div>
        <div style={{ ...gRise(frame, 34), fontFamily: F.data, fontSize: 20, color: C.faint, marginTop: 8 }}>
          Chain: Arbitrum
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S09: React.FC = () => {
  const frame = useCurrentFrame();
  const gmx = CASES[0];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '60px 120px', gap: 80, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, flexShrink: 0 }}>
          <ScoreRing at={8} score={gmx.score} color={C.safe} size={180} />
          <VerdictLabel label="ENTRY-WORTHY" at={70} variant="gamma" fontSize={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ ...gRise(frame, 16), fontFamily: F.data, fontSize: 13, color: C.faint, letterSpacing: '0.1em', marginBottom: 24, textTransform: 'uppercase' }}>
            GMX · Arbitrum — All dimensions
          </div>
          {gmx.rows.map(([name, level], i) => (
            <DimBar key={i} name={name as string} level={level as 'CLEAN' | 'WARN' | 'DANGER'} at={24 + i * 14} />
          ))}
          <div style={{ ...gRise(frame, 90), fontFamily: F.data, fontSize: 16, color: C.faint, marginTop: 24, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
            Jev AI second opinion: <span style={{ color: C.safe }}>Jev 0.10 · Consensus</span>
          </div>
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S10: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px', flexDirection: 'column' }}>
        <Eyebrow at={6}>Case File #002</Eyebrow>
        <div style={{ ...gRise(frame, 16), fontFamily: F.display, fontSize: 72, fontWeight: 800, color: C.danger }}>
          SUSHI
        </div>
        <div style={{ ...gRise(frame, 30), fontFamily: F.data, fontSize: 20, color: C.faint, marginTop: 8 }}>
          Chain: Ethereum
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S11: React.FC = () => {
  const frame = useCurrentFrame();
  const sushi = CASES[1];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '60px 120px', gap: 80, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, flexShrink: 0 }}>
          <ScoreRing at={6} score={sushi.score} color={C.danger} size={180} />
          <VerdictLabel label="AVOID" at={68} variant="gamma" fontSize={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ ...gRise(frame, 14), fontFamily: F.data, fontSize: 13, color: C.faint, letterSpacing: '0.1em', marginBottom: 24, textTransform: 'uppercase' }}>
            SUSHI · Ethereum — Dimension analysis
          </div>
          <DimBar name="top5MakerShare" level="DANGER" at={22} />
          <DimBar name="centralizationFlags" level="WARN" at={36} />
          <DimBar name="netBuyRatio" level="WARN" at={50} />
          <DimBar name="LIQUIDITY / PUMP" level="CLEAN" at={64} />
          <div style={{ ...gRise(frame, 84), fontFamily: F.data, fontSize: 15, color: C.danger, marginTop: 20, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
            Maker concentration 0.73 exceeds threshold 0.50 → DANGER
          </div>
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S12: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', flexDirection: 'column', gap: 32 }}>
        <Eyebrow at={6}>AI Cross-Examination</Eyebrow>
        <div style={{ display: 'flex', gap: 48, ...gRise(frame, 18) }}>
          <div style={{ flex: 1, background: '#0d1f0d', border: `1px solid ${C.safe}`, padding: '28px 32px', borderRadius: 4 }}>
            <div style={{ fontFamily: F.data, fontSize: 13, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>RULES ENGINE</div>
            <div style={{ fontFamily: F.display, fontSize: 32, fontWeight: 700, color: C.danger }}>AVOID</div>
            <div style={{ fontFamily: F.data, fontSize: 16, color: C.faint, marginTop: 8 }}>score: 45</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: F.data, fontSize: 18, fontWeight: 700, color: C.warn, letterSpacing: '0.08em' }}>CONTESTED</div>
          </div>
          <div style={{ flex: 1, background: '#1a1200', border: `1px solid ${C.warn}`, padding: '28px 32px', borderRadius: 4 }}>
            <div style={{ fontFamily: F.data, fontSize: 13, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>JEV AI OPINION</div>
            <div style={{ fontFamily: F.display, fontSize: 32, fontWeight: 700, color: C.warn }}>Risky 0.82</div>
            <div style={{ fontFamily: F.data, fontSize: 16, color: C.faint, marginTop: 8 }}>supports avoid</div>
          </div>
        </div>
        <div style={{ ...gRise(frame, 68), fontFamily: F.data, fontSize: 16, color: C.faint }}>
          Transparency is not optional. Both opinions shown.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S13: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', flexDirection: 'column' }}>
        <Eyebrow at={4}>Evidence Receipts</Eyebrow>
        <div style={{ ...gRise(frame, 14), fontFamily: F.data, fontSize: 13, color: C.faint, letterSpacing: '0.1em', marginBottom: 20 }}>
          VERDICT 8d3ea1d0c471 — 9 API CALLS HASHED
        </div>
        {RECEIPTS.map(([ep, , hash], i) => (
          <ReceiptRow key={ep} endpoint={ep} hash={hash} at={18} delay={i * 8} />
        ))}
      </AbsoluteFill>
    </Base>
  );
};

const S14: React.FC = () => {
  const frame = useCurrentFrame();
  const cards = [
    { n: '34', label: 'Recorded verdicts on file', color: C.text },
    { n: '7', label: 'Chains covered', color: C.text },
    { n: '306', label: 'Recorded API receipts', color: C.safe },
  ];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 48 }}>
        {cards.map(({ n, label, color }, i) => (
          <div key={n} style={{
            ...gRise(frame, 8 + i * 18),
            textAlign: 'center',
            padding: '24px 40px',
            borderLeft: `3px solid ${C.safe}`,
          }}>
            <div style={{ fontFamily: F.display, fontSize: 72, fontWeight: 800, color, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: F.data, fontSize: 16, color: C.faint, letterSpacing: '0.06em', marginTop: 10 }}>{label}</div>
          </div>
        ))}
      </AbsoluteFill>
    </Base>
  );
};

const S15: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px', flexDirection: 'column', gap: 20 }}>
        <Eyebrow at={6}>Transparency by Design</Eyebrow>
        <div style={{ ...gRise(frame, 18), fontSize: 40, color: C.text, lineHeight: 1.4 }}>
          Every threshold is published.<br />Every rule is deterministic.
        </div>
        <div style={{ ...gRise(frame, 40), fontFamily: F.data, fontSize: 20, color: C.faint }}>
          No model overrides the evidence.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S16: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', flexDirection: 'column', gap: 12 }}>
        <Eyebrow at={4}>9 CoinMarketCap Endpoints</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 60px', marginTop: 8 }}>
          {RECEIPTS.map(([ep], i) => (
            <div key={ep} style={{
              ...gRise(frame, 16 + i * 10),
              fontFamily: F.data,
              fontSize: 16,
              color: C.dim,
              letterSpacing: '0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.safe, flexShrink: 0 }} />
              {ep}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S17: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px' }}>
        <div style={{ ...gRise(frame, 8), fontSize: 48, color: C.faint, lineHeight: 1.4 }}>
          The question isn't<br /><em>could this token rug.</em>
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S18: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px' }}>
        <div style={{ ...gRise(frame, 10), fontSize: 52, color: C.text, lineHeight: 1.4 }}>
          The question is:<br /><span style={{ color: C.safe, fontWeight: 700 }}>is it rugging right now.</span>
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S19: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 28 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: C.safe }} />
      <div style={{ ...gScaleUp(frame, 8), fontFamily: F.display, fontSize: 100, fontWeight: 800, color: C.safe, letterSpacing: '0.12em' }}>
        VERDEX
      </div>
      <div style={{ ...gRise(frame, 28), fontFamily: F.data, fontSize: 18, color: C.faint, letterSpacing: '0.1em' }}>
        Built for the CoinMarketCap API Hackathon
      </div>
      <div style={{ ...gRise(frame, 140), fontFamily: F.data, fontSize: 14, color: C.faint, borderTop: `1px solid ${C.line}`, paddingTop: 20, marginTop: 8, textAlign: 'center', letterSpacing: '0.06em' }}>
        Not financial advice. Recorded evidence only.
      </div>
    </AbsoluteFill>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────
export const VerdexGamma: React.FC = () => {
  useEffect(() => { ensureFonts(); }, []);

  const tl = TL_GAMMA;

  return (
    <AbsoluteFill style={{ background: C.panel }}>
      <Sequence from={tl.s01.from} durationInFrames={tl.s01.dur}><S01 /></Sequence>
      <Sequence from={tl.s02.from} durationInFrames={tl.s02.dur}><S02 /></Sequence>
      <Sequence from={tl.s03.from} durationInFrames={tl.s03.dur}><S03 /></Sequence>
      <Sequence from={tl.s04.from} durationInFrames={tl.s04.dur}><S04 /></Sequence>
      <Sequence from={tl.s05.from} durationInFrames={tl.s05.dur}><S05 /></Sequence>
      <Sequence from={tl.s06.from} durationInFrames={tl.s06.dur}><S06 /></Sequence>
      <Sequence from={tl.s07.from} durationInFrames={tl.s07.dur}><S07 /></Sequence>
      <Sequence from={tl.s08.from} durationInFrames={tl.s08.dur}><S08 /></Sequence>
      <Sequence from={tl.s09.from} durationInFrames={tl.s09.dur}><S09 /></Sequence>
      <Sequence from={tl.s10.from} durationInFrames={tl.s10.dur}><S10 /></Sequence>
      <Sequence from={tl.s11.from} durationInFrames={tl.s11.dur}><S11 /></Sequence>
      <Sequence from={tl.s12.from} durationInFrames={tl.s12.dur}><S12 /></Sequence>
      <Sequence from={tl.s13.from} durationInFrames={tl.s13.dur}><S13 /></Sequence>
      <Sequence from={tl.s14.from} durationInFrames={tl.s14.dur}><S14 /></Sequence>
      <Sequence from={tl.s15.from} durationInFrames={tl.s15.dur}><S15 /></Sequence>
      <Sequence from={tl.s16.from} durationInFrames={tl.s16.dur}><S16 /></Sequence>
      <Sequence from={tl.s17.from} durationInFrames={tl.s17.dur}><S17 /></Sequence>
      <Sequence from={tl.s18.from} durationInFrames={tl.s18.dur}><S18 /></Sequence>
      <Sequence from={tl.s19.from} durationInFrames={tl.s19.dur}><S19 /></Sequence>

      {/* Dual VO — River (male) + Sarah (female)
          Each segment is strictly non-overlapping, with 10-16 frames silence between speakers. */}
      <Sequence from={tl.s01.from} durationInFrames={tl.s01.dur}><Audio src={staticFile('vo-gamma/s01.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s02.from} durationInFrames={tl.s02.dur}><Audio src={staticFile('vo-gamma/s02.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s03.from} durationInFrames={tl.s03.dur}><Audio src={staticFile('vo-gamma/s03.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s04.from} durationInFrames={tl.s04.dur}><Audio src={staticFile('vo-gamma/s04.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s05.from} durationInFrames={tl.s05.dur}><Audio src={staticFile('vo-gamma/s05.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s06.from} durationInFrames={tl.s06.dur}><Audio src={staticFile('vo-gamma/s06.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s07.from} durationInFrames={tl.s07.dur}><Audio src={staticFile('vo-gamma/s07.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s08.from} durationInFrames={tl.s08.dur}><Audio src={staticFile('vo-gamma/s08.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s09.from} durationInFrames={tl.s09.dur}><Audio src={staticFile('vo-gamma/s09.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s10.from} durationInFrames={tl.s10.dur}><Audio src={staticFile('vo-gamma/s10.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s11.from} durationInFrames={tl.s11.dur}><Audio src={staticFile('vo-gamma/s11.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s12.from} durationInFrames={tl.s12.dur}><Audio src={staticFile('vo-gamma/s12.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s13.from} durationInFrames={tl.s13.dur}><Audio src={staticFile('vo-gamma/s13.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s14.from} durationInFrames={tl.s14.dur}><Audio src={staticFile('vo-gamma/s14.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s15.from} durationInFrames={tl.s15.dur}><Audio src={staticFile('vo-gamma/s15.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s16.from} durationInFrames={tl.s16.dur}><Audio src={staticFile('vo-gamma/s16.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s17.from} durationInFrames={tl.s17.dur}><Audio src={staticFile('vo-gamma/s17.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s18.from} durationInFrames={tl.s18.dur}><Audio src={staticFile('vo-gamma/s18.mp3')} volume={1} /></Sequence>
      {/* s19 finale: River speaks (frames 0–125), pause 15f, Sarah speaks disclaimer (frames 140–188), outro hold (frames 188–300) */}
      <Sequence from={tl.s19.from} durationInFrames={135}><Audio src={staticFile('vo-gamma/s19.mp3')} volume={1} /></Sequence>
      <Sequence from={tl.s19.from + 140} durationInFrames={60}><Audio src={staticFile('vo-gamma/s20.mp3')} volume={1} /></Sequence>
    </AbsoluteFill>
  );
};
