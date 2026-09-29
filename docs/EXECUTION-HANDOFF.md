# Verdex — execution handoff

Updated 2026-09-29. Tasks 1–8 of the approved overhaul were executed in the isolated worktree branch `codex/verdex-evidence-v2`.

## Verified result

- Base SHA: `a1abade`.
- Latest commit: `f4df122` plus the documentation/submission alignment commit that follows this handoff update.
- Full suite: 18 files, 164 tests passed.
- `pnpm typecheck`: PASS.
- `pnpm evidence:verify tests/fixtures/cmc/synthetic-lp-outage-bundle.json`: PASS.
- `pnpm docs:verify`: PASS.
- `pnpm build`: PASS.
- `gitleaks detect --redact --log-opts="--all"`: PASS, full reachable history scanned, no leaks.
- Browser: replay homepage and a dated JUP archive rendered; mode, coverage, observed sell makers, next checks, source evidence, and exact snapshot share path were visible.

## Current contract

- Replay is the default unless `VERDEX_V2=1` and `VERDEX_LIVE=1` are both set.
- Live uses a server-only key, fail-closed quota permission, 15-second total request budget, 6-second attempt timeout, and one transport retry.
- Input uses `{query, platform?, selection:{platform,address}}`; 4096-byte JSON limit; legacy `pick` is rejected.
- V2 records publish nullable coverage and source statuses. Missing data is unknown, not zero.
- Only committed snapshot ids receive durable share links. Live/runtime records remain transient but can be downloaded as JSON.

## Unverified or owner-required

- No credential was supplied in the execution turn, so current CMC entitlement, pagination, fresh raw-body capture, and real bundle replay remain unverified.
- Mobile 390px contrast/focus capture and a three-person utility study remain unverified.
- In-app browser exposed the export link metadata but did not expose the download event; verify the downloaded file once in a normal browser.
- Production audit reported 4 high and 2 moderate transitive advisories in Next/PostCSS/optional sharp. No forced upgrade was made.
- No deploy, DoraHacks terms acceptance, BUIDL creation, video upload, X post, or submission was performed.

## Files to review

- Audit and plan: [`docs/audits/2026-09-29-hackathon-review.md`](audits/2026-09-29-hackathon-review.md), [`docs/superpowers/plans/2026-09-29-verdex-hackathon-overhaul.md`](superpowers/plans/2026-09-29-verdex-hackathon-overhaul.md).
- Evidence and release matrix: [`docs/evidence/validation-matrix.md`](evidence/validation-matrix.md).
- Judge path: [`docs/DEMO-WALKTHROUGH.md`](DEMO-WALKTHROUGH.md).
- Publishing pack: [`SUBMISSION.md`](../SUBMISSION.md), [`docs/SUBMISSION-CHECKLIST.md`](SUBMISSION-CHECKLIST.md).

The tracked `pnpm-workspace.yaml` explicitly allows only `esbuild` and `sharp` build scripts so pnpm 11 installs on Vercel do not fail closed. Do not claim a live scan, permanent live record, accuracy, adoption, or hackathon result until the corresponding evidence exists.
