// Variant β — NEON SIGNAL motion primitives.
// Aggressive slams, overshoot springs, screen shake. TikTok energy.
import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const spring = Easing.bezier(0.34, 1.56, 0.64, 1); // overshoot

/** Slam-in with overshoot scale. Lands at 1.0 after bounce. */
export function bSlam(frame: number, at: number) {
  const p = interpolate(frame - at, [0, 3, 8], [0, 1.25, 1], {
    ...clamp,
    easing: spring,
  });
  return {
    scale: `${p}`,
    opacity: frame >= at ? 1 : 0,
  };
}

/** Decaying horizontal screen shake — 8 frames max amplitude. */
export function bShake(frame: number, at: number, amp = 12) {
  const t = frame - at;
  if (t < 0 || t > 8) return { translate: "0px 0px" };
  const decay = 1 - t / 8;
  const x = Math.sin(t * 2.5) * amp * decay;
  const y = Math.cos(t * 3) * (amp * 0.65) * decay;
  return { translate: `${x.toFixed(1)}px ${y.toFixed(1)}px` };
}

/** Z-axis card flip (Y-rotation). 10-frame duration. */
export function bFlipY(frame: number, at: number) {
  const deg = interpolate(frame - at, [0, 10], [90, 0], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return `perspective(1000px) rotateY(${deg}deg)`;
}

/** Fast fade — 3 frames. */
export function bFlash(frame: number, at: number) {
  return {
    opacity: interpolate(frame, [at, at + 3], [0, 1], clamp),
  };
}

/** Count-up over span frames, neon energy. */
export function bCount(frame: number, at: number, to: number, span = 12) {
  return Math.round(
    interpolate(frame, [at, at + span], [0, to], {
      ...clamp,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    })
  );
}

/** Rapid wipe from left: clip-path sweep. */
export function bWipe(frame: number, at: number, span = 5) {
  const p = interpolate(frame, [at, at + span], [100, 0], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return { clipPath: `inset(0 ${p}% 0 0)` };
}
