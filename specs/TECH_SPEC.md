# TECH_SPEC — Verdex

## 1. Arsitektur

Single-stack Next.js 15 (App Router) + TypeScript strict. Server-side saja yang
memegang key; client menerima VerdictCard JSON. Snapshot JSON ter-commit =
demo mode.

```
client → POST /api/verdict {input}
       → engine/verdict.ts
           → lib/cmc-client.ts  (fetch + receipt + cache)
           → lib/dex.ts         (resolve + fetchers per platform)
           → engine/metrics.ts  (4 dimensi)
           → engine/rules.ts    (sub-verdict + composite + falsifier)
           → lib/jev.ts         (second opinion, optional)
           → lib/narrator.ts    (LLM narasi, optional)
       → VerdictCard JSON → persist data/verdicts/<id>.json
UI: / (input + context chips), /verdict/[id], /receipts, /methodology
```

## 2. Kontrak Data (semua field English)

```ts
type Platform = string; // 'Solana' | 'BSC' | 'Base' | ... (dex/platform/list dn field)
type SubDim = 'SAFETY' | 'FLOW' | 'LIQUIDITY' | 'PUMP';
type SubVerdictLevel = 'CLEAN' | 'WARN' | 'DANGER' | 'INSUFFICIENT';
type VerdictLevel = 'LAYAK' | 'RAWAN' | 'JANGAN' | 'BELUM_CUKUP_BUKTI';

interface Swap { ts: number; side: 'buy'|'sell'; maker: string; usd: number; tx: string; pool: string; dex: string; }
interface Receipt { endpoint: string; params: Record<string,unknown>; ts: string; credits: number; sha256: string; }
interface Metric { name: string; value: number; threshold: number; level: SubVerdictLevel; note?: string; }
interface SubVerdict { dim: SubDim; level: SubVerdictLevel; metrics: Metric[]; }
interface JevOpinion { risky: number | null; perDim: Partial<Record<SubDim, number>>; agreement: 'consensus'|'contested'|'unavailable'; }
interface VerdictCard {
  id: string;                 // `${platform}:${address}` sanitized
  token: { platform: Platform; address: string; name: string; symbol: string };
  verdict: VerdictLevel;
  score: number;              // 0-100 composite
  subs: SubVerdict[];
  context: { btcDomDelta7d: number|null; fearGreed: number|null };
  jev: JevOpinion;
  narrative: string;          // AI narration or deterministic template
  falsifier: string;
  receipts: Receipt[];
  computedAt: string;         // ISO
}
```

## 3. CMC API — quirk terdokumentasi (hasil probe 24-25 Sep)

- Base: `https://pro-api.coinmarketcap.com`, header `X-CMC_PRO_API_KEY`.
- Kebanyakan endpoint DEX pakai `platform=<short name>` (`Solana`, `BSC`,
  `Base` — dari `dex/platform/list` field `dn`). SECURITY/detail pakai
  `platformName=` (BEDA param).
- `dex/tokens/transactions` → `data.swaps[]` fields: `ts` (ms string),
  `tp` ('buy'|'sell'), `ma` (maker addr), `v` (USD number), `tx` (hash),
  `f` (pool), `en` (dex name). Param `limit`.
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
- Body: `{model:'jev-latest', state: <metrics JSON compact>, questions:{...}}`.
- Pertanyaan: `risky:noul`, `flow_ok:noul`, `liq_ok:noul`, `pump_organic:noul`.
- Timeout 3s, rotate key dari `TYPESAFE_API_KEYS` pool on 401/429/5xx,
  fallback `{agreement:'unavailable'}` — TIDAK PERNAH memblokir verdict.

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

Vitest `tests/`: fixtures JSON dari response riil (diskimpan di
`tests/fixtures/`), unit tests per metrics/rules function, boundary tests,
integration test /api/verdict dengan fetch mocked.
