# HANDOFF — Verdex (CMC API Hackathon)

**Status: PRODUCTION READY** — live https://verdex-alpha.vercel.app · repo `alfindigital/verdex` · updated 2026-09-25.

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
1. Record ~90s demo video (scan → verdict card → receipts → share page).
2. Submit DoraHacks (SUBMISSION.md has copy).
3. Optional: refresh committed snapshots so `jev.dims` shows on featured verdicts.

## Known limitations (documented in CLAIMS §Keterbatasan)
- No OHLCV on Basic tier → no intraday sweep analysis.
- No wallet labels → maker concentration only, not "smart money".
- Swap window = latest 100 txs; legacy snapshots lack `jev.dims` (UI degrades gracefully).
