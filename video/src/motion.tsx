// Motion primitives for the v2 variants. Every helper exists to serve a beat:
// snap = evidence arriving fast, slam = verdict weight, wipe = scene change,
// shake = the stamp landing. Nothing here is decorative drift (R-19).
import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile, Easing, interpolate } from "remotion";

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeSnap = Easing.bezier(0.2, 1.4, 0.3, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fast fade + short travel. Default entrance for content: 6 frames, 14px.
export function snap(frame: number, at: number, span = 6, dist = 14) {
  return {
    opacity: interpolate(frame, [at, at + span], [0, 1], { ...clamp, easing: easeOut }),
    translate: interpolate(frame, [at, at + span], [`0px ${dist}px`, "0px 0px"], {
      ...clamp,
      easing: easeOut,
    }),
  };
}

// Overshoot scale-in for stamps and headline words: lands hard, settles in ~8f.
export function slam(frame: number, at: number, fromScale = 1.4) {
  const p = interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: easeSnap });
  return { opacity: Math.min(p * 2, 1), scale: `${fromScale + (1 - fromScale) * p}` };
}

// Clip-path reveal, left to right. For color bands and headline wipes.
export function wipeX(frame: number, at: number, span = 8) {
  const p = interpolate(frame, [at, at + span], [100, 0], { ...clamp, easing: easeOut });
  return { clipPath: `inset(0 ${p}% 0 0)` };
}

// Decaying horizontal jitter for 12 frames after `at`: the stamp hitting the page.
export function shakeX(frame: number, at: number, amp = 14) {
  if (frame < at || frame > at + 12) return 0;
  const t = frame - at;
  return Math.round(Math.sin(t * 2.1) * amp * (1 - t / 12));
}

// Numeric count-up over `span` frames.
export function count(frame: number, at: number, to: number, span = 22) {
  return Math.round(interpolate(frame, [at, at + span], [0, to], { ...clamp, easing: easeOut }));
}

// Voiceover track, identical for all variants. s4c is 0.6s over its window,
// so it runs at 1.06x (inaudible shift, fits the scene).
export const VoTrack: React.FC = () => (
  <>
    <Sequence durationInFrames={240}><Audio src={staticFile("vo/s1.mp3")} /></Sequence>
    <Sequence from={240} durationInFrames={210}><Audio src={staticFile("vo/s2.mp3")} /></Sequence>
    <Sequence from={450} durationInFrames={300}><Audio src={staticFile("vo/s3.mp3")} /></Sequence>
    <Sequence from={750} durationInFrames={290}><Audio src={staticFile("vo/s4a.mp3")} /></Sequence>
    <Sequence from={1040} durationInFrames={290}><Audio src={staticFile("vo/s4b.mp3")} /></Sequence>
    <Sequence from={1330} durationInFrames={290}><Audio src={staticFile("vo/s4c.mp3")} playbackRate={1.06} /></Sequence>
    <Sequence from={1620} durationInFrames={330}><Audio src={staticFile("vo/s5.mp3")} /></Sequence>
    <Sequence from={1950} durationInFrames={330}><Audio src={staticFile("vo/s6.mp3")} /></Sequence>
    <Sequence from={2280} durationInFrames={420}><Audio src={staticFile("vo/s7.mp3")} /></Sequence>
  </>
);
