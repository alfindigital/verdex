# Verdex demo video

The video project is a Remotion workspace. It is a production aid, not proof that a final video has been published.

## Current script

Use [`../docs/DEMO-WALKTHROUGH.md`](../docs/DEMO-WALKTHROUGH.md) as the source of truth. The final 90-second cut should show:

1. replay-first home state and the problem statement;
2. an ambiguous ticker resolving to a platform/address identity;
3. observed sell makers, concentration, risk label, and coverage;
4. a failed LP source rendered as unknown/insufficient;
5. source status, exact hash, and JSON export;
6. a dated archived snapshot and its honest share behavior.

Do not call a synthetic fixture a live incident, a clean sample safe, a heuristic score a probability, or an archive a live permanent record. Do not reuse narration that says “size accordingly”.

## Commands

```powershell
npm ci --ignore-scripts
npm run dev
npx remotion render
```

The existing `video/out/` renders are historical and gitignored. Rerender only after the final deployed copy/data has been reviewed. Publishing to YouTube is an owner action; the submission checklist remains `not published` until a real URL is verified.
