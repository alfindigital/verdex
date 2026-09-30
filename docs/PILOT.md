# PILOT — 30-day commercial validation plan

Verdicts are evidence-in-a-window, not predictions. Nothing below assumes
Verdex detects rugs better than anyone — that is exactly what the pilot is
designed to measure before any pricing decision.

## What is being tested

1. **Comprehension** — do users understand `CAUTION` vs `INSUFFICIENT
   EVIDENCE` without explanation? Target: 8/10 articulate the difference.
2. **Workflow change** — does a scan actually change what they do next?
   Track: before-Verdex flow vs after (size down, skip, or proceed).
3. **Willingness to pay** — small paid pilot, not a landing-page survey.
   Offer: 30 receipted scans + a weekly "recheck digest" for a flat ~$15.
   Gate: ≥5 of 10 pilot users pay.
4. **Retention** — do they come back for a second scan inside 14 days?
   Gate: ≥3 of 5 paying users re-scan without prompting.

## What NOT to build before the gates pass

- No subscriptions, billing tiers, API keys for resale, or alerting infra.
- No "probability of rug" output — rules stay observational until a
  prospective, time-separated evaluation exists.
- No B2B resale of raw bundles until the CMC license scope for raw-body
  redistribution is confirmed in writing.

## Prospective evaluation (the honest benchmark)

The committed 59-label set is retrospective — outcomes were known at
capture. To earn any predictive claim:

1. Freeze `rulesVersion` at scan time; record the verdict.
2. Define the outcome window *before* looking (e.g. 7d: −70% liquidity
   pull, contract exploit, or delisting).
3. Score: precision/recall per class, abstention rate, calibration.
4. Baseline honestly: compare vs sec-flags-only AND vs always-CAUTION —
   a cautious judge trivially "wins" recall-only metrics.

## Licensing note

Before any commercial API tier: confirm the CMC plan permits serving
derived verdicts and redistributing raw response bodies in bundles. If
raw redistribution is out of scope, bundles stay proof-of-receipt
(hashes + metadata) and raw bodies are retained privately.
