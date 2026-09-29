```json
{
  "project_id": "cmc-api-hackaton",
  "occurred_at": "2026-09-29T03:00:43.0736436Z",
  "verification_status": "PARTIAL",
  "source_commit": "52a10c6aab5e98a033a7c2cae7e7936f22c5e7a9",
  "evidence_paths": [
    "HANDOFF.md",
    "SUBMISSION.md",
    "docs/SUBMISSION-CHECKLIST.md",
    "docs/evidence/validation-matrix.md",
    "docs/evidence/2026-09-29-capability-check.md",
    "docs/AUDIT-DOSSIER.md",
    "pnpm-workspace.yaml",
    "pnpm-lock.yaml"
  ],
  "next_actions": [
    "Retain an exact raw CMC bundle and verify current tier/pagination with an authorized bounded capture",
    "Complete owner-only DoraHacks human verification and publish demo video/social URL",
    "Run final owner review before accepting terms and submitting the BUIDL"
  ],
  "memory_status": "pending",
  "title": "Verdex production release checkpoint",
  "body": "Main is merged and pushed through commit 52a10c6. Local evidence: 164 tests passed, typecheck passed, pnpm audit --prod reports no known vulnerabilities after postcss 8.5.23 and sharp 0.35.4 overrides, docs and synthetic evidence verifiers passed, Next production build generated 141 pages, gitleaks scanned 53 commits with no leaks, and ignored scratch/artifact inspection found no credential-bearing artifacts. Vercel deployment dpl_9b2Z25a6sz7NQJgoHG1dfHzjeYsn is READY and the production alias verdex-alpha.vercel.app plus archived JUP API path returned HTTP 200. A bounded local live smoke with only the user-supplied CMC key returned JUP/Solana RAWAN score 85 with 9 uncached receipts; the key was process-only and excluded from files, logs, and this record. Mobile was intentionally out of scope per user request. This is PARTIAL because exact raw CMC bundle, current tier/pagination, public demo/social URLs, captcha completion, and DoraHacks final submission remain owner actions.",
  "id": "8dbb2f54c5cc4e889e74554441788ec8"
}
```
