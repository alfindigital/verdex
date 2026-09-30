// src/components/ScoreRing.tsx
// Animated circular score gauge using SVG — pure Remotion useCurrentFrame()
import { interpolate, useCurrentFrame } from 'remotion';
import { clamp } from '../timeline';

type Props = {
  at: number;
  score: number; // 0–100
  color: string;
  size?: number;
  strokeWidth?: number;
};

export const ScoreRing: React.FC<Props> = ({
  at,
  score,
  color,
  size = 160,
  strokeWidth = 12,
}) => {
  const frame = useCurrentFrame();
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;

  const progress = interpolate(frame, [at, at + 60], [0, score / 100], {
    ...clamp,
    easing: (t: number) => {
      // ease-out cubic
      return 1 - Math.pow(1 - t, 3);
    },
  });

  const dashOffset = circ * (1 - progress);

  const labelOpacity = interpolate(frame, [at + 30, at + 60], [0, 1], clamp);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1f2937"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Score label center */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: 700,
          fontSize: size * 0.24,
          color,
          opacity: labelOpacity,
        }}
      >
        {Math.round(progress * 100)}
      </div>
    </div>
  );
};
