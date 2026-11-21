# Zed NRC Validator

A small public API and web utility for checking the **written format** of a Zambian National Registration Card (NRC) number.

It is designed as a developer aid for applications built in Zambia. It is not connected to the National Registration system and does not verify identity, ownership, issuance, or whether a number is active.

## What it checks

The current format rule is:

~~~text
NNNNNN/NN/N
~~~

- Six numeric characters for the sequence segment.
- A slash.
- Two numeric characters for the district-code segment.
- A slash.
- A final digit of 1, 2, or 3.

The validator keeps the existing regular expression:

~~~ts
/^\d{6}\/\d{2}\/[123]$/
~~~

The expression checks syntax only. It does not establish that the number is genuine or issued.

## District-code data

Only three district-code references are currently included because those are the codes confirmed in the project's primary-source review:

| Code | Reference |
| --- | --- |
| 11 | Lusaka (Lusaka Province) |
| 61 | Ndola (Copperbelt Province) |
| 82 | Mongu (Western Province) |

This is a **partial reference list**, not a complete list of valid codes. A code missing from the list is described as unverified by this tool; it is not rejected. District-code validation must remain disabled until a complete, authoritative dataset is available.

See [ADR-001](docs/ADR-001-muchinga-province.md) for the reasoning behind deferring district lookup.

## API

All request bodies must be JSON. Validation results use HTTP 200 when the request itself is well-formed, even when the submitted NRC fails the format check. Malformed requests return HTTP 400.

### POST /api/validate

Request:

~~~json
{
  "nrc": "613475/61/1"
}
~~~

The legacy optional strict boolean is still accepted for backwards compatibility. It is deprecated and currently has no effect; it does not perform district lookup. A non-boolean value is rejected with HTTP 400.

### POST /api/validate/batch

Request:

~~~json
{
  "nrcs": ["613475/61/1", "not-an-nrc"]
}
~~~

Accepts 1–50 strings. Non-string entries are rejected as malformed requests; they are never converted to strings.

A successful batch response contains one result per input plus a summary:

~~~json
{
  "results": [],
  "summary": {
    "total": 2,
    "valid": 1,
    "invalid": 1
  }
}
~~~

### GET /api/generate

Returns a randomly generated sample for development and testing. It is marked with synthetic: true. It is not looked up in a registry and must not be used as a real identity or production record. A random sample could coincidentally match an issued number.

### GET /api/districts

Returns the three currently confirmed references and dataset_status: partial. Consumers must not treat absence from this list as proof that a district code is invalid.

### API error shape

Malformed requests use a consistent error object:

~~~json
{
  "error": {
    "code": "INVALID_BATCH_ITEM",
    "message": "Every item in the nrcs array must be a string.",
    "field": "nrcs[1]"
  }
}
~~~

Common request error codes include INVALID_JSON, INVALID_REQUEST_BODY, INVALID_STRICT_OPTION, INVALID_BATCH_ITEM, EMPTY_BATCH, and BATCH_LIMIT_EXCEEDED.

Validation endpoints return Cache-Control: no-store so NRC-bearing responses are not stored by ordinary HTTP caches.

## Architecture

~~~text
src/
  types/nrc.types.ts       Shared TypeScript contracts
  data/districts.ts        Partial, confirmed district references
  lib/nrc.ts               Framework-independent format logic
  app/api/                 HTTP route handlers
  app/page.tsx             Web interface
  app/globals.css          Visual system and responsive layout
tests/
  nrc.test.ts              Core validation and generator tests
  api.test.ts              Route-level request/response tests
~~~

The core validator is independent of Next.js. The web interface uses the same district reference source as the API, so district labels are not duplicated.

## Privacy and limitations

- The application has no database and does not intentionally persist submitted NRCs.
- Validation endpoints send Cache-Control: no-store.
- Do not submit real NRCs unless you are comfortable sending them to the service's hosting provider. Hosting-provider infrastructure and telemetry are outside the application's control.
- Do not log request bodies or NRC values when integrating the API into another system.
- No registry lookup, identity match, or proof of issuance is performed.
- Rate limiting and authoritative district data remain future work.

## Local development

~~~bash
git clone https://github.com/THFCMAZ01/zed-nrc-validator
cd zed-nrc-validator
npm install
npm run dev
~~~

Open http://localhost:3000.

## Tests

~~~bash
npm run test:run
npm run lint
npm run build
~~~

The test suite covers format edge cases, generator behavior, malformed HTTP requests, batch limits, and endpoint response headers.

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vitest
- Vercel

## Contributing district references

To propose a new district-code reference, open a GitHub issue with the district name, province, two-digit code, and the primary source supporting the mapping. Do not submit or publish anyone's personal NRC.

Repository: https://github.com/THFCMAZ01/zed-nrc-validator

Live utility: https://zed-nrc-validator.vercel.app
