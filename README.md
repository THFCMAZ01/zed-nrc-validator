# ZED NRC Validator

A public API and web tool for validating Zambian National Registration
Card (NRC) numbers. Built for developers building on Zambia.

## Problem Statement

Every Zambian developer building a system with user registration — a
hospital booking app, a fintech platform, a government portal — needs
to validate NRC numbers. No standardised public tool existed. Each
developer wrote their own validation logic independently, producing
inconsistent rules and repeated bugs.

## What v1 Does

**Level 1 — Format validation:**
- Validates the NRC format: `NNNNNN/NN/N`
- Six digits, slash, two digits, slash, nationality digit (1, 2, or 3)
- Identifies exactly which segment failed with a specific error code
- Generates syntactically valid fake NRCs for testing

**What v1 does NOT do:**
Strict district code validation is deferred to v2. Only 3 district
codes have been verified from primary sources. See
[ADR-001](docs/ADR-001-muchinga-province.md) for the full reasoning.

## API

### POST /api/validate
```json
{ "nrc": "613475/61/1", "strict": false }
```
Returns `NRCValidationResult` — always 200 for well-formed requests.

### POST /api/validate/batch
```json
{ "nrcs": ["613475/61/1", "bad-nrc"], "strict": false }
```
Returns `NRCBatchResult` with results array and summary. Max 50 per request.

### GET /api/generate
Returns a syntactically valid fake NRC for testing.

### GET /api/districts
Returns the 3 confirmed district codes.

## Architecture
src/types/nrc.types.ts  TypeScript contracts — imports nothing, imported by all
src/data/districts.ts   Static data — confirmed district codes
src/lib/nrc.ts          Pure logic — no framework dependency, fully testable
src/app/api/            HTTP layer — receives requests, calls lib, returns JSON
src/app/page.tsx        UI — calls the API, never calls lib directly

This separation keeps the core validation logic completely independent
of Next.js. It can be tested without a running server and could be
published as a standalone npm package.

## Setup

```bash
git clone https://github.com/THFCMAZ01/zed-nrc-validator
cd zed-nrc-validator
npm install
npm run dev
```

Open http://localhost:3000

## Tests

```bash
npm test          # watch mode
npm run test:run  # run once (for CI)
```

18 tests, 18 passing.

## Key Design Decisions

**Why is the return type a discriminated union?**
When `valid: true`, TypeScript guarantees `segments` exists. When
`valid: false`, TypeScript guarantees `error` exists. Bugs caught
at compile time, not runtime.

**Why specific error codes instead of one generic code?**
`INVALID_NATIONALITY_DIGIT` tells a developer exactly which field to
highlight. `INVALID_FORMAT` does not. API consumers can handle each
case differently.

**Why is strict mode deferred?**
Shipping strict mode with unverified district codes would cause real
valid Zambian NRCs to be incorrectly rejected. Honest limitations are
better than inaccurate features. See ADR-001.

## Security

- No NRC numbers are stored or logged.
- All inputs are validated before reaching core logic.
- No authentication required — public utility.
- Rate limiting planned for v2.

## What I Would Do Differently

- Research the district code data problem before writing any code.
  The data integrity issue should have been the first question.
- Add Zod for API request validation instead of manual type checks.
- Add rate limiting from day one.

## Tech Stack

| Tool | Why |
|------|-----|
| Next.js 14 App Router | API routes and UI in one project |
| TypeScript | Discriminated union catches bugs at compile time |
| Tailwind CSS | Utility-first, no separate CSS file needed |
| Vitest | Fast, TypeScript-native, watch mode built in |
| Vercel | Zero-config deployment for Next.js |

## Author

Joshua Mazaza — BSE Year 3, Zambia University of Technology, Ndola
GitHub: [@THFCMAZ01](https://github.com/THFCMAZ01)

## Contributing

To contribute verified Zambian NRC district codes, open a GitHub issue.
See [ADR-001](docs/ADR-001-muchinga-province.md) for what is needed.