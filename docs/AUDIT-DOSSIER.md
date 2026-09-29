# VERDEX — Audit Dossier (Complete Blueprint for Independent 360° Audit)

> **Purpose of this file:** a single self-contained dossier an external auditor can use
> to audit Verdex end-to-end — product, code, claims, deployment, economics, and
> limitations — **without** needing the author's narration. Every claim here points to
> a file, line, commit, or live URL so it can be falsified independently.
>
> Compiled: **2026-09-27** · Repo HEAD: `25152c1` (branch `main`) · Live deploy: Vercel auto-deploy per push.

## Current execution addendum — 2026-09-29

This dossier is a historical audit baseline. The current implementation review was
completed in isolated branch `codex/verdex-evidence-v2` from base `a1abade`.
Use [`HANDOFF.md`](../HANDOFF.md), [`docs/evidence/validation-matrix.md`](evidence/validation-matrix.md),
and [`docs/SUBMISSION-CHECKLIST.md`](SUBMISSION-CHECKLIST.md) as the current release
status; the tables below are not a claim that the old live deployment is still
available or that its old observations are current.

- Replay is the judging path. V2 live is opt-in only when `VERDEX_V2=1` and
  `VERDEX_LIVE=1` are both set, with server-only credentials and fail-closed quota
  permission.
- The current branch passed 164 tests, typecheck, evidence verification, docs
  verification, production build, and redacted gitleaks history scanning.
- Current CMC tier entitlement, pagination behavior, fresh raw-body capture, real
  bundle replay, production smoke, mobile contrast, and trader utility remain
  **UNVERIFIED** because no credential or participant/deployment authorization was
  supplied in this execution.
- The dependency audit still reports 4 high and 2 moderate transitive advisories;
  no forced upgrade was made. See the validation matrix for the exact follow-up.
- Vercel's first auto-deploy for `abd1e04` failed during pnpm install because the
  old build-script policy was not accepted by pnpm 11. The policy is now explicit
  (`esbuild: true`, `sharp: true`), frozen install passes, and a manual deploy is
  being rechecked against the production alias.
- The manual deploy then exposed a second clean-room issue: root `tsconfig.json`
  included `video/remotion.config.ts` without installing video dependencies. The
  root config now excludes `video/`; the Remotion package is checked separately.

## Historical dossier snapshot

---

## 0. Identity & All URLs

| Item | Value |
|---|---|
| Product | **Verdex** — deterministic pre-buy verdict engine for DEX tokens |
| Track | DoraHacks "Build with CMC: API Hackathon" — **Markets & Trading Tools** |
| Deadline | 2026-09-30 23:59:59 UTC |
| Live app | https://verdex-alpha.vercel.app |
| Repo (public) | https://github.com/alfindigital/verdex |
| Local workspace | `C:\Users\GEEKOM A8\Documents\Crypto\cmc-api-hackaton` |
| BUIDL page | **NOT YET CREATED** — `SUBMISSION.md` still contains `buidl/XXXX` placeholder |

### Stable demo URLs (slug-routed, survive re-harvest)

| Verdict | URL | Result |
|---|---|---|
| GMX (Arbitrum) | https://verdex-alpha.vercel.app/verdict/gmx-arbitrum | ENTRY-WORTHY 100, consensus |
| AAVE (Ethereum) | https://verdex-alpha.vercel.app/verdict/aave-ethereum | CAUTION 70, contested |
| UNI (Ethereum) | https://verdex-alpha.vercel.app/verdict/uni-ethereum | CAUTION 70, contested |
| LINK (Ethereum) | https://verdex-alpha.vercel.app/verdict/link-ethereum | CAUTION 85, contested |
| SUSHI (Ethereum) | https://verdex-alpha.vercel.app/verdict/sushi-ethereum | AVOID 45, contested |
| COMP (Gnosis) | https://verdex-alpha.vercel.app/verdict/comp-gnosis | AVOID 30, lean |
| FLOKI (BSC) | https://verdex-alpha.vercel.app/verdict/floki-bsc | CAUTION 85, contested |
| TITANO (BSC) | https://verdex-alpha.vercel.app/verdict/titano-bsc | CAUTION 20, low confidence |
| PEPE (Ethereum) | https://verdex-alpha.vercel.app/verdict/pepe-ethereum | CAUTION 85, contested |
| WIF (Solana) | https://verdex-alpha.vercel.app/verdict/wif-solana | CAUTION 85 |

All 34 snapshots also reachable by legacy hex id (`/verdict/<12-hex>`). Full slug map: `snapshots/index.json`.

### API surface (public)

| Route | Method | Behavior |
|---|---|---|
| `/api/verdict` | POST `{query, platform?, pick?}` | Live: analyze via CMC (9–10 credits). Demo (VERDEX_LIVE unset): replay committed snapshots only. |
| `/api/verdict?id=<hex-or-slug>` | GET | Load verdict JSON (snapshot → runtime dir). |
| `/verdict/[id]` | GET | SSR verdict page + dynamic OG image (`/verdict/[id]/opengraph-image`). |

---

## 1. Goal & Problem Being Solved

**Question the product answers:** *"is this token behaving like a rug right now?"* — not *"could this contract rug?"*

- Contract scanners (RugCheck, TokenSniffer, GoPlus) inspect static structure; honeypot.is simulates **one** test trade — which sophisticated traps can whitelist-game.
- Traders lose money on DEX tokens that pass every contract check while insiders manufacture the market.
- Verdex reads **~100 real recent swaps** per token from CoinMarketCap DEX data and scores **observed behavior**: maker breadth, top-5 maker USD concentration, third-party sell ability, LP pulls, volume sanity.
- Output is a stamped verdict: `LAYAK` (entry-worthy) / `RAWAN` (caution) / `JANGAN` (avoid) / `BELUM_CUKUP_BUKTI` (insufficient evidence).

**Target user:** DEX trader seconds before buying a small/new token — a pre-entry go/no-go filter, not a trading strategy (no price prediction, no sell signals, no TA).

**Why DEX only:** CEX order flow is internal (makers invisible); rug-pull risk lives on-chain. Verdex is honest about scope.

---

## 2. Product Evolution (for context)

```
ProofEdge (Monte Carlo signal validator, IDX-port)
  → abandoned: CMC Basic has no OHLCV depth needed
Claim Court / ApeCheck (deterministic claim-verification concept)
  → Verdex (DEX token verdict engine, narrowed & sharpened)
```

Pivot rationale: Basic tier lacks OHLCV (12-month aggregated lookback only); "regime board / DEX radar" ideas rejected as redundant dashboards; ~40 BUIDL competitors audited in `docs/research/COMPETITORS.md` — none do deterministic, receipt-backed verdicts.

---

## 3. Architecture & How It Works

### Stack

- **Next.js 15** (App Router) + TypeScript strict. Server holds all keys; client only receives the verdict JSON.
- **3 runtime deps total**: `next@15.5.26`, `react@19.3.0`, `react-dom@19.3.0`. Dev: tailwind v4, vitest, tsx.
- Deployed on **Vercel** (serverless, `runtime = "nodejs"`).

### Request pipeline (live mode)

```
POST /api/verdict {query, platform?, pick?}
  → input validation (typed body, pick int 0..49, 400 on malformed)
  → live-guard: per-IP cap 30/day + global 200/day + quota circuit-breaker
      (probes /v1/key/info ≤1×/15min; credits_left<1000 → 429 hard-pause;
       probe failure fails OPEN — caps still bound the damage)
  → engine/analyze.ts
      → resolve token (dex/search; ambiguous → candidate list, never silent-pick)
      → parallel fetch (each failure → INSUFFICIENT degrade, never crashes):
          dex/tokens/transactions (≤100 swaps — CMC hard cap, offset ignored)
          dex/token/pools          (pool depth, 24h vol)
          dex/liquidity-change/list (LP add/remove events)
          dex/security/detail       (riskCode isHit flags + taxes + level)
          dex/token                 (meta; creator crt/own excluded from stats)
          market ctx: global-metrics latest + historical + fear-and-greed
      → engine/metrics.ts  (4 dimensions of normalized metrics)
      → engine/rules.ts    (sub-verdicts → composite + falsifier)
      → lib/jev.ts         (TypeSafe Jev noul per-dim second opinion, optional)
      → engine/narrator.ts (Groq LLM narration, optional; template fallback)
  → VerdictRecord JSON → persisted to data/verdicts/<id>.json (best-effort)
```

### Authoritative vs advisory layers

- **Rules engine is the only verdict authority.** Jev and the narrator can never change it.
- **Jev** (`jev-1.13.0` via `api.typesafe.ai/v1/systemone`): one call, four `noul` questions (safety/flow/liquidity/pump) over the computed metrics JSON. The rules verdict is deliberately **excluded** from Jev's state → independent judgment. `riskyProb` = mean of dims. Timeout 10s, key-pool rotation, failure → `available:false`.
- **Narrator** (`narrator.ts`): OpenAI-compatible call (Groq `llama-3.3-70b-versatile` by default; env-overridable base/model). Input is computed metrics only; prompt forbids new facts; ≤4 bullets; any failure → deterministic template that names metrics+thresholds. UI labels it honestly ("AI NARRATION · TEMPLATE" vs llm source).

### Determinism & replayability

- `id = sha256(`${address}:${ts}:${randomUUID}`).slice(0,12)` — random component defeats same-ms collisions.
- Every CMC call emits a **receipt**: `{endpoint, sorted params, ts, credit_count, sha256(response body), cached}` — 9 receipts per verdict (~306 total across snapshots).
- Snapshots committed to `snapshots/*.json` = replayable evidence. `snapshots/index.json` maps stable slugs → current ids.
- Demo mode serves snapshots for zero credits; live mode burns ~9–10 credits/verdict.

---

## 4. The Rules — Every Published Threshold

Full canonical doc: `docs/CLAIMS.md`. Summary:

### SAFETY (dex/security/detail)
| Condition | Level |
|---|---|
| isHit `honeypot` / `rug_pull` / `unusual_sell_tax`, or sellTax > 10% | **DANGER** |
| isHit `wash_trading`, `whitelist_function`, `low_liquidity`, `unusual_buy_tax` | WARN |
| isHit centralization flags (`mintable`, `pausable`, `blacklist(_function)`, `upgradeable`/`proxy`, `owner_change_balance`, `hidden_owner`) — real admin powers = rug vectors, flagged **by name** | WARN |
| Any other unclassified `isHit` (fail-closed — never silently dropped) | WARN |
| `securityLevel` ≠ `safe` (incl. unknown levels) | WARN |
| No report at all / endpoint failure | INSUFFICIENT |

### FLOW (dex/tokens/transactions; window = latest ≤100 swaps)
| Metric | CLEAN | WARN | DANGER |
|---|---|---|---|
| `thirdPartySellCount` (sells by ≥3 unique non-pool non-creator makers) | ≥3 | 1–2 | **0 with ≥20 buys** |
| `uniqueMakers` | ≥20 | 5–19 | <5 |
| `top5MakerShare` (top-5 maker USD share) | <0.50 | 0.50–0.70 | >0.70 |
| `netBuyRatio` (buyUSD−sellUSD)/totalUSD | >0 | −0.2..0 | <−0.2 |
| `swaps < 50` → dimension INSUFFICIENT | | | |

**Mature-asset tier (published):** `mcapUsd ≥ $100M` → `top5MakerShare` & `netBuyRatio` capped at WARN (arb-dominated on-chain flow of large caps is weak rug evidence). Insider-exit rows stay full-severity. `mcapTier` row shown in FLOW. `mcapUsd` null → early tier (fail-strict). The $100M boundary is an intentional published cliff, not a continuum.

### LIQUIDITY (liquidity-change/list + token/pools)
| Metric | CLEAN | WARN | DANGER |
|---|---|---|---|
| `netLpDelta` | ≥0 | −10%..0 | <−10% of total liq |
| `maxSinglePullPct` (biggest remove vs **that pool**; unknown pool → total liq) | <15% | 15–50% | >50% |
| `totalLiqUsd` | ≥$10k | <$10k | — |
| `poolCount` 0 → INSUFFICIENT | | | |

### PUMP (search stats + swaps + market ctx)
| Metric | CLEAN | WARN | DANGER |
|---|---|---|---|
| `volMcapRatio` (24h) | <0.5 | 0.5–1.0 | >1.0 |
| `makersPer100kVol` (unique makers per $100k **of the same swap window**) | ≥5 | 1–5 | <1 |
| +30% 24h while BTC.D rising & F&G <30 | — | WARN | — |

### Composite (evaluated in order — proven red flags outrank missing data)
- Any DANGER in SAFETY/FLOW → **JANGAN**
- DANGER in LIQUIDITY/PUMP, or ≥2 WARN → **RAWAN**
- Any INSUFFICIENT (no DANGER, <2 WARN) → **BELUM_CUKUP_BUKTI**
- All CLEAN + score ≥70 → **LAYAK**; otherwise → RAWAN
- Score = 100 − penalties (DANGER −40, WARN −15, INSUFFICIENT −25 per dim), clamped 0–100
- Confidence: `high` = ≥100 swaps + zero INSUFFICIENT · `medium` = 50–99 · `low` = <50

### Jev agreement (contested-wins)
- (a) per-dim: sign match on ≥3 comparable dims → dim-consensus
- (b) aggregate band: riskyProb ≥0.65 risky / ≤0.35 safe — contradicts verdict polarity → contested; middle → `lean`
- Final badge: **contested if either path contests**; consensus only when both agree; `unavailable` if Jev can't answer.

### Falsifier
Lists **every** failing row (name, value, threshold) — uncapped since commit `3ce7463`.

---

## 5. Snapshot Corpus (real harvested evidence, recomputed 2026-09-26)

| Stat | Value |
|---|---|
| Records | **34** (all real CMC calls, committed, replayable) |
| Distribution | 30 CAUTION · 3 AVOID · 1 ENTRY-WORTHY |
| Jev agreement | 26 contested · 7 lean · 1 consensus |
| Confidence | 32 high · 2 low |
| Chains | 7 (Ethereum, Solana, BSC, Polygon, Arbitrum, Optimism, Gnosis) |
| Receipts | 306 total (9/verdict) |
| AVOID | SUSHI (<$100M strict tier), AAVE-Polygon (9M mcap, netBuy −0.94), COMP-Gnosis (dead market: 3 makers, $17 liq) |
| BELUM_CUKUP_BUKTI | **0 in corpus** — 16+ harvest attempts; thin tokens still trip WARN/DANGER elsewhere. Disclosed honestly. |

Harvester: `scripts/harvest.ts` (rebuilds `index.json` after each run).

---

## 6. UI/UX Walkthrough

- **`/` homepage**: hero verdict logic legend (AVOID/CAUTION/ENTRY rules verbatim), live/snapshot badge, scan input (address/ticker) + chain chips, stats rail (verdicts on file, swaps analyzed, receipts, chains, avg score), **case_files table** (34 rows: token, chain, mcap, liq, net flow, 3P sells, score, Jev P + agreement glyph) linking via stable slugs.
- **`/verdict/[id]`**: stamp + score gauge + confidence + agreement badge; four dimension panels with per-metric mini-charts (SplitBar buy/sell, maker donut, threshold markers); `upgradeable`-style flag chips; falsifier panel; AI-narration panel (labeled source); collapsible receipts table (9 CMC calls w/ SHA-256); dynamic OG image per verdict.
- **Checker states**: skeleton while fetching; typed-error box with **clickable snapshot suggestions** when demo mode returns 403; honest 404 copy ("tickers collide across chains — we never silently pick one"); ambiguous candidate table with per-row pick.
- a11y: skip-link, aria-labels on gauge/score, keyboard-selectable candidate rows (`onKeyDown` Enter).

---

## 7. Security, Secrets & Abuse Controls

- Keys live only server-side env: `CMC_API_KEY`, `TYPESAFE_API_KEYS` (pool, rotates), `GROQ_API_KEY`, `VERDEX_LIVE` — Vercel envs are `sensitive/secret`; `.env.local` gitignored; only `.env.example` (placeholders) tracked.
- Secrets sweep over S7 diff range: clean (DeepInvestigator verified — all hex hits were receipt SHA-256s).
- Input validation: `query` non-empty string, `platform` string, `pick` int 0..49 → 400 (was 500 before).
- XFF: rightmost entry trusted (Vercel chain semantics; leftmost spoofable).
- Live caps: 30/IP/day + **200 global/day** + **quota circuit-breaker** (`/v1/key/info`, floor 1000 credits/month). Map eviction on day rollover when >10k entries.
- **Honest caveat:** in-memory counters are per-serverless-instance — a floor, not a hard cross-instance limit. The quota probe is the real monthly-budget guard. No shared store (Upstash) wired yet.

---

## 8. Failure & Robustness Model

- Every endpoint failure degrades its dimension to INSUFFICIENT and lands in `failures[]` — a verdict is never blocked by one bad call; nothing fails silently.
- CMC client: 15s `AbortSignal.timeout`; ≤3 attempts; retries transport errors, HTTP 5xx/429, and envelope codes 500–599 **only** — permanent codes (1001 invalid key, 1006 plan-restricted) fail fast.
- Jev: 10s timeout + key rotation → `available:false`, never blocks verdict.
- Narrator: 8s timeout → template fallback.
- Persist: try/catch (read-only fs tolerated).
- GET validates id/slug regex; ambiguous queries never auto-pick.

---

## 9. How to Run & Verify (auditor reproduction)

```bash
pnpm install
pnpm vitest run      # 97 tests, 9 files — all green at HEAD
pnpm exec tsc --noEmit
pnpm build           # next build — clean

# demo mode (zero credits): unset VERDEX_LIVE → committed snapshots only
pnpm dev             # http://localhost:3000

# live mode: .env.local needs CMC_API_KEY (+ optional TYPESAFE_API_KEYS, GROQ_API_KEY)
VERDEX_LIVE=1 pnpm dev

# re-harvest snapshots (burns ~9 credits/token):
pnpm snapshot <address-or-name>@<Platform> ...
```

Test layout (all inline fixtures, no fixture dir):
`tests/` — cmc-client(6) · dex(9) · metrics(14) · rules(35) · jev(14) · analyze(10 incl. **mcap→composite wiring**) · narrator(2) · verdict-card(4) · live-guard(3).

Key env vars: `CMC_API_KEY` (required live), `TYPESAFE_API_KEYS` (comma pool), `GROQ_API_KEY` or `NARRATOR_BASE_URL/API_KEY/MODEL`, `VERDEX_LIVE` (`"1"` live).

---

## 10. File Map (complete)

```
app/
  page.tsx                       homepage: hero, scan, stats, case_files table (slug links)
  layout.tsx, globals.css, icon.png
  api/verdict/route.ts           POST validation + live-guard + analyze + persist; GET by id/slug
  verdict/[id]/page.tsx          SSR verdict page (loadVerdict, notFound)
  verdict/[id]/opengraph-image.tsx  dynamic OG image per verdict
src/
  engine/analyze.ts              orchestrator: resolve→fetch→metrics→rules→jev→narrate
  engine/metrics.ts              flow/liq/pump/safety normalizers
  engine/rules.ts                THRESHOLDS, sub-verdicts, composite, falsifier, mature tier, taxonomy
  engine/narrator.ts             LLM narration w/ deterministic template fallback
  lib/cmc-client.ts              fetch+receipt+cache, 15s timeout, 3 attempts (5xx/429/envelope-5xx only)
  lib/dex.ts                     search/resolve/fetchers + token meta (creator) + market ctx
  lib/jev.ts                     TypeSafe cross-examination + agreement (contested-wins)
  lib/live-guard.ts              per-IP cap, global cap, /v1/key/info quota circuit-breaker
  lib/verdict-store.ts           snapshot+runtime loader, slug index resolution
  components/checker.tsx         scan UI (loading/error/suggestion/ambiguous states)
  components/verdict-card.tsx    verdict rendering (stamp, dims, jev, falsifier, receipts)
  components/viz.tsx             charts (SplitBar, donut, threshold markers)
scripts/   harvest.ts (snapshot harvester + index.json) · logo.ts
snapshots/ 34 verdict JSONs + index.json (slug map)
docs/      CLAIMS.md (published rules) · research/{API_CAPABILITY,COMPETITORS,KANDIDAT,PLAN}.md · AUDIT-DOSSIER.md (this file)
specs/     TECH_SPEC.md · PRODUCT_SPEC.md
tests/     9 files, 97 tests
demo-shots/ demo-home.png · demo-verdict.png (re-captured post-S7)
Root:      README · SUBMISSION.md (judges copy) · HANDOFF.md · LICENSE · environment.yaml
```

---

## 11. Claims, Positioning & Business Value

**Actual differentiators** (corrected after external roast — we do NOT claim "first behavior-based"):
- CMC-native end-to-end (built for this hackathon's data specifically).
- Published deterministic thresholds + replayable receipts w/ SHA-256.
- Real observed history (~100 swaps by distinct wallets) vs 1 simulated tx — whitelist-gaming resistant.
- Dual-judge with **visible disagreement** (26/34 contested badges are evidence, not decoration).
- Maturity-aware calibration — published, not a hidden allowlist.

**Business value (stated):** the verdict+falsifier+receipt bundle is embeddable — pre-trade risk gate for wallets / DEX aggregators / sniper bots needing an auditable "why" per flag (B2B API-as-a-service).

**Competitor research:** `docs/research/COMPETITORS.md` + SUBMISSION §Positioning (vs CMC Witness, Middleman, Argus, MarketSentinel; vs RugCheck/TokenSniffer/GoPlus/honeypot.is/RugRadar/xAxios).

---

## 12. Known Limitations & Honest Disclosures (nothing hidden)

- **No rigorous backtest** — needs labeled rug dataset + historical OHLCV (unavailable on Basic). Validation = unit tests + real snapshots + adversarial audits, not backtest claims.
- **In-memory caps are per-instance** — floor, not hard global limit (documented in code+README); quota probe is the real guard.
- **$100M mature boundary is a cliff** — a token at $99.9M gets strict tier; mcap volatility can flip tier between harvests. Documented as intentional.
- **Window = latest ≤100 swaps** (CMC cap; offset/page ignored) — fast rugs between windows may not appear in the same window as the pump.
- **No wallet labels** — concentration, never "smart money" claims.
- **Coordinated wash trading** across many wallets can mimic organic breadth — partially covered by `wash_trading` flag + concentration.
- **0 BELUM_CUKUP_BUKTI in corpus** despite 16+ attempts — honest disclosure, not hidden.
- **mcapUsd missing (e.g., TITANO)** → early tier fail-strict — could penalize a large token whose mcap fetch failed.
- **Jev & narrator are optional third-party deps** — verdict correctness never depends on them; snapshots carry template narrations.
- **Snapshot ids change per re-harvest** — mitigated by stable slugs (index.json); hex links are per-run.
- **Demo video not recorded; BUIDL page not created** — `buidl/XXXX` placeholder outstanding (user-side task).

---

## 13. Audit History (evidence trail)

| Date | Audit | Result |
|---|---|---|
| 2026-09-26 | P0+P1 remediation sprint S1–S6 + DeepInvestigator #1 | APPROVED; BUG-1 (medium: unknown-level suppressed isHit) + 8 others fixed/documented; 87 tests |
| 2026-09-26 | External roast (Claude): calibration defect on majors, Jev consensus badge bug, 1-metric falsifier, per-IP cap insufficiency, positioning overclaim | ~85% accurate; S7 implemented per user choice (maturity tiers, not allowlist) |
| 2026-09-26 | S7 + re-harvest 34 + DeepInvestigator #2 | APPROVED 9/9 w/ file:line evidence + bit-identical snapshot recomputation; LOW residue fixed (`3ce7463`) |
| 2026-09-26 | Self 360° audit → 8 recs all shipped | TECH_SPEC sync, slugs, quota circuit-breaker, tests, GROQ env, demo-shots, .gitignore, CLAIMS note (`2af6228`, `25152c1`) |

**Open known gaps flagged by auditors:** `analyze.ts` mcap wiring now tested (was a gap); `allowLive`/quota paths now tested via live-guard tests; jev dim-level "consensus" at 3/4 with aggregate band aligned is published semantics — a single contested pair can still render consensus when the aggregate agrees (documented, deliberate).

---

## 14. Suggested Audit Probes (for the independent auditor)

1. Re-run `composite()` over any `snapshots/*.json` metrics — stored verdict/score/falsifier must be bit-identical.
2. Verify every threshold in `docs/CLAIMS.md` exists in `rules.ts THRESHOLDS`.
3. POST malformed bodies to `/api/verdict` (non-string query, pick=-1/99) → expect 400, never 500.
4. Check `snapshots/index.json` slugs resolve: `/api/verdict?id=<slug>`.
5. Inspect receipts: endpoint list, sorted params, sha256 presence, `cached` flag semantics.
6. Grep diff range `8c89f6f..HEAD` for secrets; confirm only `.env.example` tracked.
7. Confirm no token allowlist exists: grep `rules.ts` for symbol/address constants (there are none — only thresholds).
8. Confirm Jev never mutates the verdict: `analyze.ts` returns `result` computed before jev is awaited.

---

## 15. Addendum — Second Independent Audit (2026-09-27) & Resolutions

External auditor score: **6/10 → 8.5/10** conditional on fixes below. Their P0 claim (all verdict
pages 404, homepage serving old hex corpus) was verified **stale** — it captured a pre-deploy window;
live re-probe post-audit shows all slug pages 200 and the new 30/3/1 corpus. The underlying
architectural fragility was real, however, and is now fixed:

| Finding | Resolution |
|---|---|
| `force-dynamic` verdict routes (fs read per request on serverless) | `/verdict/[id]` + `opengraph-image` now `generateStaticParams` (68 paths baked: 34 hex + 34 slugs) + `dynamicParams=true` for live ids + `outputFileTracingIncludes` for `./snapshots/**` |
| `pnpm-workspace.yaml` literal placeholders (`"set this to true or false"`) | removed bogus `allowBuilds` block; `onlyBuiltDependencies` retained |
| `next/font/google` build-time fetch | fonts self-hosted (`next/font/local`): Archivo variable + IBM Plex Mono static TTFs in `app/fonts/` |
| No share affordance | "share on X" intent link on every verdict page + `metadataBase` set |
| SUBMISSION framing | explicit "verdict = 100% CMC data + deterministic rules; Jev/narrator optional" + originality note added |
| "Live mode appears demo-only" | **Incorrect** — prod POST /api/verdict performs live CMC search (verified: GMX → ambiguous candidates with real mcap) |
| Startup-tier DEX OHLCV upgrade | Probed `/v1/dex/{pairs,spot-pairs}/ohlcv/*` on current key (plan: 450k credits/mo) → all return `system busy` — treated as unavailable; proxy PUMP metrics retained, documented |
| Homepage hex links | Already slugs in committed code (auditor saw stale HTML) |
| Re-harvest churn on ids | Corpus **frozen** until submission — no more harvests |
