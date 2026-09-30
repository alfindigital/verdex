// VerdexEta.tsx — Variant η: MARKET TAPE
// Angle: the exchange tape never lies — but nobody reads all of it.
// Bloomberg-style flowing ticker bands; dossier rows scroll as quote data;
// verdict stamps interrupt the tape. Voice: Sarah (mature, confident).
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
import { RECEIPTS, STATS } from './data';
import { clamp } from './timeline';

const rise = (frame: number, at: number, span = 14) => ({
  opacity: interpolate(frame, [at, at + span], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [at, at + span], [20, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
});

// Real dossier rows — the tape content (from ray/pepe captures).
const TAPE = [
  'RAY ◆ top5 0.92 DANGER', 'PEPE ◆ 569 traders 24h', 'AAVE ◆ upgradeable WARN',
  'SUSHI ◆ netBuy −0.03', 'GMX ◆ top5 0.81 DANGER', 'RAY ◆ score 85 CAUTION',
  'UNI ◆ INSUFFICIENT', 'PEPE ◆ 147 cex listings', 'SUSHI ◆ score 45 AVOID',
  'AAVE ◆ top5 0.87 DANGER', 'GMX ◆ netBuy −0.28', 'BONK ◆ score 85 CAUTION',
];

const TapeRow: React.FC<{ y: number; items: string[]; speed?: number; color?: string; size?: number; dir?: 1 | -1 }> = ({
  y,
  items,
  speed = 2,
  color = C.dim,
  size = 24,
  dir = 1,
}) => {
  const frame = useCurrentFrame();
  const content = items.join('   ·   ') + '   ·   ';
  const x = dir * (-(frame * speed) % 1800);
  return (
    <div style={{ position: 'absolute', top: y, left: 0, right: 0, overflow: 'hidden', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: '10px 0', background: '#0e100d' }}>
      <div style={{ whiteSpace: 'nowrap', fontFamily: F.data, fontSize: size, color, transform: `translateX(${x}px)` }}>
        {content + content + content}
      </div>
    </div>
  );
};

const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: '#0a0c0a', fontFamily: F.data, color: C.text, overflow: 'hidden' }}>
    {children}
  </AbsoluteFill>
);

const Field: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px' }}>{children}</AbsoluteFill>
);

// ── Scenes ─────────────────────────────────────────────────────────────────

const T01: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <TapeRow y={0} items={TAPE.slice(0, 6)} speed={3} />
      <TapeRow y={980} items={TAPE.slice(6)} speed={2.4} dir={-1} />
      <Field>
        <div style={{ ...rise(frame, 8), fontSize: 16, letterSpacing: '0.3em', color: C.safe }}>THE TAPE IS PUBLIC</div>
        <div style={{ ...rise(frame, 24), fontSize: 66, fontFamily: F.display, fontWeight: 700, lineHeight: 1.2, marginTop: 20 }}>
          Nobody reads all of it.
        </div>
        <div style={{ ...rise(frame, 58), fontSize: 66, fontFamily: F.display, fontWeight: 700, color: C.safe, lineHeight: 1.2 }}>
          Verdex does.
        </div>
      </Field>
    </Base>
  );
};

const T02: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    ['MCAP', '$1.81B'], ['VOL 24H', '$1.54M'], ['LIQUIDITY', '$34.77M'], ['Δ 24H', '+2.70%'],
    ['TRADERS 24H', '569'], ['TOKEN AGE', '1,264d'], ['HOLDERS', 'provider: 0'], ['CEX LISTINGS', '147'],
  ];
  return (
    <Base>
      <TapeRow y={0} items={TAPE} speed={2.6} />
      <Field>
        <div style={{ ...rise(frame, 6), fontSize: 15, letterSpacing: '0.26em', color: C.faint, marginBottom: 26 }}>DOSSIER TAPE — PEPE · ETHEREUM</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ ...rise(frame, 8 + i * 10), border: `1px solid ${C.lineBright}`, borderRadius: 6, padding: '18px 20px', background: `${C.panel}ee` }}>
              <div style={{ fontSize: 13, letterSpacing: '0.18em', color: C.faint }}>{k}</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8, color: C.text }}>{v}</div>
            </div>
          ))}
        </div>
      </Field>
      <TapeRow y={980} items={RECEIPTS.map((r) => `${r[0]} ${r[2]}`)} speed={2.2} dir={-1} color={C.safe} />
    </Base>
  );
};

const T03: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    ['5m', '$15.1K', '10 tx', '+0.10%'],
    ['1h', '$36.0K', '48 tx', '+0.39%'],
    ['4h', '$167.0K', '196 tx', '+0.08%'],
    ['24h', '$1.55M', '1,438 tx', '+3.32%'],
  ];
  return (
    <Base>
      <Field>
        <div style={{ ...rise(frame, 6), fontSize: 15, letterSpacing: '0.26em', color: C.faint, marginBottom: 24 }}>PER-WINDOW TAPE — REAL NUMBERS, EVERY WINDOW</div>
        <div style={{ border: `1px solid ${C.lineBright}`, borderRadius: 6, background: `${C.panel}ee` }}>
          {rows.map(([w, v, tx, d], i) => (
            <div key={w} style={{ ...rise(frame, 10 + i * 14), display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 2fr', padding: '20px 28px', borderBottom: i < 3 ? `1px solid ${C.line}` : 'none', fontSize: 21 }}>
              <span style={{ color: C.faint }}>{w}</span>
              <span style={{ fontWeight: 700 }}>{v}</span>
              <span>{tx}</span>
              <span style={{ color: C.safe, fontWeight: 700, textAlign: 'right' }}>{d}</span>
            </div>
          ))}
        </div>
      </Field>
      <TapeRow y={980} items={TAPE.slice(3)} speed={2.4} dir={-1} />
    </Base>
  );
};

const T04: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [26, 34], [1.8, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <Base>
      <TapeRow y={40} items={TAPE.slice(0, 8)} speed={3.4} />
      <TapeRow y={140} items={TAPE.slice(4, 12)} speed={2.8} dir={-1} />
      <TapeRow y={840} items={TAPE.slice(2, 10)} speed={3} />
      <TapeRow y={940} items={TAPE.slice(6, 12)} speed={2.4} dir={-1} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${p}) rotate(-6deg)`, border: `8px solid ${C.warn}`, borderRadius: 10, padding: '12px 44px', color: C.warn, fontFamily: F.serif, fontSize: 108, fontWeight: 800, background: `${C.ink}ee`, opacity: p > 1.7 ? 0 : 1 }}>
          CAUTION
        </div>
        <div style={{ ...rise(frame, 60), fontSize: 19, color: C.text, marginTop: 40, background: `${C.ink}dd`, padding: '6px 14px' }}>RAY — score 85, but one row still failed</div>
      </AbsoluteFill>
    </Base>
  );
};

const T05: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Field>
        <div style={{ ...rise(frame, 6), fontSize: 15, letterSpacing: '0.26em', color: C.faint, marginBottom: 22 }}>THE FAILING ROW — TOP-5 MAKERS / TAPE</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 26, height: 320 }}>
          {[23, 92].map((v, i) => {
            const h = interpolate(frame, [20 + i * 14, 50 + i * 14], [0, v * 3.1], { ...clamp, easing: Easing.out(Easing.cubic) });
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: i ? C.danger : C.safe, marginBottom: 10 }}>{v}{i ? '%' : ''}</div>
                <div style={{ width: 150, height: h, background: i ? C.danger : C.safe, borderRadius: '6px 6px 0 0' }} />
                <div style={{ fontSize: 15, color: C.faint, marginTop: 10 }}>{i ? 'top-5 share' : 'makers'}</div>
              </div>
            );
          })}
          <div style={{ marginLeft: 60, ...rise(frame, 70) }}>
            <div style={{ fontSize: 40, fontFamily: F.display, fontWeight: 700, lineHeight: 1.3 }}>23 makers.</div>
            <div style={{ fontSize: 40, fontFamily: F.display, fontWeight: 700, color: C.danger, lineHeight: 1.3 }}>92% of the tape.</div>
          </div>
        </div>
      </Field>
      <TapeRow y={980} items={TAPE.slice(6)} speed={2.4} dir={-1} />
    </Base>
  );
};

const T06: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [22, 30], [1.8, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <Base>
      <TapeRow y={40} items={TAPE.slice(0, 8)} speed={3.2} />
      <TapeRow y={940} items={TAPE.slice(4, 12)} speed={2.6} dir={-1} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${p}) rotate(5deg)`, border: `8px solid ${C.danger}`, borderRadius: 10, padding: '12px 44px', color: C.danger, fontFamily: F.serif, fontSize: 108, fontWeight: 800, background: `${C.ink}ee`, opacity: p > 1.7 ? 0 : 1 }}>
          AVOID
        </div>
        <div style={{ ...rise(frame, 56), fontSize: 19, color: C.text, marginTop: 40, background: `${C.ink}dd`, padding: '6px 14px' }}>SUSHI — score 45 · Jev contested · disclosed</div>
      </AbsoluteFill>
    </Base>
  );
};

const T07: React.FC = () => {
  const frame = useCurrentFrame();
  const rules = [
    'missing → shown as unknown', 'truncated → coverage downgraded',
    'replayed → labeled replay', 'second opinion → labeled, never the rules',
  ];
  return (
    <Base>
      <Field>
        <div style={{ ...rise(frame, 6), fontSize: 15, letterSpacing: '0.26em', color: C.faint, marginBottom: 26 }}>TAPE RULES — PRINTED ON EVERY RECORD</div>
        {rules.map((r, i) => (
          <div key={r} style={{ ...rise(frame, 10 + i * 24), fontSize: 30, fontWeight: 700, fontFamily: F.display, marginBottom: 22, padding: '14px 22px', border: `1px solid ${C.line}`, borderRadius: 6, background: `${C.panel}cc` }}>
            {r}
          </div>
        ))}
      </Field>
      <TapeRow y={980} items={rules} speed={2.4} color={C.safe} />
    </Base>
  );
};

const T08: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
          {STATS.map(([n, l], i) => (
            <div key={l} style={{ ...rise(frame, 8 + i * 18), textAlign: 'center', border: `1px solid ${C.lineBright}`, borderRadius: 6, padding: '26px 14px', background: `${C.panel}ee` }}>
              <div style={{ fontSize: 56, fontWeight: 700, color: C.safe }}>{n}</div>
              <div style={{ fontSize: 14, color: C.faint, marginTop: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </Field>
    </Base>
  );
};

const T09: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <TapeRow y={0} items={TAPE} speed={3} />
      <TapeRow y={80} items={RECEIPTS.map((r) => `${r[0]} ${r[2]}`)} speed={2.6} dir={-1} color={C.safe} />
      <Field>
        <div style={{ ...rise(frame, 8), fontSize: 52, fontFamily: F.display, fontWeight: 700, lineHeight: 1.25 }}>Read the tape before</div>
        <div style={{ ...rise(frame, 34), fontSize: 52, fontFamily: F.display, fontWeight: 700, color: C.safe, lineHeight: 1.25 }}>the tape reads you.</div>
        <div style={{ ...rise(frame, 80), fontSize: 19, color: C.faint, marginTop: 44 }}>verdex.web.id — don't be the exit liquidity · built on the CoinMarketCap API</div>
      </Field>
      <TapeRow y={980} items={TAPE.slice(6)} speed={2.4} dir={-1} />
    </Base>
  );
};

export const TL_ETA = {
  s01: { from: 0, dur: 191 },
  s02: { from: 191, dur: 316 },
  s03: { from: 507, dur: 367 },
  s04: { from: 874, dur: 219 },
  s05: { from: 1093, dur: 252 },
  s06: { from: 1345, dur: 254 },
  s07: { from: 1599, dur: 329 },
  s08: { from: 1928, dur: 233 },
  s09: { from: 2161, dur: 184 },
} as const;
export const TL_ETA_TOTAL = 2345;

const VO = 'vo-eta';
const scenes = [T01, T02, T03, T04, T05, T06, T07, T08, T09];
const tls = Object.values(TL_ETA);

let fontsInit = false;
export const VerdexEta: React.FC = () => {
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
