// VerdexDelta.tsx — Variant δ: RECEIPT TICKER
// Angle: the receipts ARE the product. Teleprinter tape aesthetic —
// a hash strip never stops moving; endpoints print in like wire copy;
// verdict stamps punch the tape. Voice: Charlie (deep, energetic).
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

const rise = (frame: number, at: number, span = 16) => ({
  opacity: interpolate(frame, [at, at + span], [0, 1], clamp),
  translate: `0px ${interpolate(frame, [at, at + span], [26, 0], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}px`,
});

// Paper-tape base: light receipt stock on dark desk.
const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.ink, fontFamily: F.data, color: C.paperInk, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${C.panel} 0%, ${C.ink} 100%)` }} />
    {children}
  </AbsoluteFill>
);

// The receipt strip: a centered paper column with perforation edges.
const Tape: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: 0,
      bottom: 0,
      width: 780,
      transform: 'translateX(-50%)',
      background: C.paper,
      boxShadow: `0 0 60px rgba(0,0,0,0.6)`,
    }}
  >
    {/* perforation */}
    <div
      style={{
        position: 'absolute',
        left: 10,
        top: 0,
        bottom: 0,
        width: 10,
        backgroundImage: `radial-gradient(circle 4px at 5px 12px, ${C.ink} 98%, transparent 100%)`,
        backgroundSize: '10px 26px',
        backgroundRepeat: 'repeat-y',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        width: 10,
        backgroundImage: `radial-gradient(circle 4px at 5px 12px, ${C.ink} 98%, transparent 100%)`,
        backgroundSize: '10px 26px',
        backgroundRepeat: 'repeat-y',
      }}
    />
    <div style={{ position: 'absolute', inset: 0, padding: '60px 64px' }}>{children}</div>
  </div>
);

const Mono: React.FC<{ size?: number; color?: string; weight?: number; children: React.ReactNode }> = ({
  size = 20,
  color = C.paperInk,
  weight = 400,
  children,
}) => <span style={{ fontFamily: F.data, fontSize: size, fontWeight: weight as never, color }}>{children}</span>;

const HR = () => (
  <div style={{ borderTop: `2px dashed ${C.paperInk}55`, margin: '26px 0' }} />
);

// Scrolling hash ticker at the very bottom — never stops.
const HashTicker: React.FC<{ text: string; speed?: number }> = ({ text, speed = 2.2 }) => {
  const frame = useCurrentFrame();
  const chunk = `${text}   ${text}   ${text}   ${text}`;
  const x = -(frame * speed) % 2400;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: C.ink,
        borderTop: `1px solid ${C.line}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ whiteSpace: 'nowrap', fontFamily: F.data, fontSize: 22, color: C.safe, transform: `translateX(${x}px)` }}>
        {chunk + '   ' + chunk}
      </div>
    </div>
  );
};

// Type-on line.
const Typed: React.FC<{ text: string; at: number; cps?: number; color?: string; size?: number }> = ({
  text,
  at,
  cps = 2.2,
  color = C.paperInk,
  size = 22,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - at) * cps)));
  return (
    <div style={{ fontFamily: F.data, fontSize: size, color, whiteSpace: 'pre', minHeight: size * 1.4 }}>
      {text.slice(0, n)}
      {n < text.length && <span style={{ color: C.safe }}>▌</span>}
    </div>
  );
};

const Stamp: React.FC<{ text: string; at: number; color: string; size?: number }> = ({ text, at, color, size = 92 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 7], [1.6, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const o = interpolate(frame, [at, at + 5], [0, 1], clamp);
  const rot = interpolate(frame, [at, at + 10], [-10, -6], clamp);
  return (
    <div
      style={{
        display: 'inline-block',
        border: `6px solid ${color}`,
        borderRadius: 10,
        padding: '8px 30px',
        color,
        fontFamily: F.serif,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '0.04em',
        transform: `scale(${p}) rotate(${rot}deg)`,
        opacity: o,
      }}
    >
      {text}
    </div>
  );
};

// ── Scenes ─────────────────────────────────────────────────────────────────

const D01: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Tape>
        <Typed at={10} text="VERDEX EVIDENCE SERVICE" size={30} />
        <Typed at={40} text="*** RECORDED RECEIPTS ONLY ***" size={22} color={C.paperInk + 'aa'} />
        <HR />
        <Typed at={80} text="EVERY CLAIM NEEDS A BODY." size={40} />
        <Typed at={150} text="EVERY BODY GETS A HASH." size={40} />
        <div style={{ marginTop: 40, ...rise(frame, 230) }}>
          <Stamp text="SHA-256" at={230} color={C.paperInk} size={70} />
        </div>
      </Tape>
      <HashTicker text="f7b472e6df85aafc8a05ca4d42186ccf" />
    </Base>
  );
};

const D02: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = ['9 CALLS', '9 BODIES', '9 HASHES', '0 GUESSES'];
  return (
    <Base>
      <Tape>
        {lines.map((l, i) => (
          <div key={l} style={{ ...rise(frame, 6 + i * 22), marginBottom: 34 }}>
            <Mono size={56} weight={700}>
              {l}
            </Mono>
          </div>
        ))}
        <HR />
        <Typed at={110} text="one token · one scan · nine receipts" size={20} color={C.paperInk + 'aa'} />
      </Tape>
      <HashTicker text="8bf023dc978aCELETHEREUMFLOWDANGER" />
    </Base>
  );
};

const D03: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Tape>
        <Mono size={17} color={C.paperInk + '99'}>SOURCE WIRE — RAY · SOLANA</Mono>
        <HR />
        {RECEIPTS.slice(0, 6).map((r, i) => (
          <div key={r[0]} style={{ ...rise(frame, 8 + i * 12), display: 'flex', justifyContent: 'space-between', marginBottom: 17 }}>
            <Mono size={19}>{r[0]}</Mono>
            <Mono size={19} color={C.safe} weight={700}>
              {r[2]}
            </Mono>
          </div>
        ))}
      </Tape>
      <HashTicker text="614768897687d4f507b7301382b5b88b546347ad6b2903ec" />
    </Base>
  );
};

const D04: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Tape>
        <Mono size={17} color={C.paperInk + '99'}>SOURCE WIRE — CONT.</Mono>
        <HR />
        {RECEIPTS.slice(6).map((r, i) => (
          <div key={r[0]} style={{ ...rise(frame, 8 + i * 12), display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
            <Mono size={20}>{r[0]}</Mono>
            <Mono size={20} color={C.safe} weight={700}>
              {r[2]}
            </Mono>
          </div>
        ))}
        <HR />
        <Typed at={90} text="VERIFY EACH HASH YOURSELF." size={26} />
      </Tape>
      <HashTicker text="ec4887cda7b5e8b46246986a" />
    </Base>
  );
};

const D05: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CASES[0];
  return (
    <Base>
      <Tape>
        <Mono size={17} color={C.paperInk + '99'}>EXHIBIT — {c.token} / {c.chain}</Mono>
        <HR />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', ...rise(frame, 10) }}>
          <Mono size={44} weight={700}>{c.token}</Mono>
          <Mono size={26}>score {c.score}/100</Mono>
        </div>
        {c.rows.filter(([t]) => t).map(([t, lv], i) => (
          <div key={t + i} style={{ ...rise(frame, 40 + i * 18), display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <Mono size={19}>{t}</Mono>
            <Mono size={19} weight={700} color={lv === 'DANGER' ? '#b3261e' : lv === 'WARN' ? '#9a6a00' : lv === 'INSUFFICIENT' ? '#8a8f83' : '#1d7a4f'}>
              {lv}
            </Mono>
          </div>
        ))}
        <div style={{ marginTop: 36 }}>
          <Stamp text={c.label} at={120} color="#9a6a00" size={64} />
        </div>
      </Tape>
      <HashTicker text="RAYFLOWtop5MakerShare0.92WARN" />
    </Base>
  );
};

const D06: React.FC = () => {
  const frame = useCurrentFrame();
  const c = CASES[1];
  return (
    <Base>
      <Tape>
        <Mono size={17} color={C.paperInk + '99'}>EXHIBIT — {c.token} / {c.chain}</Mono>
        <HR />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', ...rise(frame, 10) }}>
          <Mono size={44} weight={700}>{c.token}</Mono>
          <Mono size={26}>score {c.score}/100</Mono>
        </div>
        {c.rows.map(([t, lv], i) => (
          <div key={t + i} style={{ ...rise(frame, 40 + i * 16), display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
            <Mono size={18}>{t}</Mono>
            <Mono size={18} weight={700} color={lv === 'DANGER' ? '#b3261e' : lv === 'WARN' ? '#9a6a00' : lv === 'INSUFFICIENT' ? '#8a8f83' : '#1d7a4f'}>
              {lv}
            </Mono>
          </div>
        ))}
        <div style={{ marginTop: 34 }}>
          <Stamp text={c.label} at={115} color="#b3261e" size={64} />
        </div>
      </Tape>
      <HashTicker text="CELFLOWswapsPerDay13.1DANGER" />
    </Base>
  );
};

const D07: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Tape>
        <Mono size={17} color={C.paperInk + '99'}>HONESTY LINE — READ CAREFULLY</Mono>
        <HR />
        {[
          'MISSING DATA = UNKNOWN, NOT ZERO',
          'TRUNCATED WINDOWS = DISCLOSED',
          'REPLAY = LABELED REPLAY',
          'AI OPINION = LABELED, NEVER THE RULES',
        ].map((t, i) => (
          <div key={t} style={{ ...rise(frame, 10 + i * 26), marginBottom: 26 }}>
            <Mono size={25} weight={700}>{t}</Mono>
          </div>
        ))}
      </Tape>
      <HashTicker text="unknown≠zero truncated≠full replay≠live" />
    </Base>
  );
};

const D08: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Tape>
        <Mono size={17} color={C.paperInk + '99'}>THE LEDGER SO FAR</Mono>
        <HR />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 14 }}>
          {STATS.map(([n, l], i) => (
            <div key={l} style={{ ...rise(frame, 10 + i * 20) }}>
              <Mono size={58} weight={700} color={C.safe}>{n}</Mono>
              <div style={{ marginTop: 8 }}>
                <Mono size={16} color={C.paperInk + 'aa'}>{l}</Mono>
              </div>
            </div>
          ))}
        </div>
      </Tape>
      <HashTicker text="301verdicts2709receipts9chains29744swaps" />
    </Base>
  );
};

const D09: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Base>
      <Tape>
        <div style={{ marginTop: 60, ...rise(frame, 10) }}>
          <Mono size={30}>IF YOU CAN'T HASH IT,</Mono>
        </div>
        <div style={{ marginTop: 12, ...rise(frame, 40) }}>
          <Mono size={30}>IT DIDN'T HAPPEN.</Mono>
        </div>
        <div style={{ marginTop: 60 }}>
          <Stamp text="VERDEX" at={90} color={C.paperInk} size={86} />
        </div>
        <div style={{ marginTop: 50, ...rise(frame, 140) }}>
          <Mono size={19} color={C.paperInk + 'aa'}>verdex.web.id — don't be the exit liquidity</Mono>
        </div>
      </Tape>
      <HashTicker text="built with the coinmarketcap api — hackathon 2026" speed={3} />
    </Base>
  );
};

export const TL_DELTA = {
  s01: { from: 0, dur: 215 },
  s02: { from: 215, dur: 260 },
  s03: { from: 475, dur: 244 },
  s04: { from: 719, dur: 241 },
  s05: { from: 960, dur: 288 },
  s06: { from: 1248, dur: 423 },
  s07: { from: 1671, dur: 363 },
  s08: { from: 2034, dur: 332 },
  s09: { from: 2366, dur: 193 },
} as const;
export const TL_DELTA_TOTAL = 2559;

const VO = 'vo-delta';
const VOTimes: [number, number][] = [
  [TL_DELTA.s01.from, TL_DELTA.s01.dur],
  [TL_DELTA.s02.from, TL_DELTA.s02.dur],
  [TL_DELTA.s03.from, TL_DELTA.s03.dur],
  [TL_DELTA.s04.from, TL_DELTA.s04.dur],
  [TL_DELTA.s05.from, TL_DELTA.s05.dur],
  [TL_DELTA.s06.from, TL_DELTA.s06.dur],
  [TL_DELTA.s07.from, TL_DELTA.s07.dur],
  [TL_DELTA.s08.from, TL_DELTA.s08.dur],
  [TL_DELTA.s09.from, TL_DELTA.s09.dur],
];

export const VerdexDelta: React.FC = () => {
  useFontsOnce();
  return (
    <>
      <Sequence {...TL_DELTA.s01}><D01 /></Sequence>
      <Sequence {...TL_DELTA.s02}><D02 /></Sequence>
      <Sequence {...TL_DELTA.s03}><D03 /></Sequence>
      <Sequence {...TL_DELTA.s04}><D04 /></Sequence>
      <Sequence {...TL_DELTA.s05}><D05 /></Sequence>
      <Sequence {...TL_DELTA.s06}><D06 /></Sequence>
      <Sequence {...TL_DELTA.s07}><D07 /></Sequence>
      <Sequence {...TL_DELTA.s08}><D08 /></Sequence>
      <Sequence {...TL_DELTA.s09}><D09 /></Sequence>
      {VOTimes.map(([from, dur], i) => (
        <Sequence key={i} from={from} durationInFrames={dur}>
          <Audio src={staticFile(`${VO}/s${String(i + 1).padStart(2, '0')}.mp3`)} />
        </Sequence>
      ))}
    </>
  );
};

let fontsInit = false;
function useFontsOnce() {
  React.useEffect(() => {
    if (!fontsInit) {
      fontsInit = true;
      ensureFonts();
    }
  }, []);
}
