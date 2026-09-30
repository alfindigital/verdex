#!/usr/bin/env python3
"""ElevenLabs v4 VO for the 5 Verdex variants — two voices per video.

Male (Brian) narrates the setup + exhibits; female (Sarah) takes the honesty
line, ledger stats, and closing. Reads lines from gen-vo-new.SCRIPTS so the
text is always the same as the edge-tts cut.

Keys come from env only — never written to disk:
    ELEVENLABS_API_KEY, ELEVENLABS_API_KEY_2 ... ELEVENLABS_API_KEY_N

Writes public/vo-<variant>-el/sNN.mp3 alongside the edge-tts folders.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module

SCRIPTS = import_module("gen-vo-new").SCRIPTS

BASE = os.path.join(os.path.dirname(__file__), "..", "public")
MODEL = "eleven_v4"
MALE = "nPczCjzI2devNBz1zQrb"    # Brian — deep, resonant
FEMALE = "EXAVITQu4vr4xnSDxMaL"  # Sarah — mature, reassuring, confident

# Female takes the last N lines of each variant (honesty + ledger + close).
FEMALE_TAIL = {"vo-delta": 3, "vo-epsilon": 3, "vo-zeta": 2, "vo-eta": 3, "vo-theta": 3}


def keys():
    out = [os.environ.get("ELEVENLABS_API_KEY")]
    i = 2
    while os.environ.get(f"ELEVENLABS_API_KEY_{i}"):
        out.append(os.environ[f"ELEVENLABS_API_KEY_{i}"])
        i += 1
    return [k for k in out if k]


def tts(key, voice, text):
    body = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
        data=body,
        headers={
            "xi-api-key": key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )
    return urllib.request.urlopen(req, timeout=60).read()


def main():
    pool = keys()
    if not pool:
        sys.exit("ELEVENLABS_API_KEY not set")
    ki = 0
    for folder, (_v, _r, lines) in SCRIPTS.items():
        tail = FEMALE_TAIL.get(folder, 2)
        outdir = os.path.join(BASE, folder + "-el")
        os.makedirs(outdir, exist_ok=True)
        for i, text in enumerate(lines, 1):
            voice = FEMALE if i > len(lines) - tail else MALE
            out = os.path.join(outdir, f"s{i:02d}.mp3")
            if os.path.exists(out) and os.path.getsize(out) > 1000:
                print(f"{folder}-el/s{i:02d}.mp3  skip (exists)")
                continue
            for _ in range(len(pool)):
                try:
                    audio = tts(pool[ki], voice, text)
                    with open(out, "wb") as f:
                        f.write(audio)
                    print(f"{folder}-el/s{i:02d}.mp3  {len(audio)//1024}KB  key{ki}  {'F' if voice == FEMALE else 'M'}")
                    break
                except urllib.error.HTTPError as e:
                    print(f"{folder}-el/s{i:02d}.mp3  HTTP {e.code} key{ki}: {e.read()[:100]!r}")
                    ki = (ki + 1) % len(pool)
                except Exception as e:
                    print(f"{folder}-el/s{i:02d}.mp3  {type(e).__name__} key{ki}: {e}")
                    ki = (ki + 1) % len(pool)
            else:
                sys.exit(f"all keys failed on {folder}/s{i:02d}")
            time.sleep(1.0)  # free-tier is burst-sensitive
    print("EL VO DONE")


if __name__ == "__main__":
    main()
