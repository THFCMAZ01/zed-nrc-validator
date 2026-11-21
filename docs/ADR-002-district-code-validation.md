# ADR-002: Defer District-Code Validation Until the Data Is Verified

## Date
22 November 2026

## Status
Accepted

## Context

An earlier proposal suggested treating district codes from `01` through
`69` as valid in strict mode. That range was inferred from limited observed
examples; it was not supported by a complete, authoritative NRC district-code
publication.

A guessed range is not a safe substitute for verified data. It could reject
a legitimate code outside the range or give developers unwarranted confidence
that a code inside the range is genuine.

The current confirmed reference file contains only three mappings. It is
useful as a small informational reference, but it is not an exhaustive
validation dataset.

## Decision

1. Do not apply a district-code allowlist or numeric range in validation.
2. Do not treat `01`–`69`, `01`–`99`, or any other guessed range as an
   official NRC rule.
3. Keep the district-code segment syntactic: the format checker verifies that
   it contains exactly two digits.
4. Keep the current district mapping informational only. A code missing from
   it must be described as unverified by the project, not invalid.
5. Retain the legacy API `strict` boolean temporarily for compatibility, but
   deprecate it and make clear that it performs no extra checks.
6. Do not infer the meaning of either digit from the three currently confirmed
   mappings.
7. Do not assign legal or citizenship meanings to the final digit unless
   those meanings are supported by an appropriate primary source.

The accepted format-validation level must remain clearly distinguishable from
registry validation. The `validationLevel: "format"` response field is the
machine-readable indication of the check being performed.

## Evidence required before changing this decision

A future proposal must provide:

- An official NRC/DNRPC publication, government gazette, or another
  authoritative primary source documenting NRC code assignments.
- A clear account of the source's date and administrative coverage.
- Evidence that the dataset is complete enough for any proposed rejection
  rule. A partial list may be used for display, but not to reject unknown
  codes.
- Tests based on source-backed examples, without publishing personal NRCs.

## Consequences

- The current format validator continues to accept any two-digit district
  segment when the rest of the syntax matches.
- The API does not claim that a district code exists or was issued.
- The UI can show confirmed reference matches while identifying all other
  codes as unverified by the project.
- The previous provisional range proposal is archived as history and must
  not be implemented.
