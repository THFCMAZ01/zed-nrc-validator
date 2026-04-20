# ADR-001: Provisional District Codes for NRC Strict Mode

Status: Proposed (2026-04-20)

Decision:

- Until an authoritative mapping of Zambian NRC district codes to province and
  district names is obtained (government registry or official documentation),
  the project will treat valid district codes as any two-digit code from
  `01` through `69` inclusive when `strict` validation is enabled.

Rationale:

- The repository previously contained an incomplete and partially incorrect
  listing of district codes. Removing strict validation entirely would reduce
  usefulness; keeping an incomplete list risks rejecting legitimate NRCs.
- Using the contiguous range `01`–`69` is conservative: it permits all
  commonly observed two-digit district codes while still rejecting clearly
  invalid values like `00` or `99`.
- This is an interim decision to be revisited once a verified source is added
  to this ADR and the `src/lib/nrc/districts.ts` file is updated accordingly.

Next steps:

1. Research and obtain an authoritative source (government documentation,
   official NRC manual, or similar). Preferred sources include:
   - Zambia national registration authority publications
   - Official government gazette
   - Academic or government datasets
2. Replace the provisional `VALID_DISTRICTS` range with an exact list of
   district codes grouped by province in `src/lib/nrc/districts.ts`.
3. Update unit tests to include examples from the authoritative source.

Notes:

- Ndola is confirmed to be in Copperbelt province; code `61` is included in
  `DISTRICTS_BY_PROVINCE` as a minimal correction, but the full mapping still
  requires verification.
