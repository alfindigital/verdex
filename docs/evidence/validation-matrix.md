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
| mobile screenshot at 390px | labels remain readable and controls reachable | production 390x844 captures show readable labels and reachable controls; no page-level horizontal scroll (`scrollWidth=390`); receipts table cells use intentional `truncate`/`overflow-x-auto` | `demo-shots/mobile-390-home.png`, `demo-shots/mobile-390-verdict.png` | PASS |
| evidence hash tamper | verifier rejects changed exact body | body hash/base64/JSON/size checks reject tamper | `tests/evidence.test.ts`, `pnpm evidence:verify` | PASS |
| archived permalink | exact registered snapshot only | `snapshotPath` rejects unregistered runtime id; browser opened JUP archive | `tests/verdict-store.test.ts`, `tests/verdict-route.test.ts` | PASS |
| fresh real CMC raw bundle | exact bytes and offline recompute | 3 authorized captures on 2026-09-29 (JUP/Solana, GMX/Arbitrum, XVS/BSC); all 9 endpoints returned HTTP 200; exact bodies retained as base64+SHA-256 and verifier passes | `tests/fixtures/cmc/real-capture-2026-09-29-{jup,gmx,xvs}.json` | PASS |
| bounded live verdict smoke | one authorized live request reaches CMC and emits uncached receipts | JUP/Solana request returned HTTP 200, `RAWAN` score 85, and 9 receipts; key was not persisted | local process log + sanitized verdict receipt | PASS |
| 3-target trader utility test | identity/mode understood within 60s | no consenting participants available | no participant data | UNVERIFIED |
| 3 real bundle replay oracle | parser/rules recompute real evidence | `scripts/replay-capture.ts` re-runs `analyze()` over captured bytes; all 3 bundles produce verdicts; live-compare verdict and label match for JUP (RAWAN/CAUTION 85), GMX (JANGAN/CAUTION 60), XVS (RAWAN/CAUTION 70) | `scripts/replay-capture.ts`, real-capture fixtures | PASS |
| production dependency audit | no known production advisories | `pnpm audit --prod` is clean after explicit patched overrides for transitive `postcss` 8.5.23 and `sharp` 0.35.4 | audit output 2026-09-29 | PASS |

## Gate result

- Local code gate: PASS after full test, typecheck, evidence verifier, docs verifier, and build commands.
- Dependency audit: **PASS**. The initial 4 high and 2 moderate transitive advisories (`next>postcss`, optional `next>sharp`) are remediated with compatible workspace overrides. `pnpm audit --prod` now reports no known vulnerabilities.
- Replay judging path: PASS locally without CMC/Jev/Groq credentials.
- Bounded live path: PASS with the user-supplied CMC key; no claim is made about remaining quota or current plan limits.
- New live behavior: **release-cleared for the observed surface** — the 2026-09-29 authorized captures prove all 9 wired endpoints return HTTP 200 on the current key and that captured bytes recompute to matching verdicts/labels. Pagination beyond the first page is still unclaimed (no cursor probe was run), and no claim is made about remaining quota or plan limits. The implementation defaults to replay when `VERDEX_V2=1` and `VERDEX_LIVE=1` are not both set.
