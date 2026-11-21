# Archived proposal: provisional NRC district-code range

## Original date
20 April 2026

## Status
Superseded — not adopted

This file records an earlier proposal to treat district codes from `01`
through `69` as valid when strict validation was enabled.

The proposed range was an inference from limited observations. The proposal
did not provide an authoritative NRC source proving that the range was
complete or that values outside it were invalid.

**Do not implement this range.** It is not an official or verified NRC rule.
The accepted decision is recorded in
[ADR-002](../ADR-002-district-code-validation.md): the validator performs
format checks only, and the partial district reference list is informational.

This archived note is retained to preserve the decision history. It does not
override ADR-001 or ADR-002.
