/**
 * NRC Validation Logic
 * 
 * Why this is separate:
 * - Single Responsibility Principle: this file ONLY validates NRCs
 * - Easier to test: can test validation without worrying about generation
 * - Can be used in multiple places: web API, CLI, etc.
 * - No dependencies on generation or React components
 */

import { ValidationResult, ValidationOptions } from './types'
import { isValidDistrict } from './districts'

/**
 * Validate a Zambian National Registration Card (NRC)
 * 
 * NRC Format: SEQUENCE/DISTRICT/NATIONALITY
 * - SEQUENCE: 6 digits (000001 - 999999)
 * - DISTRICT: 2 digits (01 - 99)
 * - NATIONALITY: 1 digit (1, 2, or 3)
 *   1 = Zambian, 2 = Commonwealth, 3 = Foreign
 * 
 * Why this validation order matters:
 * 1. Check if input exists at all (fail fast on empty)
 * 2. Check if it has the basic format (3 parts separated by /)
 * 3. Check each part individually
 * 4. Only then check strict mode (expensive district lookup)
 * 
 * This reduces unnecessary work: if format is wrong, we don't check districts.
 * 
 * @param nrc - The NRC string to validate (e.g., "613475/61/1")
 * @param options - Validation options (e.g., strict mode)
 * @returns ValidationResult - either {valid: true} or {valid: false, error: {...}}
 */
export function validateNRC(
  nrc: string,
  options: ValidationOptions = {}
): ValidationResult {
  // ===== STEP 1: Check if input is empty =====
  // This is the most basic validation - fail immediately if no input
  if (!nrc || typeof nrc !== 'string' || nrc.trim() === '') {
    return {
      valid: false,
      error: {
        code: 'EMPTY_INPUT',
        message: 'NRC cannot be empty',
        received: typeof nrc === 'string' ? `"${nrc}"` : String(nrc),
        expected: 'SEQUENCE/DISTRICT/NATIONALITY (e.g., 613475/61/1)',
        hint: 'Enter an NRC in format: 6 digits / 2 digits / 1 digit',
      },
    }
  }

  // ===== STEP 2: Check basic format (3 parts separated by /) =====
  // NRC must be exactly "XXXXXX/XX/X" format
  const parts = nrc.split('/')
  if (parts.length !== 3) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FORMAT',
        message: 'NRC must have format SEQUENCE/DISTRICT/NATIONALITY',
        received: nrc,
        expected: 'SEQUENCE/DISTRICT/NATIONALITY',
        hint: `Found ${parts.length} part(s), expected 3. Use forward slashes (/) to separate.`,
      },
    }
  }

  const [sequence, district, nationality] = parts

  // ===== STEP 3: Validate sequence (must be 6 numeric digits) =====
  // Check if sequence is exactly 6 digits (regex: ^ means start, $ means end, \d means digit)
  if (!/^\d{6}$/.test(sequence)) {
    // If it contains non-numeric characters, report that specifically
    if (!/^\d+$/.test(sequence)) {
      return {
        valid: false,
        error: {
          code: 'NON_NUMERIC_SEQUENCE',
          message: 'Sequence must contain only digits (0-9).',
          received: sequence,
          expected: '6 digits (0-9)',
          hint: 'Remove letters, spaces, and special characters.',
        },
      }
    }
    // Otherwise it's all numbers but wrong length
    return {
      valid: false,
      error: {
        code: 'INVALID_SEQUENCE_LENGTH',
        message: `Sequence must be exactly 6 digits, you provided ${sequence.length}.`,
        received: sequence,
        expected: 'exactly 6 digits',
        hint: sequence.length < 6 ? `Pad with leading zeros: ${sequence.padStart(6, '0')}` : `Remove ${sequence.length - 6} digit(s).`,
      },
    }
  }

  // ===== STEP 4: Validate district (must be 2 numeric digits) =====
  if (!/^\d{2}$/.test(district)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_DISTRICT_LENGTH',
        message: `District code must be exactly 2 digits, you provided '${district}' (${district.length} char(s)).`,
        received: district,
        expected: '2 digits (01-99)',
        hint: district.length === 1 ? `Pad with zero: 0${district}` : `District code must be 2 digits.`,
      },
    }
  }

  // ===== STEP 5: Validate nationality (must be 1 numeric digit, and 1-3) =====
  if (!/^\d$/.test(nationality)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_NATIONALITY',
        message: `Nationality must be a single digit (1, 2, or 3), you provided '${nationality}'.`,
        received: nationality,
        expected: '1 digit: 1 (Zambian), 2 (Commonwealth), or 3 (Foreign)',
        hint: 'Enter only the digit: 1, 2, or 3.',
      },
    }
  }

  // Convert to number and check valid range (1, 2, or 3)
  const nationalityCode = parseInt(nationality, 10)
  if (nationalityCode < 1 || nationalityCode > 3) {
    return {
      valid: false,
      error: {
        code: 'INVALID_NATIONALITY',
        message: `Nationality '${nationality}' is invalid. Must be 1 (Zambian), 2 (Commonwealth), or 3 (Foreign).`,
        received: nationality,
        expected: '1 (Zambian), 2 (Commonwealth), or 3 (Foreign)',
        hint: 'Use 1, 2, or 3 only. 0 and 4+ are not valid.',
      },
    }
  }

  // ===== STEP 6: Optional strict mode - check if district exists =====
  // This is expensive (lookup in districts table) so only do it if requested
  if (options.strict) {
    if (!isValidDistrict(district)) {
      return {
        valid: false,
        error: {
          code: 'UNKNOWN_DISTRICT',
          message: `District code '${district}' is not recognized. Valid Zambian districts are 01–69. See /api-docs for details.`,
          received: district,
          expected: 'Valid Zambian district code (01-69)',
          hint: 'Check /api-docs for a list of valid Zambian district codes.',
        },
      }
    }
  }

  // ===== All validation passed =====
  return {
    valid: true,
  }
}
