# Verdex demo video

The video project is a Remotion workspace. It is a production aid, not proof that a final video has been published.

## Current script

Use [`../docs/DEMO-WALKTHROUGH.md`](../docs/DEMO-WALKTHROUGH.md) as the source of truth. The final 90-second cut should show:

1. replay-first home state and the problem statement;
2. an ambiguous ticker resolving to a platform/address identity;
3. observed sell makers, concentration, risk label, and coverage;
4. a failed LP source rendered as unknown/insufficient;
5. source status, exact hash, and JSON export;
6. a dated archived snapshot and its honest share behavior.

Do not call a synthetic fixture a live incident, a clean sample safe, a heuristic score a probability, or an archive a live permanent record. Do not reuse narration that says “size accordingly”.

## Variants

All numbers on screen come from the committed snapshot corpus (`video/src/data.ts`, recomputed from `snapshots/` under rules 2.3.0). VO lives in `video/public/vo-<variant>/sNN.mp3`; scene timing (`TL_*`) is regenerated from real audio durations via `scripts/gen-vo-new.py` + the probe step that rewrote the `TL_*` constants, so narration never gets cut by a Sequence boundary.

| Composition ID | Angle | Voice | Length | File |
|---|---|---|---|---|
| `VerdexDelta-ReceiptTicker` | teleprinter evidence receipt, perforated stock, hash tape, bottom market ticker | edge-tts `en-US-GuyNeural` | ~85 s | `verdex-delta-receipt-ticker.mp4` |
| `VerdexEpsilon-CaseFile` | evidence folder, custody lines, disclosures stamped on paper | edge-tts `en-US-ChristopherNeural` | ~131 s | `verdex-epsilon-case-file.mp4` |
| `VerdexZeta-TheScan` | radar/instrument sweep over the four dimensions | edge-tts `en-US-JennyNeural` | ~91 s | `verdex-zeta-the-scan.mp4` |
| `VerdexEta-MarketTape` | Bloomberg-style bottom tape, bars on maker concentration | edge-tts `en-US-AriaNeural` | ~79 s | `verdex-eta-market-tape.mp4` |
| `VerdexTheta-BeforeAfter` | split screen: what a contract check sees vs what Verdex sees | edge-tts `en-US-AndrewNeural` | ~73 s | `verdex-theta-before-after.mp4` |

Earlier generations (`VerdexAlpha/Beta/Gamma`, `VerdexA–D`, `VerdexDemo`) remain registered for comparison; pick one final cut for submission.

**ElevenLabs two-voice cuts** — same scenes and script, narrated by Brian (male, setup + exhibits) and Sarah (female, honesty line + ledger + close) via `eleven_v4`. Each `-EL` composition takes `voDir`/`tl` props; `src/el-timing.ts` is regenerated from probed mp3 durations, so scene windows grow to fit the slower EL pace instead of speeding the audio up. Assets: `public/vo-<variant>-el/sNN.mp3`.

| Composition ID | Length | File |
|---|---|---|
| `VerdexDelta-EL` | ~92 s | `verdex-delta-el.mp4` |
| `VerdexEpsilon-EL` | ~129 s | `verdex-epsilon-el.mp4` |
| `VerdexZeta-EL` | ~99 s | `verdex-zeta-el.mp4` |
| `VerdexEta-EL` | ~84 s | `verdex-eta-el.mp4` |
| `VerdexTheta-EL` | ~90 s | `verdex-theta-el.mp4` |

Note: all variants were re-rendered on rules 2.3.0 data (2026-09-30) — corpus 301 records / 9 chains / 2,709 receipts / 29,744 swaps, CEL dead-tape exhibit replaces the retired SUSHI/GMX JANGAN case (both are CAUTION under 2.3.0). ElevenLabs keys are passed via env only (`ELEVENLABS_API_KEY[_N]`), never committed; `scripts/gen-vo-elevenlabs.py` rotates keys on `detected_unusual_activity`/quota errors.

## Commands

```powershell
npm ci --ignore-scripts
npm run dev                 # Remotion studio
npx tsc --noEmit            # typecheck
npx remotion still src/index.ts <CompId> still.png --frame=N
npx remotion render src/index.ts <CompId> out/<file>.mp4 --codec=h264
```

The existing `video/out/` renders are historical and gitignored. Rerender only after the final deployed copy/data has been reviewed. Publishing to YouTube is an owner action; the submission checklist remains `not published` until a real URL is verified.
