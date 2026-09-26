# HANDOFF — Verdex (CMC API Hackathon)

**Status: PRODUCTION READY** — live https://verdex-alpha.vercel.app · repo `alfindigital/verdex` · updated 2026-09-26.

## Post-audit remediation (2026-09-26)

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
  disclosure, unclassified/unknown-level rules), README (85 tests, ~9 calls,
  6→9 snapshots, live policy), TECH_SPEC (paths/contracts), PRODUCT_SPEC F7.
- Snapshots re-harvested post-fix: 9 committed (FLOKI·BONK·CAKE·ORCA·WIF·
  PEPE = JANGAN; UNI·HOGE = RAWAN-85; TITANO = RAWAN-20 low-conf).
  10 coverage attempts toward LAYAK/BELUM — none landed; logged honestly
  (window-calibrated strictness is documented in CLAIMS).

## What this is
DEX-native token forensic tool: deterministic rules verdict (LAYAK/RAWAN/JANGAN/BELUM_CUKUP_BUKTI) over 4 evidence dimensions (SAFETY, FLOW, LIQUIDITY, PUMP) + Jev (TypeSafe) per-dimension second opinion + auditable API receipts + shareable verdict pages.

## Current state (post-audit)
- `jevCrossExamine` (src/lib/jev.ts): 1 call → 4 noul questions → `dims` + mean `riskyProb`; full key rotation; rules verdict excluded from Jev state (independence).
- `agreement()`: ≥3/4 comparable dims sign-match → consensus/contested; fallback aggregate band.
- `resolveToken` returns `{token, receipt}` — every CMC call incl. resolution is receipted.
- Confidence `high` = ≥100 swaps (CMC hard cap; `offset`/`page` ignored — live-probed).
- Rules verdict is authoritative; Jev/UI never overrides it. `docs/CLAIMS.md` = source of truth for thresholds; `THRESHOLDS` exported → viz consumes same constants.
- Unit convention: taxes & priceChange stored as **fractions** (0.003 = 0.3%); metrics.frac() normalizes `>1 → /100` defensively.

## Verify
```bash
pnpm install && pnpm exec tsc --noEmit && pnpm test && pnpm build
# Expected: tsc clean · 74/74 tests · build pass
```
Demo mode works without keys (`VERDEX_LIVE` unset). Live needs `CMC_API_KEY` (+ optional `TYPESAFE_API_KEY`, `GROQ_API_KEY`).

## Deploy
Push to `main` → Vercel auto-deploys. Vercel CLI `--token` does NOT accept the OIDC token — use the GitHub integration path only.

## Next actions (user-side)
1. Record ~90s demo video — script updated 2026-09-25 in SUBMISSION.md (FLOKI consensus / ORCA contested arc).
2. Submit DoraHacks (SUBMISSION.md has copy + exact form fields).
3. Post X draft (SUBMISSION.md §X post draft), replace BUIDL link.

## Known limitations (documented in CLAIMS §Keterbatasan)
- No OHLCV on Basic tier → no intraday sweep analysis.
- No wallet labels → maker concentration only, not "smart money".
- Swap window = latest 100 txs; legacy snapshots lack `jev.dims` (UI degrades gracefully).
