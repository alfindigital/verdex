// src/components/DimBar.tsx
// Dimension level bar row — shows SAFETY/FLOW/LIQUIDITY/PUMP + CLEAN/WARN/DANGER level
import { interpolate, useCurrentFrame } from 'remotion';
import { clamp } from '../timeline';
import { C } from '../brand';

type Level = 'CLEAN' | 'WARN' | 'DANGER' | 'INSUFFICIENT';

const LEVEL_COLOR: Record<Level, string> = {
  CLEAN: C.safe,
  WARN: C.warn,
  DANGER: C.danger,
  INSUFFICIENT: C.cold,
};

type Props = {
  name: string;
  level: Level;
  at: number;
  delay?: number; // extra frames delay for stagger
};

export const DimBar: React.FC<Props> = ({ name, level, at, delay = 0 }) => {
  const frame = useCurrentFrame();
  const effectiveAt = at + delay;

  const opacity = interpolate(frame, [effectiveAt, effectiveAt + 12], [0, 1], clamp);
  const translateX = interpolate(frame, [effectiveAt, effectiveAt + 12], [-20, 0], {
    ...clamp,
    easing: (t: number) => 1 - Math.pow(1 - t, 2),
  });
  const barWidth = interpolate(frame, [effectiveAt + 6, effectiveAt + 24], [0, 100], {
    ...clamp,
    easing: (t: number) => 1 - Math.pow(1 - t, 2),
  });

  const color = LEVEL_COLOR[level];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        opacity,
        transform: `translateX(${translateX}px)`,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 18,
        marginBottom: 12,
      }}
    >
      {/* Dim name */}
      <span
        style={{
          width: 140,
          color: '#9ca3af',
          fontSize: 16,
          letterSpacing: '0.08em',
        }}
      >
        {name}
      </span>
      {/* Bar track */}
      <div
        style={{
          width: 200,
          height: 6,
          background: '#1f2937',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: '100%',
            background: color,
            borderRadius: 3,
          }}
        />
      </div>
      {/* Level label */}
      <span style={{ color, fontWeight: 600, fontSize: 14, letterSpacing: '0.1em' }}>
        {level}
      </span>
    </div>
  );
};
