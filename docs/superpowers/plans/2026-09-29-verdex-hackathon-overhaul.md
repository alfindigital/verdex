# Verdex Hackathon Evidence Overhaul Implementation Plan

> **For agentic workers:** Gunakan skill `executing-plans` untuk menjalankan task berurutan. Gunakan `subagent-driven-development` hanya jika pengguna memilih eksekusi dengan subagent. Checklist di bawah belum dieksekusi. Pengguna meminta planning dahulu dan akan memindahkan eksekusi ke agent lain.

**Goal:** Membuat pemeriksaan risiko DEX yang benar pada data tidak lengkap, dapat dijelaskan lewat evidence, dan dapat didemonstrasikan ulang selama judging.

**Architecture:** Pertahankan Next.js App Router, adapter CMC, pure metrics, dan pure rules. Tambahkan kontrak coverage/provenance dan evidence bundle di batas adapter-engine. Jalur sprint tidak memerlukan database: live result inline dan JSON download; hanya committed replay memiliki public permalink.

**Tech Stack:** Next 15.5.26, React 19.3.0, TypeScript, Tailwind 4, Vitest 3, pnpm; Node crypto untuk hashing, filesystem hanya untuk fixture/replay lokal. Versi dicatat dari package.json, bukan rekomendasi upgrade.

**Spec:** Bagian 1–5 dokumen ini adalah design brief; evidence/temuan: `docs/audits/2026-09-29-hackathon-review.md`.

**Status:** Draft lengkap untuk review pengguna. Scope yang belum dijawab menggunakan default eksplisit di bawah. Tidak ada izin implisit untuk langsung mengimplementasikan, deploy, submit, menerima terms, atau memposting atas nama pengguna.

## 1. Baseline, keputusan, dan scope

- Repo: `C:/Users/GEEKOM A8/Documents/Crypto/cmc-api-hackaton`; remote https://github.com/alfindigital/verdex.
- Baseline audited: `9512cee3145660fe1ffc66cdb9cc4d0addf53e8e`.
- Live: https://verdex-alpha.vercel.app. Main auto-deploy menurut HANDOFF: push main diperlakukan sebagai deployment.
- Audit 29 Sep: 97 tests, typecheck, build lulus; gitleaks history exit 0. Ini baseline, tidak menggantikan tes perubahan.
- Pertahankan Verdex, Markets and Trading Tools, English UI, Indonesian planning.
- Persona: trader DEX yang sudah memiliki address dan chain, hendak memeriksa flag sebelum swap; bukan investor mencari prediksi harga.
- Pekerjaan utama pengguna: memastikan aset benar, memahami flag dan data yang hilang, memeriksa transaksi pendukung, menyimpan hasil untuk diperiksa ulang.
- Default anggaran infra baru $0. Tidak membangun login, billing, wallet connect, bot, auto-trading, MCP, RWA, atau indexer.
- Target internal final submission: 30 Sep 2026 20:00 WIB. Deadline tertulis resmi 30 Sep 23:59 UTC, sekitar 1 Okt 06:59 WIB; cek ulang halaman resmi sebelum pengiriman.
- Jawaban pending: batas perombakan/budget/waktu agent dan apakah BUIDL/video/X sudah terbit. Default bukan izin spending. Jika jawaban mengubah scope, revisi plan dulu, jangan menjalankan dua desain berbeda.

### Strategi yang dipilih untuk draft

Pertahankan 4 dimensi, namun presentasikan **flags + coverage + receipts**. Positive state berarti tidak ada flag di sample yang memenuhi syarat, tidak berarti layak dibeli. Data hilang tidak menjadi nol. “Third-party independent seller” diganti observasi maker yang lebih terbatas. AI tidak dibutuhkan untuk verdict maupun demo; sprint memakai template deterministik dan tidak menunggu Jev.

Pilihan sharing tanpa infra: public URL hanya untuk snapshot/replay committed; live mempunyai tombol Download evidence dan Copy token identity, bukan permanent share. Ini menghilangkan janji rusak sambil mempertahankan workflow inti. Durable sharing adalah opsi pasca-sprint di bagian 12, bukan task prerequisite tersembunyi.

## 2. Global constraints

1. Baca master `C:/Users/GEEKOM A8/.agents/AGENTS.md` dan handoff lokal. Satu writer per path. Jangan menghapus artefak tanpa izin pengguna.
2. Sebelum kode, minta pengguna menyetujui rencana ini; catat scope final di handoff. Setelah disetujui, jalankan tanpa approval ulang untuk task rutin di scope.
3. Gunakan branch `codex/verdex-evidence-v2` pada checkout terisolasi bila diperlukan. Baca attachments worktree dan reuse yang tersedia. Jangan push main tanpa otorisasi deployment.
4. Production keys hanya server env. Tidak menampilkan `.env.local`, log headers auth, atau nilai secret dalam evidence. Caller tidak boleh menentukan base URL/endpoint upstream.
5. Jangan mengganti dependency/toolchain saat bug produk belum beres. Tidak menjalankan package manager install di checkout milik agent lain.
6. Semua hasil baru `schemaVersion:2`, `rulesVersion:'2.0.0'`. Semua snapshot lama tetap v1; tidak mengganti tanggal/label historis atau mengarang raw response yang hilang.
7. Batas API awal per audit eksekusi: maksimum 5 full live scans + 4 capability probes. Hitung receipt/call, bukan mengasumsikan 9 selalu sama dengan kredit aktual. Naikkan batas hanya setelah laporan hasil dan kebutuhan jelas.
8. Gunakan API resmi yang diizinkan, key peserta sendiri. Tidak menyalin implementasi kompetitor atau berpindah ke endpoint anonymous untuk menghindari rate/access limits.
9. Unknown bukan safe; fresh/replay/partial selalu terlihat. Missing angka tampil em dash dengan alasan, bukan $0.
10. “P(rug)”, “accuracy”, “calibrated”, “independent wallets”, “guaranteed exit”, “permanent record” hanya boleh dipakai bila evidence yang relevan benar-benar tersedia. Default sprint tidak memakai klaim tersebut.

## 3. Design brief dan kontrak lintas task

### 3.1 User flow

Home → input address/ticker dan chain → pilih identity pasti bila ambigu → scan bounded → hasil inline dengan nama/chain/address lengkap, label risiko dan coverage, tiga alasan utama → expand source/tx evidence → download bundle. Demo case terpisah membuka `/verdict/[id]`, jelas bertanggal dan berlabel archived. Tidak perlu akun atau biaya untuk replay.

Home copy:

> Inspect the evidence before a DEX swap.
> See observed sell activity, concentrated flow, liquidity changes, and missing data.

Tombol: `Inspect token`. Demo CTA: `Open recorded examples`. LIVE badge diganti `Live scan available` atau `Recorded examples only`, terpisah dari status tabel.

### 3.2 File ownership dan boundary

| File | Tanggung jawab |
|---|---|
| `src/lib/address.ts` (baru) | Normalisasi chain, address identity, validasi maker/pool |
| `src/lib/verdict-types.ts` (baru) | Tipe transport v1/v2, source coverage, evidence; tanpa React/fs/fetch |
| `src/lib/dex.ts` | Parse response aktual, candidate identity, timestamps, valid/rejected rows |
| `src/lib/cmc-client.ts` | Request deadline/cache, exact body hashing, source metadata; server-only |
| `src/engine/metrics.ts` | Pure metrics dari valid rows; tidak menyembunyikan null |
| `src/engine/coverage.ts` (baru) | Freshness/coverage policies, tidak memberi verdict ekonomi |
| `src/engine/rules.ts` | V2 risk findings, label precedence, checks to revisit |
| `src/engine/evidence.ts` (baru) | Menautkan metric ke source/rows; replay/export contract |
| `src/engine/analyze.ts` | Orchestration, status dependency, output V2; bounded partial completion |
| `src/lib/verdict-store.ts` | Baca snapshot v1/v2, exact permalink eligibility |
| `app/api/verdict/route.ts` | Input validation, mode, quota/deadline; response envelope |
| `src/components/checker.tsx` | Stable token selection, scanner state, abort dan race protection |
| `src/components/verdict-card.tsx` | Summary/risk/coverage, legacy adapter; pecah panel evidence bila perlu |
| `src/components/evidence-panel.tsx` (baru) | Source statuses, raw response, tx rows, full hashes, export |
| `app/page.tsx`, `app/globals.css` | Onboarding, layout/contrast, recorded examples |
| `app/verdict/[id]/{page,opengraph-image}.tsx` | Archived record rendering, exact canonical URL |
| `scripts/verify-evidence.ts` (baru) | Offline body hash + parser + metric/rule replay |
| `scripts/capture-evidence.ts` (baru) | Operator-controlled bounded fresh capture, explicit output location |
| `tests/fixtures/cmc/` (baru) | Small actual response fixtures + separately named synthetic cases |
| `docs/evidence/`, `public/evidence/` (baru) | Provenance/readme and reviewed public bundles |

Hindari circular import: `verdict-store` tidak mengimpor tipe dari React component. Pindahkan tipe lama apa adanya ke `verdict-types.ts`, lalu import ulang di component. V2 metrics/types boleh import pure engine types melalui `import type`.

### 3.3 Contract types

Tambahkan tipe berikut. `VerdictV1` adalah bentuk lama `VerdictRecord` yang dipindah dari component tanpa mengubah isi. `TokenRef`, `CompositeResult`, dan metric types tetap berasal dari modul yang sudah ada sampai task pemisahan selesai.

```ts
export type SourceKey = 'search' | 'swaps' | 'pools' | 'lp' | 'security' |
  'meta' | 'globalLatest' | 'globalHistorical' | 'fearGreed';
export type SourceStatus = 'ok' | 'empty' | 'failed' | 'unsupported' |
  'invalid' | 'timeout' | 'not-captured';
export type CoverageLevel = 'sufficient' | 'limited' | 'insufficient';
export type RiskLabel = 'NO_FLAGS_OBSERVED' | 'CAUTION' |
  'HIGH_RISK_FLAGS' | 'INSUFFICIENT_EVIDENCE';
export interface SourceEvidence {
  key: SourceKey;
  status: SourceStatus;
  endpoint: string;
  params: Record<string, string | number>;
  fetchedAt: string;
  cached: boolean;
  providerAt: string | null;
  httpStatus: number | null;
  credits: number | null;
  bodySha256: string | null;
  bodyBase64: string | null; // exact UTF-8 response bytes, never request headers
  evidenceKind: 'exact-body' | 'receipt-only' | 'none';
  parserVersion: string;
  acceptedRows: number;
  rejectedRows: number;
  reason: string | null;
}
export interface ObservationWindow {
  firstSwapAt: string | null;
  lastSwapAt: string | null;
  validSwaps: number;
  rejectedSwaps: number;
  duplicateRows: number;
  requestedLimit: number;
  fetchedPages: number;
  truncated: boolean;
}
export interface Coverage {
  level: CoverageLevel;
  reasons: string[];
  checkedAt: string;
  stale: boolean;
  exclusionStatus: 'creator-owner-known' | 'partial' | 'unknown';
  dimensions: Record<'SAFETY'|'FLOW'|'LIQUIDITY'|'PUMP', CoverageLevel>;
}
export interface RecheckCondition {
  dimension: 'SAFETY'|'FLOW'|'LIQUIDITY'|'PUMP';
  metric: string;
  observed: number | string | null;
  requirement: string;
  reason: string;
}
export interface EvidenceSummary {
  source: SourceKey;
  rowIndexes: number[]; // original source row positions, zero-based
  metric: string;
  explanation: string;
}
export interface VerdictV2 extends Omit<VerdictV1, 'result'> {
  schemaVersion: 2;
  rulesVersion: '2.0.0';
  mode: 'live' | 'replay';
  computedAt: string;
  sourceRecordId: string | null;
  result: VerdictV1['result'] & {
    label: RiskLabel;
    recheck: RecheckCondition[];
  };
  coverage: Coverage;
  window: ObservationWindow;
  sources: SourceEvidence[];
  evidence: EvidenceSummary[];
  context: {
    btcDom: number | null;
    btcDomDelta7d: number | null;
    fearGreed: number | null;
  };
  share: { kind: 'snapshot' | 'none'; path: string | null };
}
export type StoredVerdict = VerdictV1 | VerdictV2;
```

Compatibility: `result.verdict/score/confidence/falsifier` retained for existing consumers, but V2 UI uses label/coverage/recheck. Legacy score labelled `legacy heuristic score`; do not compare it numerically with AI probability. V2 `confidence` is deprecated compatibility output: sufficient→high, limited→medium, insufficient→low; never label it accuracy. V2 falsifier becomes a joined representation of recheck requirements without promise of a flip.

V2 compatibility mapping: NO_FLAGS_OBSERVED→LAYAK, CAUTION→RAWAN, HIGH_RISK_FLAGS→JANGAN, INSUFFICIENT_EVIDENCE→RAWAN. The last mapping is a conservative legacy transport value, not an observed risk finding; all V2 consumers must use `label`. Never show LAYAK as V2 user-facing copy. Keep legacy score calculation as a secondary heuristic using V2 severities; do not award clean points for unavailable dimensions or display a score when overall coverage is insufficient. Legacy v1 files and their recorded results are never recomputed under v2 rules.

Implementation typing requirement: inspect every inherited V1 metric field before adopting the `Omit` sketch above. Omit and redeclare any field whose V2 metrics become nullable; do not use type assertions to force null into number-only legacy interfaces. Define V2 flow/liquidity/pump metric types with nullable unavailable values and migrate their engine/UI consumers together. `observedSellMakers` replaces the semantic claim behind `thirdPartySells` in V2; retain the old field only in the legacy adapter. Transport must not mix old and new meanings under one field.

Failure-source invariant: record attempted `fetchedAt`, null `providerAt`/body/hash when no body was received, and a sanitized reason. A received error response may have exact bytes only after secret review, but never feeds market metrics. `empty` means a successfully validated empty list; it is distinct from failed parsing. Add `cached:boolean` to SourceEvidence and preserve original fetchedAt on cache hits. Future source/swap timestamps over 60 seconds beyond checkedAt are invalid; do not use them to pass freshness.

### 3.4 Coverage and label policy (exact sprint decisions)

- Fresh response budget: providerAt/fetchedAt age <=15 minutes at `checkedAt`. Missing/invalid providerAt displayed as unknown source time; fetchedAt is not silently called market time.
- FLOW sufficient: >=50 unique valid swap events, zero rejected rows, valid first/last times, last swap age <=15 minutes, maker identity usable, creator and owner coverage known or provider explicitly reports no such field with documented schema semantics. Otherwise limited/insufficient per below. First and last timestamps always shown; no “24h flow” claim.
- 1–49 valid swaps → FLOW insufficient. >=50 with rejected rows, unknown exclusions, timestamp missing, or stale last swap → FLOW limited. 0 valid swaps → insufficient. Last swap older than 15 minutes means insufficient for a positive live pre-trade clearance, regardless of count. This is a UX freshness policy, not an empirically calibrated market boundary.
- SAFETY requires a successfully parsed provider report. Flagged-but-partial data keeps observed warning/danger plus incomplete coverage. Unknown vendor level cannot become CLEAN.
- LIQUIDITY requires valid pools AND successful LP event response; an explicitly empty valid LP list means “no events returned in this response”, not no LP changes ever. Unknown event-to-pool mapping marks that metric unavailable, never substitutes total token liquidity. A zero/nonfinite denominator yields null.
- PUMP ratios require finite nonnegative volume and strictly positive market cap; missing macro fields disable counter-market interpretation and visibly mark its coverage. Liquidity/mcap from different endpoint scopes labelled separately, not silently reconciled.
- Source `failed/unsupported/invalid/timeout/not-captured` cannot contribute a CLEAN metric. Coverage reasons list each affected source once.
- Label precedence: (1) observed severe security finding → HIGH_RISK_FLAGS, including partial coverage disclosure; (2) all other known danger/warn findings → CAUTION; (3) no known flags but coverage not sufficient → INSUFFICIENT_EVIDENCE; (4) no flags and all required checks sufficient → NO_FLAGS_OBSERVED.
- Severe security = provider reports honeypot/rug_pull/unusual_sell_tax OR validated sellTax >0.10. Display “provider-reported”, not independently proven. Vendor flag true creates at least WARN even with no named code.
- Top5 share, netBuyRatio, few makers, absent observed sells, LP-change ratio and pump proxies are investigation flags, never independent proof of fraud. All these can produce CAUTION, not assert honeypot. Remove $100M severity cliff in V2 by capping concentration/direction at WARN on all assets; preserve the prior policy only in v1 archive rendering.
- Score remains secondary rule summary, not probability. Recheck conditions enumerate every blocking finding and every missing required input. NO_FLAGS_OBSERVED text: “No flags in this sample. A new flag or insufficient/stale evidence changes this assessment.”

### 3.5 API and resource policy

POST accepts `{query:string, platform?:string, selection?:{platform:string,address:string}}`; `query.trim().length` 1..128; `platform` normalized through an allowlisted chain map, max 32; JSON body <=4096 bytes measured while reading, not only Content-Length. Legacy `pick` either rejected 400 with explicit migration error or handled only in a temporary compatibility adapter pinned to the exact candidate set; selected design is **reject pick after same-release frontend update**.

Response `kind`: verdict/ambiguous/notFound retained. `ambiguous` includes original query and stable candidates. Selection must match a freshly resolved identity; chain mismatch→notFound, never cross-chain fallback. Invalid input 400, unavailable live mode 503 with replay links, budget exhausted 429 with retry information, unknown token 404. Partial upstream data returns a verdict with explicit coverage, not a generic 500.

Default request deadline 15 seconds. Per CMC attempt <=6 seconds, <=1 retry for transport/429/5xx if >=2 seconds remain; respect Retry-After only within remaining budget. UI abort at 20 seconds. Nine upstream calls are an estimate, actual receipts include retries/capability overhead separately. Jev/new LLM disabled for V2 sprint scans; historical advisory stays archived/labeled.

Cache: search 30s, swaps/pools/LP/security/meta 30s, macro context 300s, quota 60s. Preserve original source timestamps on cache hit; `cached:true` means retrieval reuse, not live market freshness. No broad new dependency needed. Per-instance coalescing is an optimization, explicitly not cross-instance rate limiting.

Quota permission: fresh successful quota check can authorize live; stale/missing/failed permission does not. Make concurrent probes share one in-flight promise. Keep floor 1000 until measured credit budget suggests otherwise; report this as operational policy. Default public mode during judging is replay-first with opt-in live only when server confirms capability/quota. Existing `VERDEX_LIVE=0` remains kill switch. Do not read/alter production env during planning.

## 4. Review focus: five failures that must be pinned

1. Provider LP outage with 100 healthy swaps must not produce NO_FLAGS_OBSERVED or sufficient overall coverage (Task 3).
2. Same ticker/address across chains, Solana case differences, and changed search ordering must not select another identity (Task 2).
3. Unknown side, empty maker, duplicate log row, and NaN USD must not create successful buy/sell evidence (Task 2).
4. Live result survives inline rendering/export without a false permalink; archived URLs open their exact record (Task 5).
5. Replayed/stale/full-count samples and conflicting flags must show age, missing data, and truthful recheck conditions (Tasks 3/6).

## 5. Delivery order and timeboxes

| Task | Output | Depends | Estimate |
|---|---|---|---:|
| 1 | Baseline/probe evidence and fixture contract | none | 1–2h |
| 2 | Identity and parsers | 1 | 2–3h |
| 3 | Coverage, rules and recheck | 2 | 3–4h |
| 4 | Exact evidence bundles and offline replay | 2,3 | 3–4h |
| 5 | Reliable route/runtime and sharing policy | 3,4 | 2–3h |
| 6 | Trader-facing UI and cases | 3,4,5 | 3–4h |
| 7 | Adversarial QA, CI, user utility check | 2–6 | 2–3h |
| 8 | Truthful submission/video/handoff | 6,7 | 2–3h |

Estimate total 18–26h, plus human publishing/review buffer. Run in dependency order. If actual time exceeds a task timebox by >50%, log blocker and cut optional work first. Never drop correctness, evidence honesty, or submission buffer to retain animation/AI/compare features.

Deadline fallback: reserve the final 4 hours before the internal submission target for documentation/video/link checks. First cut compare, new animations, new AI, and durable sharing (already outside core); next reduce real V2 demonstration bundles from 3 to 1, while retaining synthetic regression cases and labeling the smaller coverage. If V2 live still has a P0 at that cutoff, disable live and present a verified dated replay with its limitations; do not claim the unfinished live workflow works. If raw replay verification itself is unfinished, explicitly report the core evidence goal unmet and request a scope decision; do not quietly substitute old receipt hashes for reproducible evidence. Human publication time is additional to implementation estimates.

## Task 1: Freeze baseline and verify upstream contract

**Files:** create `docs/evidence/2026-09-29-capability-check.md`, `tests/fixtures/cmc/README.md`, small named response fixtures; do not change production source yet.

**Consumes:** existing endpoint functions and audit findings. **Produces:** documented actual field shape, timestamp units, identity semantics, and fixtures used by Tasks 2–4.

- [ ] Read audit and baseline source, check git status/other writers, create/reuse isolated checkout, record baseline SHA. Copy only approved local env configuration through secret-safe mechanism; never commit it.
- [ ] Run baseline `pnpm test`, `pnpm typecheck`, `pnpm build` separately and record each exit code. Do not rely on a combined command masking an earlier failure.
- [ ] Capture one response per required endpoint during one normal scan through the owned server key. Store response bodies only; remove auth headers and account-specific key-info content from public fixtures. Label capture timestamp, host, endpoint, params, and SHA-256 exact bytes.
- [ ] Inspect swap `ts,tp,ma,v,tx,f,h,lgid` existence/types; LP `ts,tp,tu,f,m`; token meta `crt,own`; security tax units/flag booleans. Missing field is documented, not inferred. Verify if `f` is genuinely pool address on this endpoint. If absent, leave pool linkage unknown, do not invent it from symbol or copy competitor schema.
- [ ] Bounded pagination probe: only if response/documentation exposes cursor, fetch two pages on the same authorized surface, compare `(tx,lgid)` identities, oldest/newest timestamps, and repeats. Max four calls total for capability probing. If no reliable cursor evidence, ship one page and change copy to “up to 100 recent swaps fetched”; never call it a universal CMC cap.
- [ ] Verify pricing/tier entitlement from official CMC docs/account capability; currently live success during event does not establish Basic availability. Record specific supported/unsupported endpoints. If future Basic can't be tested now, mark it unverified and keep replay as guaranteed judging path.
- [ ] Include two fixture classes: `real-*` with source timestamp/body hash and `synthetic-*` containing clearly synthetic fault cases. Do not imply injected outage or synthetic honeypot is a real detected scam.
- [ ] Commit named fixture/docs paths only after a redacted secret scan.

Acceptance: Task 2 can implement field parsing from explicit examples; no placeholder API schema, no unverified pagination claim, no secret request headers in fixtures.

## Task 2: Stable identity and validated rows

**Files:** new `src/lib/address.ts`, `src/lib/verdict-types.ts`, `tests/address.test.ts`, `tests/fixtures/cmc/synthetic-invalid.json`; modify `src/lib/dex.ts`, `src/engine/metrics.ts`, `src/engine/analyze.ts`, `tests/dex.test.ts`, `tests/metrics.test.ts`, `tests/analyze.test.ts`.

**Interfaces:**

```ts
canonicalChain(input: string): string | null;
canonicalAddress(platform: string, input: string): string | null;
tokenIdentity(platform: string, address: string): string | null;
type ParsedRows<T> = { rows: T[]; rejected: number; duplicates: number; reasons: string[] };
parseSwaps(raw: unknown, platform: string): ParsedRows<Swap>;
parseLiquidityEvents(raw: unknown, platform: string): ParsedRows<LiqEvent>;
// Extend Swap with sourceRowIndex and nullable logIndex; preserve raw source separately.
// getTokenMeta returns { creator: string|null; owner: string|null; receipt }.
// Flow calculation receives excluded addresses[], chain and exclusion status.
```

- [ ] Add identity tests first. Normalize EVM hex addresses lowercase only for known EVM chains; Solana keeps case. Map eth→Ethereum, bsc→BSC, sol→Solana, arb→Arbitrum, op→Optimism, polygon→Polygon, gnosis→Gnosis, base→Base, avalanche→Avalanche. Unsupported input rejects rather than selecting auto.

```ts
it('does not collapse case-sensitive Solana identities', () => {
  const a = 'Abcdefghijkmnopqrstuvwxyz123456789';
  const b = 'abcdef ghijkmnopqrstuvwxyz123456789'.replace(' ', '');
  expect(tokenIdentity('Solana', a)).not.toBe(tokenIdentity('Solana', b));
});
it('rejects missing maker and an unknown swap side', () => {
  const p = parseSwaps({ swaps: [{ ts: 1790630000000, tp: 'other', ma: '', v: 1 }] }, 'Ethereum');
  expect(p.rows).toHaveLength(0);
  expect(p.rejected).toBe(1);
});
```

- [ ] Add regression for requested BSC with Ethereum-only address result→notFound. Add reordered candidates test: stable selection chooses same address, never numeric index. Use full valid synthetic EVM addresses (`0x` + 40 hex) in tests.
- [ ] Implement parsers from Task 1 contract. Require recognized side, finite nonnegative USD, valid timestamp in documented unit, valid maker. Zero-dollar events may count as observations but not proof of economic sell capability; only positive-USD sells contribute observed seller metric. Reject future timestamps >5 minutes beyond capture clock as invalid.
- [ ] Dedup `(chain,tx,logIndex)` when log index exists. Without log index, dedup exact full-row fingerprint only; multiple distinct rows in one transaction remain. Report duplicates separately from malformed rows.
- [ ] Include creator AND owner in exclusion set. Unknown identity/meta never becomes known exclusion. Rename output key to `observedSellMakers` for V2; adapt legacy `thirdPartySells` only when rendering v1.
- [ ] Consistent denominator: top5MakerShare uses USD from the same eligible maker rows as numerator. Keep all-swap gross USD separately if shown. Do not divide non-pool numerator by pooled/infrastructure-inclusive volume.
- [ ] Change candidate callback contract to identity, but frontend change lands in Task 5/6 before deployment. Store query used for results, not mutable textbox state.
- [ ] Run `pnpm test -- tests/address.test.ts tests/dex.test.ts tests/metrics.test.ts tests/analyze.test.ts` and typecheck. Record failures and fix before moving on. Commit focused paths.

Acceptance: chain mismatch does not silently succeed; malformed rows cannot increase successful-sell evidence; mixed-case EVM identity merges, Solana does not; creator and owner excluded; duplicate logic preserves distinct swap logs.

## Task 3: Coverage propagation, safer labels, truthful recheck

**Files:** create `src/engine/coverage.ts`, `tests/coverage.test.ts`; modify metrics/rules/analyze and their tests, `docs/CLAIMS.md`.

**Interfaces:**

```ts
evaluateCoverage(sources: SourceEvidence[], window: ObservationWindow,
  exclusionStatus: Coverage['exclusionStatus'], checkedAt: string): Coverage;
labelRisk(subs: SubVerdict[], coverage: Coverage): RiskLabel;
buildRecheck(subs: SubVerdict[], coverage: Coverage): RecheckCondition[];
// analyze returns VerdictV2, including context, coverage, observation window.
```

- [ ] Reproduce F01 in an automated test before changing behavior: use valid full fixture set with only LP endpoint failing; expected updated label cannot be NO_FLAGS_OBSERVED.
- [ ] Write the exact precedence test table:

```ts
it.each([
  ['CLEAN','sufficient','NO_FLAGS_OBSERVED'],
  ['CLEAN','insufficient','INSUFFICIENT_EVIDENCE'],
  ['WARN','insufficient','CAUTION'],
  ['DANGER','insufficient','HIGH_RISK_FLAGS'],
] as const)('safety %s and coverage %s gives %s', (level, coverage, expected) => {
  const subs = [{dim:'SAFETY',level,metrics:[]}];
  const cov = {level:coverage,reasons:[],checkedAt:'2026-09-29T00:00:00Z',
    stale:false,exclusionStatus:'creator-owner-known',
    dimensions:{SAFETY:coverage,FLOW:coverage,LIQUIDITY:coverage,PUMP:coverage}} as Coverage;
  expect(labelRisk(subs as SubVerdict[],cov)).toBe(expected);
});
```

- [ ] Implement source status at guarded fetch boundary; propagate dependency availability to every metric. LP outage→unavailable LP delta/pull metrics; pool depth may still be reported. Meta outage→limited seller exclusion. Macro outage→unknown context; do not default fearGreed=100 or btc delta=0 in interpreted result.
- [ ] Add pure coverage tests at 0/49/50/100 swaps, timestamp null/future/stale, invalid rows>0, missing creator vs owner, partial severe flag, zero pool denominator and unknown LP pool.
- [ ] Remove full-count→high-confidence inference from V2 UI/data policy. `window` reports sample extent; `coverage` reports source completeness. A 100-swap sample from last week is insufficient for fresh clearance.
- [ ] Apply V2 severity policy exactly as §3.4. Remove mcap cliff from V2 behavior only. Add test same metrics at 99,999,999 and 100,000,000 produce same concentration severity. Do not use these tests as evidence of financial calibration.
- [ ] Replace falsifier templates with all recheck conditions. One-warning case must be listed. Two dangers improved to one still retain blocking condition; no sentence promises a label switch merely from fixing the first row.
- [ ] For liquidity, rename current-denominator ratio to `removalVsCurrentDepth` unless Task 1 proves pre-event liquidity. Do not report it as percentage of pool removed. Unknown mapping→null; never use total depth fallback.
- [ ] Publish rules version and rationale including unvalidated policy thresholds. Keep v1 data unchanged. Tests: `pnpm test -- tests/rules.test.ts tests/coverage.test.ts tests/analyze.test.ts tests/metrics.test.ts`; typecheck. Commit.

Acceptance: no failure or removal of evidence improves label to NO_FLAGS_OBSERVED; observed danger survives alongside incomplete status; every visible finding maps to one source/metric; no false flip promise.

## Task 4: Evidence bundle and reproducible replay

**Files:** create `src/engine/evidence.ts`, `scripts/verify-evidence.ts`, `scripts/capture-evidence.ts`, `tests/evidence.test.ts`, `public/evidence/README.md`; modify CMC client, analyze, shared types, package.json scripts, `tests/cmc-client.test.ts`.

**Interfaces:**

```ts
export interface EvidenceBundle {
  schemaVersion: 2;
  record: VerdictV2;
  manifest: { capturedAt: string; rulesVersion: string; parserVersion: string;
    origin: 'real-capture'|'synthetic-fixture'; completeRawEvidence: boolean };
}
verifyBundle(bundle: EvidenceBundle): { ok: boolean; errors: string[] };
// CmcResult<T> adds source: SourceEvidence, without exposing request headers.
```

- [ ] Add body integrity test using exact bytes and one-byte tamper:

Fixture setup for this and downstream tasks: create `tests/fixtures/cmc/real-complete-bundle.json` from the capture CLI after parser/rules stabilization. Create `tests/fixtures/cmc/synthetic-lp-outage-bundle.json` by feeding the same deterministic pipeline an explicitly failed LP source; set manifest origin to synthetic-fixture. Load JSON with `readFileSync` from project-root-relative paths and validate its schema before tests. In examples below, `realFixtureBundle` is the former parsed bundle and `lpFailureFixture` is the latter bundle's record. Never manufacture the real fixture's raw bodies from old snapshot metrics.

```ts
it('rejects changed raw bytes', () => {
  const bundle = structuredClone(realFixtureBundle);
  const source = bundle.record.sources.find(s => s.evidenceKind === 'exact-body')!;
  source.bodyBase64 = Buffer.from('{"data":"tampered"}','utf8').toString('base64');
  expect(verifyBundle(bundle).ok).toBe(false);
});
```

- [ ] Capture `await res.arrayBuffer()` once, hash those bytes, decode UTF-8 for JSON parsing, base64 for bundle. No parse/re-stringify before hashing. Keep body size cap 512KiB/source and total bundle 4MiB; oversized source becomes explicit unavailable evidence, never truncated bytes bearing original hash.
- [ ] Store CMC response fields only. Do not persist request headers, `.env`, key-info account/quota raw payload, or upstream secret-bearing URLs/errors. Key-info is operational permission, not public evidence.
- [ ] `verifyBundle` validates schema, checks exact-body hash, re-parses source responses, recomputes metrics/rules with original captured checkedAt, compares deterministic `result` and normalized metrics. Exclude UUID, execution duration, advisory AI, and replay-time UI mode from equality. Missing raw body means cannot fully replay, not PASS.
- [ ] Persist market context in the record. Add row references for positive-value sell makers, top-5 maker contributions, security flags, and LP events. Source row index must refer to original response, not reordered filtered-array position.
- [ ] Fixtures derived from real data can demonstrate observation, not labelled fraud. Create separately labelled synthetic outage/zero-sell cases to demonstrate policy behavior.
- [ ] `capture-evidence` is an operator CLI, not a public harvest route. Require explicit token identity and output directory, one token/run, max configured calls. Keep frozen old corpus; capture 3 meaningful real examples only after Task 3 rules stabilize.
- [ ] Add scripts `evidence:verify` and `evidence:capture`. Verifier accepts explicit bundle file path; fail nonzero on missing body/hash/rules drift. Render historical v1 as `receipt-only archive`; never fail the entire app due to a legacy record.
- [ ] Run `pnpm test -- tests/evidence.test.ts tests/cmc-client.test.ts`; run verifier offline against real fixture; change a byte in an in-memory copy and verify failure without altering the saved fixture. Commit.

Acceptance: one fresh published demo can be reproduced offline from response bytes to deterministic findings. Legacy absence is visible. Hash proves consistency with supplied bytes, not independent CMC authenticity or timestamp attestation.

## Task 5: Route resilience and honest sharing

**Files:** modify API route, CMC client, live guard, verdict store, page/OG routes, checker; add `tests/verdict-route.test.ts`, `tests/verdict-store.test.ts`, expand live guard/client tests.

**Interfaces:**

```ts
export interface AnalyzeSelection { platform: string; address: string }
export interface ScanBody { query: string; platform?: string; selection?: AnalyzeSelection }
snapshotPath(recordId: string): string | null; // only registered/committed ids
// POST returns VerdictV2 with share.kind='none'; snapshot loader sets replay metadata.
// GET continues to serve committed snapshots. Live ids are explicitly transient.
```

- [ ] Route tests first: malformed JSON, body >4096 bytes, 129-char query, invalid chain, invalid selection, old numeric pick all 400; valid unknown token 404; quota unknown 503 + snapshot references.
- [ ] Implement and test mode truth table: VERDEX_V2 unset/0→legacy recorded examples only; VERDEX_V2=1 with VERDEX_LIVE unset/0→recorded examples only; both flags 1→V2 live allowed only after quota/capability guard. The server derives home mode from this same helper. Disabling V2 must never reactivate the defective V1 live pipeline. Document both env names without secret values.
- [ ] Implement §3.5 deadlines with a shared AbortSignal through all fetches; stop launching retries when budget exhausted. Distinguish user abort from upstream unavailable in logs. Mock clock/fetch for deterministic tests; no production load test.
- [ ] Guard single-flight quota probe; if probe fails and no valid cached authorization, block live with clear replay option. Test concurrent requests wait for same probe and never see initial null as permission. Cache corrupt read→miss, not request crash. Keep all caps explicitly per-instance.
- [ ] Remove dependence on server disk for immediate display; return the record directly. Do not provide live permanent link. Local diagnostic persistence may remain best-effort but must not be the sharing contract.
- [ ] Implement `snapshotPath` by exact record id membership, not symbol-chain inference. `/verdict/[id]` share URL uses that exact record route. Stable demo slug may remain navigation alias, but dated export/share must identify original record.
- [ ] Home results get `Download evidence JSON`; archived result gets `Copy recorded-result link`. If a live result lacks raw evidence, export is still available but manifest completeRawEvidence=false. Export full contract using Blob URL with revocation; no new upload service.
- [ ] Demo mode resolves all matching records and presents ambiguity; candidate identity same as live. Remove snapshot-button dependency on stale selected chain by passing each item's platform explicitly.
- [ ] Bound UI run with AbortController, latest request id guard, disable candidate buttons during request; candidate clicks submit selected identity and original query, not current edited textbox/index. `aria-live` announces progress/completion/error.
- [ ] Store behavior regression:

Test setup: read the existing `snapshots/index.json`, resolve one actual registered snapshot through the store, and name it `knownFixtureRecord`; fail setup if the archive is empty. Use that same record as `legacyFixture` in Task 6 after confirming it is v1. No invented snapshot id is acceptable for the success test.

```ts
it('does not advertise an unregistered live record as a snapshot', () => {
  expect(snapshotPath('54811a2bf901')).toBeNull();
});
it('uses exact identity for an archived record link', () => {
  expect(snapshotPath(knownFixtureRecord.id)).toBe('/verdict/'+knownFixtureRecord.id);
});
```

- [ ] Browser validate API→inline card→export→offline verification, then open archived share in a separate tab. Record one live success and one simulated upstream failure in test environment. Keep output clearly labelled.
- [ ] Run route/store/client/guard tests and typecheck. Commit.

Acceptance: no clickable permanent link can point to a missing or different live result; deadline test finishes bounded; outage offers replay without false “live” result; stable selection survives reordered search.

## Task 6: Make the result useful to a trader

**Files:** app home/styles, checker, verdict-card, new evidence-panel, viz, OG route, `tests/verdict-card.test.ts`; new `docs/DEMO-WALKTHROUGH.md`.

**Consumes:** V2 contracts and exact snapshotPath. **Produces:** clear user journey that explains an observation, its limits, and what to inspect next.

- [ ] Home above-fold: one problem statement, input, chain selector, 3 recorded-case cards. Remove oversized empty space caused by stretching scanner against long stats panel; move engine counters to collapsed technical details.
- [ ] Recorded cases explicitly state date, token+chain, and finding. Choose cases by coverage/contrast of observations, not by desired green/red outcome. Show one normal observed-flow case, one concentrated/flagged case, one insufficient case. If insufficient is synthetic, label it before opening; never pass it as real CMC incident.
- [ ] Result first screen: full identity with copy button, timestamp UTC plus relative age, mode, risk label, separate coverage badge, three leading reasons. Show “observed sell makers”, not “independent wallets”. Add one concrete next inspection per reason: verify token identity, inspect example sell tx, inspect relevant vendor flag, refresh stale sample.
- [ ] Put original rows and explorer links in evidence panel. Use allowlisted verified explorer base per supported chain; if unknown chain, copy tx hash only. Do not create guessed explorer URLs. Expose full SHA with copy/download, source timestamp, status and exact endpoint version.
- [ ] V1 banner: “Archived assessment under legacy rules, captured [date]. Raw source bodies not retained.” Preserve its old verdict as historical output, never relabel current assessment. Do not use historical high confidence as current clearance.
- [ ] Remove public comparison of rules score vs transformed AI probability. Show historical Jev as optional archived model opinion in details. Template prose must not say “size accordingly” or imply that passing checks is an entry recommendation.
- [ ] Tests using server-rendered component HTML:

```ts
it('makes replay status and missing raw evidence explicit', () => {
  const html = renderToStaticMarkup(createElement(VerdictCard, {v: legacyFixture}));
  expect(html).toContain('Archived');
  expect(html).toContain('Raw source bodies not retained');
  expect(html).not.toContain('permanent record');
});
it('shows unknown liquidity as unknown rather than zero', () => {
  const html = renderToStaticMarkup(createElement(VerdictCard, {v: lpFailureFixture}));
  expect(html).toContain('LP evidence unavailable');
});
```

- [ ] Increase essential body/label text to 12–14px minimum; aim body 14–16px. Small essential text contrast >=4.5:1; status also textual. Keep dark visual identity but fix faint text token. Support 390px mobile and 1440px desktop, keyboard Enter/Tab, visible focus, reduced motion; long addresses wrap/copy, tables scroll only inside their panel.

Keep the existing `.test.ts` extension by importing `createElement` from React and `renderToStaticMarkup` from react-dom/server. Import VerdictCard using its actual export style. Fixture setup is specified in Tasks 4 and 5; the snippets are assertions to integrate into those test files, not standalone runnable programs.
- [ ] Manual demo script: select ambiguous ticker correctly → inspect reason → open source → observe missing-data example → export → open dated archive. Target a new user understanding main result and next check within 60 seconds; this is acceptance target until humans test it.
- [ ] Run component tests, typecheck, browser flow and contrast calculation. Save screenshots after final implementation (not mockups passed off as final). Commit.

Acceptance: reviewer can name token/chain, whether data is live or archived, main reason, missing evidence, and one next action without reading README.

## Task 7: Adversarial verification and release gate

**Files:** new `.github/workflows/ci.yml`, `docs/evidence/validation-matrix.md`, `docs/USER-CHECK.md`; expand tests for uncovered boundaries. Add no CI secrets for offline checks.

- [ ] Build validation matrix with case/input, expected state, observed state, command/screenshot, date, PASS/FAIL/UNVERIFIED. Required rows: chain mismatch, Solana case, reordered candidates, duplicate logs, missing maker, unsupported security, LP outage, stale100 swaps, malformed market number, unknown quota, cache corruption, request timeout, screenshot mobile, export hash tamper, archived permalink.
- [ ] Run full suite/typecheck/build separately. Run redacted gitleaks history. Run package-manager audit with sanitized output; report advisory and applicability rather than claiming “secure” from one scan. Do not force-upgrade breaking dependencies without scoped plan.
- [ ] Baseline measured toolchain is Node 24.15.0 and pnpm 11.24.0. Verify these exact versions with frozen-lockfile install in an isolated checkout, then pin packageManager/CI accordingly. Do not assume a local globally wrapped pnpm proves reproducibility. If clean installation fails, record the exact reason and resolve toolchain compatibility explicitly before selecting another version; no incidental dependency upgrades.
- [ ] CI order: install `--frozen-lockfile`, unit/regression tests, typecheck, evidence verifier, build. Build must work with CMC/Jev/Groq absent and mode replay. Add script to verify docs reference real fixture/endpoint paths and no submission `XXXX` in final pack.
- [ ] Model oracle: compare 10 hand-calculated synthetic boundary cases with engine, plus 3 real evidence bundles parsed/replayed. Synthetic oracle validates arithmetic/policy only. Do not call it fraud-detection accuracy or backtest returns.
- [ ] Utility test with 3 target traders (if available): give token address; ask “what would you inspect next and why?” Record real quotations only with participant consent; record time, errors, and whether live/archive was understood. Goal: 3/3 correct identity/mode, >=2/3 correct explanation/source navigation within 60s. No invented participants or success metrics if unavailable.
- [ ] Deployment review requires no open P0, all gates pass, rollback SHA recorded. User approves concrete release diff/evidence before production push if not previously authorized. No unattended main push from plan execution.
- [ ] After authorized deploy: home/replay/API export exact record, one real live scan if enabled, check no secret response fields, then one new-browser archive open. Unknown legacy live id may 404; UI must never advertise it as persistent.

Acceptance: release status states precisely which capabilities passed and which human/API-tier checks remain unverified. Any remaining P0 stops release of new live behavior; functioning dated replay can still be submitted honestly.

## Task 8: Submission story, video, and final handoff

**Files:** README, HANDOFF, SUBMISSION, specs PRODUCT/TECH/DESIGN, CLAIMS, docs/AUDIT-DOSSIER (current status links), video/README, video/src/data.ts and relevant composition only after final rules/UI; create `docs/SUBMISSION-CHECKLIST.md`.

- [ ] README opening: one user problem, one command, live/replay behavior, supported field semantics, limitations, exact endpoint table. Explain score is heuristic and source-backed observations do not prove intent/independent ownership.
- [ ] Explicit originality paragraph identifies new CMC integration and code history; no unsupported “first”, “unique”, or “unfakeable” statements. Compare the product's own behavior rather than disparaging competitors.
- [ ] Submission details order: problem → workflow → one observed case with timestamp → evidence bytes and replay command → API's essential role → known constraints → what works during judging. Form track Markets and Trading Tools. Logo verify PNG/JPEG <2MB, recommended 480x480.
- [ ] Show one actual request code example with key from environment and actual response excerpt; link full reviewed bundle. Response excerpt is labelled excerpt; hash refers to full exact bytes. Do not put a key placeholder that could be confused with a real credential value.
- [ ] Freeze correct cases before video. Reuse one 90s variant after revalidating; recommended walkthrough timing: 0–10 problem, 10–25 identity/live scan, 25–45 reason + actual row, 45–60 incomplete source, 60–75 offline receipt verification, 75–90 limitation + URL. Rerender only after data/copy locked.
- [ ] Remove old GMX=100 narration from current-live story. If using historical GMX, date it and explicitly call it recorded. Video/frame/readme counts must match the final corpus version.
- [ ] Verify final video playability, audio, text legibility, duration, URL readability. File presence or ffprobe alone does not validate narration truth. Upload/publishing by user unless explicit authorization supplied.
- [ ] Submission checklist records real BUIDL URL, YouTube URL, X post URL with BUIDL+video+#BuildwithCMC, repo public, endpoints, evidence, API feedback, selected track, eligibility confirmation. If link not published, mark `not published` in checklist; do not insert fake URL.
- [ ] HANDOFF current section: base/release SHA, commands/results, new data contract, mode/env names without values, known limitations, demo links, remaining human steps. Link historical sections; avoid multiple contradictory “current” test counts.
- [ ] After user submission, capture confirmation page/URL before marking submitted. Planning agent does not tick submission on behalf of user.

Acceptance: a judge can run replay with no key, inspect a real response, understand one useful finding and one limit, and follow all actual links. No claim of victory or user adoption without evidence.

## 6. Five release checks worth more than another feature

1. Simulated LP outage cannot yield positive clearance or sufficient coverage.
2. Chosen chain/address never changes silently.
3. Raw receipt bytes verify and recompute a published new record offline.
4. Every offered share link points to the exact dated record in a separate browser.
5. User can distinguish live, archived, partial, and unknown within the main result screen.

## 7. Ideas ranked beyond the deadline core

| Idea | Value and test | Cost/risk | Decision |
|---|---|---|---|
| Compare two saved samples for same identity | Shows change in distinct sellers/concentration/LP flags; test incompatible windows and identities reject | 3–5h; two snapshots not a trend | First optional feature after all gates |
| Watchlist recheck notifications | Tests repeated real user need and retention | Storage/scheduler/notifications, ongoing API spend | Post-hackathon; user authorization for messages |
| Persistent evidence permalinks | Enables team sharing and audit review | Needs store, retention, privacy policy and cost control | Add only if user makes live sharing mandatory |
| Rug outcome benchmark | Measures false positives/negatives against independent ground truth | Data collection and outcome leakage concerns | Longer research, no invented score before deadline |
| Wallet/aggregator API integration | Could validate B2B utility | Stable versioned API, SLA, usage control | After one partner test; not current traction |
| More endpoints/AI agent/RWA pivot | May broaden scope | Dilutes narrative, consumes remaining time | Exclude sprint |

## 8. Compare feature, if core finishes early

Create `src/engine/compare.ts` and `tests/compare.test.ts`. Pure function `compareRecords(a:VerdictV2,b:VerdictV2)` requires identical tokenIdentity, schema/rules versions, and declared source scope; rejects otherwise. Shows capture times, sample spans, accepted counts, delta per comparable metric, and changed findings. Label “two observed samples”, never “trend confirmed”. UI accepts two already saved local bundles, validates both before rendering, no server upload. Do not align unequal observation windows into misleading per-hour rates. If <4h buffer remains, cut this feature completely.

## 9. Security and cost acceptance

- Public inputs cannot select URL/path/provider; address is encoded query value only.
- Error text is sanitized code/message, not upstream raw stack/headers.
- Public bundle cannot contain key-info account details or auth headers.
- Node-only fs/crypto and any secrets remain out of client bundle; browser verifier uses Web Crypto or offline CLI, not server secret module imports.
- Max source/bundle sizes, query/body limits, provider retries and total timeout have tests.
- Cache and caps are per-instance. Do not label global quotas hard without shared storage.
- Validated user/market statements are distinct from model advisory and heuristic policy.

## 10. Rollback and preservation

Record pre-release deployment URL/SHA through authorized read-only Vercel tooling. Stage new schema behind `VERDEX_V2=1`; unset routes V1 replay but does not expose new live semantics. Reversion disables V2/new live, retains original archive files and V2 evidence for investigation. Do not delete/re-harvest 34 historical files in place. If task fails halfway, leave exact failing tests/output and modified-file inventory in HANDOFF; do not call it done because build succeeds.

## 11. Prompt for the next agent

```text
Kerjakan Verdex di C:/Users/GEEKOM A8/Documents/Crypto/cmc-api-hackaton.
Baca master AGENTS, docs/audits/2026-09-29-hackathon-review.md,
dan docs/superpowers/plans/2026-09-29-verdex-hackathon-overhaul.md seluruhnya.
Audit baseline 9512cee3145660fe1ffc66cdb9cc4d0addf53e8e.
Konfirmasi bahwa user sudah menyetujui scope plan sebelum menulis kode produk.
Setelah approval, kerjakan task 1–8 berurutan; jangan pivot atau tambah layanan
berbayar tanpa keputusan user. Jangan hapus file, buka nilai secret, publish,
push main, menerima terms atau kirim posting atas nama user tanpa otorisasi.
Setiap task: regression dahulu, implementasi minimum, verifikasi, commit path
milik sendiri, update checklist/handoff. Pertahankan snapshot historis.
Prioritas: missing-data tidak jadi safe, identity benar, evidence replay,
sharing jujur, demo yang mudah dijelaskan. Bukti tests bukan akurasi finansial.
Laporkan hasil aktual dan blocker; jangan menjanjikan kemenangan hackathon.
```

## 12. Durable sharing extension (only when explicitly selected)

Jangan sekadar mengganti `/tmp` ke lokasi disk lain di serverless. Pilih existing managed durable store yang pengguna miliki setelah inventory read-only. Kontrak `saveRecord(v:VerdictV2):Promise<{id:string,expiresAt:string|null}>`, `loadRecord(id):Promise<VerdictV2|null>`, immutable id, TTL terlihat, private writes, public read hanya redacted records. `share.kind='stored'` baru ditambahkan setelah write-ack; upload failure menghasilkan inline record + no-share. Gunakan satu module server-only, verifikasi read via API/page/OG di instance berbeda dan sesudah deploy baru. Perlu rate limiting atomic/shared untuk klaim hard global cap. Estimasi tambahan 4–8h termasuk resource setup dan security tests, belum masuk critical path dan tidak diasumsikan gratis. Jika mandatory, revisi bagian API/type/tasks terlebih dahulu agar agent tidak mencampur desain ini dengan no-store draft.
