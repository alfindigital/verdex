# CMC API Capability Matrix — hasil probe live key user

> Tanggal probe: 24 Sep 2026 · Method: GET/POST live ke `pro-api.coinmarketcap.com`, 100+ request, param minimal.
> ⚠️ **Key user = tier BASIC (free)**: 15.000 kredit/bln, 50 req/mnt, reset 1 Okt 2026.
> **Startup upgrade BELUM aktif** — daftar DoraHacks dulu dengan email akun CMC ini; upgrade menempel di key yang sama, lalu banyak ❌ di bawah jadi ✅.

## Legenda

- ✅ 200 = data riil kembali (sudah diverifikasi)
- 🔶 400 = endpoint accessible, cuma perlu param benar (bukan limit plan)
- ❌ 403/ec=1006 = "plan doesn't support this endpoint" → butuh Startup+
- ⚠️ 500 = "system busy" (2x berturut — flaky atau param non-standar)

## Cryptocurrency (core)

| Endpoint | Status | Catatan |
|---|---|---|
| `/v1/cryptocurrency/map` | ✅ | ID map semua koin |
| `/v1/cryptocurrency/listings/latest` + `/v3/...` | ✅ | Ranking mcap — 1 kredit utk 3 koin |
| `/v1/cryptocurrency/listings/historical` | ✅ | **JALAN di Basic!** snapshot ranking tanggal lampau |
| `/v1/cryptocurrency/listings/new` | ❌ | listing baru — Startup+ |
| `/v1|v2|v3/cryptocurrency/quotes/latest` | ✅ | harga/mcap/volume/%change live |
| `/v2|v3/cryptocurrency/quotes/historical` | ✅ | **JALAN di Basic!** time-series quotes (interval 24h dll) — cukup untuk backtest daily |
| `/v1|v2/cryptocurrency/ohlcv/latest` + `/historical` | ❌ | candle OHLCV — Startup+. Workaround: quotes/historical |
| `/v1|v2/cryptocurrency/market-pairs/latest` | ❌ | pair per koin lintas exchange — Startup+ |
| `/v2/cryptocurrency/price-performance-stats/latest` | ❌ | ROI multi-timeframe — Startup+ |
| `/v1|v2/cryptocurrency/info` | ✅ | metadata, logo, link, kontrak |
| `/v1/cryptocurrency/trending/latest` `gainers-losers` `most-visited` | ❌ | semua trending — Startup+ |
| `/v1/cryptocurrency/categories` | ✅ | kategori/sektor koin |
| `/v1/cryptocurrency/airdrops` | ❌ | Startup+ |

## Exchange

| Endpoint | Status | Catatan |
|---|---|---|
| `/v1/exchange/map` | ✅ | ID map exchange |
| `/v1/exchange/info` | ✅ | metadata exchange |
| `/v1/exchange/assets` | ✅ | **1550 aset Binance** — proof-of-reserves (param: `id`, bukan slug) |
| `/v1/exchange/quotes/historical` | ✅ | volume historis per exchange |
| `/v1/exchange/listings/latest` | ❌ | Startup+ |
| `/v1/exchange/quotes/latest` | ❌ | Startup+ |
| `/v1/exchange/market-pairs/latest` | ❌ | Startup+ |

## Market-wide & Tools

| Endpoint | Status |
|---|---|
| `/v1/global-metrics/quotes/latest` + `/historical` | ✅ total mcap, BTC/ETH dominance, historis |
| `/v3/fear-and-greed/latest` + `/historical` | ✅ |
| `/v1/altcoin-season-index/latest` | ✅ |
| `/v3/index/cmc100-latest` `cmc20-latest` `cmc100-historical` | ✅ indeks proprietary CMC |
| `/v1/fiat/map` | ✅ |
| `/v2/tools/price-conversion` | ✅ BTC→IDR dll |
| `/v2/simple/price` | ✅ endpoint ringkas |
| `/v1/key/info` | ✅ cek tier+kuota sendiri |
| `/v1/blockchain/statistics/latest` | ❌ Startup+ |
| `/v1/community/trending/*` | ❌ Startup+ |
| `/v1/content/*` | ❌ Startup+ (posts butuh id/slug — tetap 1006) |

## Derivatives (v5) — hampir semua JALAN di Basic 🔥

| Endpoint | Status | Data |
|---|---|---|
| `/v5/exchange/derivatives/list` | ✅ | daftar exchange derivatif |
| `/v5/exchange/derivatives/market-pairs/list/latest?exchange_slug=binance` | ✅ | perp/futures pairs: OI, funding, volume |
| `/v5/cryptocurrency/derivatives/market-pairs/list/latest?crypto_slug=bitcoin` | ✅ | perp pairs BTC lintas exchange |
| `/v5/derivatives/liquidations/quotes/latest` | ✅ | likuidasi global agregat |
| `/v5/derivatives/liquidations/exchange/list/latest` | ✅ | likuidasi per exchange |
| `/v5/derivatives/liquidations/cryptocurrency/list/latest` | ✅ | likuidasi per koin |

## RWA (v5) — kebanyakan JALAN

| Endpoint | Status |
|---|---|
| `/v5/real-world-assets/map` | ✅ rwa_id, asset_type, has_tokens, rentang historis |
| `/v5/real-world-assets/assets/list` | ✅ |
| `/v5/real-world-assets/quotes/latest?rwa_id=` | ✅ (wajib rwa_id/slug/symbol) |
| `/v5/real-world-assets/info?rwa_id=` | ✅ |
| `/v5/real-world-assets/issuers/list` + `/issuers?issuer_id=` | ✅ Backed Assets 1.176 token dll |
| `/v5/real-world-assets/market-pairs/list` | ❌ Startup+ |

## CMC AI (v5) — semua ❌ di Basic

`/v5/cmc-ai/latest` · `/coins/latest` · `/coins/map` → 403. (Nggak masalah — submission agent pakai LLM sendiri, bukan CMC AI.)

## DEX on-chain — sebagian besar JALAN di Basic 🔥

| Endpoint | Status | Data |
|---|---|---|
| `/v1/dex/platform/list` | ✅ | 243 network/platform (Solana id=16, BSC id=14, dst) |
| `/v1/dex/search?query=` | ✅ | cari token → addr, pltId, harga, mc, liq, v24h |
| `/v1/dex/token?platform&address` | ✅ | detail token: fdv, mcap, supply, creator, link sosial |
| `/v1/dex/token/price?platform&address` | ✅ | harga + pc24h/pc7d + v24h |
| `/v1/dex/token/pools?platform&address` | ✅ | 20 pool per token |
| `/v1/dex/security/detail?platformName&address` | ✅ | security/risk detail token |
| `/v1/dex/tokens/transactions?platform&address` | ✅ | **swaps riil + lastId** — bahan "flow" analysis |
| `/v1/dex/liquidity-change/list?platform&address` | ✅ | perubahan likuiditas pool |
| `/v4/dex/spot-pairs/latest?network_slug&dex_slug` | ✅ | pairs per DEX (tested solana/raydium: USDC/wSOL, liq $42M) |
| `/v4/dex/pairs/quotes/latest` | 🔶 | butuh `contract_address`+`network_slug` (addr bisa dari spot-pairs) |
| `/v1/dex/holders/count` `tag_count` `/list` `/detail` | 🔶 | accessible, nama param belum ketemu (bukan platform/address) |
| `/v1/dex/token-liquidity/query` | 🔶 | param non-standar |
| `/v1/dex/holders/trend/list` | ❌ | Startup+ |
| POST `/v1/dex/tokens/batch-query` `price/batch` `trending/list` `gainer-loser/list` `new/list` `meme/list` | ❌ | semua list-DEX premium — Startup+ |
| `/v1/k-line/candles` `/v1/k-line/points` | ⚠️ | 500 "system busy" 2x — retry/cek docs lagi |

## Keyless Public API (tanpa key sama sekali)

`/public-api/v2/simple/price?symbol=BTC` → ✅ harga riil. Prefix `/public-api` untuk endpoint terpilih (simple/price, sebagian dex/token, dll). Berguna buat demo publik tanpa expose key.

## Implikasi ke pilihan project (update vs KANDIDAT.md)

1. **Quant/backtest LAYAK di Basic**: `quotes/historical` (v2/v3) jalan → time-series harga harian per koin bisa dibangun. OHLCV candle tetap terkunci sampai Startup aktif — **register DoraHacks SEKARANG** supaya kebuka.
2. **DEX-flow/smart-money radar LAYAK penuh**: search, token detail, pools, transactions (swaps riil), liquidity-change, security — semua jalan hari ini. Ini fondasi "RADAR-X Crypto" / Elephant-Tracks-style flow.
3. **Screener butuh Startup**: `trending/*` dan `market-pairs` 403 — tanpa upgrade, screener cuma bisa pakai listings/latest sort manual.
4. **Derivatives = bonus track nyaris gratis**: liquidations + perp market-pairs jalan — bisa jadi fitur pembeda (funding/OI/liq radar) yang hampir tak disentuh kompetitor.
5. **RWA core jalan** tapi track-nya padat (12/40 kompetitor) — skip.
6. Setelah upgrade Startup aktif: trending, OHLCV, market-pairs, content, community, CMC AI, DEX list endpoints semua kebuka → scope submission bisa lebih gemuk.
