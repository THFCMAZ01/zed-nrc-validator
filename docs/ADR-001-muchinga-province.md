# ADR-001: Muchinga Province District Code Handling

## Date
March 2026

## Status
Accepted

## Context

Zambia's NRC number uses a two-digit district code where the first digit
represents the province and the second represents the district within it.

Codes confirmed from primary sources:
- `11` = Lusaka (Province 1, District 1)
- `61` = Ndola (Province 6 = Copperbelt, District 1)
- `82` = Mongu (Province 8 = Western, District 2)

### The Muchinga Problem

In November 2011, Zambia's 10th province — Muchinga — was formed by
splitting districts from Northern Province (code 5) and Eastern Province
(code 3):

From Northern Province (5x): Chinsali, Isoka, Mafinga, Mpika, Nakonde
From Eastern Province (3x): Chama

The two-digit NRC format has no mechanism to represent a 10th province.
The DNRPC has not published documentation confirming whether new codes
were assigned to Muchinga districts after 2011.

### The Broader Data Problem

Zambia expanded from 72 to 116 districts between 2012 and 2018. No
complete, verified list of NRC district codes is publicly available.
Building strict mode on unverified data would cause real valid NRCs
to be incorrectly rejected — which is worse than not having the feature.

## Decision

For v1: Strict mode is accepted by the API but performs no additional
checks beyond Level 1 format validation. Muchinga districts validate
under their original province codes.

For v2: Strict mode will validate against a community-verified lookup
table containing only codes confirmed from primary sources.

## Consequences

- No NRC will be incorrectly rejected due to incomplete district data.
- Developers who need district validation must wait for v2.
- The data file (src/data/districts.ts) is kept separate from logic
  so it can be updated without touching validation code (NFR-05).

## Contributing Verified Codes

Open a GitHub issue at:
https://github.com/THFCMAZ01/zed-nrc-validator/issues

Include: district name, province, the two-digit code, and your source.# ADR-001: Muchinga Province District Code Handling

## Date
March 2026

## Status
Accepted

## Context

Zambia's NRC number uses a two-digit district code where the first digit
represents the province and the second represents the district within it.

Codes confirmed from primary sources:
- `11` = Lusaka (Province 1, District 1)
- `61` = Ndola (Province 6 = Copperbelt, District 1)
- `82` = Mongu (Province 8 = Western, District 2)

### The Muchinga Problem

In November 2011, Zambia's 10th province — Muchinga — was formed by
splitting districts from Northern Province (code 5) and Eastern Province
(code 3):

From Northern Province (5x): Chinsali, Isoka, Mafinga, Mpika, Nakonde
From Eastern Province (3x): Chama

The two-digit NRC format has no mechanism to represent a 10th province.
The DNRPC has not published documentation confirming whether new codes
were assigned to Muchinga districts after 2011.

### The Broader Data Problem

Zambia expanded from 72 to 116 districts between 2012 and 2018. No
complete, verified list of NRC district codes is publicly available.
Building strict mode on unverified data would cause real valid NRCs
to be incorrectly rejected — which is worse than not having the feature.

## Decision

For v1: Strict mode is accepted by the API but performs no additional
checks beyond Level 1 format validation. Muchinga districts validate
under their original province codes.

For v2: Strict mode will validate against a community-verified lookup
table containing only codes confirmed from primary sources.

## Consequences

- No NRC will be incorrectly rejected due to incomplete district data.
- Developers who need district validation must wait for v2.
- The data file (src/data/districts.ts) is kept separate from logic
  so it can be updated without touching validation code (NFR-05).

## Contributing Verified Codes

Open a GitHub issue at:
https://github.com/THFCMAZ01/zed-nrc-validator/issues

Include: district name, province, the two-digit code, and your source.