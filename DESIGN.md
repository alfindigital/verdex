# DESIGN.md — Verdex visual system

> Binding brief for the UI/UX overhaul (docs/REDESIGN-PLAN.md). Two candidate directions ship side-by-side behind `data-dir="a"|"b"` on `<html>` for local comparison; the loser is removed before final ship. Every decision carries a one-line reason (antislop R-31).

## Surface modes

- Landing `/` = **Persuade** (judge/trader arrives, must grasp value in 5s) but leads with a working instrument, not marketing.
- `/verdict/[id]` = **Operate/Read** (dense evidence dossier; reading > clicking).

## Shared decisions (both directions)

| Decision | Rationale |
|---|---|
| Dark-only theme | Forensic trading tool; night-time context; brand already dark — no light mode doubles contrast risk. |
| Semantic verdict colors are identical in both dirs | Verdict semantics are product truth, not styling — `safe/warn/danger/unknown` never change per theme. |
| `--color-accent` = interaction color, distinct from verdict `safe` in B | Green means "clean verdict"; reusing it for every button teaches the wrong association. |
| Mono (IBM Plex) restricted to data: hashes, addresses, numbers, receipts, timestamps | Mono everywhere was the "AI slop terminal" costume; data-only use keeps the forensic flavor honest. |
| Min content text size 11px; labels ≥ AA | Old UI sat at 9–11px `text-faint` ≈ 2.9:1 — below WCAG AA. `faint` token is now raised to AA on panel. |
| One motif system: exhibit numbers + stamp + fingerprint strips + redaction bars | Forensic dossier identity — repeated, not decorative wallpaper. |
| No fake terminal chrome, no `verdex@cmc:~$` | Slop tell; the scanner is an instrument panel, not a shell theme. |
| No glow, no glass, no gradient meshes, no grid/blueprint wallpaper | All are the crypto-AI cliché set. Texture = film grain (kept) + paper. |
| Stats on landing are computed from real snapshots | R-26: zero fabricated numbers. |

## Direction A — "Evidence Desk" (default, `data-dir="a"`)

Forensic dossier on a dark desk. Editorial serif display over data mono.

| Element | Decision | Rationale |
|---|---|---|
| Display font | Fraunces VF (`--font-deco`), wght 600, WONK axis on accent words | Serif judicial gravitas vs mono evidence = the identity tension; nothing else in crypto looks like this. |
| Palette | ink `#0b0c0a` · panel `#13160f` · raised `#1a1e15` · line `#2a2f25` · lineBright `#404739` · text `#eef1e7` · dim `#a7b09d` · faint `#8b947f` · paper `#eae8da` | Warm-green desk tone; `faint` raised to AA (verify §QA) so no meaningful text fails contrast. |
| Accent | `--accent` = `#3dd68c` (safe green) | A uses green sparingly: links, focus, EX numbers — matches "no flags" brand. |
| Stamp | Fraunces uppercase, double-border ink stamp, `rotate(-2.5deg)`, `vdx-stamp` spring-in | The rubber stamp IS the product metaphor — scaled up to hero size. |
| Paper motif | `.paper-tag` chips (EX numbers, archive tags): paper bg + dark text + slight rotation | Physical dossier feel without paper-bg contrast risk everywhere. |
| Dossier cards | `bg-raised`, subtle alternating rotation, heavy physical shadow, paper-tag corner | Case files on a desk. |
| Radius | 4/8/12px | Editorial softness. |
| Dials | ENERGY 2 · RHYTHM 3 · MOTION 2 | Calm authority; motion = stamp reveal + skeleton only. |

## Direction B — "Instrument Panel" (alternate, `data-dir="b"`)

Cockpit instrument: heavy expanded grotesk, squared, denser, colder.

| Element | Decision | Rationale |
|---|---|---|
| Display font | Archivo `font-stretch: 122%` wght 800, tight tracking, ALL display uppercase | wdth axis already shipped in `Archivo.ttf` — expanded grotesk for free, maximal contrast vs A's serif. |
| Palette | ink `#090d12` · panel `#0f141b` · raised `#161d27` · line `#24303f` · lineBright `#37475d` · text `#eaeef5` · dim `#a3adbe` · faint `#8793a6` | Cold steel-blue neutrals — clearly distinguishable world from A. |
| Accent | `--accent` = `#2fd2f0` (signal cyan) | Instrument readout hue; separates interaction from verdict green. |
| Stamp | Squared slab: heavier border, no rotation, Archivo expanded | Placard, not rubber stamp — keeps motif, different physics. |
| Dossier cards | `bg-panel`, `border-l-3 accent`, no rotation | Rack-mounted instrument blocks. |
| Radius | 2/3/4px | Machined edges. |
| Dials | ENERGY 3 · RHYTHM 2 · MOTION 1 | Denser and more rigid; nearly still. |

## Type scale

`display-hero` clamp(2.9rem, 7vw, 5.5rem) · `display-1` clamp(1.9rem,4vw,3rem) · `display-2` clamp(1.35rem,2.4vw,1.9rem) · body 15–16px · data 12–13px · micro-label 10.5–11px uppercase. Nothing meaningful under 11px.

## QA gates

- `contrast-check.py` on every text/bg token pair per direction — table committed to PR.
- `text-faint` forbidden on body copy; allowed only for ≤11px uppercase labels at ≥4.5:1 (verify), decorative dividers, and ghosts.
- `prefers-reduced-motion` kills stamp/skeleton/reveal animations.
- Focus ring = `--color-accent`, always visible.
