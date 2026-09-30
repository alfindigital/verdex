// Variant γ — CLEAN EVIDENCE motion primitives.
// Smooth ease-out rises, no bounce. Apple keynote refinement.
import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** Smooth rise from 20px below. 20-frame span. Clean ease-out. */
export function gRise(frame: number, at: number, span = 20, dist = 20) {
  return {
    opacity: interpolate(frame, [at, at + span], [0, 1], { ...clamp, easing: easeOut }),
    translate: interpolate(frame, [at, at + span], [`0px ${dist}px`, "0px 0px"], {
      ...clamp,
      easing: easeOut,
    }),
  };
}

/** Smooth scale-in: 0.92 → 1.0 over 18 frames. No bounce. */
export function gScale(frame: number, at: number, span = 18) {
  return {
    scale: `${interpolate(frame - at, [0, span], [0.92, 1], {
      ...clamp,
      easing: easeOut,
    })}`,
    opacity: interpolate(frame - at, [0, 12], [0, 1], clamp),
  };
}

/** Slow fade-in only — 22 frames. */
export function gFade(frame: number, at: number, span = 22) {
  return {
    opacity: interpolate(frame, [at, at + span], [0, 1], { ...clamp, easing: easeOut }),
  };
}

/** Count-up smooth. */
export function gCount(frame: number, at: number, to: number, span = 22) {
  return Math.round(
    interpolate(frame, [at, at + span], [0, to], { ...clamp, easing: easeOut })
  );
}

/** Thin line expand left-to-right — accent reveal. */
export function gLineReveal(frame: number, at: number, span = 24) {
  return {
    clipPath: `inset(0 ${interpolate(frame, [at, at + span], [100, 0], {
      ...clamp,
      easing: easeOut,
    })}% 0 0)`,
  };
}
