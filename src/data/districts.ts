// ─── Confirmed Zambian NRC District Codes ─────────────────────────────────────
//
// STATUS: Only 3 codes confirmed from primary sources.
// Strict mode validation is deferred to v2.
// See docs/ADR-001-muchinga-province.md for full reasoning.
//
// Format: "XY" where X = province digit (1-9), Y = district digit
//
// To contribute a verified code, open a GitHub issue with:
//   - District name
//   - Province name
//   - The two-digit code
//   - Your source (NRC copy with permission, or official document)
//
// https://github.com/THFCMAZ01/zed-nrc-validator/issues

export const CONFIRMED_DISTRICT_CODES: Record<string, string> = {
  '11': 'Lusaka (Lusaka Province)',
  '61': 'Ndola (Copperbelt Province)',
  '82': 'Mongu (Western Province)',
}