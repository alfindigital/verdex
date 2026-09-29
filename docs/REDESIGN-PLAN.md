# REDESIGN-PLAN — Verdex UI/UX Total Overhaul

> **Status:** executor brief. Ditulis 2026-09-30 untuk dieksekusi agent lain (mode `/boost` — DeepCoder vs DeepInvestigator). Plan ini self-contained: executor tidak perlu konteks sesi ini, hanya perlu membaca file ini + file yang direferensikan.
>
> **Misi:** Rombak total UI/UX website Verdex (`https://verdex-alpha.vercel.app`) — sekarang "AI slop": kostum terminal, semua teks monospace 9–11px, kontras di bawah WCAG AA, tidak ada hierarki display, layout template. Target: produk dengan identitas sendiri yang lolos antislop Delivery Gate penuh.

---

## 0. Scope fence (HARNESS) — baca dulu, jangan dilanggar

**BOLEH diubah (UI/UX & creative saja):**

- `app/globals.css` — token `@theme`, utilities, motion keyframes
- `app/layout.tsx` — registrasi font, metadata copy (artinya jangan berubah), themeColor
- `app/page.tsx` — restructure total landing/scanner
- `app/verdict/[id]/page.tsx` — header, share row, layout wrapper
- `app/verdict/[id]/opengraph-image.tsx` — restyle
- `src/components/{checker,verdict-card,evidence-panel,viz}.tsx` — restyle/restruktur
- File baru: `app/not-found.tsx`, `app/error.tsx`, komponen UI baru di `src/components/` (flat, ikut konvensi existing — jangan bikin nested `ui/` folder)
- `app/icon.png`, `public/logo.png` — hanya setelah decision point 2 disetujui
- `video/src/{brand.ts,Variant*.tsx,VerdexDemo.tsx,Root.tsx,motion.tsx,bits.tsx}` + `video/public/fonts/` — sinkron brand
- `demo-shots/` — regenerate
- Root: `DESIGN.md`, `PRODUCT.md` (baru, wajib dibuat — lihat Phase 1)

**DILARANG disentuh (evidence contract & engine):**

- `src/engine/**` (analyze.ts, rules.ts, THRESHOLDS nilai), `src/lib/**` kecuali helper yang murni presentational
- `app/api/**` — route logic apa pun
- `snapshots/**`, `data/**`, `tests/fixtures/**`, `specs/**`
- Semantik verdict: label `ENTRY-WORTHY / CAUTION / AVOID / INSUFFICIENT`, nilai skor, falsifier text, receipts, coverage, agreement — boleh **di-restyle**, TIDAK boleh diubah makna/wording fakta
- 164 test harus tetap pass tanpa diubah (`pnpm test`)
- Tidak ada dependensi runtime baru tanpa justifikasi tertulis (etos repo: zero-dep, SVG viz hand-rolled). Default: **nol deps baru**; spring via CSS `linear()`/custom hook kecil. Kalau executor mau `motion`/GSAP, tulis justifikasinya di PR description dan tunggu approval user.

---

## 1. Inventory tool & skill yang WAJIB dipakai

### Skills (invoke di awal sesi executor)

| Skill | Fungsi di plan ini |
|---|---|
| `antislop` (core) | Filter utama. Mode: **DURING** (user sudah jawab implisit — "gunakan seluruh skill anti-slop"). Delivery Gate wajib PASS sebelum deliver. |
| `antislop` refs: `references/antislop-ui`, `antislop-copywriting`, `antislop-human` (+`contrast-check.py`), `antislop-layoutmobile`, `antislop-code` | Domain filters. `contrast-check.py` di `C:\Users\GEEKOM A8\.agents\skills\antislop\references\antislop-human\` dipakai untuk verifikasi semua pasangan text/background. |
| `impeccable` | Jalankan `scripts/impeccable context` dulu (Windows: `impeccable.cmd`). Mode permukaan: landing = **Persuade**, verdict page = **Operate/Read** hybrid. Baca `reference/craft-floor.md` sebelum edit UI apa pun. |
| `redesign-existing-projects` | Audit checklist + fix priority order. Gunakan audit list-nya sebagai daftar temuan wajib. |
| `ui-ux-pro-max` | Database desain lokal — lihat §1.2 untuk command-nya. |
| `test-driven-development` / `verification-before-completion` | Gate verifikasi. |
| `agent-browser` | Screenshot + click-through evidence (R-35). |
| `remotion-*` (12 skill) | Phase creative video. `remotion-studio` untuk preview, `remotion-render` untuk output, `remotion-markup`/`remotion-interactivity` untuk scene baru. |
| `takeone` | Rekam walkthrough UI baru kalau dibutuhkan video/submission. |
| `boost` | Orkestrasi DeepCoder/DeepInvestigator — struktur eksekusi seluruh plan ini (§6). |
| `baoyu-design` / `brandkit` | Opsional: direction board HTML mock untuk sign-off Phase 1. |
| `imagegen` | Hanya untuk aset raster bila diputuskan (mis. texture). Bukan untuk logo tanpa approval. |

### Repos lokal yang jadi referensi (sudah terinstall — `~/.agents/repos/`)

| Repo | Path | Dipakai untuk |
|---|---|---|
| `ui-ux-pro-max-skill` | `C:\Users\GEEKOM A8\.agents\repos\ui-ux-pro-max-skill` | `python src\ui-ux-pro-max\scripts\search.py "<query>" --domain <domain>` — domain: `style`, `color`, `typography`, `landing`, `chart`, `ux`, `icons`, `gsap`, `react`, `product`, `google-fonts`, `--stack nextjs`. Windows: pakai `python` bukan `python3`. Juga ada `gallery/` + `projects/` (3 contoh project jadi) sebagai referensi struktur. |
| `open-design` (nexu-io/open-design) | `C:\Users\GEEKOM A8\.agents\repos\open-design` | **Referensi saja, jangan diinstall/run.** Tambang: `design-systems/` (contoh brand `DESIGN.md` nyata), `craft/` (craft rules universal), `design-templates/` (katalog deck/prototype/video template), `skills/`, `specs/`. Baca `AGENTS.md` root-nya dulu. |
| `remotion-skills` | `C:\Users\GEEKOM A8\.agents\repos\remotion-skills` | Sudah tercermin ke skills master — invoke skill `remotion-*` langsung. |
| `superpowers`, `spec-kit`, `anti-slop` | `~/.agents/repos/` | Sudah jadi skills. |

### MCP tools (nama tool aktual — sudah diverifikasi terdaftar)

| Server | Tool | Pakai untuk |
|---|---|---|
| `mobbin` | `search_screens` (platform `web`, `mode: "deep"`, `output_destination: "code"`), `search_flows` | Referensi nyata: trading dashboards, data-dense tables, verdict/report pages. Query saran: `"crypto analytics dashboard dark"` , `"audit report document detail"`, `"data table with status badges"`. Kutip `mobbin_url` saat presentasi arah. |
| `elevenlabs` | `text_to_speech` (param: `text`, `voice_name`, `model_id`, `output_directory`, `output_format`) | Narasi video baru. **COST WARNING: hanya setelah user approve script+voice.** Output ke `video/public/audio/` (bukan Desktop — override `output_directory`). Model saran: `eleven_multilingual_v2` atau `eleven_v3` untuk ekspresif. |
| `pencil` | `read_skill` → `execute` / `get_style` | Opsional: design board `.pen` untuk arah visual sebelum coding. |
| `figma-remote` | `get_design_context`, `generate_figma_design` | Opsional: kalau user mau frame Figma sebagai sign-off artefact. |
| `canva` | `edit-design`/`get-design-feedback` | Opsional: aset sosial. |
| `takeone` | recording tools | Video walkthrough UI baru. |
| `playwright` / `agent-browser` | navigate/screenshot/click | QC evidence: screenshot 1440px + 390px, click-through setiap kontrol. |
| `vercel` | deploy/preview tools | Deploy ke **preview** dulu — jangan langsung prod (lihat §8 risiko deadline). |
| `hindsight-memory` | `hindsight_capture_initiative` | Executor: catat initiative "Verdex UI/UX redesign" di awal kerja. |

---

## 2. Diagnosis current UI (bukti — sudah diaudit dari kode + screenshot production)

| # | Temuan | Aturan/cek yang dilanggar | Bukti |
|---|---|---|---|
| D1 | Seluruh UI monospace (`font-data`) untuk label, heading, body — kostum "terminal" | R-06 (typeface tanpa alasan karakter), Part 1 "Generic AI Typography" | `page.tsx` — hampir semua elemen `font-data` |
| D2 | Fake terminal chrome `verdex@cmc:~$ scan` sebagai pembungkus scanner | R-05 / redesign skill "fake terminal window" | `page.tsx:84` |
| D3 | Kontras gagal: `text-faint` `#5c645c` di atas `bg-panel` `#121512` ≈ 2.9:1 — dipakai untuk puluhan label 9–11px | R-25 (WCAG AA 4.5:1) | `globals.css:11` + tersebar di semua file |
| D4 | Tidak ada display typography — font terbesar ~24px; tagline "Don't be the exit liquidity" (satu-satunya hook brand) dikubur di footer 10px | R-20, C-1 (no focal point) | `page.tsx:263` vs screenshot |
| D5 | Uniform section rhythm: setiap panel = `border border-line bg-panel` + header mono uppercase — sama semua | R-05 "Uniform Section Rhythm" | `page.tsx` semua section |
| D6 | Tabel 34 baris tanpa filter/sort/grouping — data UI bagus tapi rata tanpa hierarki | redesign "Layout", C-3 | `page.tsx:148-220` |
| D7 | Stamp motif (satu-satunya identitas khas) cuma dipakai 9px — aset identitas terbuang | Liveliness "identity motif" | `.stamp` + verdict card |
| D8 | `text-dim`/`text-faint` untuk teks fungsional di mana-mana; status `LIVE/REPLAY` cuma dot 6px | R-25, R-27 | `page.tsx:66-69` |
| D9 | Tidak ada `not-found.tsx`/`error.tsx` custom | redesign "Strategic Omissions" | `app/` |
| D10 | OG image + video brand pakai palette berbeda dari app (`#10b981` vs `#34d399`) — identitas sudah drift | consistency | `opengraph-image.tsx`, `video/src/brand.ts` |
| D11 | Tidak ada empty state untuk scanner (sebelum scan pertama) — langsung form kosong di console | R-27 | `checker.tsx` |
| D12 | Landing tanpa narasi produk — user langsung disuruh paste address tanpa tahu apa yang keluar | C-3, Persuade mode | `page.tsx` |

**Yang BAGUS dan harus dipertahankan/di-upgrade (jangan dibuang):** stamp rubber-stamp verdict, real numbers only (semua stat dihitung dari snapshots), skeleton yang shaped-like-content, SVG viz primitives zero-dep, replay-vs-live honesty badges, receipts/evidence tables, skip-link + focus-visible sudah ada, `prefers-reduced-motion` sudah ada.

---

## 3. Design direction (Phase 1 output — tulis ke `DESIGN.md` + `PRODUCT.md`)

Executor WAJIB membuat `DESIGN.md` sebelum coding (antislop R-37). Rekomendasi arah (A) + alternatif (B). **User memilih di decision gate; kalau eksekusi tanpa user, pakai A sebagai default terdokumentasi.**

### Arah A (REKOMENDASI): "Evidence Desk" — forensic dossier, editorial

Konsep: setiap verdict = sebuah **exhibit/dokumen kasus**. Surface terasa seperti berkas forensik di meja gelap — bukan terminal, bukan dashboard SaaS. Stamp menjadi identitas utama yang di-scale-up.

- **Design Read:** *"Persuade landing + Operate/Read verdict page untuk DEX trader & hackathon judges, dalam bahasa forensic-editorial, dial ENERGY 2 / RHYTHM 3 / MOTION 2."*
- **Palette (dark-first, tetap dark — alasan R-21: tool forensik trading, konteks penggunaan malam, brand sudah dark):**
  - `ink #0B0C0B` (desk surface), `panel #131612`, `raised #191D18`, `line #2A2F27`, `line-bright #3E453A`
  - `text #F0F1EC`, `dim #AAB1A5` (≥4.5:1 di panel — verify), `faint #767D70` (**hanya dekoratif/divider, dilarang untuk teks**)
  - `paper #E9E7DE` — untuk momen inverted (exhibit cards, stamp base) = motif contrast
  - `safe #3DD68C` (brand accent + verdict CLEAN/ENTRY — satu aksen, hemat pakai)
  - `warn #F2B234`, `danger `#F2555A`, `unknown #90968E`
  - Semua pasangan text/bg diverifikasi `contrast-check.py` — angka ditulis di DESIGN.md
- **Typography:**
  - Display: **Fraunces** (OFL variable, self-host `app/fonts/Fraunces-VF.ttf`) — editorial serif untuk H1, verdict stamp, angka besar. Alasan: kontras judicial vs data mono = identitas khas, tidak ada tool crypto lain yang begini.
  - Body/UI: **Archivo** (sudah ada) — labels, paragraphs, buttons.
  - Data: **IBM Plex Mono** (sudah ada) — HANYA untuk hash, address, angka tabel, receipts, code chips.
  - Scale: H1 64–96px display / H2 28–40 / body 15–16 / data 11–13. Larangan: tidak ada teks konten < 11px.
- **Motifs (ulang konsisten = identity):**
  1. **Stamp raksasa** — verdict stamp jadi hero visual di verdict page (rotasi -3°, ink-bleed edge, paper bg); versi kecil di cards/table.
  2. **Exhibit numbering** — `EX-01`, `EX-02` menggantikan header section generik.
  3. **Fingerprint strips** — hash/address dirender chunked mono (`a91f · 3c2d · …`), copyable.
  4. **Redaction bars** — solid blocks untuk data yang withheld/not-retained (jujur secara visual).
  5. **Dossier stacking** — showcase cards sedikit rotasi + shadow fisik, terasa seperti berkas.
- **Larangan arah:** tidak ada `:~$`, tidak ada grid/blueprint background, tidak ada glassmorphism, tidak ada glow, tidak ada arrow → di semua CTA.

### Arah B (alternatif): "Instrument Panel" — heavy grotesk, denser

Display **Archivo Expanded 800** (tidak perlu font baru), layout lebih padat ala instrument panel, accent tetap hijau, tanpa serif. Lebih aman, lebih dekat ke current tapi tetap harus lolos kontras + hierarki. Pilih kalau user mau evolusi, bukan rombak.

### Keputusan yang dikunci di DESIGN.md (R-31 satu baris per keputusan)

Palette + rasio kontrasnya · font pairing + alasan · dials + justifikasi · 5 motif + alasan · theme: dark-only (alasan tertulis) · radius scale · spacing rhythm.

---

## 4. File-by-file execution plan (Phase 3)

### 4.1 Foundation — `app/globals.css` + `app/layout.tsx`

- Tulis ulang `@theme` tokens sesuai DESIGN.md terpilih (warna, radius, font vars).
- Tambah utility classes: `.stamp` (skala besar + kecil, paper/ink variant), `.exhibit` (numbered header), `.redact` (redaction bar), `.mono-strip` (chunked hash), `.dossier` (paper card + physical shadow), keep `.skeleton`/`reveal` + tambah `@keyframes vdx-stamp` (scale 1.15→1 + rotate + opacity, ~340ms spring-ease `linear()`), `prefers-reduced-motion` cover semua.
- `layout.tsx`: registrasi font baru via `next/font/local` (self-hosted OFL saja — constraint existing), themeColor update, metadata copy boleh dipoles tapi makna tetap.
- Font download: Fraunces VF OFL → `app/fonts/`. Kalau user tolak font baru (decision 3), fallback Arah B.

### 4.2 `app/page.tsx` — landing rebuild

Urutan section baru (RHYTHM 3 — komposisi beda per section):

1. **Header**: wordmark `VERDEX` (Archivo bold, bukan tracking-0.3em mono) + status pill `RECORDED REPLAY` / `LIVE` yang jelas (bukan dot 6px) + GitHub link. Tidak ada link mati (R-24).
2. **Hero (focal point #1)**: H1 display Fraunces/Archivo-expanded besar — *"Don't be the exit liquidity."* + 1 kalimat sub spesifik (paste token → verdict auditable dari evidence CMC) + stats row real (34 verdicts · 306 receipts · 7 chains — dihitung dari snapshots, bukan hardcode).
3. **Scanner = instrument, bukan terminal**: input besar command-bar style (icon `>` boleh tetap sebagai affordance, bukan fake shell chrome), chain chips, `RUN` button primer safe-green. Hilangkan `verdex@cmc:~$` bar. Empty state designed: contoh queries + "try a recorded case" link ke slug.
4. **Engine aside** → jadi strip horizontal bawah scanner atau kartu compact; verdict logic tetap ditampilkan (itu konten nyata, honest).
5. **Recorded examples (EX-01)**: 3 dossier cards — stamp besar per verdict, token, chain, tanggal, "open case" link. Kartu paper-tone boleh dipakai di sini sebagai motif.
6. **Case files (EX-02)**: tabel di-upgrade — sticky header, filter chips per verdict (ENTRY/CAUTION/AVOID/INSUFFICIENT) + chain filter, kolom sortable minimal (score), row hover + `open` link; mobile: jadi stacked cards (bukan horizontal scroll tabel di 390px — pecahkan menjadi card rows atau overflow yang di-design sengaja).
7. **Pipeline (EX-03)**: 5 langkah sebagai evidence-chain horizontal/numbered — bukan list mono.
8. **CMC endpoints (EX-04)**: chips mono tetap (konten honest) + disclaimer.
9. **Footer**: disclaimer "not financial advice" + hackathon credit + GitHub + `docs/CLAIMS.md` link kalau ada halaman publiknya; tanpa link mati.

### 4.3 `src/components/checker.tsx` — restyle + states

- Pertahankan semua logic (abort, requestId, makeScanRequestBody) — hanya presentasi.
- State wajib: idle empty state (designed), loading skeleton baru yang match anatomy verdict card baru, error, notFound, ambiguous (table → list cards yang lebih jelas di mobile), semua keyboard-operable + aria-live tetap.
- `--chain` label → `Chain` filter chips normal.

### 4.4 `src/components/verdict-card.tsx` + `evidence-panel.tsx` + `viz.tsx` — dossier rebuild

- **Cover**: stamp raksasa (motif 1) + score gauge besar sebagai focal point; token name display; platform + fingerprint-strip address + copy.
- **Status strip**: ARCHIVED/REPLAY·LIVE, coverage, captured time — tetap, restyle kontras-aman.
- **4 dimensi**: grid boleh tetap 2×2, tapi tiap panel beda komposisi internal (sudah beda viz — perkuat: level meter lebih besar, threshold drawer rapi). Metric names pakai label manusiawi + mono untuk nilai.
- **Falsifier**: callout "What breaks this verdict" warn-tinted.
- **Jev band**: perbandingan visual rules vs jev yang jelas.
- **Receipts + source evidence**: details/summary tetap, table direstyle (padding, kontras, chunk hash).
- **viz.tsx**: reskin primitives ke token baru; tambah varian kalau perlu (e.g., gauge track lebih tebal); semua `role="img"` + aria-label dipertahankan/dipertajam.
- Verdict page wrapper (`app/verdict/[id]/page.tsx`): header `← VERDEX` restyle, share row (X intent + copy + download) konsisten, `not-found.tsx` branded + `error.tsx`.

### 4.5 States, a11y, mobile (Hard Gates)

- R-27: empty/loading/error untuk setiap data UI (scanner + verdict card partial failures sudah ada `failures[]` — visualkan).
- R-32/R-35: Tab order logis, focus indicator custom (bukan outline default tapi visible), semua interaksi diverifikasi click-through.
- R-03: 390px sempurna — tabel → card transform, stamp scale down, tidak ada overflow horizontal apa pun.
- R-25: semua teks ≥4.5:1 (≥3:1 untuk ≥18px/large); tulis tabel rasio di laporan.

### 4.6 Creative assets (Phase 5)

1. **OG images**: `opengraph-image.tsx` restyle ke identitas baru (paper+dark, stamp, Fraunces jika font bisa dibundle — kalau tidak, Archivo black). Periksa `app/icon.png` + `public/logo.png` — refresh hanya setelah approval decision 2.
2. **Demo shots**: regenerate `demo-shots/{demo-home,demo-verdict,mobile-390-*}.png` via agent-browser di preview deploy.
3. **Video (Remotion)**:
   - Sync `video/src/brand.ts` ke tokens baru (warna + font names) — `video/public/fonts/` mungkin perlu font baru dicopy.
   - Varian baru `VariantD-DossierTape` (atau rework VariantB): scene = dossier/stamp/EX numbering, pakai data dari `data.ts` (angka nyata — jangan invent).
   - Narasi: script baru selaras `docs/DEMO-WALKTHROUGH.md` "Demo language" rules (katakan "no flags observed", "provider-reported", dll). Generate voice via `elevenlabs.text_to_speech` → `video/public/audio/narration.mp3`, `model_id: "eleven_multilingual_v2"`, output dir override ke folder video. **Wajib approval user untuk biaya + pilihan voice.**
   - Render: `cd video && npx remotion render` per komposisi; output `video/out/` (gitignored).
4. **Opsional**: `takeone` rekam walkthrough UI baru; `baoyu-design` mock HTML untuk direction sign-off; `brandkit` board kalau user minta brand sheet.

---

## 5. Verifikasi wajib (Definition of Done)

Executor TIDAK boleh klaim selesai tanpa semua ini:

- [ ] `pnpm test` → 164/164 pass, **tanpa mengubah satu pun test**
- [ ] `pnpm typecheck` → clean; `pnpm build` → sukses
- [ ] `pnpm evidence:verify` + `pnpm docs:verify` → pass
- [ ] antislop **Delivery Gate 4 blok dilaporkan item-per-item PASS** dengan bukti (bukan klaim)
- [ ] `contrast-check.py` di semua pasangan text/bg token → tabel rasio dilampirkan
- [ ] Click-through list R-35: setiap button/link/details/filter → hasil dicatat
- [ ] Screenshot 1440px + 390px home & verdict via agent-browser → `demo-shots/`
- [ ] Keyboard-only pass: Tab/Shift+Tab/Enter/Escape terdokumentasi
- [ ] Zero dead controls, zero fabricated stats (R-17/R-26/R-38)
- [ ] Preview deploy Vercel OK → URL dilaporkan; **production swap hanya setelah user approve**
- [ ] `hindsight_capture_initiative` update di akhir

---

## 6. Struktur eksekusi /boost

Orchestrator memecah jadi tiket terisolasi (hindari konflik file):

| Tiket | DeepCoder scope | Investigator gate |
|---|---|---|
| T1 | Phase 0–1: audit write-up + `DESIGN.md`/`PRODUCT.md` + direction board | Investigator: cek arah vs R-37, kontras token tertulis, dials konsisten |
| T2 | `globals.css` + `layout.tsx` + font + `viz.tsx` reskin | Investigator: build + contrast-check semua token + reduced-motion |
| T3 | `page.tsx` landing rebuild | Investigator: click-through + mobile 390 + dead-link hunt |
| T4 | `checker.tsx` states | Investigator: paksa error/ambiguous/notFound, keyboard only |
| T5 | `verdict-card.tsx` + `evidence-panel.tsx` + verdict page + not-found/error | Investigator: render 4 verdict types (LAYAK/RAWAN/JANGAN/BELUM_CUKUP), v1-archived vs v2, coverage insufficient |
| T6 | OG images + logo (jika approved) + demo-shots | Investigator: OG fetch + pixel check |
| T7 | Video: brand sync + variant + ElevenLabs narasi + render | Investigator: frame-sample render, narration vs demo-language rules |
| T8 | Final: full verification suite §5 + preview deploy | Investigator: ulangi seluruh DoD independen — **APPROVED/REJECTED** |

Loop: REJECTED → balik ke Coder (maks 3 siklus) → APPROVED → checkpoint (`checkpoint` skill) + update HANDOFF.md + hindsight initiative.

**Prompt Investigator wajib berisi:** kriteria DoD §5, daftar file berubah, instruksi "patahkan implementasi ini — cari kontras gagal, dead control, overflow mobile, fabrikasi, state hilang; tunjukkan file:line + repro".

---

## 7. Decision points (executor tanya user SEKALI, batched — bukan tanya berkali-kali)

1. **[WAJIB] Arah:** A "Evidence Desk" (serif editorial + dossier) vs B "Instrument Panel" (grotesk padat) — default A.
2. **[WAJIB] Font baru:** download Fraunces VF (OFL, self-host) Ya/Tidak — kalau Tidak → Arah B atau Archivo-only.
3. **Logo/favicon:** refresh `logo.png`/`icon.png` Ya/Tidak (biarkan = tetap dipakai apa adanya).
4. **ElevenLabs:** approve spend + voice (minta 2–3 sample pendek dulu via `text_to_speech`, lalu full narasi).
5. **Deploy target:** preview-only vs swap production setelah gate (lihat risiko deadline).

---

## 8. Risiko & catatan jujur

- **Deadline DoraHacks = hari ini (30 Sep).** Versi live sekarang sudah submittable (200 OK, evidence lengkap). Redesign JANGAN memblokir submission — kirim dulu dengan build saat ini, swap URL produksi hanya setelah redesign lolos gate. Preview URL bisa dicantumkan sebagai "latest build" kalau mau.
- Redesign menyentuh `verdict-card.tsx` yang punya coverage besar di `tests/verdict-card.test.ts` — jangan ubah semantik; kalau class/teksturnya di-assert test, diskusikan, jangan diam-diam edit test (boost rule: no test weakening).
- Snapshot slugs (`snapshots/index.json`) dan `slugFor()` JANGAN diubah — permalink di SUBMISSION.md bergantung padanya.
- Video `data.ts` angka diambil dari snapshots nyata — narasi baru juga harus jujur (ikut "Demo language").
- ElevenLabs TTS berbayar: estimate ~60–90 detik narasi ≈ beberapa ribu karakter — sebutkan estimasi credit ke user saat minta approval.
- Estimasi effort: T1–T5 = inti (mayoritas waktu), T6–T7 paralel-able, T8 final. Total satu sesi panjang atau dua sesi; jangan janji waktu.

---

## 9. Referensi cepat

- Stack: Next.js 15.5.26 · React 19 · Tailwind v4 (`@theme`, `@tailwindcss/postcss`) · pnpm 11.24.0 · zero UI runtime deps · font self-host via `next/font/local` (OFL saja)
- Commands: `pnpm dev` · `pnpm test` · `pnpm typecheck` · `pnpm build` · `pnpm evidence:verify` · `pnpm docs:verify` · video: `cd video && npm run dev` (studio) / `npx remotion render`
- Contrast tool: `python "C:\Users\GEEKOM A8\.agents\skills\antislop\references\antislop-human\contrast-check.py" <fg> <bg>`
- Design data: `python "C:\Users\GEEKOM A8\.agents\repos\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py" "forensic trading dashboard" --domain style|color|typography|ux --stack nextjs`
- Docs otoritatif: `docs/CLAIMS.md` (semantik verdict), `docs/DEMO-WALKTHROUGH.md` (bahasa demo), `docs/AUDIT-DOSSIER.md`, `HANDOFF.md`, `SUBMISSION.md`
