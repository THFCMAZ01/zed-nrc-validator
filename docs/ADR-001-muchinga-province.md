# ADR-001: Muchinga Province and NRC District-Code Uncertainty

## Date
March 2026

## Status
Accepted

## Context

The NRC format used by this project contains a two-digit district-code
segment. The project has confirmed only a small number of code-to-place
references from primary sources:

- `11` — Lusaka (Lusaka Province)
- `61` — Ndola (Copperbelt Province)
- `82` — Mongu (Western Province)

These examples are not enough to establish a complete list, an exhaustive
range, or a general rule for interpreting each digit. In particular, the
project does not assume that the first digit is always a province identifier
or that the second digit is always a district identifier.

### Muchinga context

Muchinga became Zambia's tenth province in 2011, following changes involving
districts previously associated with Northern and Eastern provinces. The
project's source review has not located public DNRPC documentation that
establishes how NRC district codes were assigned or updated for the affected
districts.

The administrative province structure alone cannot be used to infer an NRC
code. A code must not be guessed from a district's current province or
administrative number.

### Data limitation

The project has not established a complete, authoritative NRC-specific
district-code mapping. Administrative district lists, province numbering,
and NRC code assignments must not be assumed to be interchangeable.

## Decision

For the current version:

- Validation checks the written NRC structure only.
- The optional legacy `strict` parameter is accepted for compatibility but
  performs no district-code lookup and has no effect on the result.
- The district reference file is informational and partial.
- A district code absent from the reference list is unverified by this
  project; it is not rejected.
- No code assignment is inferred for Muchinga districts.

Any future district lookup must follow ADR-002 and must not reject a code
unless the completeness and authority of the underlying dataset have been
established.

## Consequences

- The validator avoids rejecting numbers based on guessed or incomplete
  district data.
- The UI and API must describe the district list as partial.
- A future verified reference should include the code, place name, province,
  source URL or publication reference, and verification notes.
- Contributors must not submit or publish personal NRC numbers as evidence.

## Contributing references

Open a GitHub issue with the proposed code, place, province, and a public
primary source or official publication. Do not attach personal NRC images or
numbers.
