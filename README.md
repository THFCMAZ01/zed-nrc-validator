# Zed NRC Validator

A small web utility and JSON API for checking the **written structure** of a Zambian National Registration Card (NRC) number.

It is a developer aid, not an identity-verification service. It does not connect to the Department of National Registration, Passport and Citizenship (DNRPC) register and cannot confirm issuance, active status, citizenship, ownership, or a person's identity.

## What the validator checks

The modern format is consistently represented in government records and deployed Zambian software as:

```text
NNNNNN/NN/N
```

- Six ASCII digits for the serial segment.
- A forward slash.
- Two ASCII digits for the district-code segment.
- A forward slash.
- One ASCII digit for the country-code segment.

The validator uses this structural expression:

```ts
/^([0-9]{6})\/([0-9]{2})\/([0-9])$/
```

The expression intentionally accepts any single ASCII digit in the final position. This is a **structural rule**, not a claim that all ten values have been officially assigned. The research review found that deployed Zambian health-information systems accept a single digit in this position, while publicly available primary legislation does not publish a complete numeric assignment table. Values beyond `1` and `2` therefore remain unconfirmed as official categories.

All segments are kept as strings. Leading zeroes are significant and are never converted to numbers.

### Segment terminology

| Segment | Length | Meaning supported by public documentation |
| --- | ---: | --- |
| Serial | 6 digits | Registration serial/sequence; allocation and reuse rules are not fully documented publicly |
| District code | 2 digits | Identified as a district code in Auditor General and Public Accounts Committee reports; a complete public DNRPC mapping was not found |
| Country code | 1 digit | Identified as a country code in audit reports; the complete numeric assignment is not published in the sources reviewed |

The validator does not derive a province from either digit of the district code. Current administrative boundaries, including Muchinga Province and later district splits, are not a reliable substitute for an NRC-specific code directory.

## Validation levels

The project separates three different claims:

1. **Format check (implemented):** the input has the expected ASCII digit and separator structure.
2. **Reference-data check (not authoritative):** a code appears in a partial public-record observation list. This does not prove the code is official or valid.
3. **Registry/identity check (not available):** DNRPC confirms that a number was issued, remains active, or belongs to a particular person. This project does not perform these checks.

A format-valid result must never be presented as proof of a genuine NRC or identity.

## District-code observations

The research review found 28 distinct two-digit codes in the public records it examined. Two values (15 and 57) appeared in a Ministry of Youth, Sport and Arts publication; the other observations came from secondary copies of public-sector/education rosters.

These are recorded as **observed codes only**. The research did not find a public official DNRPC codebook confirming the geographic meaning of these codes. In particular, the former project labels for `11` (Lusaka), `61` (Ndola), and `82` (Mongu) could not be verified against a primary DNRPC source and have therefore been removed.

The observations are partial and must not be used as an allowlist. A code absent from the list is not automatically invalid. No district code is rejected by the validator.

See:
- [ADR-001: Muchinga Province and district-code uncertainty](docs/ADR-001-muchinga-province.md)
- [ADR-002: Defer district-code validation until the data is verified](docs/ADR-002-district-code-validation.md)

## Final country-code digit

Zambian audit reports use the term **country code** for the final segment. The research review found corroboration for `/1` as a Zambian citizen category and `/2` as a Commonwealth non-citizen category in the statutory card framework and an institutional JICA report. The precise assignment of `/3`, and whether `0` or `4`–`9` have been issued, could not be established from primary public specifications.

For that reason, the structural validator accepts one ASCII digit without assigning a citizenship meaning to it. It does not expose a citizenship label or reject values based on an incomplete category table.

## API

All request bodies must be JSON. A well-formed request returns HTTP 200 even when an individual NRC fails structural validation. Malformed requests return HTTP 400.

### POST /api/validate

Request:

```json
{
  "nrc": "613475/61/1"
}
```

The legacy optional `strict` boolean remains accepted for backwards compatibility. It is deprecated and currently has no effect because there is no complete authoritative district-code dataset. A non-boolean value is rejected with HTTP 400.

A structurally valid response includes:

```json
{
  "valid": true,
  "validationLevel": "format",
  "input": "613475/61/1",
  "segments": {
    "sequence": "613475",
    "districtCode": "61",
    "countryCode": "1"
  }
}
```

### POST /api/validate/batch

Request:

```json
{
  "nrcs": ["613475/61/1", "not-an-nrc"]
}
```

Accepts 1–50 strings. Non-string entries are rejected as malformed requests; they are never coerced to strings.

### GET /api/generate

Returns a randomly generated synthetic example for development and testing. The response includes `synthetic: true`. It is not retrieved from a registry and must not be used as a real identity or production record. A random sample could coincidentally match an issued number.

### GET /api/districts

Returns the partial list of codes observed in the reviewed public records, with an evidence category for each observation. The response explicitly states that it is not an official DNRPC directory. It contains no guessed place names and is not used to reject NRCs.

### API errors

Malformed requests use a consistent error object:

```json
{
  "error": {
    "code": "INVALID_BATCH_ITEM",
    "message": "Every item in the nrcs array must be a string.",
    "field": "nrcs[1]"
  }
}
```

Validation and reference endpoints return `Cache-Control: no-store` so NRC-bearing responses are not stored by ordinary HTTP caches.

## Privacy and limitations

- The application has no database and does not intentionally persist submitted NRCs.
- Do not submit real NRCs unless you are comfortable sending them to the service's hosting provider. Hosting-provider infrastructure and telemetry are outside the application's control.
- Do not log request bodies or NRC values when integrating the API into another system.
- A no-store response header controls HTTP caching; it does not prove that every upstream platform or infrastructure component retains no operational metadata.
- No government registry lookup, issuance check, active-status check, citizenship determination, or identity match is performed.
- The district-code observations are incomplete and non-authoritative.
- No checksum algorithm or Luhn check is implemented; no authoritative checksum specification was found.

## Research sources

The implementation decisions are based on a research review of the following public materials. Source links are provided so readers can inspect the underlying evidence:

- [National Registration Act, Cap. 126 — Parliament of Zambia](https://www.parliament.gov.zm/sites/default/files/documents/acts/National%20Registration%20Act.pdf)
- [National Registration (Amendment) Regulations, 2021 — SI 80 of 2021](https://media.zambialii.org/media/legislation/20844/source_file/9f3681ff42f5756f/zm-act-si-2021-80-publication-document.pdf)
- [Ministry of Youth, Sport and Arts — IVAG 2023 schedule](https://www.mysa.gov.zm/wp-content/uploads/2023/06/IVAG-2023.pdf)
- [Office of the Auditor General — 2020 COVID-19 Special Report](https://www.ago.gov.zm/wp-content/uploads/2025/03/Special-Report-COVID-Report-2020.pdf)
- [Office of the Auditor General — 2022 Main Report](https://www.ago.gov.zm/wp-content/uploads/2025/03/Auditor-Generals-Main-Report-2022.pdf)
- [Japan International Cooperation Agency — Zambia report](https://openjicareport.jica.go.jp/pdf/12392049.pdf)
- [OpenSRP Zambia implementation](https://github.com/opensrp/opensrp-client-native-form)
- [DHIS2 Zambia configuration documentation](https://github.com/dhis2/dhis2-docs/blob/master/src/user/configure-programs-in-the-maintenance-app.md)
- [Muchinga Provincial Administration](https://www.muc.gov.zm/)

Primary legislation and official government publications take precedence over secondary lists, community encyclopedias, and observed software behavior. Where the public evidence is incomplete or conflicting, this project deliberately avoids hard validation rules.

## Local development

```bash
git clone https://github.com/THFCMAZ01/zed-nrc-validator
cd zed-nrc-validator
npm install
npm run dev
```

Open http://localhost:3000.

## Tests

```bash
npm run test:run
npm run lint
npm run build
```

Tests use synthetic examples only.

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vitest
- Vercel

## Contributing

Do not submit personal NRC numbers, card images, or identifiable records.

A proposed official district-code mapping must include a primary DNRPC publication, government gazette, or other authoritative source. An observed code may be proposed as a non-authoritative observation only if its public source and limitations are clearly documented.

Repository: https://github.com/THFCMAZ01/zed-nrc-validator

Live utility: https://zed-nrc-validator.vercel.app
