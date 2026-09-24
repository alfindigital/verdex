# Kandidat Project untuk "Build with CMC: API Hackathon"

> Scan: 24 Sep 2026 · Deadline submit: **30 Sep 2026, 23:59 UTC** (~6 hari)
> Sumber halaman: https://dorahacks.io/hackathon/coinmarketcap-api-202609/detail
> Aturan kunci: project lama BOLEH, asalkan **integrasi CMC-nya baru & jelas ditandai**.
> Judging: works 30 · usefulness 25 · interesting API use 20 · code quality 15 · presentation 10.

## Ranking (urut rekomendasi)

### 🥇 #1 — RADAR-X → "RADAR-X Crypto" (port smart-money radar ke crypto)

- **Lokasi**: `Documents\Apps\radar-x-hackaton` (Next.js + TS, live demo: radar-x-beta.vercel.app)
- **Apa**: Peta posisi smart money IDX (insider/institusi/asing) → scoring -100..+100, case detection, dossier per emiten. Sudah terbukti format hackathon (Sectors Hackathon 2026, Track 3).
- **Port ke CMC**: ganti Sectors API → CMC API. Radar "siapa akumulasi/diam-diam keluar" versi crypto: DEX pairs volume shift, exchange volume share, gainers/losers persistence, kategori rotasi.
- **Track**: Markets & Trading Tools (atau Data & Visualisation).
- **Effort**: **S-M** — arsitektur ingest→score→cases→pages sudah ada, tinggal swap data layer + tuning skor.
- **Kenapa #1**: demoability tertinggi (deploy Vercel, UI jalan), paling cepat penuhi "does it work" 30 poin, punya `specs/` spec-kit jadi code quality/documentation gampang.

### 🥈 #2 — Arus Koin → "Capital Rotation Agent" bertenaga CMC

- **Lokasi**: `Documents\Crypto\Arus Koin` (master prompt "Crypto Capital Rotation Analyst" sudah jadi — `Instruct.txt`, `crypto-money-flow-prompt.docx`)
- **Apa**: Framework analisis rantai rotasi modal antar koin (narrative, ekosistem, market-cap hierarchy). Saat ini masih prompt statis.
- **Port ke CMC**: jadikan agent nyata — prompt + data live CMC (categories, listings/latest, quotes, trending, global-metrics BTC.D). LLM reasoning di atas data riil.
- **Track**: **AI Agents & Automation** — kemungkinan lebih sepi dari Track 1, dan cocok banget ("anything that puts live market data in front of an LLM").
- **Effort**: **S-M** — prompt sudah matang, tinggal bungkus jadi CLI/web mini + fetch CMC.
- **Kenapa #2**: paling unik/diferensiasi, "interesting use of the API" 20 poin gampang, cocok kombinasi dengan #1.

### 🥉 #3 — IDX/Tradingview quant engine → "Genome/Titan Crypto"

- **Lokasi**: `Documents\IDX\Tradingview` (84.35M bar parquet, Dual-Engine Titan 585M backtests, Genome-IDX 24.38M, Monte Carlo, surge/springboard engine, DuckDB scanner, bot Telegram @lotmetrikresearch_bot, pipeline VPS)
- **Apa**: Mesin quant full-stack paling berat & paling proven yang user punya.
- **Port ke CMC**: swap data layer TV/Yahoo → CMC OHLCV endpoints; jalankan combinatorial strategy discovery di universe crypto.
- **Track**: Markets & Trading Tools — ini jawaban paling literal buat "quant trading".
- **Effort**: **L** — 6 hari ketat; CMC Startup tier perlu dicek dulu berapa depth OHLCV historis yang dibuka (free tier TIDAK ada historical OHLCV sama sekali).
- **Caveat jujur**: riset IDX sendiri berkesimpulan "no tradeable TA edge" — di crypto justru bisa jadi angle: "apakah sinyal teknikal punya edge di crypto? Monte Carlo validator di 1000+ koin" (framing honest = kredibel).

### #4 — IDX/Backtest → "Crypto Signal Validator (Monte Carlo)"

- **Lokasi**: `Documents\IDX\Backtest` (bootstrap 5000 iterasi + random-entry p-value, METHODOLOGY.md rapi, src/ Python, hasil CSV)
- **Apa**: Validator "apakah sinyal ini beneran kerja?" — versi fokus dari #3, jauh lebih ringan.
- **Port**: ingest OHLCV koin dari CMC → jalankan bootstrap + random-entry gate → report.
- **Track**: Markets & Trading Tools. **Effort**: **M**. Demo: CLI + generated report (atau mini dashboard).

### #5 — Crypto/API hub sebagai fondasi (BUKAN submission)

- **Lokasi**: `Documents\Crypto\API` — `coinmarketcap-api/coinmarketcap_client.py` **sudah ada**, plus `test_all_apis.mjs` benchmark 6 provider, dan matriks kredit CMC vs CoinGecko (sangat detail).
- **Peran**: fondasi wajib apapun kandidat yang dipilih — client CMC tinggal dipakai. Sebagai submission berdiri sendiri terlalu tipis (client lib ≠ produk), tapi bisa jadi "companion tool" di repo submission.

### #6 — fmid_project → "Crypto Flow Radar"

- **Lokasi**: `Documents\IDX\fmid_project` — foreign-flow analyzer produksi (Stockbit pipeline, Telegram bot @foreignflow_bot, QRIS, VPS CI/CD).
- **Fit**: konsep "smart money flow" sama seperti #1 tapi pipeline-nya IDX/Stockbit-locked → port lebih berat dari RADAR-X. Cadangan kalau #1 ditolak.

### #7 — Telegram alert bot (@lotmetrikresearch_bot pattern)

- **Lokasi**: `Documents\Telegram\Telethon` + pola `research_bot.py` di Tradingview project.
- **Fit**: alert bot CMC gampang dibuat & didemo, tapi tipis sebagai submission tunggal. Bagusnya: jadi **fitur** di dalam submission #1/#2/#3 (sinyal → push Telegram).

## Bukan kandidat (dieleminasi)

| Project | Alasan |
|---|---|
| `Apps\LamarBot` | job-application bot, nol irisan market data |
| `IDX\Dividen`, `51persen`, `Jurnal Saham Swing`, `Bloomberg`, `IDX Tool` | IDX-domain, tak ada jalur CMC natural |
| `IDX\Lotmetrik.id` | ambisi besar tapi masih fase blueprint/riset — 6 hari tak cukup |
| `Crawl\` | infrastruktur riset (6-engine ensemble), bukan produk end-user |
| `Crypto\CoinGecko` | client API kompetitor — berguna sebagai referensi pola client, bukan submission |
| `AI\Grok Bot`, `AI\Hermes`, `Telegram\aiogram_test`, `RSS Feed` | infra bot generik |
| `Crypto\Bitcoin`, `Crypto\Halal` | folder referensi PDF/gambar, bukan code |

## Rekomendasi strategi

**Cepat & menang**: #1 (RADAR-X Crypto) — 70% arsitektur sudah ada.
**Unik & beda**: #2 (Capital Rotation Agent) — atau gabung: RADAR-X Crypto + endpoint `/agent` yang expose rotation analysis (submit 1 project, cover 2 track lewat 1 track pilihan).
**Paling ambisius**: #3 — hanya kalau sanggup sprint penuh 6 hari; cek dulu OHLCV Startup tier.
**Fondasi wajib**: `Crypto\API\coinmarketcap-api\coinmarketcap_client.py` dipakai semua opsi.
