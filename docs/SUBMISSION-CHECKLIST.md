# Submission checklist — Verdex

Status: **not submitted** as of 2026-09-29. This checklist separates local evidence from publishing actions that require the owner.

## Local release evidence

- [x] Track selected: Markets and Trading Tools.
- [x] Replay works without a CMC key from committed snapshots.
- [x] Synthetic LP outage is labelled synthetic and yields insufficient coverage.
- [x] Identity selection sends platform/address, not a search index.
- [x] Evidence verifier passes the reviewed synthetic bundle.
- [x] Full tests, typecheck, docs verifier, build, and gitleaks pass; see [`validation-matrix.md`](evidence/validation-matrix.md).
- [x] README, demo walkthrough, and handoff describe the current V2/replay boundary.
- [x] Production alias returns HTTP 200 and an archived verdict API path returns HTTP 200.
- [x] Fresh authorized CMC raw-body captures verified: 18 capture files across 8 chains (Solana/Ethereum/Arbitrum/Base/BSC/Optimism/Polygon/Gnosis), 9 endpoints HTTP 200 each, exact-body bundles verify and replay to matching verdicts (`data/captures/`, `tests/fixtures/cmc/real-capture-*.json`, `scripts/replay-capture.ts`).
- [x] Rich dossier shipped: profile, market, per-window activity (5m/1h/4h/24h/1m), pool register, swap & LP tapes, security register, macro context — EX-D1..D7 in verdict page.
- [x] Snapshot corpus deduplicated per canonical identity: 41 unique snapshots, 41 slugs, ~3,900 swaps represented; replays stamp `mode: replay`.
- [x] Jev second-opinion smoke test passed (`scripts/jev-smoke.ts`: available, dimension probabilities, agreement=contested vs RAWAN).
- [x] Logo concepts: 8 candidates in `public/logo-concepts/` (a/b/c + new D–H); verdict-stamp (D) and exhibit-tag (E) strongest.
- [x] 5 new video variants rendered (`video/out/verdex-{delta,epsilon,zeta,eta,theta}-*.mp4`), typecheck clean, TL timing rebuilt from real VO durations.
- [x] Mobile 390px pass recorded on production (`demo-shots/mobile-390-home.png`, `demo-shots/mobile-390-verdict.png`).
- [ ] Three consenting trader utility checks recorded.
- [x] Dependency audit advisories reviewed and remediated (`pnpm audit --prod` clean after patched transitive overrides).

## DoraHacks fields

- BUIDL name: `Verdex`
- Vision: `Make what was observed before a DEX swap checkable with source-backed evidence.`
- Track: `Markets and Trading Tools`
- GitHub: `https://github.com/alfindigital/verdex` (verify visibility)
- Project website: `https://verdex-alpha.vercel.app` (production alias verified); **final domain `verdex.web.id`** pending Cloudflare provisioning
- Logo: `public/logo.png` (verify form size); 7 alternates in `public/logo-concepts/` if a refresh is wanted
- Demo video URL: **not published**
- X/social URL: **not published**

## Owner-only publishing steps

1. Open the live/replay deployment in a fresh browser and verify a snapshot URL.
2. Record the final video using [`docs/DEMO-WALKTHROUGH.md`](DEMO-WALKTHROUGH.md). Review every claim and timestamp.
3. Create the DoraHacks BUIDL and accept the participant terms yourself.
4. Upload/publish the video and post the X announcement with the real BUIDL URL and `#BuildwithCMC`.
5. Paste the real URLs here, submit the form, and capture the confirmation page/URL.

No URL is invented in this checklist. Do not mark the entry submitted until the confirmation page is captured.
