// ─── District lookup data for NRC strict mode validation ───────
//
// STATUS: Deferred to v2
//
// Strict mode district validation requires verified district codes
// from the Zambia Department of National Registration,
// Passport and Citizenship (DNRPC). 
//
// Only 3 codes have been confirmed from primary sources:
//   '11' = Lusaka       (Lusaka Province)
//   '61' = Ndola        (Copperbelt Province)
//   '82' = Mongu        (Western Province)
//
// See docs/ADR-001-muchinga-province.md for full reasoning.
// To contribute verified codes, open a GitHub issue.

export const CONFIRMED_DISTRICT_CODES: Record<string, string> = {
  '11': 'Lusaka',
  '61': 'Ndola',
  '82': 'Mongu',
}