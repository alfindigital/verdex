# Verdex validation matrix — 2026-09-29

This matrix records implementation evidence. PASS means the local check ran; UNVERIFIED means the check needs an authorized provider capture, a user study, or a deployment environment. Synthetic cases validate arithmetic/policy only and are not fraud-detection accuracy.

| Case / input | Expected state | Observed state | Evidence | Status |
|---|---|---|---|---|
| EVM chain mismatch during selection | no cross-chain fallback | selection identity requires canonical chain + address | `tests/address.test.ts`, `tests/replay-match.test.ts` | PASS |
| Solana address case | preserve case-sensitive identity | lowercasing is limited to EVM; Solana creator test uses exact case | `tests/address.test.ts`, `tests/metrics.test.ts` | PASS |
| reordered candidates | stable candidate choice | replay candidates sort by exact record id; live selection uses token identity | `tests/replay-match.test.ts`, `tests/analyze.test.ts` | PASS |
| duplicate log rows | count once and disclose duplicate | parser dedupes `(tx,logIndex)` and exposes duplicate count | `tests/dex.test.ts` | PASS |
| missing maker / unknown side | row rejected, never safe zero | strict parser rejects invalid maker/side rows | `tests/dex.test.ts` | PASS |
| unsupported security response | unknown safety/coverage | source failure maps to insufficient coverage | `tests/coverage.test.ts`, `tests/analyze.test.ts` | PASS |
| LP source outage with healthy pools/swaps | no sufficient liquidity clearance | synthetic bundle labels LP evidence unavailable and coverage insufficient | `tests/coverage.test.ts`, `tests/evidence.test.ts`, synthetic fixture | PASS |
| stale or <50 swap sample | insufficient/limited coverage | freshness and count policy is explicit | `tests/coverage.test.ts` | PASS |
| malformed market number / NaN USD | null or rejected, not zero | numeric parser rejects non-finite values | `tests/dex.test.ts`, `tests/metrics.test.ts` | PASS |
| unknown quota / concurrent probe | fail closed and coalesce probe | quota failure returns false; in-flight calls share one request | `tests/live-guard.test.ts` | PASS |
| corrupted cache body | no secret/unsafe reuse | malformed cache is discarded and provider is refetched | `tests/cmc-client.test.ts` | PASS |
| upstream timeout / retry | <=6s attempt, <=1 retry, <=15s total | request signal and retry count asserted | `tests/cmc-client.test.ts` | PASS |
| mobile screenshot at 390px | labels remain readable and controls reachable | responsive styles are present; no automated 390px contrast capture | browser screenshot (desktop only) | UNVERIFIED |
| evidence hash tamper | verifier rejects changed exact body | body hash/base64/JSON/size checks reject tamper | `tests/evidence.test.ts`, `pnpm evidence:verify` | PASS |
| archived permalink | exact registered snapshot only | `snapshotPath` rejects unregistered runtime id; browser opened JUP archive | `tests/verdict-store.test.ts`, `tests/verdict-route.test.ts` | PASS |
| fresh real CMC raw bundle | exact bytes and offline recompute | no credential supplied in execution turn; capture CLI is ready | `docs/evidence/2026-09-29-capability-check.md` | UNVERIFIED |
| 3-target trader utility test | identity/mode understood within 60s | no consenting participants available | no participant data | UNVERIFIED |
| 3 real bundle replay oracle | parser/rules recompute real evidence | no real raw bundles retained | synthetic bundle only | UNVERIFIED |
| production dependency audit | no known production advisories | `pnpm audit --prod --json` found 4 high + 2 moderate transitive advisories in Next/PostCSS/sharp; no upgrade applied in this sprint | audit output 2026-09-29 | UNVERIFIED |

## Gate result

- Local code gate: PASS after full test, typecheck, evidence verifier, docs verifier, and build commands.
- Dependency audit: **UNVERIFIED / follow-up required**. Production audit reported 4 high and 2 moderate transitive advisories (`next>postcss`, optional `next>sharp`); this sprint did not force a breaking dependency upgrade. Treat this as a release review item.
- Replay judging path: PASS locally without CMC/Jev/Groq credentials.
- New live behavior: **not release-cleared** until an authorized CMC capture verifies current tier, timestamps, pagination, and raw-body replay. The implementation defaults to replay when `VERDEX_V2=1` and `VERDEX_LIVE=1` are not both set.
