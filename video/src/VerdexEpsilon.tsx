// VerdexEpsilon.tsx — Variant ε: CASE FILE
// Angle: a forensic bureau opens the dossier. Manila-folder tabs, exhibit
// cards, stamped exhibits, "chain of custody" lines. Voice: Brian (deep,
// documentary). Measured but brisk pacing (~72s).
import React from 'react';
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
import { CASES, RECEIPTS, STATS } from './data';
import { clamp } from './timeline';

const rise = (frame: number, at: number, span = 18) => ({
  opacity: interpolate(frame, [at, at + span], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [at, at + span], [24, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
});

const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.ink, fontFamily: F.display, color: C.text, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${C.panel} 3px, ${C.panel} 4px)` }} />
    {children}
  </AbsoluteFill>
);

const Folder: React.FC<{ children: React.ReactNode; tab?: string }> = ({ children, tab = 'VERDEX / EXHIBITS' }) => (
  <div style={{ position: 'absolute', left: 200, right: 200, top: 150, bottom: 90 }}>
    <div
      style={{
        position: 'absolute',
        top: -34,
        left: 0,
        height: 34,
        padding: '0 26px',
        background: '#2a2d21',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        display: 'flex',
        alignItems: 'center',
        fontFamily: F.data,
        fontSize: 15,
        letterSpacing: '0.18em',
        color: C.faint,
      }}
    >
      {tab}
    </div>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#23261c',
        border: `1px solid ${C.line}`,
        borderRadius: '0 10px 10px 10px',
        padding: '46px 54px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
      }}
    >
      {children}
    </div>
  </div>
);

const StampBox: React.FC<{ text: string; at: number; color: string; size?: number; rot?: number }> = ({ text, at, color, size = 84, rot = -7 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 6], [1.9, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const o = interpolate(frame, [at, at + 4], [0, 1], clamp);
  return (
    <div
      style={{
        display: 'inline-block',
        border: `7px double ${color}`,
        borderRadius: 8,
        padding: '6px 26px',
        color,
        fontFamily: F.serif,
        fontWeight: 800,
        fontSize: size,
        transform: `scale(${p}) rotate(${rot}deg)`,
        opacity: o,
      }}
    >
      {text}
    </div>
  );
};

const CustodyLine: React.FC<{ n: string; text: string; at: number }> = ({ n, text, at }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...rise(frame, at), display: 'flex', gap: 22, alignItems: 'baseline', marginBottom: 26 }}>
      <span style={{ fontFamily: F.data, fontSize: 17, color: C.safe }}>{n}</span>
      <span style={{ fontFamily: F.data, fontSize: 24, color: C.text }}>{text}</span>
    </div>
  );
};

// ── Scenes ─────────────────────────────────────────────────────────────────

const E01: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Folder tab="CASE 2026-09-30 / DEX FORENSICS">
        <div style={{ ...rise(frame, 8), fontFamily: F.data, fontSize: 15, letterSpacing: '0.22em', color: C.faint }}>FED TO THE RECORD</div>
        <div style={{ ...rise(frame, 24), fontFamily: F.serif, fontSize: 66, fontWeight: 700, marginTop: 20, lineHeight: 1.15 }}>
          Every DEX buy is a claim.
        </div>
        <div style={{ ...rise(frame, 60), fontFamily: F.serif, fontSize: 66, fontWeight: 700, color: C.safe, lineHeight: 1.15 }}>
          Verdex checks the evidence.
        </div>
      </Folder>
    </Base>
  );
};

const E02: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Folder tab="INTAKE">
        <CustodyLine n="01" text="Paste a contract, ticker, or name" at={8} />
        <CustodyLine n="02" text="Ambiguous tickers resolve to address + chain" at={50} />
        <CustodyLine n="03" text="Nine CoinMarketCap endpoints are pulled" at={92} />
        <CustodyLine n="04" text="Every raw body is hash-frozen on capture" at={134} />
        <div style={{ marginTop: 40, ...rise(frame, 175) }}>
          <span style={{ fontFamily: F.data, fontSize: 19, color: C.faint }}>chain of custody starts at the API call — not at our opinion</span>
        </div>
      </Folder>
    </Base>
  );
};

const E03: React.FC = () => {
  const frame = useCurrentFrame();
  const dims = [
    ['SAFETY', 'contract risk flags, taxes, vendor level'],
    ['FLOW', 'who is buying and selling, and how concentrated'],
    ['LIQUIDITY', 'can you actually exit'],
    ['PUMP', 'is the volume manufactured'],
  ];
  return (
    <Base>
      <Folder tab="FOUR EVIDENCE BOXES">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>
          {dims.map(([t, s], i) => (
            <div key={t} style={{ ...rise(frame, 10 + i * 30), border: `1px solid ${C.lineBright}`, borderRadius: 8, padding: '24px 26px', background: '#1b1e15' }}>
              <div style={{ fontFamily: F.data, fontSize: 26, fontWeight: 700, color: C.safe }}>{t}</div>
              <div style={{ fontFamily: F.data, fontSize: 17, color: C.faint, marginTop: 12, lineHeight: 1.5 }}>{s}</div>
            </div>
          ))}
        </div>
      </Folder>
    </Base>
  );
};

const ExhibitCard: React.FC<{ c: (typeof CASES)[number]; delay?: number }> = ({ c, delay = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...rise(frame, delay) }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: F.serif, fontSize: 56, fontWeight: 700 }}>{c.token}</span>
        <span style={{ fontFamily: F.data, fontSize: 18, color: C.faint }}>{c.chain} · score {c.score}</span>
      </div>
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {c.rows.filter(([t]) => t).map(([t, lv], i) => (
          <div key={t + i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.data, fontSize: 17, ...rise(frame, delay + 30 + i * 14) }}>
            <span style={{ color: C.text }}>{t}</span>
            <span style={{ fontWeight: 700, color: lv === 'DANGER' ? C.danger : lv === 'WARN' ? C.warn : lv === 'INSUFFICIENT' ? C.faint : C.safe }}>{lv}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const E04: React.FC = () => {
  return (
    <Base>
      <Folder tab={`EXHIBIT A — ${CASES[0].token}`}>
        <ExhibitCard c={CASES[0]} delay={8} />
        <div style={{ position: 'absolute', right: 90, top: 150 }}>
          <StampBox text={CASES[0].label} at={110} color={C.warn} size={72} />
        </div>
      </Folder>
    </Base>
  );
};

const E05: React.FC = () => {
  return (
    <Base>
      <Folder tab={`EXHIBIT B — ${CASES[1].token}`}>
        <ExhibitCard c={CASES[1]} delay={8} />
        <div style={{ position: 'absolute', right: 90, top: 150 }}>
          <StampBox text={CASES[1].label} at={110} color={C.danger} size={72} />
        </div>
      </Folder>
    </Base>
  );
};

const E06: React.FC = () => {
  return (
    <Base>
      <Folder tab={`EXHIBIT C — ${CASES[2].token}`}>
        <ExhibitCard c={CASES[2]} delay={8} />
        <div style={{ position: 'absolute', right: 90, top: 150 }}>
          <StampBox text={CASES[2].label} at={110} color={C.danger} size={72} />
        </div>
      </Folder>
    </Base>
  );
};

const E07: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Folder tab="CHAIN OF CUSTODY">
        {RECEIPTS.slice(0, 7).map((r, i) => (
          <div key={r[0]} style={{ ...rise(frame, 6 + i * 10), display: 'flex', justifyContent: 'space-between', fontFamily: F.data, fontSize: 18, marginBottom: 15 }}>
            <span style={{ color: C.text }}>{r[0]}</span>
            <span style={{ color: C.faint }}>{r[1]}</span>
            <span style={{ color: C.safe, fontWeight: 700 }}>{r[2]}</span>
          </div>
        ))}
        <div style={{ marginTop: 24, ...rise(frame, 90), fontFamily: F.data, fontSize: 16, color: C.faint }}>
          sha-256 of every response body — verify any byte yourself
        </div>
      </Folder>
    </Base>
  );
};

const E08: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Folder tab="ON THE RECORD">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 10 }}>
          {STATS.map(([n, l], i) => (
            <div key={l} style={{ ...rise(frame, 10 + i * 22) }}>
              <div style={{ fontFamily: F.serif, fontSize: 72, fontWeight: 700, color: C.safe }}>{n}</div>
              <div style={{ fontFamily: F.data, fontSize: 17, color: C.faint, marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </Folder>
    </Base>
  );
};

const E09: React.FC = () => {
  return (
    <Base>
      <Folder tab="DISCLOSURES — READ BEFORE TRUSTING">
        {[
          'missing data is shown as unknown, never zero',
          'truncated windows downgrade coverage on the record',
          'a replayed verdict is labeled a replay',
          'the AI opinion is a second voice, never the rulebook',
        ].map((t, i) => (
          <CustodyLine key={t} n={`0${i + 1}`} text={t} at={8 + i * 30} />
        ))}
      </Folder>
    </Base>
  );
};

const E10: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Folder tab="CLOSING THE FILE">
        <div style={{ ...rise(frame, 10), fontFamily: F.serif, fontSize: 58, fontWeight: 700, lineHeight: 1.2 }}>Verdicts you can audit.</div>
        <div style={{ ...rise(frame, 40), fontFamily: F.serif, fontSize: 58, fontWeight: 700, color: C.safe, lineHeight: 1.2 }}>Not vibes you can buy.</div>
        <div style={{ marginTop: 50 }}>
          <StampBox text="VERDEX" at={80} color={C.text} size={76} rot={-4} />
        </div>
        <div style={{ marginTop: 44, ...rise(frame, 130), fontFamily: F.data, fontSize: 18, color: C.faint }}>
          verdex.web.id — don't be the exit liquidity · built on the CoinMarketCap API
        </div>
      </Folder>
    </Base>
  );
};

export const TL_EPSILON = {
  s01: { from: 0, dur: 301 },
  s02: { from: 301, dur: 504 },
  s03: { from: 805, dur: 548 },
  s04: { from: 1353, dur: 345 },
  s05: { from: 1698, dur: 402 },
  s06: { from: 2100, dur: 416 },
  s07: { from: 2516, dur: 327 },
  s08: { from: 2843, dur: 377 },
  s09: { from: 3220, dur: 468 },
  s10: { from: 3688, dur: 228 },
} as const;
export const TL_EPSILON_TOTAL = 3916;

const VO = 'vo-epsilon';
const scenes = [E01, E02, E03, E04, E05, E06, E07, E08, E09, E10];
const tls = Object.values(TL_EPSILON);

let fontsInit = false;
export const VerdexEpsilon: React.FC = () => {
  React.useEffect(() => {
    if (!fontsInit) {
      fontsInit = true;
      ensureFonts();
    }
  }, []);
  return (
    <>
      {scenes.map((S, i) => (
        <Sequence key={i} {...tls[i]}>
          <S />
        </Sequence>
      ))}
      {tls.map((t, i) => (
        <Sequence key={`vo${i}`} from={t.from} durationInFrames={t.dur}>
          <Audio src={staticFile(`${VO}/s${String(i + 1).padStart(2, '0')}.mp3`)} />
        </Sequence>
      ))}
    </>
  );
};
