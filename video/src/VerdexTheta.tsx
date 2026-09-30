// VerdexTheta.tsx — Variant θ: BEFORE / AFTER
// Angle: split-screen contrast. Left = what a structure check sees
// (contract passes, code verified, deployer known). Right = what the
// behavior evidence sees (concentration, real sells, exit liquidity).
// Voice: Charlie (energetic).
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
import { CASES, STATS } from './data';
import { clamp } from './timeline';

const rise = (frame: number, at: number, span = 14) => ({
  opacity: interpolate(frame, [at, at + span], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [at, at + span], [20, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
});

const Split: React.FC<{ left: React.ReactNode; right: React.ReactNode; splitAt?: number; frame: number }> = ({
  left,
  right,
  splitAt = 0,
  frame,
}) => {
  const wipe = interpolate(frame, [splitAt, splitAt + 24], [0, 50], clamp);
  return (
    <AbsoluteFill style={{ fontFamily: F.data, overflow: 'hidden' }}>
      {/* left: grey structure world */}
      <div style={{ position: 'absolute', inset: 0, background: '#17181a' }}>{left}</div>
      {/* right: evidence world wipes in */}
      <div style={{ position: 'absolute', inset: 0, background: '#0c100c', clipPath: `inset(0 0 0 ${100 - wipe}%)` }}>{right}</div>
      {/* divider */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, background: C.safe, left: `${100 - wipe}%`, opacity: wipe > 0 && wipe < 50 ? 1 : 0 }} />
    </AbsoluteFill>
  );
};

const LeftTag = () => (
  <div style={{ position: 'absolute', top: 34, left: 50, fontSize: 14, letterSpacing: '0.3em', color: '#8b8f96' }}>WHAT A CONTRACT CHECK SEES</div>
);
const RightTag = () => (
  <div style={{ position: 'absolute', top: 34, right: 50, fontSize: 14, letterSpacing: '0.3em', color: C.safe }}>WHAT VERDEX SEES</div>
);

const BigCheck: React.FC<{ text: string; at: number; ok?: boolean }> = ({ text, at, ok = true }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...rise(frame, at), display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${ok ? '#8b8f96' : C.danger}`, color: ok ? '#8b8f96' : C.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        {ok ? '✓' : '✕'}
      </span>
      <span style={{ fontSize: 26, color: ok ? '#c8ccd2' : C.danger }}>{text}</span>
    </div>
  );
};

const EvidenceRow: React.FC<{ text: string; level: string; at: number }> = ({ text, level, at }) => {
  const frame = useCurrentFrame();
  const color = level === 'DANGER' ? C.danger : level === 'WARN' ? C.warn : level === 'INSUFFICIENT' ? C.faint : C.safe;
  return (
    <div style={{ ...rise(frame, at), display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, padding: '12px 18px', border: `1px solid ${C.lineBright}`, borderRadius: 6, background: `${C.panel}dd` }}>
      <span style={{ fontSize: 22, color: C.text }}>{text}</span>
      <span style={{ fontSize: 20, fontWeight: 700, color }}>{level}</span>
    </div>
  );
};

// ── Scenes ─────────────────────────────────────────────────────────────────

const H01: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Split
      frame={frame}
      splitAt={70}
      left={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 110px', width: '50%' }}>
          <LeftTag />
          <div style={{ fontSize: 44, fontFamily: F.display, fontWeight: 700, color: '#c8ccd2', lineHeight: 1.3 }}>Contract verified.</div>
        </AbsoluteFill>
      }
      right={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 110px', alignItems: 'flex-end' }}>
          <RightTag />
          <div style={{ width: '46%', fontSize: 44, fontFamily: F.display, fontWeight: 700, color: C.safe, lineHeight: 1.3, textAlign: 'right' }}>Behavior measured.</div>
        </AbsoluteFill>
      }
    />
  );
};

const H02: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Split
      frame={frame}
      splitAt={0}
      left={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px', width: '52%' }}>
          <LeftTag />
          <BigCheck text="source code verified" at={8} />
          <BigCheck text="audit badge present" at={30} />
          <BigCheck text="deployer doxxed" at={52} />
          <BigCheck text="liquidity locked" at={74} />
        </AbsoluteFill>
      }
      right={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px', alignItems: 'flex-end' }}>
          <RightTag />
          <div style={{ width: '48%' }}>
            <EvidenceRow text="top-5 makers: 92% of tape" level="WARN" at={12} />
            <EvidenceRow text="third-party sells observed: 12" level="WARN" at={34} />
            <EvidenceRow text="net buy ratio: +0.84" level="WARN" at={56} />
          </div>
        </AbsoluteFill>
      }
    />
  );
};

const H03: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Split
      frame={frame}
      splitAt={0}
      left={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 90px', width: '50%' }}>
          <LeftTag />
          <div style={{ fontSize: 40, fontFamily: F.display, fontWeight: 700, color: '#c8ccd2', lineHeight: 1.3 }}>
            "Passed."
          </div>
          <div style={{ ...rise(frame, 30), fontSize: 20, color: '#8b8f96', marginTop: 24, lineHeight: 1.6 }}>structure ≠ behavior</div>
        </AbsoluteFill>
      }
      right={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 90px', alignItems: 'flex-end' }}>
          <RightTag />
          <div style={{ width: '48%' }}>
            <div style={{ fontSize: 40, fontFamily: F.display, fontWeight: 700, color: C.warn, lineHeight: 1.3, textAlign: 'right' }}>CAUTION.</div>
            <div style={{ ...rise(frame, 30), fontSize: 20, color: C.faint, marginTop: 24, textAlign: 'right' }}>one failing row: named</div>
          </div>
        </AbsoluteFill>
      }
    />
  );
};

const H04: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CASES[1];
  return (
    <Split
      frame={frame}
      splitAt={0}
      left={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px', width: '52%' }}>
          <LeftTag />
          <BigCheck text={`${c.token} contract verified`} at={8} />
          <BigCheck text="known brand, still listed" at={30} />
          <BigCheck text="$65K nominal pool depth" at={52} />
        </AbsoluteFill>
      }
      right={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px', alignItems: 'flex-end' }}>
          <RightTag />
          <div style={{ width: '48%' }}>
            <EvidenceRow text="13 swaps/day over 8 days" level="DANGER" at={10} />
            <EvidenceRow text="top-5 makers: 100% of tape" level="WARN" at={32} />
            <EvidenceRow text="pausable + unrenounced flags" level="WARN" at={54} />
          </div>
        </AbsoluteFill>
      }
    />
  );
};

const H05: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [20, 28], [1.8, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: '#0c100c', justifyContent: 'center', alignItems: 'center', fontFamily: F.data }}>
      <div style={{ transform: `scale(${p}) rotate(4deg)`, border: `8px solid ${C.danger}`, borderRadius: 10, padding: '10px 46px', color: C.danger, fontFamily: F.serif, fontSize: 76, fontWeight: 800, opacity: p > 1.7 ? 0 : 1 }}>
        HIGH RISK FLAGS
      </div>
      <div style={{ ...rise(frame, 52), fontSize: 19, color: C.faint, marginTop: 38 }}>CEL · score 45 — the collapse didn't end the ticker; dead tape did</div>
    </AbsoluteFill>
  );
};

const H06: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Split
      frame={frame}
      splitAt={0}
      left={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px', width: '52%' }}>
          <LeftTag />
          <BigCheck text="green dashboard" at={8} />
          <BigCheck text="smooth chart" at={30} />
          <BigCheck text="active community" at={52} />
        </AbsoluteFill>
      }
      right={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px', alignItems: 'flex-end' }}>
          <RightTag />
          <div style={{ width: '48%' }}>
            <EvidenceRow text="evidence missing → unknown" level="WARN" at={10} />
            <EvidenceRow text="window thin → coverage limited" level="WARN" at={34} />
            <EvidenceRow text="replayed record → labeled" level="CLEAN" at={58} />
          </div>
        </AbsoluteFill>
      }
    />
  );
};

const H07: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#0c100c', justifyContent: 'center', padding: '0 160px', fontFamily: F.data }}>
      <div style={{ ...rise(frame, 8), fontSize: 15, letterSpacing: '0.28em', color: C.faint }}>THE METHOD, FLAT OUT</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22, marginTop: 26 }}>
        {[
          ['RESOLVE', 'chain + address, never a guess'],
          ['PULL', '9 CMC endpoints, raw bodies'],
          ['MEASURE', '4 dimensions, published thresholds'],
          ['STAMP', 'verdict + named falsifier'],
        ].map(([t, s], i) => (
          <div key={t} style={{ ...rise(frame, 12 + i * 22), border: `1px solid ${C.lineBright}`, borderRadius: 6, padding: '24px', background: `${C.panel}dd` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.safe }}>{t}</div>
            <div style={{ fontSize: 15, color: C.faint, marginTop: 10, lineHeight: 1.5 }}>{s}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const H08: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#0c100c', justifyContent: 'center', padding: '0 160px', fontFamily: F.data }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
        {STATS.map(([n, l], i) => (
          <div key={l} style={{ ...rise(frame, 8 + i * 18), textAlign: 'center', border: `1px solid ${C.lineBright}`, borderRadius: 6, padding: '26px 14px', background: `${C.panel}dd` }}>
            <div style={{ fontSize: 56, fontWeight: 700, color: C.safe }}>{n}</div>
            <div style={{ fontSize: 14, color: C.faint, marginTop: 10 }}>{l}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const H09: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Split
      frame={frame}
      splitAt={0}
      left={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 100px', width: '50%' }}>
          <LeftTag />
          <div style={{ fontSize: 40, fontFamily: F.display, fontWeight: 700, color: '#c8ccd2', lineHeight: 1.3 }}>Trust the badge.</div>
        </AbsoluteFill>
      }
      right={
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 100px', alignItems: 'flex-end' }}>
          <RightTag />
          <div style={{ width: '48%' }}>
            <div style={{ fontSize: 40, fontFamily: F.display, fontWeight: 700, color: C.safe, lineHeight: 1.3, textAlign: 'right' }}>Check the record.</div>
            <div style={{ ...rise(frame, 40), fontSize: 18, color: C.faint, marginTop: 30, textAlign: 'right' }}>verdex.web.id — don't be the exit liquidity</div>
          </div>
        </AbsoluteFill>
      }
    />
  );
};

export const TL_THETA = {
  s01: { from: 0, dur: 201 },
  s02: { from: 201, dur: 395 },
  s03: { from: 596, dur: 209 },
  s04: { from: 805, dur: 357 },
  s05: { from: 1162, dur: 170 },
  s06: { from: 1332, dur: 237 },
  s07: { from: 1569, dur: 260 },
  s08: { from: 1829, dur: 194 },
  s09: { from: 2023, dur: 152 },
} as const;
export const TL_THETA_TOTAL = 2175;

const VO = 'vo-theta';
const scenes = [H01, H02, H03, H04, H05, H06, H07, H08, H09];
const tls = Object.values(TL_THETA);

let fontsInit = false;
export const VerdexTheta: React.FC = () => {
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
