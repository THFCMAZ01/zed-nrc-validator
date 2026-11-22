# ADR-001: Muchinga Province and NRC District-Code Uncertainty

## Date
March 2026

## Status
Accepted

## Context

The NRC format used by this project contains a two-digit district-code
segment. Earlier versions of this project displayed three place-name
associations:

- `11` — Lusaka (Lusaka Province)
- `61` — Ndola (Copperbelt Province)
- `82` — Mongu (Western Province)

The November 2026 research review did not find an authoritative DNRPC
publication confirming these geographic mappings. It found evidence that
these and other codes occur in public-sector records, but occurrence does not
establish a place-name mapping or an official exhaustive code directory.

### Muchinga context

Muchinga became Zambia's tenth province in 2011, following changes involving
districts previously associated with Northern and Eastern provinces. The
research review found no public DNRPC documentation establishing how NRC
district codes were assigned or updated for the affected districts.

The administrative province structure alone cannot be used to infer an NRC
code. A code must not be guessed from a district's current province or
administrative number.

### Data limitation

The project has not established a complete, authoritative NRC-specific
district-code mapping. Administrative district lists, province numbering,
and NRC code assignments must not be assumed to be interchangeable.

## Decision

For the current version:

- Validation checks the written structure only.
- The optional legacy `strict` parameter is accepted for compatibility but
  performs no district-code lookup and has no effect on the result.
- Public-record code observations are informational and partial.
- No place name or province is assigned to an observed code without
  authoritative evidence.
- A code absent from the observation list is not rejected.
- No code assignment is inferred for Muchinga districts.

Any future district lookup must follow ADR-002 and must not reject a code
unless the completeness and authority of the underlying dataset have been
established.

## Consequences

- The validator avoids rejecting numbers based on guessed or incomplete
  district data.
- The UI and API must describe the observed-code list as partial and
  non-authoritative.
- Future reference entries must include evidence provenance and verification
  status.
- Contributors must not submit or publish personal NRC numbers as evidence.

## Contributing references

Open a GitHub issue with the proposed code and source. Primary DNRPC
documentation or an official publication is required before assigning a
geographic meaning. Do not attach personal NRC images or numbers.
