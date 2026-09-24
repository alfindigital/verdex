# CLAIM COURT — Blueprint & Plan
### "Pengadilan klaim crypto — verdict dari data, bukan opini"

> Supersedes: rencana "ProofEdge / Crypto Signal Validator" (pivot 24 Sep 2026 —
> user challenge: regime board = rebuild dashboard CMC, DEX radar = better
> Dexscreener. Dicari diferensiasi yang out-of-the-box → verdict produk).

---

## 1. Pitch (1 kalimat)

Paste klaim crypto apapun yang beredar → Claim Court mengadilinya dengan data
CoinMarketCap riil → keluar **verdict TERBUKTI / HOAX / BELUM CUKUP BUKTI** +
**receipt** (endpoint, angka, timestamp) yang bisa diverifikasi orang lain.

## 2. Problem & bukti demand

- Crypto Twitter/Telegram = banjir klaim narasi ("altseason sudah mulai!",
  "whale nimbun X", "exchange Y menipis") — nol alat untuk mengeceknya.
- Media sudah mengerjakan ini **manual** (contoh: AInvest — "Your Feed Says
  Altcoin Season Flipped. The Index Says Otherwise", index 46 vs threshold 75).
  Belum ada yang memproduktifkannya.
- Meta hackathon terbukti: verifiability/auditability ("show every API call",
  "auditable receipts") — Claim Court adalah meta itu *menjadi produk*.
- Nol dari 40 BUIDL kompetitor menyentuh claim-adjudication.

## 3. Prinsip desain

- **NOL AI di jalur verdict.** Klaim → template deterministik → metrik +
  threshold terpublikasi → verdict. Reproducible, auditable, anti-halu.
- **Receipts first**: setiap angka di verdict punya receipt (endpoint, params,
  timestamp, credits, field yang dipakai, hash raw response).
- **"BELUM CUKUP BUKTI" adalah verdict sah** — kejujuran epistemik = fitur.
- **Standing claims board**: regime market = daftar klaim standing dengan
  verdict live (menyerap ide "Regime & Rotation Board" sebagai satu surface).
- **Shareable verdict card** = viral loop bawaan + memenuhi syarat X post.
- Pure CMC, zero external market data (aturan submission).

## 4. Claim templates v1 (8) — semua endpoint verified Basic ✅

| # | Klaim | Resep (metrik → threshold) | Endpoint |
|---|-------|---------------------------|----------|
| T1 | "Altseason sudah mulai" | breadth = % top-50 non-stablecoin beat BTC 30d (hitung sendiri); ≥75% + BTC.D turun → TERBUKTI; ≤25% → HOAX; else BELUM | `listings/latest`, `quotes/historical`, `global-metrics/historical`, `altcoin-season-index` |
| T2 | "Market euforia/top" | F&G ≥80 + long-liq skew tinggi + perf 7d ekstrem → TERBUKTI; F&G ≤20 → HOAX | `fear-and-greed`, `derivatives/liquidations`, `quotes` |
| T3 | "Whale nimbun token X" | DEX swaps: net-buy imbalance >0 & unique makers ≥N & liquidity-change net adds >0 → TERBUKTI; net-sell dominan → HOAX | `dex/tokens/transactions` (field `tp`,`v`,`ma` ✅), `dex/liquidity-change`, `dex/token/pools` |
| T4 | "Pump X organik?" (= Pump Autopsy, terserap) | vol/mcap ratio wajar + maker breadth lebar + buy imbalance moderat + security flags bersih + liquidity adds > pulls → ORGANIK; sebaliknya → MENCURIGAKAN | `dex/tokens/transactions`, `dex/token/price`, `dex/security/detail`, `dex/liquidity-change` |
| T5 | "Rotasi ke narasi Y" | share mcap kategori (dihitung) naik vs snapshot + `market_cap_change`,`volume_change`,`avg_price_change` kategori positif beruntun → TERBUKTI | `categories`, `category`, `listings`, `quotes/historical` |
| T6 | "Exchange X cadangan menyusut" | delta `exchange/assets` vs snapshot tersimpan ≤ -5% → TERBUKTI (anomali cadangan, BUKAN klaim insolvensi — wording hati-hati) | `exchange/assets` (1550 aset ✅), `exchange/quotes/historical` |
| T7 | "Koin X mati/sekarat" | rank migration (listings historical vs now) turun besar + volume trend turun + perf negatif beruntun → TERBUKTI | `listings/historical`, `listings/latest`, `quotes/historical` |
| T8 | "BTC menyedot oksigen (alt terkuras)" | BTC.D naik beruntun + breadth alt <30% → TERBUKTI | `global-metrics/historical`, `quotes/historical`, `listings` |

Standing claims (selalu live di board): T1, T2, T8 + rotasi kategori top.
On-demand claims: T3–T7 (user pilih template → isi subjek → jalankan).

### Verdict model

```ts
type Verdict = "TERBUKTI" | "HOAX" | "BELUM_CUKUP_BUKTI";
interface ClaimResult {
  claim: string;            // klaim dinormalisasi
  verdict: Verdict;
  confidence: "high" | "medium" | "low";   // dari margin vs threshold + coverage data
  metrics: Metric[];        // tiap metrik: nilai, threshold, kontribusi
  receipts: Receipt[];      // 1:1 ke API call
  falsifier: string;        // "klaim ini gugur jika ..." (prove-me-wrong)
  computed_at: string;
}
interface Receipt {
  endpoint: string; params: object; ts: string;
  credits: number; fields_used: string[]; response_sha256: string;
}
```

## 5. Arsitektur — IN → PROCESS → OUT

```
IN  (CMC only, semua verified Basic)
├─ listings/latest + listings/historical        (universe + time-travel rank)
├─ quotes/latest + quotes/historical            (perf 7d/30d, volume trend)
├─ global-metrics/latest + /historical          (BTC.D, total mcap)
├─ fear-and-greed/latest + /historical          (sentimen)
├─ altcoin-season-index                         (indeks resmi)
├─ categories + category                        (share narasi, rotasi)
├─ derivatives/liquidations + market-pairs      (leverage/stress)
├─ exchange/assets + exchange/quotes/historical (cadangan CEX)
└─ dex/tokens/transactions, liquidity-change,   (on-chain: whale & autopsy)
   token/pools, token/price, security/detail, spot-pairs

PROCESS
├─ cmc-client.ts        → fetch + strip key + tulis api_log.jsonl (receipt raw)
├─ snapshotter          → harvest harian → data/snapshots/YYYY-MM-DD.json
│                         (committed → demo jalan tanpa key; history dirakit
│                          sendiri = moat, kategori share tidak retroaktif)
├─ claims/*.ts          → 1 file = 1 template: inputs, fetchPlan, metrics(),
│                         evaluate() → verdict + falsifier
├─ engine.ts            → orchestrate: parse → fetch → metrics → verdict
└─ receipt.ts           → hash response, bentuk Receipt[]

OUT
├─ /                  board: standing claims + verdict badges live
├─ /claim/[template]  form subjek → run → verdict card
├─ /verdict/[id]      shareable verdict page (kartu + receipts + falsifier)
├─ /receipts          API audit trail (endpoint, ts, credits, raw excerpt)
└─ OG-image verdict card → untuk X post requirement
```

## 6. Stack & struktur repo

**Next.js 15 + TypeScript + Tailwind** (single stack, deploy Vercel, reuse pola
RADAR-X). Engine klaim = TS murni (resep = aritmetika, tak perlu Python/numpy).
Snapshot = JSON di-commit (skala demo cukup; hindari DB).

```
cmc-api-hackaton/
├─ app/                    (Next.js routes di atas)
├─ src/
│  ├─ lib/cmc-client.ts    (env key, logging, retry, credit counter)
│  ├─ lib/receipt.ts
│  ├─ claims/              (t1_altseason.ts ... t8_btcd.ts + registry)
│  ├─ engine.ts
│  └─ snapshotter.ts       (script: pnpm snapshot)
├─ data/snapshots/         (committed demo data)
├─ api_log.jsonl           (committed — bukti visible API usage)
├─ scripts/probe.ts
└─ docs/CLAIMS.md          (dokumentasi threshold tiap template)
```

## 7. Security

- Key hanya via `CMC_API_KEY` env (`.env.local` di-gitignore). **Tidak pernah**
  ke file/log/screenshot. `api_log.jsonl` menyimpan endpoint+params+response
  excerpt — header auth di-strip.
- Demo default = snapshot committed; live mode perlu env key.
- Kedua key yang pernah di-paste di chat → **rotate setelah hackathon**.

## 8. Track & requirement mapping

**Track: Markets & Trading Tools** (paling sepi — 8 entry, paling fit).

| Syarat submission | Cara terpenuhi |
|---|---|
| Public repo | github.com/…/claim-court |
| Working demo | Vercel deploy (snapshot mode) + screen recording |
| X post | verdict card OG-image + DoraHacks link + #BuildwithCMC |
| Named endpoints | docs/CLAIMS.md + /receipts page |
| Visible API call+response | api_log.jsonl + receipts per verdict |
| "API enabled / limitations" | README: Basic = no OHLCV/trending → klaim
  yang tidak bisa diadili dicatat jujur; Startup akan membuka T-x |
| Originality | codebase baru di `Crypto/cmc-api-hackaton`; CMC integration = produk |

## 9. Workflow & timeline (target submit ~5-6 hari kerja)

| Hari | Deliverable |
|------|-------------|
| D0 | Register DoraHacks (email akun CMC) → Startup upgrade → re-probe key. Scaffold Next.js + `cmc-client` + `api_log` + smoke call. |
| D1 | Snapshotter (harvest harian: listings, categories, global-metrics, F&G, altseason, exchange/assets, watchlist DEX). Seed 3-5 hari snapshot backfill dari quotes/historical. |
| D2 | Claim engine + T1, T2, T5, T8 (standing claims) → verdict JSON benar + unit test fixture. |
| D3 | T3, T4 (DEX whale + pump autopsy), T6, T7. Receipt rendering + falsifier text. |
| D4 | UI: board, claim form, verdict card, receipts page. Polish + OG image. |
| D5 | Deploy Vercel, demo video, X post draft, README, submit DoraHacks. |
| Buffer | 1 hari — bugfix / Startup-tier enhancement kalau upgrade mendarat (OHLCV, trending → template baru). |

## 10. Risiko & mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Startup upgrade tidak mendarat | Produk dirancang di atas Basic-verified endpoints; limitasi dicatat sebagai "where API got in the way" (dinilai positif) |
| Key invalid (key baru hari ini 1001) | Pakai key lama; re-check pasca-register |
| Threshold arbitrer → verdict diperdebatkan | Semua threshold dipublikasi di docs/CLAIMS.md + verdict "BELUM_CUKUP_BUKTI" untuk gray zone + falsifier eksplisit |
| Coverage DEX terbatas (token tertentu tak ada data) | Template mengembalikan BELUM_CUKUP_BUKTI dengan alasan coverage |
| Snapshot history tipis hari pertama | Backfill dari quotes/historical (12 bl) + snapshot jalan setiap hari sampai deadline |
| Rate limit 50/mnt | Snapshot batch harian + cache; demo pakai committed data |

## 11. Acceptance criteria

- [ ] 8 template klaim menghasilkan verdict + receipts di data fixture
- [ ] Standing board menampilkan ≥4 klaim live dari snapshot
- [ ] /verdict/[id] shareable + OG card
- [ ] api_log.jsonl committed, nol key bocor (grep bersih)
- [ ] README: endpoints, limitasi, cara run demo tanpa key
- [ ] Deployed + demo video + X post + submitted ke DoraHacks
