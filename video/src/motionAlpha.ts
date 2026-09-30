// Variant α — NOIR FORENSIC motion primitives.
// Slow, deliberate reveals. No bounce/overshoot. Forensic gravity.
import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** Slow fade + 10px travel upward. 14-frame span for noir weight. */
export function aSnap(frame: number, at: number, span = 14) {
  return {
    opacity: interpolate(frame, [at, at + span], [0, 1], { ...clamp, easing: easeOut }),
    translate: interpolate(frame, [at, at + span], ["0px 10px", "0px 0px"], {
      ...clamp,
      easing: easeOut,
    }),
  };
}

/** Typewriter effect at 25 chars/sec — deliberate noir pacing. */
export function aType(frame: number, at: number, text: string) {
  const chars = Math.floor(Math.max(0, frame - at) * (25 / 30));
  return text.slice(0, Math.min(chars, text.length));
}

/** Cursor blink: 1 per second @ 30fps (on 15f, off 15f). */
export function aBlink(frame: number) {
  return Math.floor(frame / 15) % 2 === 0 ? "|" : " ";
}

/** Bar fill from 0 to target width (pct) over span frames. */
export function aBarFill(frame: number, at: number, span = 18) {
  return interpolate(frame, [at, at + span], [0, 100], { ...clamp, easing: easeOut });
}

/** Score count-up over span frames. No bounce. */
export function aCount(frame: number, at: number, to: number, span = 20) {
  return Math.round(
    interpolate(frame, [at, at + span], [0, to], { ...clamp, easing: easeOut })
  );
}
