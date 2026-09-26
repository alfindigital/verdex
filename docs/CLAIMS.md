# Verdex — Published Verdict Rules (CLAIMS.md)

Setiap angka di verdict bisa diaudit di sini. Threshold sengaja konservatif —
gray zone selalu menghasilkan `BELUM_CUKUP_BUKTI`, bukan tebakan.

## Sub-verdict levels

`CLEAN` = bukti mendukung · `WARN` = mixed/gray · `DANGER` = red flag terbukti ·
`INSUFFICIENT` = data tidak cukup untuk memutuskan.

## SAFETY (sumber: `dex/security/detail`)

| Rule | Level |
|---|---|
| `isHit` pada `honeypot`, `rug_pull`, `unusual_sell_tax`, atau `sellTax > 10%` | DANGER |
| `isHit` pada `wash_trading`, `whitelist_function`, `low_liquidity`, `unusual_buy_tax` | WARN |
| `isHit` pada centralization flags `mintable`, `pausable`, `blacklist(_function)`, `upgradeable`/`proxy`, `owner_change_balance`, `hidden_owner` (kekuasaan admin nyata — bukan bukti rug, tapi vektor rug) | WARN |
| `isHit` pada riskCode LAIN yang tak terklasifikasi (fail-open dilarang) | WARN |
| `securityLevel` apa pun selain `safe` (termasuk level tak dikenal) | WARN |
| Semua flag bersih dan `securityLevel=safe` | CLEAN |
| Endpoint error / token tidak ada data | INSUFFICIENT |

## FLOW (sumber: `dex/tokens/transactions`, window = swaps yang tersedia)

Semua threshold di kalibrasi untuk window ~100 swap terakhir (cap CMC) —
bukan 24 jam. Maker dihitung case-insensitive; address pool dan creator
(meta `dex/token` `crt`/`own`) tidak dihitung sebagai seller pihak ketiga;
address pool juga dikecualikan dari statistik maker.

| Metric | CLEAN | WARN | DANGER |
|---|---|---|---|
| `thirdPartySellCount` (sell oleh ≥3 maker unik non-pool & non-creator) | ≥3 sells | 1–2 | **0 sells dengan ≥20 buys** |
| `uniqueMakers` (distinct `ma`) | ≥20 | 5–19 | <5 |
| `top5MakerShare` (share volume USD 5 maker terbesar) | <0.50 | 0.50–0.70 | >0.70 |
| `netBuyRatio` = (buyUSD − sellUSD)/totalUSD | >0 | −0.2..0 | <−0.2 |

Dimensi = worst-of metrics; `swaps < 50` → INSUFFICIENT.

**Mature-asset tier (published):** token dengan `mcapUsd ≥ $100M` diperdagangkan
lintas CEX+DEX — window on-chain mereka didominasi infrastruktur arbitrase,
jadi `top5MakerShare` dan `netBuyRatio` hanya boleh WARN (tidak bisa DANGER).
Sinyal insider-exit (`thirdPartySells=0`, `uniqueMakers<5`) tetap bisa DANGER
karena venue-independent. Row `mcapTier` ditampilkan di panel FLOW agar
tier-nya terlihat. `mcapUsd` tidak tersedia → early tier (fail-strict by
design); boundary $100M adalah cliff yang disengaja dan dipublikasi — bukan
continuum.

## LIQUIDITY (sumber: `dex/liquidity-change/list` + `dex/token/pools`)

| Metric | CLEAN | WARN | DANGER |
|---|---|---|---|
| `netLpDelta` (adds − removes, USD) | ≥0 | −10%..0 | <−10% total liq |
| `maxSinglePullPct` (remove terbesar vs **pool yang ditarik**; pool tak dikenal → total liq) | <15% | 15–50% | >50% |
| `totalLiqUsd` | ≥$10k | <$10k | — |
| `poolCount` | ≥1 valid pool | — | 0 → INSUFFICIENT |

## PUMP (sumber: `dex/search` stats + `dex/tokens/transactions` + market ctx)

| Metric | CLEAN | WARN | DANGER |
|---|---|---|---|
| `volMcapRatio` (24h vol / mcap) | <0.5 | 0.5–1.0 | >1.0 |
| `makersPer100kVol` — unique makers per $100k **USD dalam window yang sama** (bukan 24h; membandingkan window≠24h membuat token likuid selalu terlihat wash) | ≥5 | 1–5 | <1 |
| Konteks: harga naik >30% 24h SAAT BTC.D naik & F&G <30 | — | WARN | — |

## Composite → verdict

Dievaluasi **berurutan** (proven red flag mengalahkan data yang hilang —
`DANGER` outranks `INSUFFICIENT`, by design):

| Kondisi | Verdict |
|---|---|
| Ada `DANGER` di SAFETY atau FLOW | **JANGAN** |
| Ada `DANGER` di LIQUIDITY/PUMP, atau ≥2 WARN | **RAWAN** |
| Salah satu dimensi `INSUFFICIENT` (tanpa DANGER & <2 WARN) | **BELUM_CUKUP_BUKTI** |
| Semua CLEAN (`warns=0`) dan score ≥70 | **LAYAK** |
| Lainnya (mis. tepat 1 WARN) | **RAWAN** |

Score = 100 − Σ penalties (DANGER −40, WARN −15 per dimensi, INSUFFICIENT −25),
clamped 0–100. CMC membatasi swap history ke 100 transaksi terbaru
(param `offset`/`page` diabaikan — diprobe), sehingga confidence:
`high` jika swaps≥100 (window penuh) **dan nol dimensi INSUFFICIENT**;
`medium` jika swaps 50–99 (INSUFFICIENT tidak mengubah medium);
selain itu `low` (window <50 swap). Kegagalan endpoint tidak menurunkan
confidence langsung — ia muncul sebagai INSUFFICIENT pada dimensi terkait
(yang memblokir `high`) atau hanya dicatat di `failures[]` untuk
konteks/meta — semuanya terlihat di receipts/failures panel.

## Jev cross-examination

Jev menjawab `noul` per dimensi (safety/flow/liquidity/pump) atas metrics
JSON yang sama, dalam satu call — verdict rules tidak dikirim sebagai state
(Jev menilai independen). `agreement` dihitung dua jalur dan **contested
selalu menang** — pertarungan tidak pernah disembunyikan:
(a) per-dimensi: sign(rules) == sign(jev>0.5) pada ≥3 dimensi comparable →
consensus, selisih → contested (dimensi INSUFFICIENT / prob null tidak dihitung);
(b) band agregat pada mean dims: ≥0.65 risky / ≤0.35 aman — jika band
bertentangan dengan polaritas verdict rules → contested; tengah → `lean`.
Badge akhir: contested jika salah satu jalur contested, consensus hanya jika
kedua jalur sepakat. Jev tidak pernah mengubah verdict rules — ia second
opinion yang ditampilkan berdampingan.

## Keterbatasan yang diakui (ditulis juga di submission note)

- Tanpa OHLCV (Basic) → analisis "sweep" intraday tidak dilakukan.
- Tanpa wallet labels → "akumulasi luas vs terkonsentrasi", bukan "smart money".
- CEX order-flow & social hype di luar jangkauan.
- Wash-trading antar-wallet terkoordinasi bisa menyerupai breadth asli —
  `wash_trading` flag + maker concentration meng-cover sebagian.
