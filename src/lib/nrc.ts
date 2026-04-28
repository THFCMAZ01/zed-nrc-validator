import type {
  NRCValidationResult,
  NRCValidateOptions,
  NRCGenerateResult,
  NRCSegments,
  NRCErrorCode,
  NRCSegment,
} from '../types/nrc.types'

// ─── Regex ────────────────────────────────────────────────────────────────────
// ^      = start of string
// \d{6}  = exactly 6 digits (sequence number)
// \/     = literal forward slash
// \d{2}  = exactly 2 digits (district code)
// \/     = literal forward slash
// [123]  = exactly one of: 1, 2, or 3 (nationality digit)
// $      = end of string
const NRC_REGEX = /^\d{6}\/\d{2}\/[123]$/

// ─── Helper: build a failed result ───────────────────────────────────────────
// DRY principle — one function to construct invalid results.
// Every failure path calls this instead of repeating the same object shape.
function makeInvalid(
  input: string,
  code: NRCErrorCode,
  message: string,
  segment: NRCSegment,
  segments?: NRCSegments
): NRCValidationResult {
  return {
    valid: false,
    input,
    ...(segments && { segments }),
    error: { code, message, segment },
  }
}

// ─── validateNRC ─────────────────────────────────────────────────────────────
// Level 1: validates NRC format — all 18 tests cover this.
// Level 2 (strict district lookup): deferred to v2.
// See docs/ADR-001-muchinga-province.md for why.
//
// The underscore prefix on _options tells TypeScript and ESLint:
// "This parameter is intentionally unused for now — strict mode is v2."
export function validateNRC(
  input: string,
  _options: NRCValidateOptions = {}
): NRCValidationResult {

  // ── Null / undefined guard ───────────────────────────────────────────────
  // TypeScript declares this is a string, but JavaScript callers may pass null.
  // We guard at runtime so the function never crashes.
  if (input === null || input === undefined) {
    return makeInvalid(
      String(input),
      'EMPTY_INPUT',
      'NRC input cannot be null or undefined.',
      'input'
    )
  }

  // ── Empty string guard ───────────────────────────────────────────────────
  if (input.trim() === '') {
    return makeInvalid(
      input,
      'EMPTY_INPUT',
      'NRC input cannot be empty.',
      'input'
    )
  }

  // ── Specific error diagnosis ─────────────────────────────────────────────
  // If the overall format is wrong, try to identify exactly which segment
  // caused the problem so the error message is useful to the developer.
  if (!NRC_REGEX.test(input)) {
    const parts = input.split('/')

    if (parts.length === 3) {
      const [seq, district, nat] = parts

      // Sequence: wrong number of characters
      if (seq.length !== 6) {
        return makeInvalid(
          input,
          'INVALID_SEQUENCE_LENGTH',
          `Sequence must be exactly 6 digits. Got ${seq.length} character(s): "${seq}".`,
          'sequence'
        )
      }

      // Sequence: correct length but contains non-digit characters (e.g. letters)
      if (!/^\d+$/.test(seq)) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          `Sequence must contain only digits. Received: "${seq}".`,
          'sequence'
        )
      }

      // District: wrong number of characters
      if (district.length !== 2) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          `District code must be exactly 2 digits. Got ${district.length} character(s): "${district}".`,
          'districtCode'
        )
      }

      // District: contains non-digit characters
      if (!/^\d{2}$/.test(district)) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          `District code must contain only digits. Received: "${district}".`,
          'districtCode'
        )
      }

      // Nationality digit: not 1, 2, or 3
      if (!/^[123]$/.test(nat)) {
        return makeInvalid(
          input,
          'INVALID_NATIONALITY_DIGIT',
          `Nationality digit must be 1 (Zambian), 2 (Commonwealth), or 3 (Other Foreign). Received: "${nat}".`,
          'nationalityDigit'
        )
      }
    }

    // Catch-all: format is completely wrong — wrong separators, wrong structure
    return makeInvalid(
      input,
      'INVALID_FORMAT',
      `NRC must follow the format NNNNNN/NN/N where N is a digit and the last digit is 1, 2, or 3. Example: 613475/61/1. Received: "${input}".`,
      'input'
    )
  }

  // ── Valid — split into named segments ────────────────────────────────────
  const parts = input.split('/')
  const segments: NRCSegments = {
    sequence: parts[0],
    districtCode: parts[1],
    nationalityDigit: parts[2],
  }

  // Strict mode is accepted but deferred to v2.
  // _options is unused intentionally — see docs/ADR-001.

  return {
    valid: true,
    input,
    segments,
  }
}

// ─── generateNRC ─────────────────────────────────────────────────────────────
// Generates a syntactically valid fake NRC for testing purposes.
// Uses confirmed district code 61 (Ndola, Copperbelt) — one of three
// codes verified from primary sources. Always passes Level 1 validation.
export function generateNRC(): NRCGenerateResult {
  // Random 6-digit sequence: 100000 to 999999
  const sequence = Math.floor(Math.random() * 900000 + 100000).toString()
  const districtCode = '61'
  const nationalityDigit: 1 | 2 | 3 = 1

  return {
    nrc: `${sequence}/${districtCode}/${nationalityDigit}`,
    districtCode,
    nationalityDigit,
  }
}