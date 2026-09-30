# PRODUCT_SPEC — Verdex

## 1. Why (Konteks & Masalah)

Trader memecoin/small-cap di DEX menghadapi keputusan harian: "token ini layak
dibeli atau jebakan?" Tools existing sudah mengecek potongan masalah ini —
RugCheck/TokenSniffer membaca struktur kontrak, GoPlus menambah simulasi jual,
Bubblemaps memetakan klaster holder. Yang tidak mereka berikan adalah
**bukti yang bisa diaudit ulang**: label muncul tanpa baris mentah, threshold,
timestamp, atau cara mereproduksinya. Dan saat endpoint-nya down atau datanya
kosong, umumnya status itu tidak terlihat sama sekali.

Verdex mengisi gap itu: **paste token → vonis berbasis bukti, auditable,
deterministik** — setiap sinyal membawa receipt SHA-256 dan status coverage,
plus abstain eksplisit (`BELUM_CUKUP_BUKTI` / `INSUFFICIENT_EVIDENCE`) saat
bukti kurang atau basi — plus second opinion dari model keputusan
terkalibrasi (Jev) yang tidak pernah menimpa rules.

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

## 6. Current V2 boundary (2026-09-29)

- Replay is the default judging path and does not require credentials.
- V2 live is opt-in only when `VERDEX_V2=1` and `VERDEX_LIVE=1`, with a fresh
  quota permission and bounded request budget.
- The primary user output is a risk label plus coverage and recheck reasons.
  `observedSellMakers` is a sample observation, never “independent wallets”.
- Evidence exports may be incomplete when raw response bodies were not retained;
  the UI says so. Only committed snapshot ids receive durable share paths.
- A current real CMC capture, participant utility study, deployment smoke test,
  and submission publication are release tasks, not claims of this repository.
