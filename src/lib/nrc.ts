import type {
  NRCValidationResult,
  NRCVAlidateOptions,
  NRCGenerateResult,
  NRCSegments,
} from '../types/nrc.types'

// ─── The regex that defines a valid NRC format ──────────────────
// ^ means start of string
// \d{6} means exactly 6 digits
// \/ means a literal forward slash
// \d{2} means exactly 2 digits
// \/ means another literal forward slash
// [123] means exactly one character that is 1, 2, or 3
// $ means end of string
const NRC_REGEX = /^\d{6}\/\d{2}\/[123]$/

// ─── Helper: build an invalid result ───────────────────────────
// Instead of repeating this shape everywhere, we use a helper.
// This is the DRY principle — Don't Repeat Yourself.
function invalid(
  input: string,
  code: 'EMPTY_INPUT' | 'INVALID_FORMAT' | 'INVALID_SEQUENCE_LENGTH' | 'INVALID_NATIONALITY_DIGIT' | 'UNKNOWN_DISTRICT_CODE',
  message: string,
  segment: 'input' | 'sequence' | 'districtCode' | 'nationalityDigit',
  segments?: NRCSegments
): NRCValidationResult {
  return {
    valid: false,
    input,
    segments,
    error: {code, message, segment },
  }
}

// ─── Main validation function ───────────────────────────────────
export function validateNRC(
  input: string,
  _options: NRCValidateOptions = {}
): NRCValidationResult {

  // TC-12: handle null or undefined passed at runtime
  // even though TypeScript says it's a string, JavaScript
  // callers may pass null — we guard against it
  if (input === null || input === undefined) {
    return invalid(
      String(input),
      'EMPTY_INPUT',
      'NRC input cannot be null or undefined',
      'input'
    )
  }

  // TC-11: handle empty string
  if (input.trim() === '') {
    return invalid(
      input,
      'EMPTY_INPUT',
      'NRC input cannot be empty',
      'input'
    )
  }

  // TC-05, TC-06, TC-07, TC-08, TC-13:
  // Check the overall format first using the regex.
  // If it doesn't match the pattern, reject immediately.
  if (!NRC_REGEX.test(input)) {
    // Try to split anyway to give a more specific error
    const parts = input.split('/')

if (parts.length === 3) {
  const [seq, district, nat] = parts

  // Wrong length — INVALID_SEQUENCE_LENGTH
  if (seq.length !== 6) {
    return invalid(
      input,
      'INVALID_SEQUENCE_LENGTH',
      `Sequence must be exactly 6 digits. Got ${seq.length} characters: "${seq}"`,
      'sequence'
    )
  }

  // Correct length but contains non-digits — INVALID_FORMAT
  if (!/^\d{6}$/.test(seq)) {
    return invalid(
      input,
      'INVALID_FORMAT',
      `Sequence must contain only digits. Received: "${seq}"`,
      'sequence'
    )
  }

  // Correct district length and wrong nationality digit
  if (district.length === 2 && !/^[123]$/.test(nat)) {
    return invalid(
      input,
      'INVALID_NATIONALITY_DIGIT',
      `Nationality digit must be 1 (Zambian), 2 (Commonwealth), or 3 (Other). Received: "${nat}"`,
      'nationalityDigit'
    )
  }
}

    // TC-05, TC-08, TC-13: anything else is a general format error
    return invalid(
      input,
      'INVALID_FORMAT',
      `NRC must follow the format NNNNNN/NN/N (e.g. 613475/61/1). Received: "${input}"`,
      'input'
    )
  }

  // If we reach here, the format is valid.
  // Split the string into its three segments.
  const parts = input.split('/')
  const segments: NRCSegments = {
    sequence: parts[0],
    districtCode: parts[1],
    nationalityDigit: parts[2],
  }

  // TC-14, TC-15, TC-16: strict mode district validation
  // NOTE: Strict mode is deferred to v2 — see docs/ADR-001
  // For now, strict mode is accepted but does nothing beyond Level 1
  // This means TC-14 passes (valid NRC passes strict mode)
  // TC-15 and TC-16 need revisiting in v2

  // TC-01, TC-02, TC-03, TC-04: valid NRC
  return {
    valid: true,
    input,
    segments,
  }
}

// ─── Generator ──────────────────────────────────────────────────
// Generates a fake but syntactically valid NRC for testing.
// Uses known valid district code 61 (Ndola, Copperbelt).
export function generateNRC(): NRCGenerateResult {
  // Generate a random 6-digit sequence
  // Math.random() gives 0 to 0.999...
  // Multiplying by 900000 and adding 100000 gives 100000 to 999999
  const sequence = Math.floor(Math.random() * 900000 + 100000).toString()

  // Use district code 61 — the only code we have confirmed from research
  const districtCode = '61'

  // Default to Zambian citizen
  const nationalityDigit: 1 | 2 | 3 = 1

  return {
    nrc: `${sequence}/${districtCode}/${nationalityDigit}`,
    districtCode,
    nationalityDigit,
  }
}