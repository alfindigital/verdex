// src/components/VerdictLabel.tsx
// Verdict badge component — style differs per variant
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { clamp } from '../timeline';
import { C, F } from '../brand';

type Verdict = 'ENTRY-WORTHY' | 'CAUTION' | 'AVOID';
type Variant = 'alpha' | 'beta' | 'gamma';

const VERDICT_COLOR: Record<Verdict, string> = {
  'ENTRY-WORTHY': C.safe,
  'CAUTION': C.warn,
  'AVOID': C.danger,
};

type Props = {
  label: Verdict;
  at: number;
  variant?: Variant;
  fontSize?: number;
};

export const VerdictLabel: React.FC<Props> = ({
  label,
  at,
  variant = 'alpha',
  fontSize = 28,
}) => {
  const frame = useCurrentFrame();
  const color = VERDICT_COLOR[label];

  // α: slow fade-up
  // β: slam overshoot + shake
  // γ: smooth scale
  let scale = 1;
  let opacity = 1;
  let translateY = 0;
  let shakeX = 0;

  if (variant === 'alpha') {
    opacity = interpolate(frame, [at, at + 18], [0, 1], clamp);
    translateY = interpolate(frame, [at, at + 18], [10, 0], {
      ...clamp,
      easing: (t: number) => 1 - Math.pow(1 - t, 2),
    });
  } else if (variant === 'beta') {
    scale = interpolate(frame, [at, at + 4, at + 9], [0, 1.2, 1], {
      ...clamp,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    });
    opacity = frame >= at ? 1 : 0;
    const shakeT = frame - at;
    if (shakeT >= 0 && shakeT < 8) {
      shakeX = Math.sin(shakeT * 2.5) * 8 * (1 - shakeT / 8);
    }
  } else {
    scale = interpolate(frame, [at, at + 20], [0.9, 1], {
      ...clamp,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    opacity = interpolate(frame, [at, at + 20], [0, 1], clamp);
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: F.data,
        fontWeight: 700,
        fontSize,
        color,
        letterSpacing: '0.08em',
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px) translateX(${shakeX}px)`,
        ...(variant === 'beta' && {
          textTransform: 'uppercase',
          padding: '6px 16px',
          border: `2px solid ${color}`,
        }),
      }}
    >
      {label === 'ENTRY-WORTHY' && '✓ '}
      {label === 'CAUTION' && '⚠ '}
      {label === 'AVOID' && '✕ '}
      {label}
    </div>
  );
};
