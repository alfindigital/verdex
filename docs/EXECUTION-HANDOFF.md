# Verdex — execution entry point

Updated 29 September 2026. **Planning only; product overhaul has not started.**

## Read in order

1. Master rules: `C:/Users/GEEKOM A8/.agents/AGENTS.md`.
2. [Verified audit and critique](audits/2026-09-29-hackathon-review.md).
3. [Detailed implementation plan](superpowers/plans/2026-09-29-verdex-hackathon-overhaul.md), including contracts, Tasks 1–8, release gates and rollback.

Baseline: `9512cee3145660fe1ffc66cdb9cc4d0addf53e8e`; repository `https://github.com/alfindigital/verdex`; application `https://verdex-alpha.vercel.app`. Recheck working tree and remote before beginning. Planning files are local additions; no product source, production setting or deployment was changed by this planning task.

## Decision proposed for approval

Retain Verdex and Markets and Trading Tools. Build a pre-swap evidence inspection workflow: stable token identity, source coverage, observed flags, raw evidence export, deterministic replay. Default new infrastructure budget $0. Live scans render inline and export JSON; public sharing is only for committed dated snapshots. No new database, login, billing, trading automation, MCP or RWA pivot in the sprint.

The user requested a plan before implementation and will move execution to another agent. “Continue planning” is not implementation approval. Once the user authorizes execution of this plan, proceed through approved tasks without asking again for routine changes. Deployment, posting, submitting forms/terms, spending and deletion require their applicable explicit authorization. Do not independently send this handoff to another chat.

## Verified findings to preserve

| Priority | Finding | Evidence |
|---|---|---|
| P0 | Failed LP source can become CLEAN/high-confidence LAYAK | Reproduced with a mocked source outage |
| P0 | Live result URL can fail and share URL can open an older record | Live API id `54811a2bf901`: API GET 200, page GET 404 during audit |
| P0 | Requested chain can silently fall back to another chain | Resolver probe BSC request returned Ethereum |
| P0 | Malformed rows become buys/adds or count as sell evidence | Parser and empty-maker probes |
| Product | 30 of 34 archived samples are RAWAN | Corpus inspected; not an accuracy benchmark |

97 tests, typecheck, build and redacted gitleaks check passed at baseline. These successes did not prevent the reproduced defects. Node 24.15.0, pnpm 11.24.0 measured locally; clean install remains unverified. Live/API checks are dated observations, not uptime guarantees. Full mobile, dependency vulnerability and human utility testing remain pending.

## Execution order

1. Freeze baseline, capture actual CMC field contracts and fixtures.
2. Correct chain/address identity and strict parsing/deduplication.
3. Implement coverage propagation and versioned rule labels.
4. Capture exact response bytes and verify offline recomputation.
5. Bound route deadlines/quota behavior and correct sharing contract.
6. Render useful reasons, missing evidence and archived/live state.
7. Verify adversarial cases, CI, clean install and user comprehension.
8. Align README/specs/submission/video with actual tested behavior.

The detailed plan specifies file ownership, interfaces, test cases and acceptance per task. Estimated 18–26 hours plus publication buffer; this is not a guaranteed completion time. Internal submission target 30 September 2026 20:00 WIB. Official closing text inspected says 30 September 23:59 UTC (1 October 06:59 WIB); verify again before submission.

## Questions still unanswered

- Does the user accept retaining Verdex/Markets and the no-new-infrastructure scope?
- How much execution time and service budget are available?
- Are BUIDL, final YouTube demo and X post already published? Obtain actual URLs rather than inventing placeholders.
- Is persistent sharing for every live scan mandatory? Default is no; selecting yes requires the extension and contract revision in plan §12.

These questions do not block reviewing the plan. Scope approval is needed before coding; publication links are needed before final submission completeness can be claimed. No winning probability can be justified from this audit.

## Completion report required from executing agent

Record approved scope, baseline/final SHA, changed files, actual commands and exit codes, evidence/demo paths, screenshots, remaining failed/unverified checks, mode settings by name without secret values, and human publication steps. Tick only completed checks. Preserve original 34 snapshots and all historical timestamps. If work stops mid-task, document the exact failing case and next command.
