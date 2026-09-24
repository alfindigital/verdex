# DESIGN_SPEC — Verdex

## 1. Rasa & Tone

"Courtroom terminal" — gelap, tajam, forensik. Bukan dashboard crypto generic
yang penuh neon. Satu keputusan besar di tengah, bukti di bawahnya.

## 2. Tokens

- Background: `#0a0a0a` (neutral-950), surface `#171717` (neutral-900)
- Teks: `#fafafa` primer, `#a3a3a3` sekunder
- Verdict colors:
  - LAYAK / CLEAN → emerald-400 `#34d399`
  - RAWAN / WARN → amber-400 `#fbbf24`
  - JANGAN / DANGER → red-400 `#f87171`
  - BELUM_CUKUP_BUKTI / INSUFFICIENT → neutral-400 `#a3a3a3`
- Consensus → emerald; Contested → violet-400 `#a78bfa`
- Font: mono (ui-monospace) untuk angka/receipt, sans untuk narasi
- Radius: `rounded-lg`; border `border-neutral-800`; tanpa gradient berlebihan

## 3. Layout

### `/` (home)
```
┌────────────────────────────────────┐
│ VERDEX            [receipts] [docs]│
│ "Don't be the exit liquidity"      │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ paste token address / $TICKER  │ │ ← input besar, mono
│ └────────────────────────────────┘ │
│ [Solana][BSC][Base][auto]          │ ← platform chips
│                                    │
│ context: BTC.D ▲ 0.4% · F&G 44     │ ← strip kecil
│                                    │
│ showcase verdicts (3-5 cards)      │
└────────────────────────────────────┘
```

### `/verdict/[id]`
```
┌────────────────────────────────────┐
│ TOKEN $SYM (BSC · 0x55d3…7955)     │
│ ┌──────────────────────────────┐   │
│ │        JANGAN                │   │ ← verdict besar
│ │  score 34/100 · conf: high   │   │
│ │  rules ✗  jev P(risky)=0.91  │   │ ← consensus/contested
│ └──────────────────────────────┘   │
│ SAFETY ⚠  FLOW ✗  LIQ ⚠  PUMP ✗   │ ← sub badges
│ ─ metrics table (angka mono) ──    │
│ ─ falsifier callout ──             │
│ ─ AI narration (labeled) ──        │
│ ─ receipts accordion (N calls) ──  │
└────────────────────────────────────┘
```

## 4. States & A11y

- Loading skeleton saat compute; error state jelas (token not found, API down).
- Verdict tidak pernah hanya warna — selalu ada label teks.
- Keyboard: input focusable, receipt accordion `<details>` native.
- `prefers-reduced-motion` respected; tidak ada autoplay/animasi berat.

## 5. Copy

- Bahasa UI: English (judges internasional).
- Falsifier format: "This verdict flips if <metric> crosses <threshold>."
- Narrative wajib label "AI narration".
