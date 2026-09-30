# How Verdex works — plain language

Verdex answers one question: **"before I buy this DEX token, what does the observable evidence say?"** It is a forensic reader, not an advisor. It never says "buy" — it stamps `ENTRY-WORTHY`, `CAUTION`, `AVOID`, or `INSUFFICIENT EVIDENCE` and shows exactly which numbers produced the stamp.

## The 30-second version

1. **You paste a token.** A ticker like `RAY`, a name, or a full contract address.
2. **Verdex identifies it.** Many tickers exist on many chains — if your input is ambiguous, you pick the exact chain/address. No silent guessing.
3. **Verdex pulls the tape.** Nine CoinMarketCap API endpoints: token search, swap transactions, pools, LP (liquidity) events, security detail, token metadata, and macro context (global metrics, historical quotes, Fear & Greed). Every raw response body is frozen and hashed — a receipt.
4. **Four dimensions get measured.** Deterministic rules — the same numbers always produce the same answer:
   - **SAFETY** — contract flags, taxes, provider-reported risk.
   - **FLOW** — who is actually trading: maker count, top-5 maker share, net buy ratio, third-party sells.
   - **LIQUIDITY** — pool depth and whether exits are possible.
   - **PUMP** — whether volume looks manufactured.
5. **A score settles, a stamp lands.** 0–100 heuristic score (a heuristic, *not* a probability) plus the verdict label and a named falsifier — the specific fact that would change the verdict.
6. **A second opinion speaks — separately.** An external AI model (Jev) reads the computed metrics only (never raw payloads, never keys) and returns its own risk estimate plus an agreement status: agrees / contested / unavailable. It can disagree with the rules; that disagreement is printed, not hidden.
7. **Coverage is disclosed.** If the swap window was truncated (e.g. the 100-row API cap) or a source failed, coverage drops to *limited/insufficient* and the record says why. Missing data renders as `—` / unknown, never as zero.
8. **Everything is shareable with proof.** Each verdict links to its evidence bundle: endpoint list, timestamps, SHA-256 hashes of raw bodies, credit counts. Archived snapshots can be replayed later without an API key.

## What the labels mean

| Stamp | Meaning |
|---|---|
| `ENTRY-WORTHY` | No known flag in the reviewed sample — **not** a guarantee or recommendation |
| `CAUTION` | At least one dimension reads danger; the failing rows are named |
| `AVOID` | Multiple hard failures (e.g. extreme maker concentration + negative flow) |
| `INSUFFICIENT` | Not enough evidence to judge honestly — the missing pieces are listed |

## Replay vs live

- **Replay** — committed snapshots served without an API key; labeled `ARCHIVED / REPLAY`. This is what the demo site shows by default.
- **Live** — fresh CMC fetch behind `VERDEX_V2` + `VERDEX_LIVE` flags and a server-side key (`CMC_API_KEY`); labeled `LIVE`, transient, and not given a permanent share URL.

## In one sentence

> Verdex turns "trust me bro" into "here are the receipts": nine frozen API bodies, four measured dimensions, one stamped verdict, and a second opinion that's allowed to disagree — all of it auditable.

Production: `verdex.web.id` (provisioning) — currently `https://verdex-alpha.vercel.app`.
