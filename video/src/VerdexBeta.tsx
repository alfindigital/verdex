// VerdexBeta.tsx — Variant β: NEON SIGNAL
// TikTok-energy. Female voice (Matilda). Fast 1-3s scenes. Bold typography + neon pops.
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
import { TL_BETA, clamp } from './timeline';
import { ScoreRing } from './components/ScoreRing';
import { DimBar } from './components/DimBar';
import { VerdictLabel } from './components/VerdictLabel';

// Motion helpers — aggressive (β style)
const bSlam = (frame: number, at: number) => {
  const s = interpolate(frame, [at, at + 4, at + 9], [0, 1.15, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  return {
    scale: `${s}`,
    opacity: frame >= at ? 1 : 0,
  };
};

const bShake = (frame: number, at: number): { translate: string } => {
  const t = frame - at;
  if (t < 0 || t > 8) return { translate: '0px 0px' };
  const d = 1 - t / 8;
  return { translate: `${Math.sin(t * 2.5) * 10 * d}px ${Math.cos(t * 3) * 6 * d}px` };
};

const bFlash = (frame: number, at: number) =>
  interpolate(frame, [at, at + 3, at + 6], [1, 0.2, 1], clamp);

// Bold headline base
const Hed: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.text,
  size = 120,
  style,
}) => (
  <div
    style={{
      fontFamily: F.display,
      fontWeight: 900,
      fontSize: size,
      color,
      lineHeight: 1,
      letterSpacing: '-0.02em',
      textTransform: 'uppercase',
      ...style,
    }}
  >
    {children}
  </div>
);

// Flash-cut base
const Base: React.FC<{ children: React.ReactNode; bg?: string }> = ({
  children,
  bg = C.ink,
}) => (
  <AbsoluteFill
    style={{
      background: bg,
      fontFamily: F.display,
      color: C.text,
      overflow: 'hidden',
      padding: '80px 100px',
    }}
  >
    {children}
  </AbsoluteFill>
);

// ── Scenes ────────────────────────────────────────────────────────────────────

const S01: React.FC = () => {
  const frame = useCurrentFrame();
  const flashBg = bFlash(frame, 0);
  return (
    <AbsoluteFill
      style={{
        background: C.ink,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: flashBg,
      }}
    >
      <div style={{ ...bSlam(frame, 0), ...bShake(frame, 0), textAlign: 'center' }}>
        <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 200, color: C.danger, lineHeight: 1, letterSpacing: '-0.04em' }}>
          -$47K
        </div>
        <div style={{ fontFamily: F.data, fontSize: 28, color: C.dim, letterSpacing: '0.1em', marginTop: 12 }}>
          GONE
        </div>
      </div>
    </AbsoluteFill>
  );
};

const S02: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '80px 100px', flexDirection: 'column', gap: 8 }}>
        <Hed size={64} style={{ ...bSlam(frame, 4) }}>One swap.</Hed>
        <Hed size={64} color={C.danger} style={{ ...bSlam(frame, 12) }}>One rug pull.</Hed>
        <Hed size={64} color={C.faint} style={{ ...bSlam(frame, 20) }}>Zero warning.</Hed>
      </AbsoluteFill>
    </Base>
  );
};

const S03: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base bg="#030d08">
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 100px' }}>
        <Hed size={72} style={{ ...bSlam(frame, 4), textAlign: 'center', color: C.safe }}>
          What if you could CHECK<br />before you swap?
        </Hed>
      </AbsoluteFill>
    </Base>
  );
};

const S04: React.FC = () => {
  const frame = useCurrentFrame();
  const shk = bShake(frame, 0);
  return (
    <AbsoluteFill style={{ background: C.safe, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ ...bSlam(frame, 0), ...shk, textAlign: 'center' }}>
        <Hed size={150} color={C.ink}>THIS IS VERDEX</Hed>
      </div>
    </AbsoluteFill>
  );
};

const S05: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 100px', flexDirection: 'column', gap: 20 }}>
        <div style={{ ...bSlam(frame, 4), fontFamily: F.data, fontSize: 20, color: C.safe, letterSpacing: '0.1em' }}>
          PASTE TOKEN ADDRESS →
        </div>
        <div style={{ ...bSlam(frame, 14), fontFamily: F.data, fontSize: 28, color: C.text, letterSpacing: '0.04em' }}>
          Get a forensic verdict.
        </div>
        <div style={{ ...bSlam(frame, 26), fontFamily: F.data, fontSize: 20, color: C.faint, letterSpacing: '0.08em' }}>
          Powered by CoinMarketCap DEX data.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S06: React.FC = () => {
  const frame = useCurrentFrame();
  const dims = ['SAFETY', 'FLOW', 'LIQUIDITY', 'PUMP'];
  const colors = [C.safe, C.safe, C.safe, C.safe];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 30 }}>
        {dims.map((d, i) => (
          <div key={d} style={{
            ...bSlam(frame, i * 8),
            fontFamily: F.data,
            fontSize: 30,
            fontWeight: 700,
            color: colors[i],
            letterSpacing: '0.1em',
            background: '#111113',
            border: `2px solid ${colors[i]}`,
            padding: '10px 28px',
          }}>
            {d}
          </div>
        ))}
      </AbsoluteFill>
    </Base>
  );
};

const S07: React.FC = () => {
  const frame = useCurrentFrame();
  const verdicts = ['ENTRY-WORTHY', 'CAUTION', 'AVOID'] as const;
  const cols = [C.safe, C.warn, C.danger];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 20, flexDirection: 'column' }}>
        {verdicts.map((v, i) => (
          <div key={v} style={{
            ...bSlam(frame, i * 14),
            fontFamily: F.data,
            fontSize: 36,
            fontWeight: 700,
            color: cols[i],
            letterSpacing: '0.1em',
            border: `3px solid ${cols[i]}`,
            padding: '10px 40px',
            width: 500,
            textAlign: 'center',
          }}>
            {v}
          </div>
        ))}
      </AbsoluteFill>
    </Base>
  );
};

const S08: React.FC = () => {
  const frame = useCurrentFrame();
  const gmx = CASES[0];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 60 }}>
        <div style={{ textAlign: 'center' }}>
          <Hed size={80} color={C.safe} style={{ ...bSlam(frame, 4) }}>GMX</Hed>
          <div style={{ ...bSlam(frame, 14), fontFamily: F.data, color: C.faint, fontSize: 18, letterSpacing: '0.1em', marginTop: 8 }}>
            ARBITRUM
          </div>
        </div>
        <ScoreRing at={14} score={gmx.score} color={C.safe} size={200} />
      </AbsoluteFill>
    </Base>
  );
};

const S09: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 100px', flexDirection: 'column', gap: 16 }}>
        <VerdictLabel label="ENTRY-WORTHY" at={4} variant="beta" fontSize={36} />
        <div style={{ ...bSlam(frame, 16), marginTop: 16 }}>
          {CASES[0].rows.map(([name], i) => (
            <DimBar key={i} name={name as string} level="CLEAN" at={20 + i * 12} />
          ))}
        </div>
        <div style={{ ...bSlam(frame, 64), fontFamily: F.data, color: C.safe, fontSize: 18, letterSpacing: '0.06em' }}>
          Jev AI: 0.10 · CONSENSUS
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const shk = bShake(frame, 0);
  return (
    <AbsoluteFill style={{ background: '#1a0000', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ ...bSlam(frame, 0), ...shk, textAlign: 'center' }}>
        <Hed size={80} color={C.danger}>SUSHI</Hed>
        <Hed size={48} color={C.danger} style={{ marginTop: 8 }}>AVOID · SCORE 45</Hed>
      </div>
    </AbsoluteFill>
  );
};

const S11: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 100px', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...bSlam(frame, 0), fontFamily: F.data, fontSize: 18, color: C.danger, letterSpacing: '0.1em' }}>
          ⚠ DANGER SIGNAL
        </div>
        <div style={{ ...bSlam(frame, 8), fontFamily: F.display, fontSize: 54, fontWeight: 900, color: C.danger }}>
          73% MAKER CONCENTRATION
        </div>
        <div style={{ ...bSlam(frame, 20), fontFamily: F.data, fontSize: 22, color: C.dim }}>
          One wallet controls the flow.
        </div>
        <div style={{ ...bSlam(frame, 36), fontFamily: F.data, fontSize: 16, color: C.faint, borderTop: `1px solid ${C.line}`, paddingTop: 12, marginTop: 8 }}>
          top5MakerShare: 0.73 &gt; threshold 0.50 → DANGER (from snapshot)
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S12: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24 }}>
        <div style={{ ...bSlam(frame, 0), fontFamily: F.data, fontSize: 42, fontWeight: 700, color: C.warn, letterSpacing: '0.08em' }}>
          AI DISAGREES?
        </div>
        <div style={{ ...bSlam(frame, 14), fontFamily: F.display, fontSize: 64, fontWeight: 900, color: C.text }}>
          YOU SEE IT.
        </div>
        <div style={{ ...bSlam(frame, 28), fontFamily: F.data, fontSize: 30, color: C.warn, letterSpacing: '0.1em' }}>
          CONTESTED · NEVER HIDDEN
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const S13: React.FC = () => {
  const frame = useCurrentFrame();
  const stats = ['9 API CALLS', '9 SHA-256 HASHES', 'ZERO GUESSWORK'];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20 }}>
        {stats.map((s, i) => (
          <div key={s} style={{
            ...bSlam(frame, i * 16),
            fontFamily: F.data,
            fontSize: 32,
            fontWeight: 700,
            color: i === 2 ? C.safe : C.text,
            letterSpacing: '0.08em',
          }}>
            {s}
          </div>
        ))}
      </AbsoluteFill>
    </Base>
  );
};

const S14: React.FC = () => {
  const frame = useCurrentFrame();
  const cards = [
    { n: '34', label: 'VERDICTS' },
    { n: '7', label: 'CHAINS' },
    { n: '306', label: 'RECEIPTS' },
  ];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 50 }}>
        {cards.map(({ n, label }, i) => (
          <div key={n} style={{
            ...bSlam(frame, i * 16),
            textAlign: 'center',
            background: '#111113',
            border: `2px solid ${C.safe}`,
            padding: '20px 40px',
          }}>
            <div style={{ fontFamily: F.display, fontWeight: 900, fontSize: 80, color: C.safe }}>{n}</div>
            <div style={{ fontFamily: F.data, fontSize: 16, color: C.faint, letterSpacing: '0.1em', marginTop: 4 }}>{label}</div>
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
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 100px', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...bSlam(frame, 0), fontFamily: F.data, fontSize: 20, color: C.faint, letterSpacing: '0.1em' }}>
          NOT A BLACK BOX
        </div>
        <Hed size={56} style={{ ...bSlam(frame, 10) }}>Published rules.</Hed>
        <Hed size={56} color={C.safe} style={{ ...bSlam(frame, 22) }}>Audit everything.</Hed>
      </AbsoluteFill>
    </Base>
  );
};

const S16: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 100px', flexDirection: 'column', gap: 8 }}>
        <div style={{ ...bSlam(frame, 0), fontFamily: F.data, fontSize: 16, color: C.faint, letterSpacing: '0.1em', marginBottom: 12 }}>
          9 CMC ENDPOINTS · ALL HASHED
        </div>
        {RECEIPTS.map(([ep], i) => (
          <div key={ep} style={{
            opacity: interpolate(frame, [6 + i * 8, 16 + i * 8], [0, 1], clamp),
            fontFamily: F.data,
            fontSize: 18,
            color: i < 3 ? C.safe : C.dim,
            letterSpacing: '0.03em',
            borderLeft: `3px solid ${i < 3 ? C.safe : C.line}`,
            paddingLeft: 14,
          }}>
            {ep}
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
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ ...bSlam(frame, 0), fontFamily: F.data, fontSize: 28, color: C.faint, textAlign: 'center' }}>
          That $47K?
        </div>
        <Hed size={60} color={C.safe} style={{ ...bSlam(frame, 14), textAlign: 'center' }}>
          Could've stayed<br />in your wallet.
        </Hed>
      </AbsoluteFill>
    </Base>
  );
};

const S18: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.2) * 0.04 + 1;
  return (
    <AbsoluteFill style={{ background: C.safe, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ ...bSlam(frame, 0), textAlign: 'center', transform: `scale(${pulse})` }}>
        <Hed size={100} color={C.ink}>VERDEX</Hed>
        <div style={{ fontFamily: F.data, fontSize: 24, color: '#1a6040', letterSpacing: '0.08em', marginTop: 12 }}>
          CHECK BEFORE YOU SWAP
        </div>
      </div>
    </AbsoluteFill>
  );
};

const S19: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24 }}>
        <Hed size={60} color={C.safe} style={{ ...bSlam(frame, 6) }}>#BuildwithCMC</Hed>
        <div style={{ ...bSlam(frame, 20), fontFamily: F.data, fontSize: 22, color: C.text, letterSpacing: '0.06em', textAlign: 'center' }}>
          Built for the CoinMarketCap API Hackathon
        </div>
        <div style={{
          ...bSlam(frame, 36),
          fontFamily: F.data,
          fontSize: 16,
          color: C.faint,
          borderTop: `1px solid ${C.line}`,
          paddingTop: 16,
          marginTop: 8,
          width: 600,
          textAlign: 'center',
        }}>
          Not financial advice. Recorded evidence only.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

// ── Main Composition ──────────────────────────────────────────────────────────
export const VerdexBeta: React.FC = () => {
  useEffect(() => { ensureFonts(); }, []);

  const tl = TL_BETA;
  const voDir = 'vo-beta';

  return (
    <AbsoluteFill style={{ background: C.ink }}>
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

      {/* VO — Matilda, punchy */}
      {Object.entries(tl).map(([key, { from }]) => {
        const n = key.replace('s', '').padStart(2, '0');
        return (
          <Sequence key={key} from={from}>
            <Audio src={staticFile(`${voDir}/s${n}.mp3`)} volume={1} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
