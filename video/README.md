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

All numbers on screen come from the committed snapshot corpus (`video/src/data.ts`, recomputed from `tests/fixtures/cmc/snapshots`). VO lives in `video/public/vo-<variant>/sNN.mp3`; scene timing (`TL_*`) is regenerated from real audio durations via `scripts/gen-vo-new.py` + the probe step that rewrote the `TL_*` constants, so narration never gets cut by a Sequence boundary.

| Composition ID | Angle | Voice | Length | File |
|---|---|---|---|---|
| `VerdexDelta-ReceiptTicker` | teleprinter evidence receipt, perforated stock, hash tape, bottom market ticker | ElevenLabs **Charlie** | ~105 s | `verdex-delta-receipt-ticker.mp4` |
| `VerdexEpsilon-CaseFile` | evidence folder, custody lines, disclosures stamped on paper | edge-tts `en-US-ChristopherNeural` | ~128 s | `verdex-epsilon-case-file.mp4` |
| `VerdexZeta-TheScan` | radar/instrument sweep over the four dimensions | edge-tts `en-US-JennyNeural` | ~89 s | `verdex-zeta-the-scan.mp4` |
| `VerdexEta-MarketTape` | Bloomberg-style bottom tape, bars on maker concentration | edge-tts `en-US-AriaNeural` | ~78 s | `verdex-eta-market-tape.mp4` |
| `VerdexTheta-BeforeAfter` | split screen: what a contract check sees vs what Verdex sees | edge-tts `en-US-AndrewNeural` | ~70 s | `verdex-theta-before-after.mp4` |

Earlier generations (`VerdexAlpha/Beta/Gamma`, `VerdexA–D`, `VerdexDemo`) remain registered for comparison; pick one final cut for submission.

Note: ElevenLabs quota ran out mid-generation — Delta kept the ElevenLabs/Charlie master; the other four variants use edge-tts neural voices (regenerate with ElevenLabs later if preferred, then re-run the TL probe).

## Commands

```powershell
npm ci --ignore-scripts
npm run dev                 # Remotion studio
npx tsc --noEmit            # typecheck
npx remotion still src/index.ts <CompId> still.png --frame=N
npx remotion render src/index.ts <CompId> out/<file>.mp4 --codec=h264
```

The existing `video/out/` renders are historical and gitignored. Rerender only after the final deployed copy/data has been reviewed. Publishing to YouTube is an owner action; the submission checklist remains `not published` until a real URL is verified.
