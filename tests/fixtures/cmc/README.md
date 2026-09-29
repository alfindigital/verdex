# CMC fixture contract

These fixtures are inputs to parser and policy tests. They are not a claim that a fixture proves a token is safe or fraudulent.

## Fixture classes

- `real-shape-sample.json` contains trimmed response shapes recorded by the repository's existing DEX normalizer tests. It preserves field names and representative types, but the original response bodies are not retained, so it has no replayable body hash and is not a public evidence receipt.
- `synthetic-invalid.json` is deliberately malformed test data. It covers unknown swap/liquidity types, missing makers, duplicate log identities, non-finite numbers, and missing timestamps. It must remain labelled synthetic in tests and documentation.

When a user explicitly supplies a credential for a bounded capture, add files named `real-capture-<date>-<token>.json` only after reviewing the response for headers, key metadata, and account-specific quota information. Store response bytes exactly, compute the hash from those bytes, and record the endpoint, sanitized params, capture time, and provider timestamp. Never store request headers or `.env` content.

## Observed field contract

The current source and tests exercise these CMC fields:

| Endpoint | Fields used | Meaning in the current adapter | Open question |
|---|---|---|---|
| `/v1/dex/search` | `tks[].plt`, `addr`, `n`, `s`, `mc`, `v24h`, `pc24h`, `liq` | platform, address, token name/symbol and market stats | pagination/cursor semantics are not established |
| `/v1/dex/tokens/transactions` | `swaps[].ts`, `tp`, `ma`, `v`, `tx`, `f`, `en` | timestamp, side, maker, USD value, transaction, pool and DEX | `lgid` is not present in the retained sample |
| `/v1/dex/token/pools` | `fa`/`addr`, `exn`, `liqUsd`, `v24`, `t0.sym`, `t1.sym` | pool identity, venue, liquidity, volume and pair symbols | exact pool address semantics need a fresh authorized capture |
| `/v1/dex/liquidity-change/list` | `lcs[].ts`, `tp`, `tu`, `f`, `m` | timestamp, event type, USD amount, pool and maker | event-to-pool coverage needs a fresh authorized capture |
| `/v1/dex/token` | `crt`, `own` | creator and owner metadata | missing fields must remain unknown |
| `/v1/dex/security/detail` | `securityLevel`, `securityItems[]`, `extra.buyTax`, `extra.sellTax`, `extra.isFlaggedByVendor` | provider level, named flags, taxes and vendor flag | tax units must be confirmed against current docs |

The plan deliberately does not copy a competitor's schema or infer a pool field that is absent from the retained sample. Task 2 must preserve original source row indexes and treat unknown fields as unavailable.
