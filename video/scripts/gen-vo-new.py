#!/usr/bin/env python3
"""Generate VO for the 4 remaining Remotion variants via edge-tts.
Delta already used ElevenLabs/Charlie; these use distinct English voices
per variant, paced fast (+10%/+14%) to match the edit.
"""
import asyncio, os
import edge_tts

BASE = os.path.join(os.path.dirname(__file__), "..", "public")

SCRIPTS = {
    "vo-epsilon": ("en-US-ChristopherNeural", "+8%", [
        "Case opened: September thirtieth. Every DEX buy is a claim — and claims get cross-examined. This is what evidence looks like.",
        "Intake is simple. Paste a contract, a ticker, or a name. Ambiguous tickers resolve to an address and a chain — never a lucky guess. Nine CoinMarketCap endpoints get pulled. Every raw body is frozen on capture.",
        "The file splits into four evidence boxes. Safety: contract flags, taxes, vendor risk. Flow: who is buying and selling — and how concentrated. Liquidity: can you actually exit. Pump: is the volume manufactured.",
        "Exhibit A: RAY on Solana. Three dimensions clean. But top-five makers hold ninety-two percent of the tape. The stamp reads caution.",
        "Exhibit B: SUSHI. Mintable flag, seventy-three percent maker concentration, negative net flow. Three failing rows — every one named. The stamp reads avoid.",
        "Exhibit C: GMX on Arbitrum. A governance blue-chip — and still, flow danger. Eighty-one percent concentration, net outflow. Caution, on the record.",
        "Chain of custody, on paper: nine endpoints, nine bodies, nine SHA-256 hashes. You can re-verify every byte yourself.",
        "On the record: forty-one verdicts. Eight chains. Three hundred sixty-nine receipts. Thirty-one cautions, four avoids, six insufficient.",
        "Disclosures, before you trust it: missing data shows as unknown — never zero. Truncated windows downgrade coverage. A replayed verdict is labeled a replay. The AI is a second voice — never the rulebook.",
        "Verdicts you can audit. Not vibes you can buy. Verdex — don't be the exit liquidity.",
    ]),
    "vo-zeta": ("en-US-JennyNeural", "+12%", [
        "Verdex: a pre-trade forensic scan. Nine endpoints, four dimensions, one verdict.",
        "Target acquired. RAY on Solana — resolved to a chain and an address. Ambiguous tickers never get auto-picked.",
        "Pulling evidence: search, transactions, pools, liquidity events, security detail, token metadata, global metrics, historical quotes, fear and greed. Each body frozen with a hash.",
        "The dimension sweep begins. Safety — clean. Flow — danger: the top five makers hold ninety-two percent. Liquidity — clean. Pump — clean.",
        "Score settled: eighty-five out of a hundred. Flow danger on the record — ninety-two percent concentration is named, not smoothed over.",
        "The stamp: caution. Coverage is limited — the hundred-row swap cap is disclosed, not hidden.",
        "SUSHI — a different answer from the same instrument. Mintable flag, seventy-three percent concentration, negative net buys.",
        "Avoid. Score forty-five. The second opinion contested it — and that disagreement is printed too.",
        "Forty-one verdicts on file. Eight chains. Three hundred sixty-nine receipts. A ledger, not a blog post.",
        "The machine doesn't guess. It measures, hashes, and labels. Verdex — don't be the exit liquidity.",
    ]),
    "vo-eta": ("en-US-AriaNeural", "+10%", [
        "The tape is public. Nobody reads all of it. Verdex does.",
        "The dossier tape: market cap, volume, liquidity, daily change, unique traders, token age, holders, exchange listings — every field the provider reports.",
        "Per-window activity, real numbers: five minutes, one hour, four hours, twenty-four. Volume, transactions, buys, sells, price change — every window on the record.",
        "RAY stamps caution. Score eighty-five — the strongest on file — and it still fails one row.",
        "That row: twenty-three makers, ninety-two percent of the tape. When five wallets own the flow, your exit is their decision.",
        "SUSHI stamps avoid. Score forty-five. The model's second opinion contested — shown, not hidden.",
        "The tape rules: missing shows as unknown. Truncated downgrades coverage. Replayed is labeled. The second opinion never writes the rules.",
        "The ledger so far: forty-one verdicts, eight chains, three hundred sixty-nine receipts, thirty-one cautions on file.",
        "Read the tape before the tape reads you. Verdex — don't be the exit liquidity.",
    ]),
    "vo-theta": ("en-US-AndrewNeural", "+9%", [
        "On the left — what a contract check sees: verified. On the right — what Verdex sees: behavior.",
        "The contract checks all pass: source verified, audit badge, doxxed deployer, locked liquidity. Now the other side: top-five makers at ninety-two percent. Twelve third-party sells. That's what the tape says.",
        "Passed describes the structure. It says nothing about the behavior. Verdex measures the behavior — and prints caution.",
        "Same test on a blue-chip: SUSHI. Audited, branded, years old. The evidence side: seventy-three percent concentration, negative net buys, a mintable flag.",
        "Avoid. Score forty-five. The brand didn't save it — the behavior sank it.",
        "The honest version matters just as much: missing data shows unknown, thin windows show limited, replays show replayed.",
        "The method, flat out: resolve the identity. Pull nine endpoints. Measure four dimensions. Stamp the verdict with a named falsifier.",
        "Forty-one verdicts. Eight chains. Three hundred sixty-nine receipts. Every number on file.",
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
