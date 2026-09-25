# DoraHacks submission pack — Verdex

## Links

- **Live demo**: https://verdex-alpha.vercel.app
- **Repo (public)**: https://github.com/alfindigital/verdex
- **Shareable verdicts** (committed snapshots, real CMC data, recomputed 2026-09-25):
  - FLOKI (BSC) → AVOID: https://verdex-alpha.vercel.app/verdict/298cca788e24 — Jev **consensus** (agrees on 3/4 dims)
  - ORCA (Solana) → CAUTION: https://verdex-alpha.vercel.app/verdict/b181e6b2cbdc — Jev **contested** (disagrees on SAFETY)
  - PEPE (Ethereum) → AVOID: https://verdex-alpha.vercel.app/verdict/f59f7f2da058
  - WIF (Solana) → AVOID: https://verdex-alpha.vercel.app/verdict/e44c2c197150
  - BONK (Solana) → AVOID: https://verdex-alpha.vercel.app/verdict/6bcb959abc38
  - CAKE (BSC) → AVOID: https://verdex-alpha.vercel.app/verdict/7ce923e7e3b9

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

CMC endpoints used: dex/search, dex/tokens/transactions, dex/token/pools, dex/liquidity-change/list, dex/security/detail, global-metrics/quotes (latest+historical), fear-and-greed/latest.

Honest limits documented in README: no OHLCV on Basic tier → PUMP uses vol/mcap + makers-per-volume instead; no wallet labels → we report concentration, never claim "smart money"; thin tokens return INSUFFICIENT EVIDENCE rather than a fake answer.

## Demo video script (~90s)

1. (0–10s) Home: "Every day, traders lose money to tokens that pass every contract check but behave like rugs. Verdex answers the real question."
2. (10–25s) Paste FLOKI BSC address → Check → verdict card: AVOID 60/100 — FLOW DANGER stamp. "Not a crash warning — a structure warning."
3. (25–45s) Scroll FLOW: 58 unique makers but top-5 = 71% of USD flow; 19 real third-party sells. "Breadth looks fine. Concentration doesn't. That's what scanners miss."
4. (45–60s) Jev panel: per-dimension bars — Jev agrees rules are risky on 3/4 dims → consensus badge. Switch to ORCA: Jev flags SAFETY 0.66 while rules say CLEAN → **contested**. "Two independent judges. When they disagree, we show the fight — never a fake consensus."
5. (60–75s) Evidence receipts: endpoint, params, credits, SHA-256. "Every number auditable."
6. (75–90s) Case files: 5 of 6 majors flag AVOID on concentrated flow — falsifier tells you exactly what flips each verdict. Close: "Structure tells you could it rug. Verdex tells you is it rugging. #BuildwithCMC"

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
