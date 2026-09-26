# Verdex — Don't be the exit liquidity

**Live: https://verdex-alpha.vercel.app** · **Track: Markets & Trading Tools** · Built with the CoinMarketCap API

Paste a token address or ticker. Get a deterministic, evidence-backed verdict —
**ENTRY-WORTHY / CAUTION / AVOID / INSUFFICIENT EVIDENCE** — computed from
CoinMarketCap DEX data and cross-examined by Jev (TypeSafe's decision model).

## The problem

DEX scanners (RugCheck, TokenSniffer, GoPlus) answer *"could this contract
rug?"* — mostly static structure; honeypot.is goes further and simulates one
test trade. Traders lose money to a different question: *"is it behaving
like a rug right now?"* A token can pass every contract check while 4
wallets manufacture a pump and zero independent sellers exist. One simulated
trade can be whitelist-gamed; ~100 real swaps from distinct wallets can't.

## What Verdex does differently

- **Behavior over structure.** From raw swap-level DEX data we compute
  maker breadth, top-5 maker USD share, and the check almost nobody
  automates: **are there real third-party sells?** Hundreds of buys with
  zero independent sells is the hidden-honeypot signature.
- **A verdict, not a dashboard.** Four published sub-verdicts (SAFETY,
  FLOW, LIQUIDITY, PUMP) roll into one composite score with explicit
  thresholds — every threshold is in [`docs/CLAIMS.md`](docs/CLAIMS.md).
- **Falsifier.** Every verdict states what future observation would flip
  it. No unfalsifiable claims.
- **Two independent judges.** Rules engine (auditable) × Jev `noul`
  probability over the same metrics → `consensus` / `contested` / `lean`.
  Jev never overrides rules; disagreement is surfaced, not hidden.
- **Receipts.** Every CMC call is logged (endpoint, params, timestamp,
  credits, SHA-256 of response) and shown in the UI. The data is auditable
  down to the response body hash.

**Why this is a product, not a toy:** the verdict + falsifier + receipt
bundle is built to be embedded — a pre-trade risk gate for wallets, DEX
aggregators, and sniper bots that need an auditable "why" per flag (B2B
API-as-a-service), not a black-box score. Canonical demo URLs are stable
slugs (`/verdict/gmx-arbitrum`) backed by `snapshots/index.json`, so shared
links survive every re-harvest.

## CMC endpoints used

| Endpoint | Purpose |
|---|---|
| `/v1/dex/search` | Resolve address *or* name/ticker → token candidates |
| `/v1/dex/tokens/transactions` | Swap-level flow: side, USD value, maker address |
| `/v1/dex/token/pools` | Pool depth, 24h volume |
| `/v1/dex/token` | Token meta — creator/owner excluded from "third-party sells" |
| `/v1/dex/liquidity-change/list` | LP adds vs pulls (rug-drain detection) |
| `/v1/dex/security/detail` | Honeypot/tax/rug_pull/wash_trading flags |
| `/v1/global-metrics/quotes/latest` + `/historical` | BTC-dominance delta (counter-market pump context) |
| `/v3/fear-and-greed/latest` | Market sentiment context |

One verdict costs **~9 CMC calls** (well inside Basic tier's 15k credits/mo,
50 req/min — validated live). Live mode is capped at **30 scans/IP/day**
(per-instance floor) so a public demo can't drain the credit pool.

## Where the API shaped the product (honest limitations)

- **No OHLCV on Basic** → the PUMP dimension uses volume/mcap ratio and
  makers-per-$100k-volume instead of candle shape analysis.
- **No wallet labels** → we report "broad vs concentrated accumulation",
  never claim "smart money".
- **Swap window is the latest ~100 swaps** → thin tokens return
  INSUFFICIENT EVIDENCE rather than a fake verdict.
- `dex/search` param is `q` (undocumented); `security/detail` takes
  `platformName` where siblings take `platform`.

## Architecture

```
input (address | ticker | $TICKER)
  → dex/search resolve (ambiguous? → candidate list, never silent)
  → parallel fetch: swaps · pools · liquidity-change · security · market ctx
  → metrics: flow / liquidity / pump / safety      (src/engine/metrics.ts)
  → rules: 4 sub-verdicts → composite + falsifier  (src/engine/rules.ts)
  → Jev noul second opinion + agreement            (src/lib/jev.ts)
  → narrator (deterministic template; optional Groq) (src/engine/narrator.ts)
  → verdict JSON + receipts → persisted → /verdict/[id] share page + OG card
```

Every endpoint failure degrades its dimension to INSUFFICIENT — never a
crash, never a hidden gap. Jev/LLM down → rules verdict stands alone.

## Quickstart

```bash
pnpm install
cp .env.example .env.local   # add CMC_API_KEY (TYPESAFE_API_KEYS, GROQ_API_KEY optional)
pnpm dev
```

**Demo mode (default, `VERDEX_LIVE` unset):** serves the committed
`snapshots/` verdicts — 34 real CMC records across 7 chains (Ethereum,
Solana, BSC, Polygon, Arbitrum, Optimism, Gnosis): 1 ENTRY-WORTHY (GMX),
30 CAUTION (AAVE, UNI, LINK, LDO, TITANO, …), 3 AVOID. Real data harvested
live, replayable forever, zero credits. Try `GMX` or `FLOKI`, or paste a
showcased address. Screenshots in `demo-shots/`.

**Live mode:** `VERDEX_LIVE=1 pnpm dev` — real calls, receipts, and
persisted verdicts under `data/`, capped at 30 analyses per IP **and**
200 total per UTC day, **plus a quota circuit-breaker**: every ~15 min the
server probes `/v1/key/info` and hard-pauses live mode when the monthly
credit balance drops below 1,000 — snapshots always survive. In-memory caps
are per serverless instance (a floor, not a hard cross-instance limit;
rightmost XFF entry is used since leftmost is spoofable). Set
`VERDEX_LIVE=0` for snapshot-only public deployments.

## Testing

```bash
pnpm vitest run   # 97 tests: client, normalizers, metrics, rules, jev, orchestrator, live-guard
pnpm typecheck
pnpm build
```

## Design docs

- [`specs/PRODUCT_SPEC.md`](specs/PRODUCT_SPEC.md) — target user, USP/UVP, claims
- [`specs/TECH_SPEC.md`](specs/TECH_SPEC.md) — contracts, param quirks, receipts
- [`docs/CLAIMS.md`](docs/CLAIMS.md) — **every published threshold**
- [`docs/research/COMPETITORS.md`](docs/research/COMPETITORS.md) — gap analysis

## Env vars

| Var | Required | Purpose |
|---|---|---|
| `CMC_API_KEY` | live mode | CoinMarketCap API key (Basic works) |
| `TYPESAFE_API_KEYS` | no | Jev second opinion (comma-separated pool) |
| `GROQ_API_KEY` | no | LLM narrator (template narrator if absent) |
| `VERDEX_LIVE` | no | `1` = live CMC calls; unset = snapshot demo |

Built for the *Build with CMC* hackathon — DoraHacks submission.
