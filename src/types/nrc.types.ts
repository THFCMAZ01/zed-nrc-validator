// ─── Error codes ──────────────────────────────────────────────────────────────
// Every possible error code this system can return.
// A union type — the value must be exactly one of these strings.
// Nothing else is valid — TypeScript catches typos at compile time.
export type NRCErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_FORMAT'
  | 'INVALID_SEQUENCE_LENGTH'
  | 'INVALID_NATIONALITY_DIGIT'
  | 'UNKNOWN_DISTRICT_CODE'

// ─── Segments ─────────────────────────────────────────────────────────────────
// Which part of the NRC string caused the error.
export type NRCSegment =
  | 'input'
  | 'sequence'
  | 'districtCode'
  | 'nationalityDigit'

// ─── Parsed NRC ───────────────────────────────────────────────────────────────
// The three parts of a parsed NRC string.
// Example: "613475/61/1" → { sequence: "613475", districtCode: "61", nationalityDigit: "1" }
export interface NRCSegments {
  sequence: string          // 6 digits — sequential number issued in the district
  districtCode: string      // 2 digits — province digit + district digit
  nationalityDigit: string  // "1" = Zambian, "2" = Commonwealth, "3" = Other Foreign
}

// ─── Validation error ─────────────────────────────────────────────────────────
export interface NRCValidationError {
  code: NRCErrorCode    // machine-readable — for developer logic
  message: string       // human-readable — for displaying to end users
  segment: NRCSegment   // which part of the NRC failed
}

// ─── Validation result ────────────────────────────────────────────────────────
// A discriminated union.
// When valid: true  → TypeScript KNOWS segments exists, error does NOT exist
// When valid: false → TypeScript KNOWS error exists, segments MAY not exist
// This means you cannot access result.error unless you check result.valid === false first
export type NRCValidationResult =
  | {
      valid: true
      input: string
      segments: NRCSegments
    }
  | {
      valid: false
      input: string
      segments?: NRCSegments
      error: NRCValidationError
    }

// ─── Options ──────────────────────────────────────────────────────────────────
// Strict mode is deferred to v2 — see docs/ADR-001-muchinga-province.md
export interface NRCValidateOptions {
  strict?: boolean
}

// ─── Generator result ─────────────────────────────────────────────────────────
export interface NRCGenerateResult {
  nrc: string                    // e.g. "385721/61/1"
  districtCode: string           // e.g. "61"
  nationalityDigit: 1 | 2 | 3   // only these three values are valid
}

// ─── Batch validation ─────────────────────────────────────────────────────────
export interface NRCBatchResult {
  results: NRCValidationResult[]
  summary: {
    total: number
    valid: number
    invalid: number
  }
}