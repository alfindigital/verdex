// src/components/ReceiptRow.tsx
// Single evidence receipt row: endpoint | sha256 | checkmark
import { interpolate, useCurrentFrame } from 'remotion';
import { clamp } from '../timeline';
import { C, F } from '../brand';

type Props = {
  endpoint: string;
  hash: string;
  at: number;
  delay?: number;
};

export const ReceiptRow: React.FC<Props> = ({ endpoint, hash, at, delay = 0 }) => {
  const frame = useCurrentFrame();
  const effectiveAt = at + delay;

  const opacity = interpolate(frame, [effectiveAt, effectiveAt + 8], [0, 1], clamp);
  const translateX = interpolate(frame, [effectiveAt, effectiveAt + 10], [-16, 0], {
    ...clamp,
    easing: (t: number) => 1 - Math.pow(1 - t, 2),
  });
  const checkOpacity = interpolate(
    frame,
    [effectiveAt + 8, effectiveAt + 14],
    [0, 1],
    clamp,
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 24,
        alignItems: 'center',
        opacity,
        transform: `translateX(${translateX}px)`,
        padding: '8px 0',
        borderBottom: `1px solid ${C.line}`,
        fontFamily: F.data,
        fontSize: 15,
      }}
    >
      <span style={{ color: C.dim, letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {endpoint}
      </span>
      <span style={{ color: C.faint, fontSize: 13, letterSpacing: '0.02em' }}>
        sha256:{hash}…
      </span>
      <span style={{ color: C.safe, opacity: checkOpacity, fontSize: 18 }}>✓</span>
    </div>
  );
};
