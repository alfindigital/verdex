# Evidence bundles

Verdex v2 bundles contain source coverage and, when authorized and reviewed, exact UTF-8 response bytes with SHA-256 hashes. A hash proves that the supplied bytes have not changed; it does not prove CoinMarketCap authenticity, market intent, or a trading outcome.

`real-capture` bundles must come from the operator capture command with an explicitly supplied `CMC_API_KEY`. Reviewers must remove request headers, key info, quota/account payloads, and secret-bearing URLs before publishing. `synthetic-fixture` bundles demonstrate parser or missing-source policy and must never be presented as a real incident.

Verify an individual bundle offline:

```text
pnpm evidence:verify tests/fixtures/cmc/synthetic-lp-outage-bundle.json
```

Historical v1 snapshots have receipt metadata only. They are rendered as archived records and are not upgraded into v2 raw evidence.
