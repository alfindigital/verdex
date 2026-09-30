// VerdexAlpha.tsx — Variant α: NOIR FORENSIC
// Dark documentary. Male voice (Roger). Methodical. Monospace only.
// All data from data.ts — zero invented numbers.
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
import { TL_ALPHA, clamp } from './timeline';
import { ScoreRing } from './components/ScoreRing';
import { DimBar } from './components/DimBar';
import { ReceiptRow } from './components/ReceiptRow';
import { VerdictLabel } from './components/VerdictLabel';

// Motion helpers — slow, deliberate (α style)
const aSnap = (frame: number, at: number, span = 16) => ({
  opacity: interpolate(frame, [at, at + span], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [at, at + span], [12, 0], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}px`,
});

const aType = (frame: number, at: number, text: string, cps = 22) => {
  const chars = Math.max(0, Math.floor(((frame - at) / 30) * cps));
  return text.slice(0, Math.min(chars, text.length));
};

const Cursor: React.FC<{ frame: number }> = ({ frame }) => (
  <span
    style={{
      display: 'inline-block',
      width: 2,
      height: '1em',
      background: C.safe,
      marginLeft: 2,
      opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0,
      verticalAlign: 'middle',
    }}
  />
);

// Base container
const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: C.ink,
      fontFamily: F.data,
      color: C.text,
      overflow: 'hidden',
    }}
  >
    {/* subtle grid */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }}
    />
    {children}
  </AbsoluteFill>
);

// ── Scenes ────────────────────────────────────────────────────────────────────

const S01: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 160px' }}>
        <div style={{ ...aSnap(frame, 10), fontSize: 36, letterSpacing: '0.04em', lineHeight: 1.6, color: C.dim }}>
          {aType(frame, 10, 'A token can pass every contract audit.', 24)}
          {frame < 10 + 45 && <Cursor frame={frame} />}
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S02: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 160px', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...aSnap(frame, 6), fontSize: 36, letterSpacing: '0.04em', color: C.dim }}>
          And still rug you.
        </div>
        <div style={{ ...aSnap(frame, 26), fontSize: 28, letterSpacing: '0.04em', color: C.faint }}>
          Because structure is not behavior.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S03: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ ...aSnap(frame, 10), fontSize: 38, letterSpacing: '0.04em', textAlign: 'center', color: C.text, maxWidth: 900, lineHeight: 1.5 }}>
          What if someone already checked<br />the actual trades?
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
        <div style={{
          ...aSnap(frame, 8),
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: C.safe,
        }}>
          VERDEX
        </div>
        <div style={{ ...aSnap(frame, 28), fontSize: 22, color: C.faint, letterSpacing: '0.12em' }}>
          pre-trade forensic evidence
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S05: React.FC = () => {
  const frame = useCurrentFrame();
  const dims = ['SAFETY', 'FLOW', 'LIQUIDITY', 'PUMP'];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 160px', flexDirection: 'column', gap: 24 }}>
        <div style={{ ...aSnap(frame, 6), color: C.safe, fontSize: 18, letterSpacing: '0.1em' }}>
          &gt; input: DEX token address
        </div>
        <div style={{ ...aSnap(frame, 20), color: C.dim, fontSize: 18, letterSpacing: '0.06em' }}>
          &gt; reading 100 swaps · liquidity events · security flags
        </div>
        <div style={{ ...aSnap(frame, 42), display: 'flex', gap: 24, marginTop: 16 }}>
          {dims.map((d, i) => (
            <div key={d} style={{
              opacity: interpolate(frame, [42 + i * 10, 54 + i * 10], [0, 1], clamp),
              background: '#111113',
              border: `1px solid ${C.line}`,
              padding: '12px 24px',
              fontSize: 16,
              letterSpacing: '0.1em',
              color: C.safe,
            }}>
              {d}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S06: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 160px', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...aSnap(frame, 6), color: C.faint, fontSize: 16, letterSpacing: '0.1em' }}>
          FORENSIC DIMENSIONS
        </div>
        {['SAFETY', 'FLOW', 'LIQUIDITY', 'PUMP'].map((d, i) => (
          <div key={d} style={{
            opacity: interpolate(frame, [16 + i * 12, 28 + i * 12], [0, 1], clamp),
            fontSize: 32,
            letterSpacing: '0.06em',
            color: C.text,
            translate: `0px ${interpolate(frame, [16 + i * 12, 28 + i * 12], [10, 0], clamp)}px`,
          }}>
            {String(i + 1).padStart(2, '0')}. {d}
          </div>
        ))}
      </AbsoluteFill>
    </Base>
  );
};

const S07: React.FC = () => {
  const frame = useCurrentFrame();
  const verdicts = [
    { label: 'ENTRY-WORTHY', color: C.safe },
    { label: 'CAUTION', color: C.warn },
    { label: 'AVOID', color: C.danger },
  ];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 160px', flexDirection: 'column', gap: 28 }}>
        <div style={{ ...aSnap(frame, 4), fontSize: 16, color: C.faint, letterSpacing: '0.1em' }}>OUTPUT / VERDICT</div>
        {verdicts.map(({ label, color }, i) => (
          <div key={label} style={{
            opacity: interpolate(frame, [16 + i * 18, 30 + i * 18], [0, 1], clamp),
            fontSize: 30,
            fontWeight: 700,
            color,
            letterSpacing: '0.08em',
          }}>
            {label}
          </div>
        ))}
      </AbsoluteFill>
    </Base>
  );
};

const S08: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 160px', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...aSnap(frame, 6), color: C.faint, fontSize: 16, letterSpacing: '0.1em' }}>CASE FILE #001</div>
        <div style={{ ...aSnap(frame, 18), fontSize: 72, fontWeight: 700, color: C.text, letterSpacing: '0.1em' }}>
          GMX
        </div>
        <div style={{ ...aSnap(frame, 32), fontSize: 22, color: C.faint, letterSpacing: '0.08em' }}>
          chain: arbitrum
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
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', gap: 64, alignItems: 'center' }}>
        {/* Left: score ring */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          <ScoreRing at={6} score={gmx.score} color={C.safe} size={180} />
          <VerdictLabel label="ENTRY-WORTHY" at={66} variant="alpha" fontSize={22} />
        </div>
        {/* Right: dim table */}
        <div style={{ flex: 1, ...aSnap(frame, 20) }}>
          <div style={{ color: C.faint, fontSize: 15, letterSpacing: '0.1em', marginBottom: 24 }}>
            GMX · ARBITRUM — DIMENSION ANALYSIS
          </div>
          {gmx.rows.map(([name, level], i) => (
            <DimBar key={i} name={name as string} level={level as 'CLEAN' | 'WARN' | 'DANGER'} at={30 + i * 14} />
          ))}
          <div style={{ ...aSnap(frame, 92), fontSize: 16, color: C.faint, marginTop: 20, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
            Jev AI second opinion: <span style={{ color: C.safe }}>{gmx.footAccent}</span>
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
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 160px', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...aSnap(frame, 4), color: C.faint, fontSize: 16, letterSpacing: '0.1em' }}>CASE FILE #002</div>
        <div style={{ ...aSnap(frame, 14), fontSize: 72, fontWeight: 700, color: C.danger, letterSpacing: '0.1em' }}>
          SUSHI
        </div>
        <div style={{ ...aSnap(frame, 28), fontSize: 22, color: C.faint }}>
          chain: ethereum · <span style={{ color: C.danger, fontWeight: 600 }}>AVOID · score 45</span>
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
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', gap: 64, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          <ScoreRing at={4} score={sushi.score} color={C.danger} size={180} />
          <VerdictLabel label="AVOID" at={64} variant="alpha" fontSize={22} />
        </div>
        <div style={{ flex: 1, ...aSnap(frame, 16) }}>
          <div style={{ color: C.faint, fontSize: 15, letterSpacing: '0.1em', marginBottom: 24 }}>
            SUSHI · ETHEREUM — DIMENSION ANALYSIS
          </div>
          <DimBar name="top5MakerShare" level="DANGER" at={26} />
          <DimBar name="centralizationFlags" level="WARN" at={40} />
          <DimBar name="netBuyRatio" level="WARN" at={54} />
          <DimBar name="LIQUIDITY / PUMP" level="CLEAN" at={68} />
          <div style={{ ...aSnap(frame, 90), fontSize: 15, color: C.danger, marginTop: 20, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
            top5MakerShare: 0.73 &gt; threshold 0.50 → DANGER
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
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', gap: 0, flexDirection: 'column' }}>
        <div style={{ ...aSnap(frame, 6), color: C.faint, fontSize: 15, letterSpacing: '0.1em', marginBottom: 40 }}>
          AI CROSS-EXAMINATION
        </div>
        <div style={{ display: 'flex', gap: 60 }}>
          {/* Rules engine */}
          <div style={{ flex: 1, ...aSnap(frame, 14), background: '#111113', border: `1px solid ${C.line}`, padding: '32px 36px' }}>
            <div style={{ color: C.faint, fontSize: 14, letterSpacing: '0.1em', marginBottom: 16 }}>RULES ENGINE</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.danger }}>AVOID</div>
            <div style={{ color: C.faint, fontSize: 16, marginTop: 12 }}>score: 45</div>
          </div>
          {/* Divider */}
          <div style={{ ...aSnap(frame, 40), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.warn }}>CONTESTED</div>
            <div style={{ width: 1, height: 80, background: C.warn, opacity: 0.4 }} />
          </div>
          {/* Jev AI */}
          <div style={{ flex: 1, ...aSnap(frame, 28), background: '#111113', border: `1px solid ${C.warn}`, padding: '32px 36px' }}>
            <div style={{ color: C.faint, fontSize: 14, letterSpacing: '0.1em', marginBottom: 16 }}>JEV AI OPINION</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.warn }}>P(risky) 0.82</div>
            <div style={{ color: C.faint, fontSize: 16, marginTop: 12 }}>supports avoid</div>
          </div>
        </div>
        <div style={{ ...aSnap(frame, 70), color: C.faint, fontSize: 16, marginTop: 28 }}>
          Both opinions shown. Neither hidden.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S13: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', flexDirection: 'column', gap: 0 }}>
        <div style={{ ...aSnap(frame, 4), color: C.faint, fontSize: 15, letterSpacing: '0.1em', marginBottom: 28 }}>
          EVIDENCE RECEIPTS — VERDICT 8d3ea1d0c471
        </div>
        <div style={{ flex: 1 }}>
          {RECEIPTS.map(([ep, , hash], i) => (
            <ReceiptRow key={ep} endpoint={ep} hash={hash} at={12} delay={i * 8} />
          ))}
        </div>
        <div style={{ ...aSnap(frame, 90), color: C.safe, fontSize: 16, marginTop: 24, letterSpacing: '0.06em' }}>
          9 endpoints · 9 SHA-256 hashes · 0 invented
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S14: React.FC = () => {
  const frame = useCurrentFrame();
  const stats = [
    { n: '34', label: 'recorded verdicts' },
    { n: '7', label: 'chains covered' },
    { n: '306', label: 'API receipts' },
  ];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 80 }}>
        {stats.map(({ n, label }, i) => (
          <div key={n} style={{
            opacity: interpolate(frame, [8 + i * 16, 24 + i * 16], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [8 + i * 16, 24 + i * 16], [20, 0], clamp)}px`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 80, fontWeight: 700, color: C.safe, letterSpacing: '0.05em' }}>{n}</div>
            <div style={{ fontSize: 18, color: C.faint, letterSpacing: '0.08em', marginTop: 8 }}>{label}</div>
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
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 160px', flexDirection: 'column', gap: 24 }}>
        <div style={{ ...aSnap(frame, 6), fontSize: 30, color: C.text, fontWeight: 600 }}>No black box.</div>
        <div style={{ ...aSnap(frame, 22), fontSize: 22, color: C.dim }}>Every threshold is published.</div>
        <div style={{ ...aSnap(frame, 38), fontSize: 22, color: C.dim }}>Every rule is auditable.</div>
      </AbsoluteFill>
    </Base>
  );
};

const S16: React.FC = () => {
  const frame = useCurrentFrame();
  const endpoints = RECEIPTS.map(([ep]) => ep);
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...aSnap(frame, 4), color: C.faint, fontSize: 15, letterSpacing: '0.1em', marginBottom: 24 }}>
          COINMARKETCAP DEX API — 9 ENDPOINTS
        </div>
        {endpoints.map((ep, i) => (
          <div key={ep} style={{
            opacity: interpolate(frame, [14 + i * 8, 26 + i * 8], [0, 1], clamp),
            fontSize: 18,
            color: C.dim,
            letterSpacing: '0.04em',
            borderLeft: `2px solid ${C.safe}`,
            paddingLeft: 16,
          }}>
            &gt; {ep}
          </div>
        ))}
      </AbsoluteFill>
    </Base>
  );
};

const S17: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '0 160px', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...aSnap(frame, 8), fontSize: 28, color: C.faint }}>
          Structure says: could it rug?
        </div>
        <div style={{ ...aSnap(frame, 36), fontSize: 38, fontWeight: 700, color: C.text }}>
          Verdex says: <span style={{ color: C.safe }}>is it rugging.</span>
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S18: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24 }}>
        <div style={{
          ...aSnap(frame, 8),
          fontSize: 100,
          fontWeight: 700,
          color: C.safe,
          letterSpacing: '0.15em',
        }}>
          VERDEX
        </div>
        <div style={{ ...aSnap(frame, 36), fontSize: 24, color: C.faint, letterSpacing: '0.08em' }}>
          Don't be the exit liquidity.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S19: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ ...aSnap(frame, 6), color: C.safe, fontSize: 22, letterSpacing: '0.1em' }}>
          #BuildwithCMC
        </div>
        <div style={{ ...aSnap(frame, 22), color: C.text, fontSize: 26, letterSpacing: '0.06em' }}>
          Built for the CoinMarketCap API Hackathon
        </div>
        <div style={{ ...aSnap(frame, 38), color: C.faint, fontSize: 18, marginTop: 12 }}>
          Open source · github.com/alfindigital/verdex
        </div>
        <div style={{ ...aSnap(frame, 54), color: C.faint, fontSize: 15, borderTop: `1px solid ${C.line}`, paddingTop: 16, marginTop: 8, width: 600, textAlign: 'center' }}>
          Not financial advice. Recorded evidence only.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────
export const VerdexAlpha: React.FC = () => {
  useEffect(() => { ensureFonts(); }, []);

  const tl = TL_ALPHA;
  const voDir = 'vo-alpha';

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {/* Scenes */}
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

      {/* Voiceover — Roger, deliberate */}
      {Object.entries(tl).map(([key, { from }]) => {
        const n = key.replace('s', '').padStart(2, '0');
        const filename = `${voDir}/s${n}.mp3`;
        return (
          <Sequence key={key} from={from}>
            <Audio src={staticFile(filename)} volume={1} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
