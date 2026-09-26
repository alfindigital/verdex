# DoraHacks submission pack — Verdex

## Links

- **Live demo**: https://verdex-alpha.vercel.app
- **Repo (public)**: https://github.com/alfindigital/verdex
- **Shareable verdicts** (34 committed snapshots, real CMC data, recomputed 2026-09-26):
  - **GMX (Arbitrum) → ENTRY-WORTHY: https://verdex-alpha.vercel.app/verdict/8d3ea1d0c471 — score 100**, all four dims CLEAN, Jev **consensus** (0.10) — proof the engine can say yes when evidence is clean
  - **AAVE (Ethereum) → CAUTION: https://verdex-alpha.vercel.app/verdict/581465f26b3d — score 70**, Jev **contested**: SAFETY WARN on the named `upgradeable` centralization flag, FLOW WARN on arb-dominated DEX flow (mature-tier rule, mcap $2.4B — published in CLAIMS)
  - UNI (Ethereum) → CAUTION: https://verdex-alpha.vercel.app/verdict/ad9bed9c75d8 — score 70; `mintable` centralization flag surfaced by name, Jev contested
  - LINK (Ethereum) → CAUTION: https://verdex-alpha.vercel.app/verdict/a90b221cf121 — score 85; concentrated DEX maker flow read as WARN for a $14B asset, Jev contested
  - SUSHI (Ethereum) → AVOID: https://verdex-alpha.vercel.app/verdict/5071c7a844a8 — score 45; sub-$100M mcap → strict tier: top-5 makers 0.73 + `mintable` flag → falsifier names all three failing rows
  - COMP (Gnosis) → AVOID: https://verdex-alpha.vercel.app/verdict/fd10af61fb49 — score 30; dead-market signature: 3 unique makers, top-5 = 100% of flow, $17 pool liquidity
  - FLOKI (BSC) → CAUTION: https://verdex-alpha.vercel.app/verdict/8ee1fe7e3850 — score 85, Jev contested
  - TITANO (BSC) → CAUTION: https://verdex-alpha.vercel.app/verdict/a617e358f0cd — score 20, confidence **low** (thin swap window), Jev lean
  - PEPE (Ethereum) → CAUTION: https://verdex-alpha.vercel.app/verdict/36d17f41056d — Jev contested
  - WIF (Solana) → CAUTION: https://verdex-alpha.vercel.app/verdict/5f133ef70475
  - …plus 24 more majors across Ethereum, Solana, BSC, Arbitrum, Optimism, Polygon, Gnosis on the homepage `case_files/` table

## Track

**Markets & Trading Tools**

## Project name

Verdex

## Tagline

Don't be the exit liquidity — an evidence-backed verdict on any DEX token before you click buy.

## Description (paste-ready)

Verdex answers the question every DEX trader asks seconds before buying: *is this token behaving like a trap right now?*

Existing scanners check contract structure — could it rug? (honeypot.is even simulates one test trade — but a single simulated buy/sell can be whitelist-gamed by sophisticated traps.) Verdex checks **live behavior** — is it rugging? From ~100 *real* swaps by distinct wallets on CoinMarketCap DEX data we compute maker breadth, top-5 maker USD concentration, and the check almost nobody automates: **are there real third-party sells?** Hundreds of buys with zero independent sells is the hidden-honeypot signature — and real order flow can't be faked for the scanner's address.

Every verdict is four published sub-verdicts (SAFETY · FLOW · LIQUIDITY · PUMP) rolled into a deterministic composite score — every threshold is public in docs/CLAIMS.md, including a **mature-asset tier** (mcap ≥ $100M): arb-dominated on-chain flow of large caps is weak rug evidence, so concentration/direction signals cap at WARN while insider-exit signals (zero third-party sells, <5 makers) still bite. Each result ships with a **falsifier** naming *every* failing row, a **Jev second opinion** (TypeSafe's calibrated decision model cross-examines the same metrics — consensus/contested/lean, disagreement always shown, never overriding rules), and **evidence receipts**: endpoint, params, timestamp, credit count, and SHA-256 of every CMC response.

**Business value:** the verdict + falsifier + SHA-256 receipt bundle is built to be embedded, not just viewed — a pre-trade risk gate for wallets, DEX aggregators, and Telegram sniper bots that need an auditable "why" for every flag (B2B API-as-a-service), versus black-box scanner scores. The deterministic, replayable evidence trail is the moat: partners can verify our calls independently instead of trusting us.

CMC endpoints used: dex/search, dex/tokens/transactions, dex/token/pools, dex/token (creator meta), dex/liquidity-change/list, dex/security/detail, global-metrics/quotes (latest+historical), fear-and-greed/latest — ~9 calls per verdict.

Honest limits documented in README: no OHLCV on Basic tier → PUMP uses vol/mcap + makers-per-volume instead; no wallet labels → we report concentration, never claim "smart money"; thin tokens return INSUFFICIENT EVIDENCE rather than a fake answer.

## Demo video script (~90s)

1. (0–10s) Home: "Every day, traders lose money to tokens that pass every contract check but behave like rugs. Verdex answers the real question."
2. (10–25s) Open GMX → **ENTRY-WORTHY 100/100**, all four dims CLEAN, Jev consensus — "the engine says yes when the data is clean." Then SUSHI → AVOID 45/100 — "same rules, opposite verdict. The difference is the evidence."
3. (25–45s) Scroll SUSHI: sub-$100M token, top-5 makers = 73% of USD flow, `mintable` admin flag — falsifier names every failing row. Contrast AAVE → CAUTION 70: "$2.4B asset — the published mature-tier rule reads arb-dominated DEX flow as caution, not danger. Same metrics, honest severity."
4. (45–60s) Jev panel on AAVE → **contested** badge: "Rules see warnings; Jev prices the risk at 0.27. When the judges disagree we show the fight — never a fake consensus." UNI: `mintable` centralization flag surfaced by name — "admin powers aren't proof of a rug, but they're a rug vector — so we flag them, by name."
5. (60–75s) Evidence receipts: 9 endpoint calls per verdict, params, credits, SHA-256. "Every number auditable — that receipt bundle is exactly what a wallet or aggregator needs to trust a pre-trade check."
6. (75–90s) Case files: 34 verdicts — 30 CAUTION, 3 AVOID, 1 ENTRY-WORTHY — across 7 chains. "Calibrated on real majors: AAVE, UNI, LINK land at caution; AVOID is reserved for genuinely trapped markets." Close: "Structure tells you could it rug. Verdex tells you is it rugging. #BuildwithCMC"

## X post draft

> Don't be the exit liquidity.
>
> Verdex gives any DEX token a deterministic verdict — ENTRY-WORTHY / CAUTION / AVOID — from @CoinMarketCap DEX data, cross-examined by @TypeSafeAI's Jev.
>
> Every number ships with a receipt. Every verdict with a falsifier.
>
> Live: https://verdex-alpha.vercel.app
> BUIDL: https://dorahacks.io/buidl/XXXX
>
> #BuildwithCMC

(Replace XXXX after DoraHacks BUIDL page exists.)

## DoraHacks form fields (exact)

| Field | Value |
|---|---|
| BUIDL name | `Verdex` |
| BUIDL logo | `public/logo.png` (480×480, 18KB ✅) |
| Vision | "Make 'is this token behaving like a trap?' a checkable fact before every DEX buy — evidence-backed verdicts, not dashboards." |
| Category | Markets and Trading Tools |
| GitHub * | `https://github.com/alfindigital/verdex` |
| Project website | `https://verdex-alpha.vercel.app` |
| Demo video * | **YouTube link — user must record** (script below) |
| Social link (≥1) | X post URL (after posting) |

## Positioning vs closest BUIDLs (43 total)

- **CMC Witness** — pre-trade *gate for AI agents* (x402 paid, allow|caution|block). Verdex is **trader-facing** with full metric surface (third-party sells, maker concentration, LP pulls) + falsifier + Jev cross-exam. Gate vs courtroom.
- **Middleman / Forwarding Address** (Edy Cu) — evidence over suspicion, but about slippage/pool choice and LP-pull adjudication. Verdex adjudicates the *token itself* pre-entry.
- **Argus / Market Detective** — "why did it move" investigation + receipts. Verdex answers "should I buy" — receipts shared as pattern, verdict is the differentiator.
- **MarketSentinel** — TEE manipulation signals, infra-heavy. Verdex is zero-infra, deterministic, reproducible by anyone.

## Checklist for submission form

- [ ] Public repo: https://github.com/alfindigital/verdex
- [ ] Demo link: https://verdex-alpha.vercel.app
- [ ] Demo video/screen recording attached
- [ ] X post contains DoraHacks link + video + #BuildwithCMC
- [ ] Endpoints named in description (done above)
- [ ] "Where the API got in the way" section (done — README)
- [ ] Track: Markets & Trading Tools
