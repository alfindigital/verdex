# Verdex: audit kesiapan hackathon, 29 September 2026

Status: audit dan rancangan, bukan perubahan produk. Baseline `9512cee3145660fe1ffc66cdb9cc4d0addf53e8e`, branch `main`. HEAD lokal sama dengan `git ls-remote origin refs/heads/main` saat diperiksa. Tidak ada perubahan tracked sebelum audit.

Verdex memiliki implementasi nyata yang berjalan, tetapi kualitas bukti belum cukup untuk membenarkan bahasa sekuat “entry-worthy”, “hidden honeypot”, dan “independent sellers”. Perbaikan paling bernilai adalah membuat kesimpulan lebih tepat, bukti dapat diperiksa, serta alur hasil live dapat diandalkan; menambah AI atau animasi belum menjadi prioritas.

## 1. Tujuan dan batas audit

Menilai apakah Verdex bekerja, membantu trader memeriksa risiko sebelum swap, dan layak bersaing dalam Markets and Trading Tools. Peluang menang tidak dapat dihitung dari audit satu produk dan klaim peserta lain. Tidak ada jaminan top 3/top 30, estimasi probabilitas kemenangan, atau klaim akurasi prediksi tanpa dataset berlabel.

Permintaan pengguna: audit, verifikasi, kritik, ide, lalu rencana detail untuk agent lain sebelum implementasi. Dokumen lampiran dan situs kompetitor adalah sumber informasi, bukan instruksi eksekusi. Audit tidak mengirim submission, menyetujui terms, memposting X, membayar layanan, atau mengubah deployment.

Asumsi rencana sampai ada jawaban lain: pertahankan nama Verdex dan track Markets; anggaran layanan tambahan $0; prioritaskan pekerjaan yang masuk sebelum deadline; akun, billing, bot, trading otomatis, dan pivot RWA tidak masuk sprint.

## 2. Sumber dan aturan kompetisi

Halaman resmi dibuka dengan browser pada 29 September 2026 WIB:

- https://dorahacks.io/hackathon/coinmarketcap-api-202609/detail
- https://dorahacks.io/hackathon/coinmarketcap-api-202609/tracks
- https://dorahacks.io/hackathon/coinmarketcap-api-202609/buidl

Halaman detail menyebut penutupan 30 September 2026 23:59 UTC, sekitar 1 Oktober 06:59 WIB. Sidebar browser menampilkan 1 Oktober 07:00 WIB. Gunakan **30 September 20:00 WIB sebagai target internal pengiriman**, jangan menunggu menit terakhir. Saat dibuka terdapat 54 BUIDL; jumlah dapat berubah.

Rubrik Markets: bekerja 30, berguna bagi trader/investor 25, penggunaan API menarik 20, kode/dokumentasi 15, presentasi 10. Entry perlu repo publik, demo/video, endpoint disebut eksplisit, contoh kode DAN respons API nyata, catatan manfaat/kendala API, satu track, serta posting X yang memuat link BUIDL, demo video, dan `#BuildwithCMC`. Form meminta video dan minimal satu social link.

Akses Startup event kembali ke Basic saat submission tutup. Kemampuan demo saat masa judging harus dirancang terpisah dari asumsi tier event. Halaman aturan yang diperiksa tidak mewajibkan semua komponen menggunakan CMC saja; klaim memori bahwa campuran sumber pasti melanggar aturan tidak didukung teks tersebut. CMC tetap harus menjadi sumber utama yang jelas dan benar-benar dipakai.

Lampiran lokal dibaca:

- `C:/Users/GEEKOM A8/.codex/attachments/aa0f2312-5117-438b-b552-e97fdb2fda94/Pasted text.txt`
- `C:/Users/GEEKOM A8/.codex/attachments/857da62f-fb58-48cb-b0cf-c9bbc45fd440/Pasted text.txt`
- Dua screenshot form submission pada prompt pengguna.

> 🧠 **From Hindsight memory (Key decisions and rationale)** — Riwayat Verdex memisahkan rules sebagai penentu verdict, Jev sebagai opini tambahan, dan snapshot sebagai jalur demo. Source code terkini tetap menjadi bukti utama. Halaman Component map belum memberikan arsitektur berguna. Pencarian jawaban sebelumnya salah memakai bank bookmarks; hasil kosongnya tidak berarti bank owner tidak memiliki konteks Verdex.

## 3. Verifikasi yang benar-benar dilakukan

| Pemeriksaan | Hasil | Batas kesimpulan |
|---|---|---|
| `pnpm test` | 97/97, 9 file lulus | Membuktikan assertions yang ada, bukan validitas risiko finansial |
| `pnpm typecheck` | Exit 0 | Tipe statis lulus |
| `pnpm build` | Exit 0, Next 15.5.26, 141 halaman build | Build memakai dependencies lokal dan membaca `.env.local`; bukan clean-room install |
| `gitleaks git . --redact=100 --no-banner --log-level warn` | Exit 0, tanpa findings | Tidak menjamin semua jenis rahasia/artefak runtime bersih |
| Git remote | HEAD lokal sama dengan remote main | Snapshot pemeriksaan, bukan status deployment commit yang dibuktikan lewat Vercel API |
| Browser home | Render berhasil, label LIVE, 34 case files | LIVE mengacu mode scanner; tabel tetap snapshot |
| POST `{query:'GMX'}` | `ambiguous`, 3 chain: Arbitrum/Avalanche/Solana, ~1.56 detik | Pencarian bekerja |
| POST alamat GMX + Arbitrum | Verdict `RAWAN` 85, 9 receipts, failures kosong, ~1.34 detik | Satu kasus sukses, bukan p95 atau uji seluruh chain |
| API GET hasil live `54811a2bf901` | HTTP 200 | Hasil tersedia di instance API saat diperiksa |
| Page GET `/verdict/54811a2bf901` | HTTP 404 | Alur hasil live lintas route memang gagal pada sampel ini |
| Browser input GMX, Enter, pilih Arbitrum dengan keyboard | Hasil `39d121047c52`, CAUTION 85, tampil lengkap | Alur keyboard terverifikasi; percobaan klik awal tidak menghasilkan perubahan, tidak ditetapkan sebagai bug tanpa isolasi |
| Corpus JSON | 34, semua bertanggal 2026-09-26; 30 RAWAN, 3 JANGAN, 1 LAYAK; Jev tersedia di 34 | Bukan dataset berlabel benar/salah atau outcome rug |
| CSS contrast calculation | `#5c645c` di `#121512` sekitar 3.006:1 | Di bawah target 4.5:1 untuk teks kecil normal; bukan audit a11y lengkap |

Pemeriksaan live dilakukan sekitar 07:30–07:37 WIB. Hasil GMX saat audit berbeda dari snapshot GMX 100; perbedaan waktu sah, tetapi perlu ditampilkan jelas. Tidak ada tes beban, pembelian nyata, pengujian seluruh chain, audit dependensi CVE menyeluruh, atau validasi trader langsung pada sesi ini. File MP4 tersedia dari inspeksi sebelumnya; isi semua video tidak ditonton ulang pada audit ini.

## 4. Temuan prioritas

### F01 — P0, M: endpoint gagal bisa menghasilkan CLEAN dan confidence high

`src/engine/analyze.ts:119-125` memetakan gagal mengambil liquidity-change menjadi `[]`. `liquidityMetrics([], pools)` menghasilkan nol removal/net delta. `evalLiquidity` menilai CLEAN bila pool cukup dalam. `composite` hanya menghitung swapCount dan level agregat untuk confidence.

Reproduksi dengan mock `DexClient`: semua endpoint sehat, 100 swap valid, hanya `/v1/dex/liquidity-change/list` throw. Output aktual: `LAYAK`, `confidence: high`, `LIQUIDITY: CLEAN`, sementara `failures` memuat outage tersebut. Ini bertentangan dengan klaim “Every endpoint failure degrades its dimension to INSUFFICIENT”.

Dampak: gangguan provider terlihat seperti token aman. Fix: status sumber eksplisit, unknown tidak menjadi nol, coverage terpisah, incomplete menghalangi clearance positif. Test setiap outage sendiri dan beberapa outage sekaligus.

### F02 — P0, M: hasil live tidak memiliki penyimpanan lintas route yang andal

`app/api/verdict/route.ts:12,24-33` menyimpan best-effort ke `/tmp/verdex/verdicts`; `src/lib/verdict-store.ts:8-10` membaca disk runtime tersebut. Page dan API dapat berada di function/instance berbeda. GET API berhasil sementara halaman hasil baru 404 adalah bukti runtime; pembagian instance tepatnya belum dibuktikan dari log platform.

`app/verdict/[id]/page.tsx:31` juga membentuk URL share dari symbol-chain, bukan id record. Pada hasil live token yang memiliki demo slug, link bisa membuka snapshot lama; token di luar corpus bisa menghasilkan slug yang tidak ada. Label `permanent record` tidak benar untuk live `/tmp`.

Fix sprint tanpa infra baru: hasil live inline + unduh JSON, share hanya record snapshot yang ada dan diberi tanggal. Jika sharing semua live scan wajib, gunakan persistent store sebelum mengaktifkan tombolnya; jangan mengklaim disk sementara sebagai solusi final.

### F03 — P0, S/M: identitas chain dan pemilihan kandidat bisa bergeser

`src/lib/dex.ts:171-174` fallback ke address sama di chain lain ketika platform hint tidak cocok. Probe permintaan BSC dengan kandidat Ethereum mengembalikan Ethereum. `pick` adalah indeks hasil pencarian ulang, sehingga ordering baru dapat mengganti token pilihan pengguna. Demo route menggunakan `.find`, melewati ambiguity untuk ticker lintas-chain.

Fix: chain eksplisit merupakan filter wajib, identity kandidat adalah `(platform,address)`, dan demo/live memakai resolver yang sama. Base58 Solana case-sensitive; `.toLowerCase()` menyeluruh pada address/maker tidak boleh diteruskan.

### F04 — P0, M: data malformed berubah menjadi aktivitas ekonomi yang terlihat sah

`normSwap`: semua `tp` selain sell menjadi buy; missing maker menjadi string kosong; invalid angka menjadi NaN yang terserialisasi null. `normLiqEvent`: semua tipe selain remove menjadi add. Probe maker kosong pada sell menghasilkan `thirdPartySells:1`.

Fix: parse status eksplisit, tolak sisi/angka/timestamp tidak valid, hitung rejected rows, bedakan alamat kosong dengan maker valid, dan gunakan log identity untuk dedup. Jangan dedup hanya transaction hash: satu transaksi bisa membawa beberapa swap sah.

### F05 — P1, M: “independent sellers” tidak dibuktikan oleh data yang tersedia

`getTokenMeta` memilih creator ATAU owner; saat keduanya berbeda hanya satu dikecualikan. Bila meta gagal, semua seller dapat dihitung. Alamat berbeda juga tidak membuktikan pemilik berbeda; satu pihak bisa mengendalikan banyak wallet. Pool list dapat tidak lengkap, sehingga mengecualikan pool yang dikenal tidak berarti semua infrastruktur terhapus.

Fix: hitung `observed distinct sell makers`, simpan creator dan owner, tandai cakupan exclusion, tampilkan transaksi contoh. “Tidak ada sell teramati” menjadi sinyal investigasi, bukan diagnosis honeypot. Bukti satu/seratus swap tidak menjamin siapa pun bisa menjual di masa depan.

### F06 — P1, M: skor dan threshold dipasarkan lebih kuat daripada validasinya

Score = penalti per dimensi, bukan probabilitas kerugian. Negative net buy dan top-5 concentration dapat memicu AVOID untuk aset < $100M; itu belum membuktikan penipuan. Pemotongan severity pada $100M menyebabkan discontinuity; `mc` juga berbeda antar representasi token/chain. Tidak ada evaluasi outcome atau kontrol berlabel untuk membenarkan klaim “calibrated”. 30 dari 34 kasus CAUTION menyisakan keputusan pengguna yang kurang spesifik.

Fix: tetap risk inspection, ganti positive label menjadi `NO FLAGS OBSERVED`; tunjukkan coverage dan alasan. Semua konsentrasi/arah flow merupakan WARN untuk investigasi sampai ada validasi eksternal; reported honeypot/rug flags tetap ditampilkan sebagai laporan vendor, bukan fakta yang diverifikasi sendiri. Hindari retuning supaya token favorit menjadi hijau. Version rules dan simpan output historis apa adanya.

### F07 — P1, S: falsifier keliru

`rules.ts:172` mengatakan perlu dua WARN untuk membalik LAYAK, padahal satu WARN sudah RAWAN. Probe GMX snapshot + satu `mintable` flag membuktikannya. Kalimat pada `rules.ts:180` menjanjikan verdict berubah jika satu worst metric membaik, walau flag lain masih bisa menahan verdict.

Fix: “Checks to revisit”, diturunkan dari semua finding dan coverage gap. Jika menjanjikan perpindahan label, jalankan evaluator pada counterfactual lengkap dan buktikan label baru. Jangan menulis janji inverse dari template satu row.

### F08 — P1, M: hash belum menjadi evidence replay

`cmc-client.ts:111` hash raw response, tetapi raw body tidak disimpan dalam verdict/snapshot. UI menampilkan potongan hash dan tidak memberikan body untuk dihitung ulang. `analyze` tidak menyimpan market context padahal itu memengaruhi PUMP. Ini cukup sebagai call log, belum cukup agar pihak lain mereproduksi seluruh hasil.

Fix: evidence bundle versioned: exact response bytes, endpoint/params, timestamps, parser/rules versions, normalized inputs, rejected-row counts, dan replay verifier offline. Hash atas body asli berbeda dari hash atas JSON yang diformat ulang. Historical records tanpa body harus diberi `receipt-only`, bukan diisi body rekonstruksi yang diklaim asli.

### F09 — P1, M: uptime/biaya setelah event belum terjamin

Guard per-instance, probe quota gagal berarti fail-open, tidak ada request budget total. Client bisa menghabiskan ~46 detik per stage dengan retry; Jev mencoba semua key secara sequential, sehingga “optional, never blocking” bukan berarti tidak menambah latensi. Dex callers tidak menggunakan opsi `ttlMs`; market context yang sama diambil ulang untuk setiap scan.

Fix: bounded deadline, optional AI dihapus dari critical path sprint, cache context, fail-closed saat quota unknown setelah cached permission kedaluwarsa, dan snapshot fallback jelas. Hard global quota membutuhkan shared atomic storage; tanpa itu jangan mengklaim cap global keras. Saat tier pasca-event belum diuji, gunakan replay-first untuk judging dan live opt-in yang sehat.

### F10 — P1, S/M: presentasi menonjolkan mesin sebelum manfaat

Home memiliki ruang scan kosong besar, banyak teks 9–11px redup, tabel panjang tanpa penjelasan singkat manfaat atau tanggal per row. Badge LIVE di atas corpus historis mudah disalahpahami. Jev P(risky) dikonversi menjadi skor yang disejajarkan dengan rules score, padahal keduanya bukan ukuran yang tervalidasi setara. Full token address sulit diperiksa karena dipendekkan.

Fix: satu kalimat masalah, contoh kasus bernarasi, source/time label, full address dapat dicopy, tiga alasan utama dan evidence rows, detail teknis expandable, kontras teks kecil >=4.5:1. AI advisory diletakkan di detail; coverage tampil utama.

### F11 — P1, S: submission dan dokumentasi belum konsisten

SUBMISSION menyatakan Jev absen pada snapshot, tetapi 34/34 snapshot memuat Jev available. HANDOFF memiliki hitungan tests 74/87/93/97 dari bagian historis tanpa status tunggal. TECH_SPEC masih mencantumkan search `query` padahal kode `q`; tahun probe tidak konsisten. Homepage menulis fear-and-greed di `/v1/` padahal client `/v3/`. Template video README tidak mendokumentasikan varian dan cara membangun narasi final. BUIDL masih placeholder, video/X final belum dibuktikan terbit.

Fix: submission truth table dengan evidence link dan tanggal. Current state terpisah dari historical log. Jangan membuat URL submission atau user testimonial palsu. Konfirmasikan kelayakan peserta melalui pengguna, bukan inferensi.

### F12 — P2, S/M: pengujian belum menyentuh batas kritis

97 tes berguna, tetapi belum ada route contract/browser test yang melindungi live record sharing, demo ambiguity, input oversized, selection race, dan outage LP. Mock orchestrator sehat juga memakai 120 swaps/timestamp lama tanpa membatasi data freshness; passing tests dapat mempertahankan asumsi yang salah.

Fix: tambahkan regression tepat sasaran, fixture CMC mentah dengan asal jelas, CI tanpa production keys, clean install terpisah. Gitleaks lulus history saat audit; dependency vulnerability audit dan clean environment belum diverifikasi.

## 5. Perbandingan kompetitif yang proporsional

Ini perbandingan positioning dan kedalaman materi publik, bukan hasil benchmark semua produk.

| Peserta | Bukti yang dilihat | Implikasi untuk Verdex |
|---|---|---|
| [Middleman](https://dorahacks.io/buidl/49021) | Halaman lengkap: metode maker joins, raw row, verifikasi offline, sampel 800 prints, decision per pool, limits terperinci | Bukti terperiksa dan keputusan spesifik sudah menjadi standar kompetitif. Tidak cukup hanya hash dan gauge |
| [Exit Radar](https://dorahacks.io/buidl/49040) | Judul/deskripsi daftar: risk score DEX + MCP | Menambah MCP tidak otomatis memberi diferensiasi |
| [Nemea](https://dorahacks.io/buidl/49124) | Deskripsi daftar: konteks penyebab perubahan portofolio | Manfaat menjawab pertanyaan spesifik mudah dikomunikasikan |
| CMC Witness | Lampiran: pre-trade gate dan receipt | Klaim Verdex “pre-trade gate B2B” bukan ruang kosong |
| Elephant Tracks | Lampiran: bentuk flow di balik net number | Top-5 share/net buy saja bukan insight unik |
| Receipts | Lampiran dan daftar publik: verifikasi klaim dengan panggilan API | Kata “receipts” sendiri tidak membedakan produk |

Middleman menyebut `lastId` cursor pada surface `/public-api`, berbeda dari host/path pemakaian Verdex saat ini. Ini hipotesis untuk probe, bukan bukti bahwa authenticated endpoint yang digunakan Verdex punya schema sama. Rencana mewajibkan membedakan host, envelope, field swaps/transactions, cursor, dan error semantics; tidak mengadopsi anonymous surface demi menghindari pembatasan akun. Gunakan integrasi resmi yang diizinkan dan key milik peserta.

## 6. Penilaian rubrik sementara

Skor berikut judgment audit, bukan skor juri, ukuran objektif kualitas total, atau probabilitas menang. Interval mengakui belum ada uji pengguna/benchmark pesaing menyeluruh.

| Rubrik | Kisaran saat ini | Alasan |
|---|---:|---|
| Does it work /30 | 19–23 | Scan inti bekerja, tests/build lulus; false clean dan live link 404 mengurangi kepercayaan |
| Usefulness /25 | 10–15 | Problem nyata; belum ada validasi pengguna dan tindakan setelah CAUTION kurang jelas |
| API /20 | 12–15 | Banyak endpoint berguna; replay raw belum tersedia, cakupan dan semantik belum ketat |
| Code/docs /15 | 9–11 | Modul ringkas, tests, secrets scan baik; contract/docs drift dan error propagation lemah |
| Presentation /10 | 5–7 | Brand konsisten, video ada; onboarding, keterbacaan, label waktu perlu perbaikan |
| Total /100 | 55–71 | Jangan dipresentasikan sebagai ranking terhadap 54 peserta |

Target acceptance perombakan bukan “skor 90”: seluruh kasus wajib lolos, 3 orang target user dapat menjelaskan hasil dan evidence, dan satu demo bisa diulang tanpa API key. Mencapai ini meningkatkan kelayakan bersaing, bukan menjamin hadiah.

## 7. Pilihan arah, ROI dan batas fitur

1. **Rekomendasi: perbaiki kebenaran + evidence workflow.** Tetap Verdict/risk tool, ubah clearance positif, expose transaksi/sumber/waktu, bounded live + replay. Estimasi 18–26 jam engineering fokus dan 4–6 jam QA/presentasi; angka perkiraan, bukan janji waktu agent. Downside: beberapa klaim dan tampilan hero perlu direkam ulang.
2. **Ambisi tambahan: compare dua observasi token yang sama.** Nilai nyata: apa berubah sejak pemeriksaan sebelumnya. Sesudah critical path, 3–5 jam; dua sample tidak membuktikan tren. Hilangkan jika membahayakan deadline.
3. **Pivot AI/RWA atau platform SaaS lengkap.** Tidak direkomendasikan sprint ini: membuang implementasi/evidence yang sudah ada, menambah validasi domain dan operasi, tanpa bukti bisa mengejar pesaing. SaaS monetisasi merupakan hipotesis tahap berikutnya.

Satu proposisi yang disarankan: **“Inspect the evidence before a DEX swap: who actually sold, how concentrated the recent flow is, and what data is missing.”** Klaim itu dapat dipenuhi dan didemonstrasikan tanpa menjanjikan token aman atau rug terdeteksi.

## 8. Kritik jujur dan STOP

Verdex terlihat lebih yakin daripada pengetahuannya: tanda hijau, angka 100, dan confidence high bisa muncul tanpa bukti lengkap. Menambahkan hash dan opini model tidak menyelesaikan masalah tersebut. Nilai produk akan naik saat pengguna bisa memeriksa klaim dan melihat alasan untuk menahan kesimpulan.

Hentikan penggunaan “production ready” sebagai bukti runtime; klaim seller independen; hash sebagai bukti autentisitas CMC; konsentrasi sebagai bukti rug; confidence sample sebagai akurasi; dan presentasi GMX 100 sebagai hasil terkini. Jangan menghabiskan sprint membuat varian video keempat sebelum alur inti dan narasi diperbaiki.

## 9. Lima tindakan pertama

1. Propagasi status sumber/coverage; outage tidak boleh membuat hasil lebih aman.
2. Kunci identitas token + chain dan parsing row; tolak data malformed tanpa menyembunyikan gap.
3. Perbaiki bahasa verdict/recheck conditions dan pisahkan risk flags dari coverage.
4. Bukti raw + replay verifier; hasil live inline/export, share hanya hasil yang benar-benar tersedia.
5. Jadikan UI, video, README, dan submission satu cerita yang terverifikasi; kirim sebelum target internal.

Rencana task, kontrak, tes, dan instruksi agent berada di `../superpowers/plans/2026-09-29-verdex-hackathon-overhaul.md`.
