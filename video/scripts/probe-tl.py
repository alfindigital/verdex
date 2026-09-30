#!/usr/bin/env python3
"""Probe VO mp3 durations and rewrite the TL_<VARIANT> blocks + totals.

Each scene window = ceil(mp3_seconds * 30) + PAD frames; `from` is cumulative.
Keeps narration inside its Sequence so audio is never clipped by a boundary.
"""
import json, math, os, re, subprocess

BASE = os.path.join(os.path.dirname(__file__), "..")
FPS = 30
PAD = 15  # 0.5s breathing room after each VO line

VARIANTS = {
    "vo-delta": ("VerdexDelta.tsx", "TL_DELTA", "TL_DELTA_TOTAL"),
    "vo-epsilon": ("VerdexEpsilon.tsx", "TL_EPSILON", "TL_EPSILON_TOTAL"),
    "vo-zeta": ("VerdexZeta.tsx", "TL_ZETA", "TL_ZETA_TOTAL"),
    "vo-eta": ("VerdexEta.tsx", "TL_ETA", "TL_ETA_TOTAL"),
    "vo-theta": ("VerdexTheta.tsx", "TL_THETA", "TL_THETA_TOTAL"),
}

def dur_frames(mp3):
    out = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "json", mp3],
        capture_output=True, text=True, check=True)
    sec = float(json.loads(out.stdout)["format"]["duration"])
    return math.ceil(sec * FPS) + PAD

for folder, (tsx, tl_name, total_name) in VARIANTS.items():
    vdir = os.path.join(BASE, "public", folder)
    files = sorted(f for f in os.listdir(vdir) if f.endswith(".mp3"))
    entries, cur = [], 0
    for i, fn in enumerate(files, 1):
        d = dur_frames(os.path.join(vdir, fn))
        entries.append(f"  s{i:02d}: {{ from: {cur}, dur: {d} }},")
        cur += d
    total = cur
    block = f"export const {tl_name} = {{\n" + "\n".join(entries) + \
            f"\n}} as const;\nexport const {total_name} = {total};"
    path = os.path.join(BASE, "src", tsx)
    src = open(path, encoding="utf-8").read()
    pat = re.compile(
        rf"export const {tl_name} = \{{.*?\}} as const;\s*export const {total_name} = \d+;",
        re.S)
    assert pat.search(src), f"{tl_name} block not found in {tsx}"
    src = pat.sub(lambda _: block, src, count=1)
    open(path, "w", encoding="utf-8").write(src)
    print(f"{tsx}: {len(files)} scenes, total {total}f ({total/FPS:.1f}s)")

print("TL PROBE DONE")
