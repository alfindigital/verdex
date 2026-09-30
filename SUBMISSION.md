# Verdex — DoraHacks submission pack

This file is a truthful copy pack. URLs that require a user action remain explicitly `not published`.

## Form fields

| Field | Value / status |
|---|---|
| BUIDL name | Verdex |
| Vision | Make “what was observed before a DEX swap?” checkable with source-backed flow, liquidity, safety, and coverage evidence. |
| Category | Markets and Trading Tools |
| GitHub | `https://github.com/alfindigital/verdex` — verify public visibility before submitting |
| Project website | **`https://verdex.web.id`** — live HTTPS 200, canonical (Cloudflare DNS → Vercel); `verdex-alpha.vercel.app` remains working alias |
| Demo video | **not published** — 5 re-rendered candidates in `video/out/` (rules 2.3.0 data, fresh VO): `verdex-delta-receipt-ticker.mp4` (~85s, flagship receipt-tape), `verdex-theta-before-after.mp4` (~73s, contract-check vs behavior split-screen), `verdex-eta-market-tape.mp4` (~79s), `verdex-zeta-the-scan.mp4` (~91s), `verdex-epsilon-case-file.mp4` (~131s); pick one, owner uploads to YouTube. Legacy renders retained for comparison |
| Social link | **not published** — post only after the BUIDL URL and video URL exist |
| Logo | `public/logo.png` — concept **A "Verdict Scanner"** chosen (teal geometric V on paper); verify PNG/JPEG size is under 2 MB in the DoraHacks form; 7 alternates preserved in `public/logo-concepts/` |
| Track | Markets and Trading Tools |

## Paste-ready description

Verdex is a pre-trade DEX evidence desk. A trader enters a ticker or address and chooses the exact chain when the ticker is ambiguous. Nine CoinMarketCap endpoints are pulled per scan — search, transactions, pools, LP changes, security detail, token metadata, and macro context — and every raw response body is frozen with a SHA-256 receipt.

A deterministic rules engine (v2.3.0) evaluates four dimensions — SAFETY, FLOW, LIQUIDITY, PUMP — plus a fifth signal most checkers miss: tape vitality (how fast the last 100 swaps accumulated). That is how it catches what contract-scanners cannot: CEL still lists $65K of nominal pool depth, but the tape records ~13 swaps a day — a dead market wearing a live ticker. The stamp reads HIGH RISK FLAGS.

Every verdict ships with its named falsifier ("this flips if swapsPerDay recovers above 50/day"), the exact threshold each row failed, and a coverage badge. Missing evidence shows as unknown — never zero. Replays are labelled replays. The AI second opinion (Jev, a probability classifier over the same four dimensions) is printed alongside its agreement — 130/130 records examined; the model never writes the rules, and the product is fully functional without it.

The archived corpus holds 130 verdicts across 9 chains, 1,170 receipts, 12,800 swap events. Against a 59-label hand-checked set the rules catch 4/6 collapsed tokens with zero zombie/faded tokens stamped clean — while a security-flags-only baseline stamps 5/7 of them entry-safe. Three false positives on thin L2 tapes are disclosed, not hidden.

Replay is the judging path: committed snapshots open without a key. V2 live requires `VERDEX_V2=1` + `VERDEX_LIVE=1`, a server-only CMC key, and a fresh quota check; live results are transient — only archived snapshots get permanent links.

## Endpoint list

`/v1/dex/search`, `/v1/dex/tokens/transactions`, `/v1/dex/token/pools`, `/v1/dex/token`, `/v1/dex/liquidity-change/list`, `/v1/dex/security/detail`, `/v1/global-metrics/quotes/latest`, `/v1/global-metrics/quotes/historical`, `/v3/fear-and-greed/latest`.

## Reproduction excerpt

The key stays in the server environment; do not paste a real value into a README or submission form.

```powershell
$env:CMC_API_KEY = '<set only in the server environment>'
$env:VERDEX_V2 = '1'
$env:VERDEX_LIVE = '1'
pnpm dev
```

Offline, no key is required:

```powershell
pnpm evidence:verify tests/fixtures/cmc/synthetic-lp-outage-bundle.json
```

The reviewed excerpt below is **synthetic fixture output**, not a live CMC response:

```json
{
  "schemaVersion": 2,
  "rulesVersion": "2.0.0",
  "result": { "label": "INSUFFICIENT_EVIDENCE" },
  "coverage": { "level": "insufficient", "reasons": ["LP source failed"] },
  "manifest": { "origin": "synthetic-fixture", "completeRawEvidence": false }
}
```

Full fixture: [`tests/fixtures/cmc/synthetic-lp-outage-bundle.json`](tests/fixtures/cmc/synthetic-lp-outage-bundle.json). Real exact-body captures from 2026-09-29 are retained at `tests/fixtures/cmc/real-capture-2026-09-29-{jup,gmx,xvs}.json` (9 endpoints, HTTP 200 each, verifier passes, replay matches live verdict/label).

## Demo sequence

Use the recorded path in [`docs/DEMO-WALKTHROUGH.md`](docs/DEMO-WALKTHROUGH.md): choose an ambiguous identity, inspect the next reason, expand source evidence, download JSON, then open a dated archive. Do not describe historical Jev text as current advice.

## Publishing checklist

- [ ] Confirm the public repo URL and default branch contain the final commits.
- [ ] Confirm a deployed replay page opens in a new browser without a key.
- [x] Final 90-second video re-rendered 2026-09-29 (`video/out/verdex-B-evidencetape.mp4`, h264+AAC 1080p) with the corrected copy; owner still reviews and uploads.
- [ ] Create the DoraHacks BUIDL and accept terms yourself.
- [ ] Replace the `not published` video/social statuses only after the URLs open.
- [ ] Post the X message with the actual BUIDL URL, video URL, and `#BuildwithCMC`.
- [ ] Submit the form and capture the confirmation URL before marking the entry submitted.

See [`docs/SUBMISSION-CHECKLIST.md`](docs/SUBMISSION-CHECKLIST.md) for the same gates with evidence links.
