# TECH_SPEC — Verdex

## 1. Arsitektur

Single-stack Next.js 15 (App Router) + TypeScript strict. Server-side saja yang
memegang key; client menerima VerdictCard JSON. Snapshot JSON ter-commit =
demo mode.

```
client → POST /api/verdict {input}
       → engine/analyze.ts
           → lib/cmc-client.ts  (fetch + receipt + cache, 15s timeout, retry ×2 pada 5xx/429)
           → lib/dex.ts         (resolve + fetchers + token meta creator + market ctx)
           → engine/metrics.ts  (4 dimensi)
           → engine/rules.ts    (sub-verdict + composite + falsifier)
           → lib/jev.ts         (second opinion, optional)
           → engine/narrator.ts (LLM narasi, optional)
       → VerdictCard JSON → persist data/verdicts/<id>.json + snapshots/ (committed)
UI: / (input + case-file ledger), /verdict/[id] (+OG image)
    — /receipts & /methodology pages: DI-DROP (receipts tampil inline di verdict card)
```

## 2. Kontrak Data (semua field English)

```ts
type Platform = string; // 'Solana' | 'BSC' | 'Base' | ... (dex/platform/list dn field)
type SubDim = 'SAFETY' | 'FLOW' | 'LIQUIDITY' | 'PUMP';
type SubVerdictLevel = 'CLEAN' | 'WARN' | 'DANGER' | 'INSUFFICIENT';
type VerdictLevel = 'LAYAK' | 'RAWAN' | 'JANGAN' | 'BELUM_CUKUP_BUKTI';

interface Swap { ts: number; side: 'buy'|'sell'; maker: string; usd: number; tx: string; pool: string; dex: string; }
interface Receipt { endpoint: string; params: Record<string,unknown>; ts: string; credits: number; sha256: string; cached: boolean; }
interface MetricRow { name: string; value: number|string; threshold: string; level: SubVerdictLevel; }
interface SubVerdict { dim: SubDim; level: SubVerdictLevel; metrics: MetricRow[]; }
interface JevOpinion { available: boolean; riskyProb: number | null; dims?: Partial<Record<SubDim, number|null>>; }
// agreement dihitung terpisah: 'consensus'|'contested'|'lean'|'unavailable' — see §4
interface VerdictCard {
  id: string;                 // sha256(`${address}:${ts}:${uuid}`).slice(0,12)
  token: { platform: Platform; address: string; name: string; symbol: string; mcapUsd?: number|null };
  verdict: VerdictLevel;
  score: number;              // 0-100 composite
  subs: SubVerdict[];
  context: { btcDomDelta7d: number|null; fearGreed: number|null };
  jev: JevOpinion;
  agreement: 'consensus'|'contested'|'lean'|'unavailable';
  narrative: string;          // AI narration or deterministic template
  falsifier: string;          // names EVERY failing row, not just the worst
  receipts: Receipt[];
  computedAt: string;         // ISO
}
```

Row names diterbitkan: `centralizationFlags` (mintable/pausable/blacklist/
upgradeable/proxy/owner_change_balance/hidden_owner → WARN, lihat CLAIMS),
`unclassifiedFlags` (flag tak dikenal — fail-closed WARN), `mcapTier`
('mature'|'early', informational CLEAN row di FLOW). EngineInput menerima
`mcapUsd`; `mcapUsd ≥ $100M` → tier mature: `top5MakerShare` & `netBuyRatio`
maksimal WARN, sinyal insider-exit tetap bisa DANGER. `mcapUsd` null → early
tier (fail-strict by design).

**Stable demo URLs:** `snapshots/index.json` memetakan slug
`symbol-platform` → id snapshot; `loadVerdict` dan `/verdict/[id]` me-resolve
slug maupun hex id. Link publik kebal re-harvest (id baru, slug tetap).

## 3. CMC API — quirk terdokumentasi (hasil probe 24-25 Sep)

- Base: `https://pro-api.coinmarketcap.com`, header `X-CMC_PRO_API_KEY`.
- Kebanyakan endpoint DEX pakai `platform=<short name>` (`Solana`, `BSC`,
  `Base` — dari `dex/platform/list` field `dn`). SECURITY/detail pakai
  `platformName=` (BEDA param).
- `dex/tokens/transactions` → `data.swaps[]` fields: `ts` (ms string),
  `tp` ('buy'|'sell'), `ma` (maker addr), `v` (USD number), `tx` (hash),
  `f` (pool), `en` (dex name). Param `limit` (max 100). Params `offset`/
  `page` DIABAIKAN API (diprobe 2025) — window fixed 100 swaps terbaru.
- `dex/security/detail` → `data[0].securityItems[]` {`riskCode`,`isHit`,
  `riskyLevel`}, `securityLevel`, `extra.{buyTax,sellTax,isFlaggedByVendor}`.
- `dex/liquidity-change/list` → per-pool liquidity add/remove events.
- `dex/token/pools` → pool list w/ liquidity.
- `dex/token` → meta (name, symbol, creator `crt`, owner `own`, decimals).
- `dex/search?query=` → resolve ticker → [{platform, address, ...}].
- Error: `{status:{error_code}}` — 1006=plan restricted, 1001=invalid key,
  400=bad params, 500=retryable.
- Rate: 50 req/min, 15k credits/month (Basic). Sleep ≥1.2s antar-call saat
  batch snapshot.

## 4. Jev (TypeSafe AI)

- `POST https://api.typesafe.ai/v1/systemone`, `Authorization: Bearer <key>`.
- Body: `{model:'jev-1.13.0', state: <metrics JSON compact>, questions:{...}}`.
- Pertanyaan (1 call, cross-examination per dimensi): `safety:noul`,
  `flow:noul`, `liquidity:noul`, `pump:noul` — rules verdict TIDAK
  disertakan di state (independensi). `riskyProb` = mean prob dims.
- Timeout 10s, rotasi semua key di pool `TYPESAFE_API_KEY(S)` pada error,
  fallback `available:false` — TIDAK PERNAH memblokir verdict.
- `agreement(verdict, jev, subs)` — **contested-wins, dua jalur**: (a) sign
  match ≥3/4 dimensi comparable → dim-consensus; (b) band agregat pada
  riskyProb (≥0.65 risky / ≤0.35 aman) bertentangan dengan polaritas verdict
  → contested. Salah satu contested → contested; consensus hanya jika kedua
  jalur sepakat. <3 comparable → band saja.

## 5. Narrator (opsional)

- Groq (`openai-compatible`, model llama-3.3-70b-versatile) atau template
  deterministik jika `GROQ_API_KEY` kosong.
- Prompt ketat: input = VerdictCard JSON; output ≤80 kata; dilarang fakta baru.
- UI label: "AI narration — verdict computed deterministically".

## 6. Error & Edge

- Token tidak ketemu → 404 `{error:'TOKEN_NOT_FOUND'}`.
- Platform tidak didukung DEX → verdict BELUM_CUKUP_BUKTI + alasan.
- Swaps < MIN_SWAPS (50) → FLOW/PUMP = INSUFFICIENT → composite belum bukti.
- CMC 500/429 → retry ×2 backoff; tetap gagal → INSUFFICIENT untuk dimensi itu.
- Key invalid → error page jelas, demo mode tetap bisa.

## 7. Testing

Vitest `tests/` (97 tests): fixtures JSON dari response riil di-inline di
test files (tidak ada tests/fixtures/ dir), unit tests per metrics/rules
function, boundary tests, orchestrator tests dengan DexClient mocked
(termasuk wiring `mcapUsd` → mature tier), live-guard caps+quota probe.
