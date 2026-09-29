# Verdex — DoraHacks submission pack

This file is a truthful copy pack. URLs that require a user action remain explicitly `not published`.

## Form fields

| Field | Value / status |
|---|---|
| BUIDL name | Verdex |
| Vision | Make “what was observed before a DEX swap?” checkable with source-backed flow, liquidity, safety, and coverage evidence. |
| Category | Markets and Trading Tools |
| GitHub | `https://github.com/alfindigital/verdex` — verify public visibility before submitting |
| Project website | `https://verdex-alpha.vercel.app` — production alias verified HTTP 200 |
| Demo video | **not published** — record from [`docs/DEMO-WALKTHROUGH.md`](docs/DEMO-WALKTHROUGH.md) after the final deployment review |
| Social link | **not published** — post only after the BUIDL URL and video URL exist |
| Logo | `public/logo.png`; verify PNG/JPEG size is under 2 MB in the DoraHacks form |
| Track | Markets and Trading Tools |

## Paste-ready description

Verdex is a pre-trade DEX evidence reader. A trader enters a token ticker or address and chooses the exact chain when search is ambiguous. CoinMarketCap DEX responses are parsed into four dimensions: SAFETY, FLOW, LIQUIDITY, and PUMP. The result shows observed maker concentration, observed sell makers, provider-reported security fields, LP evidence status, coverage age, three next checks, and the receipts needed to review the calculation.

Verdex uses deterministic rules for the verdict. Jev and narration are optional secondary context; they never override the rules. A clean label means no known flag in the reviewed sample, not a recommendation or proof that a token is safe. Missing or failed inputs are unknown and lower coverage. A synthetic LP-outage fixture demonstrates this behavior and is labelled synthetic, not presented as a live incident.

Replay is the judging path: committed snapshots open without a key or API credit. V2 live requires both `VERDEX_V2=1` and `VERDEX_LIVE=1`, a server-only CMC key, and a fresh successful quota check. Live results are transient and do not receive a permanent share link; archived snapshot ids do.

The CMC integration is essential because it supplies the current DEX token search, swap rows, pools, LP changes, security report, and macro context that the rules inspect. The repository does not claim current tier entitlement, universal pagination, fraud-detection accuracy, user adoption, or a prize without separate evidence.

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

Full fixture: [`tests/fixtures/cmc/synthetic-lp-outage-bundle.json`](tests/fixtures/cmc/synthetic-lp-outage-bundle.json). A bounded live smoke test passed with the user-supplied key; an exact raw CMC bundle capture is still not retained.

## Demo sequence

Use the recorded path in [`docs/DEMO-WALKTHROUGH.md`](docs/DEMO-WALKTHROUGH.md): choose an ambiguous identity, inspect the next reason, expand source evidence, download JSON, then open a dated archive. Do not describe historical Jev text as current advice.

## Publishing checklist

- [ ] Confirm the public repo URL and default branch contain the final commits.
- [ ] Confirm a deployed replay page opens in a new browser without a key.
- [ ] Record and review the final 90-second video; no invented live result or stale narration.
- [ ] Create the DoraHacks BUIDL and accept terms yourself.
- [ ] Replace the `not published` video/social statuses only after the URLs open.
- [ ] Post the X message with the actual BUIDL URL, video URL, and `#BuildwithCMC`.
- [ ] Submit the form and capture the confirmation URL before marking the entry submitted.

See [`docs/SUBMISSION-CHECKLIST.md`](docs/SUBMISSION-CHECKLIST.md) for the same gates with evidence links.
