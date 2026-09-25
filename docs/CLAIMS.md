# Verdex — Published Verdict Rules (CLAIMS.md)

Setiap angka di verdict bisa diaudit di sini. Threshold sengaja konservatif —
gray zone selalu menghasilkan `BELUM_CUKUP_BUKTI`, bukan tebakan.

## Sub-verdict levels

`CLEAN` = bukti mendukung · `WARN` = mixed/gray · `DANGER` = red flag terbukti ·
`INSUFFICIENT` = data tidak cukup untuk memutuskan.

## SAFETY (sumber: `dex/security/detail`)

| Rule | Level |
|---|---|
| `isHit` pada `honeypot`, `rug_pull`, `unusual_sell_tax` (sell_tax > 10%) | DANGER |
| `isHit` pada `wash_trading`, `whitelist_function`, `low_liquidity`, `unusual_buy_tax`, atau `securityLevel=caution`/`risky` | WARN |
| Semua flag bersih dan `securityLevel=safe` | CLEAN |
| Endpoint error / token tidak ada data | INSUFFICIENT |

## FLOW (sumber: `dex/tokens/transactions`, window = swaps yang tersedia)

| Metric | CLEAN | WARN | DANGER |
|---|---|---|---|
| `thirdPartySellCount` (sell oleh ≥3 maker unik non-pool) | ≥3 sells | 1–2 | **0 sells dengan ≥20 buys** |
| `uniqueMakers` (distinct `ma`) | ≥20 | 5–19 | <5 |
| `top5MakerShare` (share volume USD 5 maker terbesar) | <0.50 | 0.50–0.70 | >0.70 |
| `netBuyRatio` = (buyUSD − sellUSD)/totalUSD | >0 | −0.2..0 | <−0.2 |

Dimensi = worst-of metrics; `swaps < 50` → INSUFFICIENT.

## LIQUIDITY (sumber: `dex/liquidity-change/list` + `dex/token/pools`)

| Metric | CLEAN | WARN | DANGER |
|---|---|---|---|
| `netLpDelta` (adds − removes, USD) | ≥0 | −10%..0 | <−10% pool |
| `maxSinglePullPct` (remove terbesar vs pool size) | <15% | 15–50% | >50% |
| `poolCount` | ≥1 valid pool | — | 0 → INSUFFICIENT |

## PUMP (sumber: `dex/token/price`, transactions, `quotes` mcap jika ada)

| Metric | CLEAN | WARN | DANGER |
|---|---|---|---|
| `volMcapRatio` (24h vol / mcap) | <0.5 | 0.5–1.0 | >1.0 |
| `makersPer100kVol` | ≥5 | 1–5 | <1 (volume oleh <1 maker/100k = wash) |
| Konteks: harga naik >30% 24h SAAT BTC.D naik & F&G <30 | — | WARN | — |

## Composite → verdict

| Kondisi | Verdict |
|---|---|
| Salah satu dimensi `INSUFFICIENT` karena coverage | **BELUM_CUKUP_BUKTI** |
| Ada `DANGER` di SAFETY atau FLOW | **JANGAN** |
| Ada `DANGER` di LIQUIDITY/PUMP, atau ≥2 WARN | **RAWAN** |
| Semua CLEAN, score ≥70 | **LAYAK** |
| Lainnya | **RAWAN** |

Score = 100 − Σ penalties (DANGER −40, WARN −15 per dimensi, INSUFFICIENT −25),
clamped 0–100. Confidence: `high` jika swaps≥200 & semua endpoint sukses;
`medium` swaps 50–199; `low` jika ada dimensi INSUFFICIENT tapi cukup bukti
untuk verdict non-abu.

## Jev cross-examination

Jev menjawab `noul` per dimensi atas metrics JSON yang sama.
`agreement = consensus` jika sign(rules) == sign(jev>0.5) pada ≥3 dari 4
dimensi; selain itu `contested`. Jev tidak pernah mengubah verdict rules —
ia second opinion yang ditampilkan berdampingan.

## Keterbatasan yang diakui (ditulis juga di submission note)

- Tanpa OHLCV (Basic) → analisis "sweep" intraday tidak dilakukan.
- Tanpa wallet labels → "akumulasi luas vs terkonsentrasi", bukan "smart money".
- CEX order-flow & social hype di luar jangkauan.
- Wash-trading antar-wallet terkoordinasi bisa menyerupai breadth asli —
  `wash_trading` flag + maker concentration meng-cover sebagian.
