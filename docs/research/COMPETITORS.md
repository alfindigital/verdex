# Landscape Kompetitor — 40 BUIDL "Build with CMC: API Hackathon"

> Sumber: dorahacks.io/hackathon/coinmarketcap-api-202609/buidl (di-paste user 24 Sep 2026)
> 185 hackers terdaftar, 40 BUIDL masuk. Deadline ~6 hari lagi.

## Distribusi track (yang dipilih submitter)

| Track | Jumlah | Share |
|---|---|---|
| AI Agents & Automation | 13 | 32% |
| Real World Assets | 12 | 30% |
| Markets & Trading Tools | 8 | 20% |
| Data & Visualisation | 7 | 18% |

RWA + AI Agents = 62% lapangan. Markets & Trading paling sepi relatif ke jumlah developer yang "main" di situ.

## Per-entry: goal, dipakai apa, workflow

### Track: Real World Assets (12)

| BUIDL | Goal | Data/workflow |
|---|---|---|
| **MirrorGap** (Tang Vu) | Deteksi selisih harga antar wrapper tokenized asset | Cek RWA quotes → cek freshness & market hours → catat insiden → export "evidence receipt" auditable. Demo pakai fixture sintetik (red flag kecil). |
| **RWAT SCORE** | Skor risiko auditable untuk aset apa pun | CMC market data + sinyal on-chain + bukti policy → angka skor transparan. |
| **Investor Intel** (TheContentForge) | Sumber di balik harga RWA | Tambahkan issuer + filings + likuiditas riil + receipt di tiap angka. |
| **Verigate** (Rinat) | "Let AI act" — verifikasi sebelum aksi | Gatekeeper untuk keputusan AI (deskripsi tipis). |
| **Shelfware** (Edy Cu) | Hitung tokenized stock yang tak punya market | Scan katalog RWA CMC → hitung wrapper tanpa tracked market → grade issuer → jawab per-ticker. |
| **UnderScope** (Pinnacle Crypt) | Investigasi RWA lebih cepat | Gabungkan aset↔issuer↔token yang tersebar jadi satu view. |
| **RWA X-Ray** | Kapasitas pasar riil RWA | Volume, konsentrasi, data gap, freshness → stress-test posisi dengan bukti. |
| **Bedrock** | Trust layer RWA | Ranking live wrapper spread + issuer/chain + link SEC filings + patch data gap API-nya sendiri. |
| **Backstop** | Atribusi nilai per-token RWA | 7.811 baris katalog, <800 punya token, 15 issuer pegang semua nilai → ukur konsentrasi + publikasikan lubang data. |
| **Signal Desk** (Smartcoded) | Risiko pasar: partisipasi vs sentimen | "Voice and Money" — flag saat sentimen & partisipasi beda; resolve tokenized stock → emiten asli. |
| **RWA Compass** (Zubair Shafi) | Agent Q&A RWA berbasis data riil | Baca RWA endpoints → jawab apa/likuid/bandingkan → cite angka riil. |
| **Parity** (kiter) | Fair-price layer tokenized stocks | Hitung wrapper spread vs harga acuan. |

**Pola RWA**: hampir semua = "audit/evidence/issuer-mapping" di atas endpoint `/v5/real-world-assets/*`. Angle klaster: wrapper-spread (MirrorGap, Parity, Bedrock), issuer forensik (Shelfware, Backstop, UnderScope), scoring (RWAT, Investor Intel, X-Ray, Compass). Data-gap moaning dianggap fitur oleh beberapa (Bedrock, Backstop).

### Track: AI Agents & Automation (13)

| BUIDL | Goal | Data/workflow |
|---|---|---|
| **Forwarding Address** (Edy Cu) | Adjudikasi alert "liquidity pulled" | Agent ikuti wallet di balik LP removal lintas pool/chain → jawab "uang keluar vs cuma pindah" + 2 baris bukti. |
| **CMC Witness** (CryptoCT01) | Pre-trade gate untuk AI trading agent | Skor bukti via CMC → allow/caution/block → Market Receipt tamper-evident; bayar via x402 per call. |
| **MarketSentinel** (Cubiczan) | Deteksi manipulasi pasar rahasia | CMC → iExec TEE (encrypted) → 3 sub-score (wash trading, exchange concentration, pump) → sinyal on-chain TokenClean/Manipulated. |
| **RWA AI Research Agent** (ndm604539) | MCP research agent RWA | FastMCP server di atas RWA endpoints → standardisasi likuiditas + resolve wrapper → masuk Claude Desktop. |
| **CMC-Sentinel-MCP** (Moyu) | Firewall eksekusi agent | MCP: orderbook depth + sentiment → blokir slippage/honeypot/MEV sebelum tx on-chain. |
| **CMC Market Detective** (RonyZ) | Detektif pasar AI | Deteksi gerak anomali → investigasi bukti → cari setup mirip → penjelasan grounded (no catalyst halu). |
| **PerpsIA** (Jonathan) | Intelijen pasar all-in-one | Derivatives + TA + SMC + on-chain + sentimen + makro → peluang trading. |
| **Argus** (Trillions) | "Kenapa bergerak" bukan "apa yang gerak" | Watch top 200 → flag anomali per koin → investigasi live → tunjukkan SEMUA API call (audit trail). |
| **CMC Agent Tools** (Solocreative) | MCP server tools CMC | Price/market/listings lookup + `get_liquidation_risk` (health factor & liq price dari harga live). |
| **KeeperHub Agent Economy** | Payment layer agent | NL → routing pembayaran on-chain instan (deskripsi umum). |
| **MarketMind** (elkanemi) | Data → intelijen pasar AI | Raw CMC → penjelasan "apa artinya" untuk user. |
| **Precedent Panel** (9718149) | Risk snapshot per price lookup | Governance flags, treasury concentration, hack alerts, dampak event historis; x402 per-call. |
| **Will RWA Let Me In** (Robinhill85) | RWA investing sesimpel tanya | Agent jawab akses + siapkan tx untuk user sign di wallet. |

**Pola AI Agents**: tiga klaster — (a) **MCP server wrappers** (Agent Tools, Sentinel-MCP, RWA Agent), (b) **pre-trade/risk gates** (Witness, Sentinel, Precedent Panel), (c) **detective/explainer agents** (Argus, Market Detective, MarketMind, PerpsIA). Banyak yang jual "audit trail of API calls" — judges kayaknya suka verifiability.

### Track: Markets & Trading Tools (8)

| BUIDL | Goal | Data/workflow |
|---|---|---|
| **Middleman** (Edy Cu) | "Siapa di antara quote & fill-ku" | Print riil tiap DEX pool, ordered+joined by maker, keyless → trader pilih pool & slippage cap dari bukti. |
| **Pulse Screener** (Vincent) | Screener CMC cepat + alert aman | Listing/quotes → what's moving → konteks → price alerts. |
| **Crypto Screener** (edensember) | Satu layar ganti 3 tab | CMC + exchange + TradingView dalam satu screen: moving? tradeable? trustworthy? |
| **Divergence** (geralexgr) | Voice vs Money gap | Dua indeks 0-100 + gapnya, direkam tiap 15 menit — karena positioning history tak bisa di-fetch retroaktif (moat data sendiri). |
| **Baserate** (kryptoholik) | Screener + base rate historis | "Yang cocok hari ini + apa yang terjadi 1000x sebelumnya" di 2 tahun data CMC — paling dekat quant. |
| **Python CLI tool** (mnyandenilunga) | Notifikasi email + monitor inefficiency | CLI Python → alert email; arbitrage monitor (tipis). |
| **Catalyst Edge** (nanadaka) | Setup riset long/short ter-explain | Live CMC → ranked setups dengan entry/target/invalidation/risk transparan. |
| **CMC-Alpha-Terminal** (Ishant5436) | Quant screening engine institusional | Zero-heap quant engine + FastMCP gateway + "Holzmann Deterministic Safety Invariants". |

### Track: Data & Visualisation (7)

| BUIDL | Goal | Data/workflow |
|---|---|---|
| **My Beginning** | Gambaran besar aset & keluarganya | Lineage/koneksi antar aset dalam satu tempat. |
| **Cap or No Cap** | Game tebak higher/lower | 2 aset, 1 stat revealed 1 hidden → tebak. |
| **Keldavo Journal** | Jurnal trading + konteks | Trades + CMC context timestamped → review berlabel manusia. |
| **OverWatch** (demi) | Data teknis → terasa manusiawi | Live CMC dipresentasikan "alive" untuk non-teknis. |
| **Crypto Derivatives Risk Radar** (CSquant) | Peta stres pasar derivatif | Fragmented derivatives data → view transparan di mana stres menumpuk. |
| **TrendLab Market Structure Map** (Aleksandr) | Bedakan gerak broad vs narrow | Partisipasi pasar vs gerak large-cap saja → bahasa naratif lebih presisi. |
| **Elephant Tracks** (Edy Cu) | Shape of flow DEX | Tape tak direduksi jadi 1 angka — bedakan desk besar jual ke kerumunan vs matched pairs. |

## Temuan strategis

1. **Edy Cu submit 4 BUIDL** (Middleman, Forwarding Address, Shelfware, Elephant Tracks) — rules allow multiple submissions, 1 prize per orang. Dia shotgun 3 track. Catatan: pola "evidence receipts" berulang.
2. **Tidak ada yang backtest/validasi sinyal beneran.** Baserate paling dekat (frekuensi historis) tapi bukan Monte Carlo/OOS validation. **Lubang terbesar = quant validation** — pas banget sama mesin Tradingview/Backtest kamu.
3. **Tidak ada capital-rotation / narrative-flow** (konsep Arus Koin). TrendLab (breadth) paling dekat tapi beda.
4. **Tidak ada smart-money positioning radar** ala RADAR-X (insider→whale/DEX-flow). Divergence & Elephant Tracks paling dekat tapi bukan positioning per-aset.
5. **Verifiability = meta yang menang**: "show every API call", "auditable receipts", "cited real numbers" muncul di >10 entry. Submission kamu wajib expose API call-nya secara eksplisit (yang emang syarat wajib juga).
6. **MCP server sudah penuh sesak** (3-4 entry) — jangan submit "yet another MCP".
7. **x402 muncul 2x** (CMC Witness, Precedent Panel) — bayar-per-call on-chain jadi gimmick menarik tapi belum jenuh.
8. **RWA padat** (12) padahal endpoint paling baru — kalau mau RWA harus beda banget; saran: hindari.
9. Demo tipis terlihat: MirrorGap pakai "synthetic fixtures", Python CLI cuma email — bar "does it work" (30 poin) bisa dimenangkan dengan demo live riil.
