# DoraHacks submission pack — Verdex

## Links

- **Live demo**: https://verdex-alpha.vercel.app
- **Repo (public)**: https://github.com/alfindigital/verdex
- **Shareable verdicts** (34 committed snapshots, real CMC data, recomputed 2026-09-26):
  - **LDO (Ethereum) → ENTRY-WORTHY: https://verdex-alpha.vercel.app/verdict/7a4b2e35aeae — score 100**, all four dims CLEAN (21 third-party sells, top-5 share 0.40, net buys +0.28), Jev **consensus** (0.09) — proof the engine can say yes when evidence is clean
  - PEPE (Ethereum) → AVOID: https://verdex-alpha.vercel.app/verdict/d98a1e3d881f — Jev **contested** (Jev rates every dim <0.5 while rules flag FLOW danger)
  - UNI (Ethereum) → CAUTION: https://verdex-alpha.vercel.app/verdict/97126871d688 — score 85; SAFETY WARN via unclassified `mintable` flag (surfaced, not hidden)
  - TITANO (BSC) → CAUTION: https://verdex-alpha.vercel.app/verdict/2a1b06f38cff — score 20, confidence **low** (thin swap window), Jev lean
  - FLOKI (BSC) → AVOID: https://verdex-alpha.vercel.app/verdict/e49cf505ca70
  - WIF (Solana) → AVOID: https://verdex-alpha.vercel.app/verdict/0a244cd6bc1d
  - LINK (Ethereum) → AVOID: https://verdex-alpha.vercel.app/verdict/b9303860dd49 — top-5 makers 0.96
  - BONK (Solana) → AVOID: https://verdex-alpha.vercel.app/verdict/c5ed0ebbf386
  - ORCA (Solana) → AVOID: https://verdex-alpha.vercel.app/verdict/2c2c3cd60e17
  - CAKE (BSC) → AVOID: https://verdex-alpha.vercel.app/verdict/52a8c61dd1c7
  - …plus 24 more majors across Ethereum, Solana, BSC, Arbitrum, Optimism, Polygon, Gnosis on the homepage `case_files/` table

## Track

**Markets & Trading Tools**

## Project name

Verdex

## Tagline

Don't be the exit liquidity — an evidence-backed verdict on any DEX token before you click buy.

## Description (paste-ready)

Verdex answers the question every DEX trader asks seconds before buying: *is this token behaving like a trap right now?*

Existing scanners check contract structure — could it rug? Verdex checks **live behavior** — is it rugging? From CoinMarketCap DEX swap-level data we compute maker breadth, top-5 maker USD concentration, and the check almost nobody automates: **are there real third-party sells?** Hundreds of buys with zero independent sells is the hidden-honeypot signature.

Every verdict is four published sub-verdicts (SAFETY · FLOW · LIQUIDITY · PUMP) rolled into a deterministic composite score — every threshold is public in docs/CLAIMS.md. Each result ships with a **falsifier** (what future observation would flip it), a **Jev second opinion** (TypeSafe's calibrated decision model cross-examines the same metrics — consensus/contested/lean, never overriding rules), and **evidence receipts**: endpoint, params, timestamp, credit count, and SHA-256 of every CMC response.

CMC endpoints used: dex/search, dex/tokens/transactions, dex/token/pools, dex/token (creator meta), dex/liquidity-change/list, dex/security/detail, global-metrics/quotes (latest+historical), fear-and-greed/latest — ~9 calls per verdict.

Honest limits documented in README: no OHLCV on Basic tier → PUMP uses vol/mcap + makers-per-volume instead; no wallet labels → we report concentration, never claim "smart money"; thin tokens return INSUFFICIENT EVIDENCE rather than a fake answer.

## Demo video script (~90s)

1. (0–10s) Home: "Every day, traders lose money to tokens that pass every contract check but behave like rugs. Verdex answers the real question."
2. (10–25s) Open LDO → **ENTRY-WORTHY 100/100**, all four dims CLEAN — "the engine says yes when the data is clean." Then FLOKI BSC → AVOID 60/100 — FLOW DANGER stamp. "Same deterministic rules. Opposite verdicts. The difference is the evidence."
3. (25–45s) Scroll FLOKI FLOW: 50 unique makers but top-5 = 72% of USD flow; net outflow −0.61; 30 real third-party sells. "Breadth looks fine. Concentration and direction don't. That's what scanners miss."
4. (45–60s) Jev panel: per-dimension bars → consensus badge. Switch to PEPE: rules flag FLOW DANGER (top-5 0.55 + net-outflow 0.87) while Jev rates every dim <0.5 → **contested**. Then UNI: score 85 CAUTION — one WARN, and it's an unclassified `mintable` flag other tools would drop. "Two independent judges. When they disagree, we show the fight — never a fake consensus."
5. (60–75s) Evidence receipts: 9 endpoint calls per verdict, params, credits, SHA-256. "Every number auditable."
6. (75–90s) Case files: 34 verdicts on file — 22 AVOID, 11 CAUTION, 1 ENTRY-WORTHY — across 7 chains. Every falsifier tells you exactly what flips it. Close: "Structure tells you could it rug. Verdex tells you is it rugging. #BuildwithCMC"

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
