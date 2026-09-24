# DoraHacks submission pack — Verdex

## Links

- **Live demo**: https://verdex-alpha.vercel.app
- **Repo (public)**: https://github.com/alfindigital/verdex
- **Shareable verdicts** (committed snapshots, real CMC data):
  - FLOKI (BSC) → ENTRY-WORTHY: https://verdex-alpha.vercel.app/verdict/e2c087a9cc2b
  - WIF (Solana) → AVOID: https://verdex-alpha.vercel.app/verdict/aff8a4e8d2a7
  - BONK (Solana) → CAUTION: https://verdex-alpha.vercel.app/verdict/3ba71827286a
  - CAKE (BSC) → CAUTION: https://verdex-alpha.vercel.app/verdict/e0c9de28f103

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
2. (10–25s) Paste FLOKI BSC address → Check → verdict card animates in: ENTRY-WORTHY 85/100. Point at the 4 sub-verdicts.
3. (25–45s) Scroll: FLOW shows 63 unique makers, 30 third-party sells, top-5 share 0.68 → WARN flag explained. "This is the honeypot check nobody automates."
4. (45–60s) Jev panel: P(risky)=0.18, consensus badge. "Two independent judges. When they disagree, we show it."
5. (60–75s) Open Evidence receipts — endpoint, params, credits, SHA-256. "Every number auditable."
6. (75–90s) WIF verdict (AVOID) via /verdict/aff8a4e8d2a7 + falsifier box. Close: "Structure tells you could it rug. Verdex tells you is it rugging. #BuildwithCMC"

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

## Checklist for submission form

- [ ] Public repo: https://github.com/alfindigital/verdex
- [ ] Demo link: https://verdex-alpha.vercel.app
- [ ] Demo video/screen recording attached
- [ ] X post contains DoraHacks link + video + #BuildwithCMC
- [ ] Endpoints named in description (done above)
- [ ] "Where the API got in the way" section (done — README)
- [ ] Track: Markets & Trading Tools
