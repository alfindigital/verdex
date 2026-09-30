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
- [x] Fresh authorized CMC raw-body captures verified: 120+ capture sets across 9 chains (Ethereum/Solana/Base/BSC/Arbitrum/Optimism/Polygon/Gnosis/Avalanche), 9 endpoints HTTP 200 each, exact-body bundles verify and replay to matching verdicts (`data/captures/`, `tests/fixtures/cmc/real-capture-*.json`, `scripts/replay-capture.ts`).
- [x] Rich dossier shipped: profile, market, per-window activity (5m/1h/4h/24h/1m), pool register, swap & LP tapes, security register, macro context — all seven dossier sections in the verdict page.
- [x] Snapshot corpus deduplicated per canonical identity: **301 unique snapshots** (LAYAK 8 · RAWAN 189 · JANGAN 103 · BELUM_CUKUP_BUKTI 1), slug-routed stable URLs; replays stamp `mode: replay`. All 301 records on `rulesVersion 2.4.0` with live Jev cross-exam (8 consensus · 43 lean · 250 contested) — see `docs/CLAIMS.md`.
- [x] Header polish: anchor nav (scanner/cases/files/method), honest replay/live chip with tooltip, icon-only GitHub link, persisted dark/light toggle (paper-desk light palette), verified live at `verdex.web.id`.
- [x] External-review fix (`rulesVersion 2.2.0` → `2.3.0`): dust-liquidity DANGER→JANGAN, then tape vitality (`swapsPerDay` <15/day = dead tape) — CEL/HOGE now JANGAN, TITANO/VGX at score 0. Labeled-set eval (`scripts/eval-verdicts.ts`, 59 labels): 4/6 dead caught, 0/7 faded stamped clean, 3/46 major false-positives on thin L2 tapes — misses printed not hidden.
- [x] Baseline comparison (`scripts/eval-baselines.ts`): on the same 59 labels, a security-flags-only judge stamps 5/7 zombie tokens clean and misses all dead tapes; liquidity-only baselines stamp 6/7 zombies clean. Verdex trades 3 major FPs for zero zombie greens — documented as an indication, not statistics.
- [x] Outcome recheck infrastructure (`scripts/recheck-outcomes.ts`): re-fetches 59 labeled tokens live, diffs price/liquidity vs dossier — first run 59/59 HTTP 200, sub-24h window, no predictive claim yet.
- [x] Jev second-opinion smoke test passed (`scripts/jev-smoke.ts`: available, dimension probabilities, agreement=contested vs RAWAN).
- [x] Logo: **concept A "Verdict Scanner" adopted** as `public/logo.png` + `app/icon.png` favicon; original archived as `logo-legacy-original.png`, 7 alternates in `public/logo-concepts/`.
- [x] 5 video variants **re-rendered on rules 2.3.0 data** (`video/out/verdex-{delta,epsilon,zeta,eta,theta}-*.mp4`): fresh VO (edge-tts), TL timing re-probed from real audio, all on-screen numbers re-derived from the current corpus — CEL dead-tape exhibit replaces the retired SUSHI case.
- [x] Mobile 390px pass recorded on production (`demo-shots/mobile-390-home.png`, `demo-shots/mobile-390-verdict.png`).
- [ ] Three consenting trader utility checks recorded.
- [x] Dependency audit advisories reviewed and remediated (`pnpm audit --prod` clean after patched transitive overrides).

## DoraHacks fields

- BUIDL name: `Verdex`
- Vision: `Make what was observed before a DEX swap checkable with source-backed evidence.`
- Track: `Markets and Trading Tools`
- GitHub: `https://github.com/alfindigital/verdex` (verify visibility)
- Project website: **`https://verdex.web.id`** (apex 200, www→apex 308, SSL issued); `verdex-alpha.vercel.app` remains as Vercel alias
- Logo: `public/logo.png` — concept A "Verdict Scanner" (verify form size)
- Demo video URL: **not published**
- X/social URL: **not published**

## Owner-only publishing steps

1. Open the live/replay deployment in a fresh browser and verify a snapshot URL.
2. Record the final video using [`docs/DEMO-WALKTHROUGH.md`](DEMO-WALKTHROUGH.md). Review every claim and timestamp.
3. Create the DoraHacks BUIDL and accept the participant terms yourself.
4. Upload/publish the video and post the X announcement with the real BUIDL URL and `#BuildwithCMC`.
5. Paste the real URLs here, submit the form, and capture the confirmation page/URL.

No URL is invented in this checklist. Do not mark the entry submitted until the confirmation page is captured.
