# PRODUCT_SPEC — Verdex

## 1. Why (Konteks & Masalah)

Trader memecoin/small-cap di DEX menghadapi keputusan harian: "token ini layak
dibeli atau jebakan?" Tools existing (RugCheck, GoPlus, TokenSniffer,
Bubblemaps) hanya mengukur **struktur kontrak** — "bisakah ini rug?" — tapi
tidak menjawab **"apakah ini SEDANG berperilaku seperti scam?"** Riset forum
menunjukkan check paling prediktif justru yang jarang diotomatiskan: bukti flow
riil (apakah ada sell pihak ketiga, apakah buying tersebar atau terkonsentrasi
di sedikit wallet, apakah LP dicabut saat harga naik).

Verdex mengisi gap itu: **paste token → vonis berbasis bukti, auditable,
deterministik** — plus second opinion dari model keputusan terkalibrasi (Jev).

Tagline: **"Don't be the exit liquidity."**

## 2. Untuk Siapa

- **Target primer**: trader DEX small-cap/memecoin yang akan entry
  (segmen tooling crypto paling besar secara revenue: GMGN, Axiom, BullX).
- **Target sekunder**: content creator/analis yang butuh verdict shareable.

## 3. Apa (Requirements)

### Fungsional
- F1: Input token = contract address (+ pilih chain) atau ticker/symbol
  (resolve via `dex/search`).
- F2: Satu verdict card per token: verdict komposit + 4 sub-verdict
  (SAFETY, FLOW, LIQUIDITY, PUMP) + confidence + falsifier.
- F3: Receipts — setiap angka punya jejak ke API call (endpoint, params,
  timestamp, sha256 response).
- F4: Jev second opinion per dimensi + flag consensus/contested.
- F5: Narasi AI (opsional) — meringkas verdict dalam bahasa manusia, hanya
  boleh menyebut angka dari JSON hasil hitung.
- F6: Halaman shareable `/verdict/[id]` + OG image.
- F7: ~~`/receipts` audit page~~ → DROPPED; audit trail tampil inline di
  verdict card (receipts table per endpoint + sha256).
- F8: Demo mode tanpa key — render dari snapshot/verdict ter-commit.
- F9: Konteks market (BTC dominance trend, Fear&Greed) sebagai input interpretasi
  ("pump saat BTC dumping = red flag").

### Non-fungsional
- Deterministik: verdict hanya dari rules di atas data CMC — NOL AI di jalur
  verdict.
- Auditable: semua threshold dipublikasi di `docs/CLAIMS.md`.
- Graceful: Jev/LLM down → verdict tetap jalan (flag `jevUnavailable`).
- Jujur: coverage tipis → BELUM_CUKUP_BUKTI, bukan tebakan.

## 4. Bukan Scope (YAGNI)

- Bukan signal generator/prediksi harga.
- Tidak mengklaim "smart money" (tidak ada wallet labels di CMC Basic).
- Tidak ada autentikasi user, tidak ada DB server, tidak ada wallet connect.
- Tidak execute trade.

## 5. Definition of Done

Selaras acceptance criteria di GOAL/plan: verdict end-to-end jalan untuk
token riil Solana & BSC, fixture honeypot → JANGAN, thin data →
BELUM_CUKUP_BUKTI, demo tanpa key, deploy live, submitted.
