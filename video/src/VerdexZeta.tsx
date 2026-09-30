// VerdexZeta.tsx — Variant ζ: THE SCAN
// Angle: instrument-grade scan. A token identity drops into the machine;
// a sweep passes; four dimension gauges settle one by one; the verdict
// lands with a mechanical stamp. Voice: River (neutral, brisk).
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
import { STATS } from './data';
import { clamp } from './timeline';

const rise = (frame: number, at: number, span = 14) => ({
  opacity: interpolate(frame, [at, at + span], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [at, at + span], [22, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
});

const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const sweep = (frame * 6) % 1400 - 200;
  return (
    <AbsoluteFill style={{ background: '#0a0d0b', fontFamily: F.data, color: C.text, overflow: 'hidden' }}>
      {/* faint grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.line}22 1px, transparent 1px), linear-gradient(90deg, ${C.line}22 1px, transparent 1px)`, backgroundSize: '64px 64px' }} />
      {/* scanline */}
      <div style={{ position: 'absolute', left: sweep, top: 0, bottom: 0, width: 120, background: `linear-gradient(90deg, transparent, ${C.safe}18, transparent)` }} />
      {children}
    </AbsoluteFill>
  );
};

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ border: `1px solid ${C.lineBright}`, background: `${C.panel}dd`, borderRadius: 6, padding: '26px 30px', ...style }}>
    {children}
  </div>
);

const Gauge: React.FC<{ label: string; level: string; at: number }> = ({ label, level, at }) => {
  const frame = useCurrentFrame();
  const lv = level === 'CLEAN' ? 0 : level === 'WARN' ? 1 : level === 'DANGER' ? 2 : -1;
  const color = lv === 0 ? C.safe : lv === 1 ? C.warn : lv === 2 ? C.danger : C.faint;
  const p = interpolate(frame, [at, at + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const x = lv < 0 ? 50 : 16 + lv * 34;
  return (
    <div style={{ ...rise(frame, at) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20 }}>
        <span style={{ color: C.text, fontWeight: 700 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{level}</span>
      </div>
      <div style={{ position: 'relative', height: 10, marginTop: 14, borderRadius: 4, background: C.line }}>
        <div style={{ position: 'absolute', left: 0, right: `${100 - (lv < 0 ? 0 : (lv + 1) * 33)}%`, top: 0, bottom: 0, borderRadius: 4, background: color, transform: `scaleX(${p})`, transformOrigin: 'left' }} />
        <div style={{ position: 'absolute', top: -5, width: 4, height: 20, background: C.text, left: `${x}%`, opacity: p }} />
      </div>
    </div>
  );
};

// ── Scenes ─────────────────────────────────────────────────────────────────

const Z01: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 170px' }}>
        <div style={{ ...rise(frame, 6), fontSize: 16, letterSpacing: '0.3em', color: C.safe }}>VERDEX · PRE-TRADE FORENSIC SCAN</div>
        <div style={{ ...rise(frame, 22), fontSize: 62, fontWeight: 700, fontFamily: F.display, lineHeight: 1.2, marginTop: 22 }}>
          Nine endpoints.
        </div>
        <div style={{ ...rise(frame, 46), fontSize: 62, fontWeight: 700, fontFamily: F.display, lineHeight: 1.2 }}>
          Four dimensions.
        </div>
        <div style={{ ...rise(frame, 70), fontSize: 62, fontWeight: 700, fontFamily: F.display, lineHeight: 1.2, color: C.safe }}>
          One verdict.
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const Z02: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = 'RAY · solana · 4k3Dyjzvzp8eMZW…';
  const n = Math.max(0, Math.min(typed.length, Math.floor((frame - 10) * 1.6)));
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 170px' }}>
        <Panel>
          <div style={{ fontSize: 15, letterSpacing: '0.24em', color: C.faint }}>TARGET ACQUIRED</div>
          <div style={{ fontSize: 34, fontWeight: 700, marginTop: 18, minHeight: 50 }}>
            {typed.slice(0, n)}
            {n < typed.length && <span style={{ color: C.safe }}>▌</span>}
          </div>
          <div style={{ ...rise(frame, 80), fontSize: 16, color: C.faint, marginTop: 14 }}>
            identity resolved to chain + address — ambiguous tickers never auto-picked
          </div>
        </Panel>
      </AbsoluteFill>
    </Base>
  );
};

const Z03: React.FC = () => {
  const frame = useCurrentFrame();
  const eps = ['/v1/dex/search', '/v1/dex/tokens/transactions', '/v1/dex/token/pools', '/v1/dex/liquidity-change/list', '/v1/dex/security/detail', '/v1/dex/token', '/v1/global-metrics/quotes/latest', '/v1/global-metrics/quotes/historical', '/v3/fear-and-greed/latest'];
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 170px' }}>
        <div style={{ ...rise(frame, 4), fontSize: 15, letterSpacing: '0.24em', color: C.faint, marginBottom: 22 }}>PULLING EVIDENCE — COINMARKETCAP API</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {eps.map((e, i) => (
            <Panel key={e} style={{ ...rise(frame, 6 + i * 9), padding: '18px 20px' }}>
              <div style={{ fontSize: 15, color: C.text }}>{e}</div>
              <div style={{ fontSize: 13, color: C.safe, marginTop: 8 }}>body frozen · sha-256</div>
            </Panel>
          ))}
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const Z04: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 170px' }}>
        <div style={{ ...rise(frame, 4), fontSize: 15, letterSpacing: '0.24em', color: C.faint, marginBottom: 26 }}>DIMENSION SWEEP — RAY</div>
        <Panel style={{ display: 'flex', flexDirection: 'column', gap: 34, padding: '38px 44px' }}>
          <Gauge label="SAFETY" level="CLEAN" at={8} />
          <Gauge label="FLOW" level="WARN" at={44} />
          <Gauge label="LIQUIDITY" level="CLEAN" at={80} />
          <Gauge label="PUMP" level="CLEAN" at={116} />
        </Panel>
      </AbsoluteFill>
    </Base>
  );
};

const Z05: React.FC = () => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [30, 44], [0, 1], clamp);
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 170px' }}>
        <Panel style={{ padding: '40px 48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, letterSpacing: '0.24em', color: C.faint }}>SCORE SETTLED</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12 }}>RAY · Solana</div>
              <div style={{ ...rise(frame, 60), fontSize: 18, color: C.faint, marginTop: 14 }}>FLOW warning — top-5 makers hold 92% of the tape</div>
            </div>
            <div style={{ position: 'relative', width: 190, height: 190 }}>
              <svg viewBox="0 0 100 100" width="190" height="190">
                <circle cx="50" cy="50" r="42" fill="none" stroke={C.line} strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={C.warn} strokeWidth="8" strokeDasharray={`${s * 0.85 * 264} 264`} transform="rotate(-90 50 50)" strokeLinecap="round" />
                <text x="50" y="56" textAnchor="middle" fontSize="26" fontWeight="700" fill={C.text} fontFamily={F.data}>{Math.round(s * 85)}</text>
              </svg>
            </div>
          </div>
        </Panel>
      </AbsoluteFill>
    </Base>
  );
};

const Z06: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [20, 28], [1.7, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${p}) rotate(-7deg)`, border: `8px solid ${C.warn}`, borderRadius: 10, padding: '10px 40px', color: C.warn, fontFamily: F.serif, fontSize: 110, fontWeight: 800, opacity: p > 1.6 ? 0 : 1 }}>
          CAUTION
        </div>
        <div style={{ ...rise(frame, 50), fontSize: 18, color: C.faint, marginTop: 40 }}>coverage: limited — 100-row swap cap disclosed on the record</div>
      </AbsoluteFill>
    </Base>
  );
};

const Z07: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 170px' }}>
        <div style={{ ...rise(frame, 4), fontSize: 15, letterSpacing: '0.24em', color: C.faint, marginBottom: 26 }}>CEL — DIFFERENT ANSWER, SAME INSTRUMENT</div>
        <Panel style={{ display: 'flex', flexDirection: 'column', gap: 30, padding: '36px 42px' }}>
          <Gauge label="SAFETY — pausable, unrenounced" level="WARN" at={8} />
          <Gauge label="FLOW — 13 swaps/day" level="DANGER" at={40} />
          <Gauge label="FLOW — top-5 at 100%" level="WARN" at={72} />
          <Gauge label="LIQUIDITY / PUMP" level="CLEAN" at={104} />
        </Panel>
      </AbsoluteFill>
    </Base>
  );
};

const Z08: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [18, 26], [1.7, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${p}) rotate(5deg)`, border: `8px solid ${C.danger}`, borderRadius: 10, padding: '10px 44px', color: C.danger, fontFamily: F.serif, fontSize: 76, fontWeight: 800, opacity: p > 1.6 ? 0 : 1 }}>
          HIGH RISK FLAGS
        </div>
        <div style={{ ...rise(frame, 46), fontSize: 18, color: C.faint, marginTop: 40 }}>score 45 · dead tape — 13 swaps/day · Jev second opinion: lean, shown not hidden</div>
      </AbsoluteFill>
    </Base>
  );
};

const Z09: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 170px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
          {STATS.map(([n, l], i) => (
            <Panel key={l} style={{ ...rise(frame, 8 + i * 20), textAlign: 'center' }}>
              <div style={{ fontSize: 54, fontWeight: 700, color: C.safe }}>{n}</div>
              <div style={{ fontSize: 14, color: C.faint, marginTop: 10 }}>{l}</div>
            </Panel>
          ))}
        </div>
      </AbsoluteFill>
    </Base>
  );
};

const Z10: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 170px' }}>
        <div style={{ ...rise(frame, 8), fontSize: 46, fontFamily: F.display, fontWeight: 700, lineHeight: 1.25 }}>The machine doesn't guess.</div>
        <div style={{ ...rise(frame, 38), fontSize: 46, fontFamily: F.display, fontWeight: 700, color: C.safe, lineHeight: 1.25 }}>It measures, hashes, and labels.</div>
        <div style={{ ...rise(frame, 80), fontSize: 19, color: C.faint, marginTop: 46, fontFamily: F.data }}>verdex.web.id — don't be the exit liquidity</div>
      </AbsoluteFill>
    </Base>
  );
};

export const TL_ZETA = {
  s01: { from: 0, dur: 208 },
  s02: { from: 208, dur: 252 },
  s03: { from: 460, dur: 385 },
  s04: { from: 845, dur: 378 },
  s05: { from: 1223, dur: 257 },
  s06: { from: 1480, dur: 204 },
  s07: { from: 1684, dur: 272 },
  s08: { from: 1956, dur: 250 },
  s09: { from: 2206, dur: 290 },
  s10: { from: 2496, dur: 250 },
} as const;
export const TL_ZETA_TOTAL = 2746;

const VO = 'vo-zeta';
const scenes = [Z01, Z02, Z03, Z04, Z05, Z06, Z07, Z08, Z09, Z10];
const tls = Object.values(TL_ZETA);

let fontsInit = false;
export const VerdexZeta: React.FC = () => {
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
