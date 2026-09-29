# Verdex 60-second demo walkthrough

Use the recorded path when `VERDEX_V2` and `VERDEX_LIVE` are not both enabled. It is deterministic and does not spend a CMC credit.

1. Open the home page and point out `RECORDED EXAMPLES ONLY` (or `LIVE SCAN AVAILABLE` when both flags and a quota-approved server key are active).
2. Type a ticker such as `JUP` and choose a chain. If the API returns multiple identities, select the row by its full platform and address. The client sends `{platform,address}`; it never sends an array index.
3. On the result, name the token, chain, full address, capture time, `ARCHIVED / REPLAY` or `LIVE SCAN`, risk label, and coverage level.
4. Read `WHAT TO INSPECT NEXT`. Use the first reason to open the relevant source receipt or inspect an example transaction. `observed sell makers` describes the observed sample; it is not a claim of independent wallets.
5. Expand `source evidence` for status, provider timestamp, accepted/rejected rows, exact SHA-256, and whether raw bytes were retained. Failed LP evidence is rendered as unknown and never as zero.
6. Click `download evidence JSON`; the browser export preserves the record, receipts, limitations, and evidence fields. Verify a captured bundle offline with `pnpm evidence:verify <bundle.json>`.
7. Open a dated recorded case from `recorded examples/`. Its archive header and legacy banner make the historical rule version and missing raw source bodies explicit. Only committed snapshot IDs receive an X share link.

## Demo language

- Say “no flags observed in this sample” rather than “safe” or “accurate”.
- Say “provider-reported” for vendor security flags.
- Say “synthetic regression” for the LP outage fixture; it is not a CoinMarketCap incident.
- Do not describe a legacy score as a probability, an entry recommendation, or a permanent live record.
