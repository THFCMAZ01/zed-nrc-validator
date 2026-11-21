// ─── Confirmed Zambian NRC District Codes ─────────────────────────────────────
//
// STATUS: Only 3 codes confirmed from primary sources.
// Strict mode validation is deferred to v2.
// See docs/ADR-001-muchinga-province.md for full reasoning.
//
// These are individual source-backed references only. No general formula or
// exhaustive range is inferred from this small sample.
//
// To contribute a verified code, open a GitHub issue with:
//   - District name
//   - Province name
//   - The two-digit code
//   - A public primary source or official document (do not post personal NRCs)
//
// https://github.com/THFCMAZ01/zed-nrc-validator/issues

export const CONFIRMED_DISTRICT_CODES: Record<string, string> = {
  '11': 'Lusaka (Lusaka Province)',
  '61': 'Ndola (Copperbelt Province)',
  '82': 'Mongu (Western Province)',
}