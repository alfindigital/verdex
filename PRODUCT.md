# PRODUCT.md — Verdex

> Persona context for UI work (impeccable surface modes). Keep in sync with docs/CLAIMS.md — that file owns verdict semantics.

## What it is

Paste a DEX token → get an auditable verdict (`ENTRY-WORTHY` / `CAUTION` / `AVOID` / `INSUFFICIENT EVIDENCE`) computed by deterministic rules over CoinMarketCap DEX evidence, cross-examined by an independent model ("Jev"). Every claim ships with SHA-256 receipts and a named falsifier. **Replay/archived records are the durable surface; live scans are transient.**

## Who

- Hackathon judges (5-minute evaluation path)
- DEX traders doing pre-trade checks
- Skeptical auditors who want receipts, not vibes

## Tone

Forensic, precise, honest about gaps. Says "no flags observed in this sample", "provider-reported", "unknown — not zero". Never: "safe to buy", "guaranteed", AI-hype words.

## Journeys

1. Judge: land → see hero + scanner → run recorded example → read dossier → expand receipts → share link works.
2. Trader: land → paste address → disambiguate exact identity → verdict + "what to inspect next" → export JSON.
3. Skeptic: land → case-files table → filter by verdict → open dossier → expand source evidence + hashes.

## Hard product rules the UI must encode

- REPLAY vs LIVE always visible and unambiguous.
- Archived (v1) records declare raw bodies are not retained.
- Failed LP evidence renders "unknown", never "0".
- `share.kind === "none"` → no permanent link UI, no fake copy button.
- Jev = second opinion band, visually subordinate to rules verdict.
- Not financial advice — footer + OG disclaimers.
