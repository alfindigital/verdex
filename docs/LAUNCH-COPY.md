# Launch copy — Verdex

Truthful copy pack for the hackathon post. Replace `<BUIDL_URL>` and `<VIDEO_URL>` with real URLs at publish time. Nothing below claims predictive accuracy, adoption, or a prize.

## X post (primary)

```
Most DEX "safety checks" stop at the contract.

CEL still shows $65K of pool depth — but the tape records ~13 swaps a day. A dead market wearing a live ticker.

Verdex reads the tape, not just the contract:
9 @CoinMarketCap endpoints → 4 deterministic checks + tape vitality → a stamped verdict with SHA-256 receipts you can re-verify.

<BUIDL_URL>
<VIDEO_URL>

#BuildwithCMC
```

## X post (shorter alt)

```
Paste a ticker → get an evidence file, not a vibe.

Verdex: deterministic DEX-token verdicts on @CoinMarketCap data — every claim backed by a hashed receipt, every failing row named, missing data shown as unknown.

130 verdicts on file. Zero AI required to run the rules.

<BUIDL_URL> #BuildwithCMC
```

## Reply/comment lines (optional, if thread format)

```
The honest parts matter: missing evidence shows "unknown", replays are labelled replays, and the AI second opinion never writes the rules — it's printed as a probability next to its disagreement.
```

```
On a 59-label hand-checked set: 4/6 collapsed tokens caught, 0 zombie tokens stamped clean. The naive baselines we compared against stamp 5–6 of 7 zombies entry-safe. Full method + limits: <BUIDL_URL>
```

## YouTube / video description

```
Verdex — don't be the exit liquidity.

A pre-trade evidence desk for DEX tokens, built for the CoinMarketCap API hackathon. One scan pulls 9 CMC endpoints; every raw response body is frozen with a SHA-256 receipt. A deterministic rules engine (v2.3.0) scores four dimensions — SAFETY, FLOW, LIQUIDITY, PUMP — plus tape vitality: how fast the last 100 swaps accumulated.

Shown in this cut: RAY (caution — 92% of the tape in 5 wallets), CEL (high-risk flags — a collapsed lender's token on ~13 swaps/day), and the receipt chain you can re-hash yourself.

Live replay archive: https://verdex.web.id
Code: https://github.com/alfindigital/verdex

Disclosures: verdicts describe observed evidence in a fixed window, not future price movement; the AI second opinion is advisory only; thin L2 tapes can false-flag. Built with the CoinMarketCap API. #BuildwithCMC
```

## DoraHacks Q&A prompts (if the form asks)

**What problem does it solve?**
DEX token pages show contract checks; they don't show whether anyone can actually get out. Verdex measures observed behavior — maker concentration, sell-side existence, LP activity, tape vitality — on top of provider security fields, and stamps a falsifiable verdict.

**Why is the CMC integration essential?**
All evidence comes from CMC endpoints: `/v1/dex/search`, `/v1/dex/tokens/transactions`, `/v1/dex/token/pools`, `/v1/dex/liquidity-change/list`, `/v1/dex/security/detail`, `/v1/dex/token`, `/v1/global-metrics/quotes/{latest,historical}`, `/v3/fear-and-greed/latest`. Each response body is stored with a SHA-256 receipt, so every verdict is independently re-verifiable.

**What makes it different?**
Verdicts are falsifiable — each names the metric that would flip it. Missing data degrades coverage instead of pretending to be zero. The corpus is replayable offline: 130 archived verdicts, no key needed to judge. An AI second opinion (Jev) is cross-examined against the rules and printed with its disagreement — it never overrides them.
