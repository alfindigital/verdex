#!/usr/bin/env python3
"""Resume vo-theta generation from s03 with retry/backoff."""
import asyncio, os
import edge_tts

BASE = os.path.join(os.path.dirname(__file__), "..", "public", "vo-theta")
VOICE, RATE = "en-US-AndrewNeural", "+9%"
LINES = [
    "Passed describes the structure. It says nothing about the behavior. Verdex measures the behavior — and prints caution.",
    "Same test on a blue-chip: SUSHI. Audited, branded, years old. The evidence side: seventy-three percent concentration, negative net buys, a mintable flag.",
    "Avoid. Score forty-five. The brand didn't save it — the behavior sank it.",
    "The honest version matters just as much: missing data shows unknown, thin windows show limited, replays show replayed.",
    "The method, flat out: resolve the identity. Pull nine endpoints. Measure four dimensions. Stamp the verdict with a named falsifier.",
    "Forty-one verdicts. Eight chains. Three hundred sixty-nine receipts. Every number on file.",
    "Trust the badge — or check the record. Verdex — don't be the exit liquidity.",
]

async def gen(i, text):
    out = os.path.join(BASE, f"s{i:02d}.mp3")
    for attempt in range(5):
        try:
            c = edge_tts.Communicate(text, VOICE, rate=RATE)
            await c.save(out)
            print(f"s{i:02d}.mp3 ok")
            return
        except Exception as e:
            print(f"s{i:02d} attempt {attempt+1} failed: {e}")
            await asyncio.sleep(4 * (attempt + 1))
    raise SystemExit(f"giving up on s{i:02d}")

async def main():
    for j, text in enumerate(LINES):
        await gen(j + 3, text)
        await asyncio.sleep(1.5)

asyncio.run(main())
print("THETA DONE")
