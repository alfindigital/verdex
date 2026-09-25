# DESIGN_SPEC — Verdex

## 1. Rasa & Tone

"Trading terminal" — gelap, mono-dominan, data-dense seperti CMC/CoinGecko
terminal. Minim prosa: angka, grafik SVG murni (gauge, split-bar, donut,
needle, level meter), tabel rapat. Identitas visual: **verdict stamp** +
**prompt console** (`verdex@cmc:~$ scan`). Desktop-first (max-w-7xl), panel
tipis 1px, section header bergaya shell.

## 2. Tokens

```css
--bg: #0c0e0c;            /* off-black, tint hijau tipis — bukan neutral-950 murni */
--surface: #121512;       /* panel */
--surface-2: #171b17;     /* inset/raised */
--line: #232823;          /* border — hijau-netral, bukan abu murni */
--text: #eceee9;          /* primer */
--text-dim: #9aa39a;      /* sekunder */
--text-faint: #5c645c;    /* tersier */

--safe: #34d399;          /* emerald-400 — LAYAK/CLEAN/consensus/aksen utama */
--warn: #fbbf24;          /* amber-400 — RAWAN/WARN/lean */
--danger: #f87171;        /* red-400 — JANGAN/DANGER/contested */
--unknown: #8a9189;       /* INSUFFICIENT */
```

Aturan pakai:
- `--safe` = SATU-satunya aksen UI (CTA, focus, link aktif) **dan** warna
  verdict aman — dipakai di momen kunci saja (antislop: accent dose cap).
- Warna verdict selalu berpasangan dengan label teks (a11y: bukan warna saja).
- Zero gradient di permukaan UI. Grain overlay subtle di background saja.

### Typography

- Display/body: **Archivo** (variable, next/font) — grotesk tegas, karakter
  institusional; heading 700–800, tracking negatif, `text-wrap: balance`.
- Data/receipt/alamat: **IBM Plex Mono** — "evidence tag" feel; semua angka
  `font-variant-numeric: tabular-nums`.
- Alasan (R-06): tool forensik data — mono untuk angka = semantik, bukan estetika.

### Radius & elevation

- Radius: `--r-sm 6px` (chips/badge), `--r-md 10px` (input, tombol), `--r-lg 14px` (panel).
- Hampir semua flat; satu shadow maks di verdict card (tinted `--safe`/verdict color, bukan hitam).

### Motion dial: 2

- Hover: border-color/background shift 150–200ms, `translateY(-1px)` halus.
- Press: `scale(0.98)`.
- Verdict reveal: satu kali scale/fade masuk (300ms, ease-out) — no loop.
- `prefers-reduced-motion` → semua off.

## 3. Layout

### `/` (home)

```
┌──────────────────────────────────────────┐
│ VERDEX                        [● LIVE]   │  dot = real state (API mode)
│                                          │
│  DON'T BE THE                            │  display 800, asymmetric,
│  EXIT LIQUIDITY.                         │  left-aligned, besar
│  ─ subtext 65ch max ──                   │
│                                          │
│  ┌──────────────────────────────────┐[▶] │  input mono besar + platform chips
│  [auto][Solana][BSC][Base]           │
│                                          │
│  CASE FILES (committed verdicts)         │  ledger rows, bukan card grid:
│  ▸ FLOKI  BSC    ENTRY-WORTHY  85   →    │  tiap row = stamp + angka
│  ▸ WIF    SOL    AVOID         45   →    │
│  ...                                     │
│                                          │
│  HOW A VERDICT IS REACHED (chain list)   │
│  ENDPOINTS USED (mono chips)             │
│  ── footer: hackathon · github ──        │
└──────────────────────────────────────────┘
```

### Verdict card (dipakai `/` dan `/verdict/[id]`)

```
┌─ verdict panel ─────────────────────────┐
│  ╔════════════╗                          │
│  ║ ENTRY-     ║ ← stamp: border 2px,     │
│  ║  WORTHY    ║   rotate -3deg, mono     │
│  ╚════════════╝  FLOKI · BSC             │
│        score 85/100 ━━━━●━━ confidence   │
│                                          │
│  SAFETY CLEAN ── metrics ledger          │
│  FLOW   WARN  ── metrics ledger          │
│  LIQ    CLEAN ── ...                     │
│  PUMP   CLEAN ── ...                     │
│  ─ Jev second opinion + agreement ──     │
│  ─ falsifier callout ──                  │
│  ▸ receipts (details)                    │
└──────────────────────────────────────────┘
```

## 4. States & A11y

- Loading: skeleton berbentuk verdict card (bukan spinner generic).
- Empty/error: sebutkan penyebab + aksi berikutnya; error demo-mode tawarkan
  snapshot chips.
- `<details>` native untuk receipts; focus-visible ring `--safe` 2px offset.
- `text-wrap: balance` di headline; tidak ada orphan word.
- Semantic HTML: `<main> <header> <section> <footer> <table>` untuk ledger.

## 5. Copy

- English. Falsifier: "This verdict flips if <metric> crosses <threshold>."
- Narration label "AI narration". No emoji di UI. Sentence case headings.
- Voice: dokumen forensik — singkat, prosedural, tanpa hype.
