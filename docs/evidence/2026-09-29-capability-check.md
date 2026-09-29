# CMC capability check — 29 September 2026

Status: Task 1 planning/fixture record. No production source was changed for this check.

## Baseline commands

Executed in the isolated branch `codex/verdex-evidence-v2` at base `a1abade`:

| Command | Result | Note |
|---|---|---|
| `pnpm install --frozen-lockfile` | installed 91 root packages; pnpm reported ignored esbuild/sharp scripts | root setup |
| `pnpm test` | PASS, 100 tests in 9 files | current HEAD has 100, not the earlier 97 count |
| `pnpm typecheck` before video install | FAIL, missing Remotion modules | clean root install does not install `video/` dependencies |
| `pnpm build` before video install | FAIL at type checking for the same missing Remotion modules | same setup issue |
| `npm ci --ignore-scripts` in `video/` | PASS, 370 packages audited; npm reported 2 low severity findings | setup only; no `npm audit fix` run |
| `pnpm typecheck` after video install | PASS | all included TypeScript files resolved |
| `pnpm build` after video install | PASS, 141 static pages | build output retained in terminal evidence |

The missing video dependency setup is a release reproducibility issue. It is not silently treated as a product fix: Task 7 must decide and document the supported install sequence or make the workspace declaration explicit. The existing tracked `pnpm-workspace.yaml` has an unrelated local modification (`allowBuilds` placeholder text); it was not changed or staged by this task.

## Credential boundary

The repository has a local `.env.local`, but no API credential was supplied in this user request. Per the workspace credential rule, this task did not read or use that file and did not call CMC with a stored key. Therefore no current live response body, quota entitlement, pagination result, or Basic-tier capability is claimed here. Replay remains the safe judging path until a user explicitly supplies a credential for a bounded capture.

## Deployment follow-up — 2026-09-29

This baseline was recorded before the owner supplied an explicit CMC key and before
the production install policy was repaired. `pnpm-workspace.yaml` now uses
`allowBuilds: { esbuild: true, sharp: true }`; `pnpm install --frozen-lockfile`
passes locally with both package scripts completing. The first Vercel auto-deploy
for `abd1e04` failed at `pnpm install` with `ERR_PNPM_IGNORED_BUILDS`; a manual
deployment is being verified separately. The supplied key is used only in the
current process for a bounded live probe and is not written here or to the repo.

The manual build then failed because the root TypeScript include glob reached
`video/remotion.config.ts` while Vercel installs only the root dependencies. The
root `tsconfig.json` now excludes `video/`; the video workspace remains covered by
its own `npm run lint` and `npm run build` checks.

## Contract evidence available without a key

The retained repository normalizer tests contain trimmed payloads with the fields listed in `tests/fixtures/cmc/README.md`. They are sufficient to specify parser input shapes, but not to establish current provider behavior, endpoint availability, response timestamps, pagination, or raw-body hashes. `real-shape-sample.json` is explicitly labelled `rawBodyRetained: false` for that reason.

## Capability probe decision

No anonymous endpoint or competitor endpoint was used as a substitute. The plan's maximum of four capability probes remains unused. A future authorized capture must use the existing official CMC client surface, one token identity, and a bounded call budget; it must report each endpoint as verified or unverified rather than inferring support from a successful historical snapshot.

## Acceptance result

Task 2 now has explicit representative field shapes and a synthetic invalid corpus. Live contract, pagination, current quota/tier, and raw response capture remain **UNVERIFIED** and are carried into the handoff/release matrix.
