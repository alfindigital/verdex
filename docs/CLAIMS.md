# Verdex — Published Verdict Rules (CLAIMS.md)

Setiap angka di verdict bisa diaudit di sini. Threshold sengaja konservatif —
gray zone selalu menghasilkan `BELUM_CUKUP_BUKTI`, bukan tebakan.

## Sub-verdict levels

`CLEAN` = bukti mendukung · `WARN` = mixed/gray · `DANGER` = red flag terbukti ·
`INSUFFICIENT` = data tidak cukup untuk memutuskan.

## V2 evidence contract (2026-09-29)

The legacy rules below remain attached to historical v1 snapshots. New V2
records use `schemaVersion: 2` and `rulesVersion: 2.3.0`:

- `observedSellMakers` means distinct maker identities observed in valid sell
  rows after pool/creator/owner exclusions. It is not a claim of independent
  ownership or intent. The UI no longer labels it “third-party wallets”.
- A result can be `NO_FLAGS_OBSERVED` only when required sources are fresh and
  sufficient. Failed, unsupported, stale, invalid, and missing sources remain
  visible as coverage reasons; they never become zero or CLEAN.
- LP event failure makes LP change/depth linkage unknown even when pool depth is
  present. The synthetic LP-outage fixture is a regression case, not a market
  incident.
- The swap window is the endpoint response that was actually captured. A
  universal pagination or CMC cap claim is not published until a current
  authorized probe verifies it.
- A bounded live smoke test passed with an authorized key, but current tier
  entitlement, pagination, and a real exact-body capture remain unverified
  because no exact raw bundle was retained.

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
| `top5MakerShare` (share volume USD 5 maker terbesar) | <0.50 | 0.50–0.70 | >0.70 **dan** uniqueMakers <20 |
| `swapsPerDay` (tape vitality — swaps ÷ span hari window) | ≥50/hari | 15–50/hari | <15/hari (**dead tape** — pasar butuh >6 hari untuk 100 swap; exit nominal meski depth terlihat) |
| `netBuyRatio` = (buyUSD − sellUSD)/totalUSD | ≥ −0.10 | −0.3..−0.1 | <−0.3 |

Kalibrasi `rulesVersion 2.1.0` (2026-10-01): konsentrasi top-5 pada window
100-swap hanya berstatus DANGER bila breadth juga tipis — di sampel terbatas,
share besar dengan banyak maker unik lebih tepat dibaca whale/MM flow, bukan
insider tape. `netBuyRatio` di bawah nol tipis adalah hari merah biasa; WARN
baru berlaku saat outflow material (<−0.10), DANGER saat <−0.30.

## Labeled-set evaluation (jujur, kecil — indikasi bukan bukti statistik)

`scripts/eval-verdicts.ts` menguji corpus terhadap ground truth publik —
**59 label dalam 3 kelas**: 6 dead (harus JANGAN), 7 faded/zombie (tidak
boleh LAYAK — stamp hijau pada zombie adalah miss terburuk), dan 46 majors
mapan (tidak boleh JANGAN). Hasil pada `rulesVersion 2.3.0`:

- Dead tertangkap JANGAN: **4/6** (TITANO $0, VGX $2, NORMIE exploit, CEL
  dead-tape 13 swap/hari).
- Dead soft-flag RAWAN: **2/6** — FTT ($127k liq, 67 swap/hari) dan FEI
  ($965k total liq, 17 swap/hari) masih punya tape yang hidup dan exit yang
  nyata; collapse ≠ untradeable. Batas jujur: rules mengukur tape sekarang,
  bukan reputasi proyek — RAWAN pada token mati-yang-masih-likuid adalah
  jawaban evidence yang benar, bukan bug.
- Faded flagged (tidak hijau): **7/7** — HOGE, DFYN, MBOX, CHEEMS, BODEN,
  MICHI, WEN semuanya RAWAN; nol zombie dapat ENTRY-WORTHY.
- Major false-positive (AVOID): **3/46** — SNX-Optimism, COW-Gnosis,
  VELO-Optimism ketembak FLOW-DANGER (insider-tape: top5>0.7 + makers<20).
  Polanya jelas: venue L2/sidechain tipis di mana tape memang terkonsentrasi
  pada sedikit maker secara struktural — konsentrasi di chain tipis ≠
  manipulasi. Tercatat sebagai miss nyata, bukan disembunyikan.
- Majors ENTRY-WORTHY: **0/46** — gate LAYAK sangat strict (semua dim bersih);
  majors mendapat RAWAN karena tape DEX padat-arsip mereka menembak
  threshold FLOW, bukan karena scam. Trade-off disengaja; sensitivitas
  masih bisa dinaikkan tapi presisi menurun.
- Receipt membuktikan reproduksibilitas, bukan kebenaran prediksi — belum
  ada outcome follow-up 24h/7d (semua capture 30 Sep 2026).

Kalibrasi `rulesVersion 2.2.0` (2026-09-30): `totalLiqUsd <$1k` naik dari
WARN ke DANGER dan dieskalasikan ke JANGAN — pool yang ada tapi berkedalaman
nol membuat exit mustahil apa pun status kontraknya (kasus: TITANO $0,
VGX $2). LP-pull dan net-outflow DANGER tetap RAWAN: itu risiko potensial,
bukan ketidakmungkinan exit saat ini.

Kalibrasi `rulesVersion 2.3.0` (2026-10-01): `swapsPerDay` ditambahkan ke
FLOW — **tape vitality**. Pasar yang butuh >6 hari untuk mengumpulkan 100
swap adalah tape mati: kedalaman pool bisa terlihat tapi exit nyata tidak
ada (kasus: CEL 13/hari → JANGAN, HOGE 4/hari → JANGAN). Threshold dipilih
dari pemisahan empiris di corpus: token dead/zombie duduk di 4–70 swap/hari,
major aktif di 1.300–170.000/hari — jarak ~20×. Di mature tier (≥$100M mcap)
dead tape di-cap WARN karena aset CEX-listed wajar punya DEX footprint kecil.
Efek samping yang diakui: JONES turun LAYAK→RAWAN (20 swap/hari — tape
memang tipis) dan LAYAK corpus menjadi 5.

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
| `totalLiqUsd` | ≥$10k | <$10k | **<$1k dust** (exit mustahil — pools ada tapi kosong) |
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
| Ada `DANGER` di SAFETY atau FLOW, **atau LIQUIDITY `totalLiqUsd` DANGER** (`<$1k` — token secara praktis tidak bisa dijual, sekelas outcome honeypot) | **JANGAN** |
| Ada `DANGER` di LIQUIDITY/PUMP (selain dust depth), atau ≥2 WARN | **RAWAN** |
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

Hasil aktual di corpus 130 record (rules 2.3.0): **5 consensus · 16 lean ·
109 contested**. Polanya konsisten dan dilaporkan apa adanya: Jev setuju
keras pada dimensi SAFETY (P 0.64–0.72 tepat di token yang rules flag
danger) dan pada kelima LAYAK (P 0.07–0.10), tetapi sistematis menilai
konsentrasi maker FLOW dan likuiditas dust lebih rendah risikonya daripada
rules. Kedua lensa berdiri berdampingan — contested bukan kegagalan, tapi
bukti bahwa rules memang sengaja lebih strict pada tape/exit-risk.

## Keterbatasan yang diakui (ditulis juga di submission note)

- Tanpa OHLCV (Basic) → analisis "sweep" intraday tidak dilakukan.
- Tanpa wallet labels → "akumulasi luas vs terkonsentrasi", bukan "smart money".
- CEX order-flow & social hype di luar jangkauan.
- Wash-trading antar-wallet terkoordinasi bisa menyerupai breadth asli —
  `wash_trading` flag + maker concentration meng-cover sebagian.
