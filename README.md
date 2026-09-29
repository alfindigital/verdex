# Verdex — inspect the evidence before a DEX swap

Verdex turns CoinMarketCap DEX observations into a deterministic, reviewable token assessment. It answers **what was observed in this sample, what is missing, and what to inspect next**. It does not predict price, prove intent, or provide financial advice.

**Track:** Markets & Trading Tools · **Demo:** recorded replay by default · **CMC integration:** server-side API client with receipts

## Why it exists

Contract scanners answer whether a token *could* rug. A trader also needs to see whether the observed swap flow is concentrated, whether sells were observed, whether LP evidence is available, and whether a vendor-reported security flag exists. Verdex keeps those questions separate across SAFETY, FLOW, LIQUIDITY, and PUMP.

The product reports **observed sell makers** in the sampled rows. It does not call them independent wallets or smart money. Positive output means no known flag in the reviewed sample; it is not a clearance.

## What a judge can verify offline

```powershell
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm evidence:verify tests/fixtures/cmc/synthetic-lp-outage-bundle.json
pnpm docs:verify
pnpm build
```

The committed synthetic bundle demonstrates a failed LP source beside healthy pool/swap payloads. It is labelled synthetic and is not a CoinMarketCap incident. Historical snapshots remain v1 archives with receipt hashes; their raw response bodies were not retained.

## Modes and request contract

- **Replay (default):** active unless `VERDEX_V2=1` and `VERDEX_LIVE=1` are both set. It serves committed snapshots without a key or credit spend.
- **V2 live:** requires both flags, a server-only `CMC_API_KEY` (optional fallback key), a successful quota probe, and the in-memory caps. Unknown quota fails closed. A live result is transient and has no permanent share URL.
- **Input:** `POST /api/verdict` accepts `{query, platform?, selection?: {platform,address}}`, max 128 query characters and 4096 JSON bytes. Legacy `pick` is rejected so candidate identity cannot change when search order changes.

Live requests have a 15-second total budget, a 6-second per-attempt timeout, and at most one transport retry. The client never accepts a caller-supplied upstream URL or endpoint.

## CoinMarketCap endpoints used

| Endpoint | Product use |
|---|---|
| `/v1/dex/search` | resolve address, name, or ticker into candidate identities |
| `/v1/dex/tokens/transactions` | swap side, USD value, maker, tx and pool observations |
| `/v1/dex/token/pools` | current pool depth and pool identity |
| `/v1/dex/token` | creator/owner metadata for exclusion accounting |
| `/v1/dex/liquidity-change/list` | LP add/remove events; failure remains unknown |
| `/v1/dex/security/detail` | provider-reported flags and tax fields |
| `/v1/global-metrics/quotes/latest` + `/historical` | optional macro context |
| `/v3/fear-and-greed/latest` | optional sentiment context |

The normal orchestration estimates nine calls, but receipts record the actual calls and retries. Current provider tier entitlement, pagination semantics, and a fresh raw-body capture are **UNVERIFIED in this execution** because no credential was supplied.

## Evidence and sharing

Every new V2 source record carries status, provider/fetch time, accepted/rejected rows, cache state, and a body hash when exact bytes are retained. `scripts/verify-evidence.ts` checks exact base64 bytes, SHA-256, JSON validity, size, and the complete-raw-evidence flag. The UI exposes source statuses, full hashes, recheck conditions, and a direct evidence JSON download.

Only a registered committed snapshot id receives a durable `/verdict/<id>` path and X share link. Runtime/live records show `transient live result` and `no permanent share link`.

## Limitations

- Missing data is unknown, never zero or CLEAN.
- A sample contains the rows returned by the endpoint; no universal pagination/cap claim is made until a current authorized probe.
- No wallet labels: maker breadth is a transaction observation, not ownership or intent.
- No OHLCV claim is made in V2; PUMP uses available volume/mcap context and marks missing macro inputs.
- Synthetic regression cases are policy checks, not fraud-detection accuracy or backtest results.
- Production audit currently reports four high and two moderate transitive advisories in Next/PostCSS/optional sharp; no breaking upgrade was forced in this sprint. See [`docs/evidence/validation-matrix.md`](docs/evidence/validation-matrix.md).

## Architecture

```text
request policy → identity resolver → strict parsers → nullable metrics
             → coverage + V2 rules → evidence bundle → replay/live UI
```

Key modules: `src/lib/address.ts`, `src/lib/dex.ts`, `src/engine/metrics.ts`, `src/engine/coverage.ts`, `src/engine/rules.ts`, `src/engine/evidence.ts`, `src/lib/verdict-store.ts`.

## Local setup

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

The live key is read only from the server environment. Do not commit `.env.local`, request headers, or key-info payloads.

## Project documents

- [`docs/DEMO-WALKTHROUGH.md`](docs/DEMO-WALKTHROUGH.md) — 60-second judge path
- [`docs/evidence/validation-matrix.md`](docs/evidence/validation-matrix.md) — PASS/UNVERIFIED release matrix
- [`docs/evidence/2026-09-29-capability-check.md`](docs/evidence/2026-09-29-capability-check.md) — provider-contract evidence boundary
- [`docs/USER-CHECK.md`](docs/USER-CHECK.md) — participant utility test plan
- [`HANDOFF.md`](HANDOFF.md) and [`SUBMISSION.md`](SUBMISSION.md) — current execution and publishing handoff

Built for Build with CMC: API Hackathon. The repository does not claim a prize, user adoption, or live capability that has not been verified.
