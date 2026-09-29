# HANDOFF — Verdex (CMC API Hackathon)

## Current execution state — 2026-09-29

**Implementation status:** Tasks 1–8 executed in isolated worktree branch `codex/verdex-evidence-v2`. The branch is ready for review, not pushed or deployed.

- Base: `a1abade` · latest implementation commits: `ca1b051`, `9755da7`, `cf4c7c1`, `8cc36af`, `87c15df`, `a24eae8`, `8e5b135`, `f4df122`.
- Verification: full suite 18 files / 164 tests passed; `pnpm typecheck`, evidence verifier, docs verifier, production build, and redacted gitleaks history passed.
- Runtime policy: replay unless `VERDEX_V2=1` and `VERDEX_LIVE=1` are both set. Live requires server env key and fresh quota permission; unknown quota fails closed.
- New evidence contract: `schemaVersion: 2`, `rulesVersion: 2.0.0`, nullable coverage/metrics, source statuses, exact body hashes when retained, explicit `share.kind`.
- Share policy: only committed snapshot ids get durable paths/X links. Live/runtime results are transient and exportable without a permanent link.
- Known unverified items: authorized fresh CMC raw capture and current tier/pagination, 390px automated contrast, consenting trader utility study, three real raw bundle replay, browser download transfer event, deployment smoke test, and dependency audit remediation.
- Dependency review item: `pnpm audit --prod --json` reports 4 high and 2 moderate transitive advisories in Next/PostCSS/optional sharp. No forced upgrade was made.
- Install policy: `pnpm-workspace.yaml` now explicitly allows only `esbuild` and `sharp` build scripts. `pnpm install --frozen-lockfile` passes locally and is required for Vercel's pnpm 11 install path.
- Boundary policy: the root Next typecheck excludes the Remotion `video/` workspace; video dependencies are verified separately with `npm run lint` and `npm run build` inside `video/`.

Use [`docs/evidence/validation-matrix.md`](docs/evidence/validation-matrix.md), [`docs/DEMO-WALKTHROUGH.md`](docs/DEMO-WALKTHROUGH.md), and [`SUBMISSION.md`](SUBMISSION.md) as the current handoff. The historical notes below describe earlier states and are not the current release status.

## Historical — post-audit remediation (2026-09-26)

P0+P1 roast findings remediated in isolated sprints (see `.goal/out/S*.md`):

- `makersPer100kVol` now same-window (makers per $100k of OBSERVED window USD)
  — liquid tokens no longer auto-flagged wash.
- Composite: LAYAK requires all CLEAN (was: allowed 1 WARN — diverged from
  CLAIMS). Unknown `securityLevel` → WARN (fail-closed). Unclassified `isHit`
  codes surface as `unclassifiedFlags` WARN row.
- `maxSinglePullPct` per-pool denominator (was: total liquidity).
- `dex/token` meta call wired — `creator`/`own` excluded from third-party sells.
- Market-context calls (gm/latest, gm/historical, fng) now in `receipts[]` +
  `failures[]` — 9 receipts per verdict.
- `cmc-client`: 15s timeout + retry ×2 on 5xx/429 only (permanent codes
  fail fast). Route: `pick` bounds validated; per-IP live cap 30/day;
  `GET /api/verdict?id=` serves snapshots via `loadVerdict`.
- Maker keys lowercased; pools excluded from maker stats.
- Docs synced: CLAIMS (precedence order, $10k warn, per-pool pull, window
  disclosure, unclassified/unknown-level rules), README (87 tests, ~9 calls,
  6→9 snapshots, live policy), TECH_SPEC (paths/contracts), PRODUCT_SPEC F7.
- Snapshots re-harvested post-fix + widened (commit 57b5955), then again
  post-S7 (commit 33017bc): **34 committed** across 7 chains — 1 LAYAK
  (GMX, score 100, Jev consensus), 30 RAWAN, 3 JANGAN (SUSHI, AAVE-Polygon,
  COMP-Gnosis).
  16 coverage attempts → no pure BELUM_CUKUP_BUKTI landed (dead tokens
  still trip warns/dangers); documented honestly. TITANO + VGX carry the
  low-confidence showcase path.

## Historical — product description
DEX-native token forensic tool: deterministic rules verdict (LAYAK/RAWAN/JANGAN/BELUM_CUKUP_BUKTI) over 4 evidence dimensions (SAFETY, FLOW, LIQUIDITY, PUMP) + Jev (TypeSafe) per-dimension second opinion + auditable API receipts + shareable verdict pages.

## Historical — state before the 2026-09-29 overhaul
- `jevCrossExamine` (src/lib/jev.ts): 1 call → 4 noul questions → `dims` + mean `riskyProb`; full key rotation; rules verdict excluded from Jev state (independence).
- `agreement()`: ≥3/4 comparable dims sign-match → consensus/contested; fallback aggregate band.
- `resolveToken` returns `{token, receipt}` — every CMC call incl. resolution is receipted.
- Confidence `high` = ≥100 swaps (CMC hard cap; `offset`/`page` ignored — live-probed).
- Rules verdict is authoritative; Jev/UI never overrides it. `docs/CLAIMS.md` = source of truth for thresholds; `THRESHOLDS` exported → viz consumes same constants.
- Unit convention: taxes & priceChange stored as **fractions** (0.003 = 0.3%); metrics.frac() normalizes `>1 → /100` defensively.

## Historical — verify commands
```bash
pnpm install && pnpm exec tsc --noEmit && pnpm test && pnpm build
# Expected: tsc clean · 74/74 tests · build pass
```
Demo mode works without keys (`VERDEX_LIVE` unset). Live needs `CMC_API_KEY` (+ optional `TYPESAFE_API_KEY`, `GROQ_API_KEY`).

## Historical — deploy notes
Push to `main` → Vercel auto-deploys. Vercel CLI `--token` does NOT accept the OIDC token — use the GitHub integration path only.

## Historical — 2026-09-26 S7 calibration sprint (post-roast)
- **Mature-asset tier (published):** `mcapUsd ≥ $100M` → `top5MakerShare`/`netBuyRatio` cap at WARN; insider-exit rows (`thirdPartySells`, `uniqueMakers`) keep full severity. `mcapTier` row shown in FLOW. AAVE/UNI/LINK now CAUTION, not AVOID.
- **Safety taxonomy:** `mintable|pausable|blacklist|upgradeable|owner_change_balance|hidden_owner` → named `centralizationFlags` WARN row (was generic `unclassifiedFlags`).
- **Jev agreement:** contested-wins — dim-level consensus AND aggregate band must both agree; AAVE-style cases now show `contested` honestly.
- **Falsifier** lists every failing row.
- **Global live cap:** 200 scans/day across all IPs + 30/IP/day — protects the ~15k/month CMC quota (in-memory, documented floor).
- Re-harvested all 34 snapshots: **30 CAUTION / 3 AVOID / 1 ENTRY-WORTHY (GMX 100, consensus)**. SUSHI (<$100M) and COMP/Gnosis (dead market) correctly stay AVOID.
- 93 tests · tsc clean · build clean.

## Historical — 2026-09-27 S8 independent-audit remediation
- **Verdict routes now static:** `/verdict/[id]` + `opengraph-image` use `generateStaticParams` (68 baked paths = 34 hex + 34 slugs) + `dynamicParams=true`; `force-dynamic` removed; `outputFileTracingIncludes` keeps `snapshots/**` in the serverless bundle for on-demand ids.
- **Fresh-install fix:** bogus `allowBuilds` placeholders removed from `pnpm-workspace.yaml`.
- **Fonts self-hosted:** `next/font/local` (Archivo variable + Plex Mono static) — no Google Fonts fetch at build.
- **Share-on-X** intent link on verdict pages; `metadataBase` set.
- **Live mode is ON in prod** (POST `/api/verdict` → live CMC search verified); quota breaker + caps protect the monthly budget. Corpus **frozen** — no re-harvest before submission.
- **OHLCV probe:** `/v1/dex/*/ohlcv/*` on current key (450k credits/mo plan) returns `system busy` on every variant → unavailable; proxy PUMP metrics retained.
- SUBMISSION.md: Jev framed as optional advisory over 100%-CMC deterministic verdict; originality note added.
- 97 tests · tsc clean · build clean (68 static verdict paths prerendered).

## Historical — 2026-09-27 demo video v2
- v1 (77a4e25) judged too slow → full rework. Three compositions at
  `video/src/Variant{A,B,C}.tsx`, shared real-data layer `data.ts`,
  motion primitives `motion.tsx`, VO track via `@remotion/media`.
- A `SlamCut` (word-slam + stamp shake + CutBar), B `EvidenceTape`
  (persistent chrome, scrolling real sha256 ticker, progress rail —
  recommended), C `VerdictField` (color-field wipe + count-up).
- Deepgram `aura-2-orion-en` voiceover (9 segments, video/public/vo/),
  s4c at playbackRate 1.06 to fit its window.
- Renders verified via ffprobe: 90.048s, h264+AAC, 1920×1080, 30fps.
  Files in `video/out/` (gitignored): verdex-A-slamcut.mp4,
  verdex-B-evidencetape.mp4, verdex-C-verdictfield.mp4.
- Commit `1bb92ac` pushed.

## Historical — next actions (user-side)
1. Pick one variant from `video/out/` → upload to YouTube → paste URL.
2. Submit DoraHacks (SUBMISSION.md has copy + exact form fields).
3. Post X draft (SUBMISSION.md §X post draft), replace BUIDL link.

## Historical — known limitations (documented in CLAIMS §Keterbatasan)
- No OHLCV on Basic tier → no intraday sweep analysis.
- No wallet labels → maker concentration only, not "smart money".
- Swap window = latest 100 txs; legacy snapshots lack `jev.dims` (UI degrades gracefully).
