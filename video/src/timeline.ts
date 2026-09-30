// timeline.ts — Frame-accurate scene timing for all 3 Verdex variants
// Total: 2700 frames @ 30fps = 90 seconds per variant

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export { clamp };

// ── Variant α: NOIR FORENSIC ─────────────────────────────────────────────────
// Slow, methodical. Avg scene ~6s. 19 scenes.
export const TL_ALPHA = {
  s01: { from: 0,    dur: 90  }, // 0:00-0:03  "A token can pass every audit"
  s02: { from: 90,   dur: 90  }, // 0:03-0:06  "And still rug you"
  s03: { from: 180,  dur: 90  }, // 0:06-0:09  "What if someone checked"
  s04: { from: 270,  dur: 90  }, // 0:09-0:12  "Verdex. Pre-trade forensic evidence"
  s05: { from: 360,  dur: 120 }, // 0:12-0:16  DEX token → 4 dimensions
  s06: { from: 480,  dur: 90  }, // 0:16-0:19  "Four forensic dimensions"
  s07: { from: 570,  dur: 120 }, // 0:19-0:23  Verdict labels + levels
  s08: { from: 690,  dur: 90  }, // 0:23-0:26  "GMX on Arbitrum"
  s09: { from: 780,  dur: 180 }, // 0:26-0:32  GMX data table
  s10: { from: 960,  dur: 90  }, // 0:32-0:35  "SUSHI on Ethereum"
  s11: { from: 1050, dur: 150 }, // 0:35-0:40  SUSHI danger data
  s12: { from: 1200, dur: 150 }, // 0:40-0:45  Jev contested
  s13: { from: 1350, dur: 150 }, // 0:45-0:50  Receipt table
  s14: { from: 1500, dur: 120 }, // 0:50-0:54  Stats 34/7/306
  s15: { from: 1620, dur: 120 }, // 0:54-0:58  No black box
  s16: { from: 1740, dur: 150 }, // 0:58-1:03  9 CMC endpoints
  s17: { from: 1890, dur: 150 }, // 1:03-1:08  "Structure says vs Verdex says"
  s18: { from: 2040, dur: 180 }, // 1:08-1:14  "Verdex. Don't be the exit liquidity"
  s19: { from: 2220, dur: 480 }, // 1:14-1:30  Hackathon badge + hold
} as const;

// ── Variant β: NEON SIGNAL ───────────────────────────────────────────────────
// Fast, brainrot. Avg scene ~3s. 19 scenes.
export const TL_BETA = {
  s01: { from: 0,    dur: 60  }, // 0:00-0:02  "-$47K GONE" SLAM
  s02: { from: 60,   dur: 60  }, // 0:02-0:04  "One swap. One rug. Zero warning"
  s03: { from: 120,  dur: 60  }, // 0:04-0:06  "CHECK before you swap?"
  s04: { from: 180,  dur: 60  }, // 0:06-0:08  "THIS IS VERDEX"
  s05: { from: 240,  dur: 75  }, // 0:08-0:10  Paste token → verdict
  s06: { from: 315,  dur: 75  }, // 0:10-0:12  4 icons rapid
  s07: { from: 390,  dur: 90  }, // 0:13-0:16  3 verdict badges flip
  s08: { from: 480,  dur: 90  }, // 0:16-0:19  GMX score ring 0→100
  s09: { from: 570,  dur: 120 }, // 0:19-0:23  GMX all clean
  s10: { from: 690,  dur: 75  }, // 0:23-0:25  SUSHI hard cut
  s11: { from: 765,  dur: 120 }, // 0:25-0:29  SUSHI 0.73 danger
  s12: { from: 885,  dur: 120 }, // 0:29-0:33  Contested badge pulse
  s13: { from: 1005, dur: 90  }, // 0:33-0:36  "9 API calls. 9 hashes"
  s14: { from: 1095, dur: 120 }, // 0:36-0:40  Stat Z-flip cards
  s15: { from: 1215, dur: 120 }, // 0:40-0:44  Black box vs rules
  s16: { from: 1335, dur: 150 }, // 0:44-0:49  9 endpoints rain
  s17: { from: 1485, dur: 120 }, // 0:49-0:53  "$47K → wallet"
  s18: { from: 1605, dur: 90  }, // 0:53-0:56  "VERDEX. Check before swap"
  s19: { from: 1695, dur: 1005}, // 0:56-1:30  CTA + hackathon hold
} as const;

// ── Variant γ: CLEAN EVIDENCE ────────────────────────────────────────────────
// Measured, Apple keynote. Sequential scene pacing with zero VO collision.
// Total duration: 3775 frames @ 30fps = 125.8 seconds (~2 min).
export const TL_GAMMA = {
  s01: { from: 0,    dur: 125 }, // 0:00.0 - 0:04.1 (VO 3.76s = 113f + 12f pause) "Every day, someone buys"
  s02: { from: 125,  dur: 175 }, // 0:04.1 - 0:10.0 (VO 5.36s = 161f + 14f pause) "Loses everything. Audits ≠ behavior"
  s03: { from: 300,  dur: 75  }, // 0:10.0 - 0:12.5 (VO 2.00s = 60f + 15f pause)  "Verdex checks behavior"
  s04: { from: 375,  dur: 140 }, // 0:12.5 - 0:17.1 (VO 4.24s = 128f + 12f pause) "Pre-trade forensic evidence"
  s05: { from: 515,  dur: 235 }, // 0:17.1 - 0:25.0 (VO 7.28s = 219f + 16f pause) Token → 100 swaps → 4 dims
  s06: { from: 750,  dur: 200 }, // 0:25.0 - 0:31.6 (VO 6.24s = 188f + 12f pause) 4 dimension pills
  s07: { from: 950,  dur: 195 }, // 0:31.6 - 0:38.1 (VO 6.08s = 183f + 12f pause) Clean/Warn/Danger levels
  s08: { from: 1145, dur: 115 }, // 0:38.1 - 0:42.0 (VO 3.44s = 104f + 11f pause) "Case file: GMX on Arbitrum"
  s09: { from: 1260, dur: 340 }, // 0:42.0 - 0:53.3 (VO 10.8s = 324f + 16f pause) GMX clean card
  s10: { from: 1600, dur: 100 }, // 0:53.3 - 0:56.6 (VO 2.96s = 89f + 11f pause)  "Case file: SUSHI on Ethereum"
  s11: { from: 1700, dur: 265 }, // 0:56.6 - 1:05.5 (VO 8.40s = 252f + 13f pause) SUSHI 0.73 evidence
  s12: { from: 1965, dur: 240 }, // 1:05.5 - 1:13.5 (VO 7.52s = 226f + 14f pause) Contested split
  s13: { from: 2205, dur: 275 }, // 1:13.5 - 1:22.6 (VO 8.64s = 260f + 15f pause) Receipt table clean
  s14: { from: 2480, dur: 175 }, // 1:22.6 - 1:28.5 (VO 5.36s = 161f + 14f pause) Stat cards 34/7/306
  s15: { from: 2655, dur: 210 }, // 1:28.5 - 1:35.5 (VO 6.56s = 197f + 13f pause) Deterministic rules
  s16: { from: 2865, dur: 410 }, // 1:35.5 - 1:49.1 (VO 13.2s = 396f + 14f pause) 9 endpoints hub
  s17: { from: 3275, dur: 95  }, // 1:49.1 - 1:52.3 (VO 2.80s = 84f + 11f pause)  "Could it rug?"
  s18: { from: 3370, dur: 105 }, // 1:52.3 - 1:55.8 (VO 3.04s = 92f + 13f pause)  "Is it rugging?"
  s19: { from: 3475, dur: 300 }, // 1:55.8 - 2:05.8 (River 125f + Sarah 48f + hold) Close + badge hold
} as const;

export const TL_GAMMA_TOTAL_FRAMES = 3775;

export type SceneTiming = { from: number; dur: number };
