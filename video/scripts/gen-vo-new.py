#!/usr/bin/env python3
"""Generate VO for all 5 Remotion variants via edge-tts.

Refresh 2026-09-30 (rules 2.3.0): every number below is re-derived from the
current committed snapshot corpus — 301 records, 9 chains, 2,709 receipts,
29,744 swap events, label dist 190 caution / 103 high-risk / 6 insufficient / 2
clean. SUSHI/GMX are no longer JANGAN under 2.3.0, so the JANGAN exhibit is
now CEL (dead tape, 13.1 swaps/day) and TITANO (dust liquidity, score 0).

Delta previously used ElevenLabs/Charlie (quota ran out); it now uses
edge-tts GuyNeural for consistency with the other four variants.
"""
import asyncio, os
import edge_tts

BASE = os.path.join(os.path.dirname(__file__), "..", "public")

SCRIPTS = {
    "vo-delta": ("en-US-GuyNeural", "+8%", [
        "Every DEX buy is a claim — and claims deserve receipts. Verdex is a pre-trade evidence check.",
        "One token in. Nine CoinMarketCap calls out. Every raw body frozen and hashed — nothing from memory.",
        "The custody chain, printed on tape: search, transactions, pools, liquidity events, security detail, token metadata.",
        "Global metrics, historical quotes, fear-and-greed — every receipt hash is on screen. Verify each byte yourself.",
        "Exhibit one: RAY on Solana. Score eighty-five. But five wallets hold ninety-two percent of the tape — the stamp reads caution.",
        "Exhibit two: CEL — a collapsed lender's token that still trades. Thirteen swaps a day across an eight-day window. Dead tape. Score forty-five. The stamp reads high-risk flags.",
        "The honesty line: missing shows as unknown — never zero. Truncated downgrades coverage. Replays are labeled. The AI is a second voice, never the rules.",
        "The ledger so far: three hundred one verdicts. Nine chains. Over twenty-seven hundred receipts. Nearly thirty thousand swaps on file.",
        "If you can't hash it, it didn't happen. Verdex — don't be the exit liquidity.",
    ]),
    "vo-epsilon": ("en-US-ChristopherNeural", "+8%", [
        "Case opened: September thirtieth. Every DEX buy is a claim — and claims get cross-examined. This is what evidence looks like.",
        "Intake is simple. Paste a contract, a ticker, or a name. Ambiguous tickers resolve to an address and a chain — never a lucky guess. Nine CoinMarketCap endpoints get pulled. Every raw body is frozen on capture.",
        "The file splits into four evidence boxes. Safety: contract flags, taxes, vendor risk. Flow: who is buying and selling — and how concentrated. Liquidity: can you actually exit. Pump: is the volume manufactured.",
        "Exhibit A: RAY on Solana. Three dimensions clean. But top-five makers hold ninety-two percent of the tape. The stamp reads caution.",
        "Exhibit B: CEL. A collapsed lender's token, still listed. Thirteen swaps a day — a hundred percent of the tape in five wallets. The stamp reads high-risk flags.",
        "Exhibit C: TITANO on BSC. Zero dollars of pool depth. Zero swaps observed. An exit that does not exist. High-risk flags — score zero.",
        "Chain of custody, on paper: nine endpoints, nine bodies, nine SHA-256 hashes. You can re-verify every byte yourself.",
        "On the record: three hundred one verdicts. Nine chains. Over twenty-seven hundred receipts. One hundred ninety cautions, one hundred three high-risk, six insufficient.",
        "Disclosures, before you trust it: missing data shows as unknown — never zero. Truncated windows downgrade coverage. A replayed verdict is labeled a replay. The AI is a second voice — never the rulebook.",
        "Verdicts you can audit. Not vibes you can buy. Verdex — don't be the exit liquidity.",
    ]),
    "vo-zeta": ("en-US-JennyNeural", "+12%", [
        "Verdex: a pre-trade forensic scan. Nine endpoints, four dimensions, one verdict.",
        "Target acquired. RAY on Solana — resolved to a chain and an address. Ambiguous tickers never get auto-picked.",
        "Pulling evidence: search, transactions, pools, liquidity events, security detail, token metadata, global metrics, historical quotes, fear and greed. Each body frozen with a hash.",
        "The dimension sweep begins. Safety — clean. Flow — warning: the top five makers hold ninety-two percent. Liquidity — clean. Pump — clean.",
        "Score settled: eighty-five out of a hundred. Flow warning on the record — ninety-two percent concentration is named, not smoothed over.",
        "The stamp: caution. Coverage is limited — the hundred-row swap cap is disclosed, not hidden.",
        "CEL — a different answer from the same instrument. A collapsed lender's token: thirteen swaps a day, five wallets holding the whole tape.",
        "High-risk flags. Score forty-five. The second opinion leaned risky too — and that agreement is printed.",
        "Three hundred one verdicts on file. Nine chains. Over twenty-seven hundred receipts. A ledger, not a blog post.",
        "The machine doesn't guess. It measures, hashes, and labels. Verdex — don't be the exit liquidity.",
    ]),
    "vo-eta": ("en-US-AriaNeural", "+10%", [
        "The tape is public. Nobody reads all of it. Verdex does.",
        "The dossier tape: market cap, volume, liquidity, daily change, unique traders, token age, holders, exchange listings — every field the provider reports.",
        "Per-window activity, real numbers: five minutes, one hour, four hours, twenty-four. Volume, transactions, buys, sells, price change — every window on the record.",
        "RAY stamps caution. Score eighty-five — and it still fails one row.",
        "That row: twenty-three makers, ninety-two percent of the tape. When five wallets own the flow, your exit is their decision.",
        "CEL stamps high-risk flags. Score forty-five. A collapsed lender's token — thirteen swaps a day. The tape was already dead.",
        "The tape rules: missing shows as unknown. Truncated downgrades coverage. Replayed is labeled. The second opinion never writes the rules.",
        "The ledger so far: three hundred one verdicts, nine chains, over twenty-seven hundred receipts on file.",
        "Read the tape before the tape reads you. Verdex — don't be the exit liquidity.",
    ]),
    "vo-theta": ("en-US-AndrewNeural", "+9%", [
        "On the left — what a contract check sees: verified. On the right — what Verdex sees: behavior.",
        "The contract checks all pass: source verified, audit badge, doxxed deployer, locked liquidity. Now the other side: top-five makers at ninety-two percent. Twelve third-party sells. That's what the tape says.",
        "Passed describes the structure. It says nothing about the behavior. Verdex measures the behavior — and prints caution.",
        "Same test on a fallen brand: CEL. Celsius collapsed — but the ticker never stopped trading. The evidence side: thirteen swaps a day, one hundred percent concentration, unrenounced powers.",
        "High-risk flags. Score forty-five. The brand didn't save it — the dead tape sank it.",
        "The honest version matters just as much: missing data shows unknown, thin windows show limited, replays show replayed.",
        "The method, flat out: resolve the identity. Pull nine endpoints. Measure four dimensions. Stamp the verdict with a named falsifier.",
        "Three hundred one verdicts. Nine chains. Over twenty-seven hundred receipts. Every number on file.",
        "Trust the badge — or check the record. Verdex — don't be the exit liquidity.",
    ]),
}

async def gen(folder, voice, rate, i, text):
    out = os.path.join(BASE, folder, f"s{i:02d}.mp3")
    c = edge_tts.Communicate(text, voice, rate=rate)
    await c.save(out)
    print(f"{folder}/{os.path.basename(out)}  ({len(text)} chars)")

async def main():
    for folder, (voice, rate, lines) in SCRIPTS.items():
        os.makedirs(os.path.join(BASE, folder), exist_ok=True)
        for i, text in enumerate(lines, 1):
            await gen(folder, voice, rate, i, text)

asyncio.run(main())
print("VO DONE")
