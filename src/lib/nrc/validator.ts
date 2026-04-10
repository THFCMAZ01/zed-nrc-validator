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
          message: 'Sequence must contain only digits',
        },
      }
    }
    // Otherwise it's all numbers but wrong length
    return {
      valid: false,
      error: {
        code: 'INVALID_SEQUENCE_LENGTH',
        message: 'Sequence must be exactly 6 digits',
      },
    }
  }

  // ===== STEP 4: Validate district (must be 2 numeric digits) =====
  if (!/^\d{2}$/.test(district)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_DISTRICT_LENGTH',
        message: 'District code must be exactly 2 digits',
      },
    }
  }

  // ===== STEP 5: Validate nationality (must be 1 numeric digit, and 1-3) =====
  if (!/^\d$/.test(nationality)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_NATIONALITY',
        message: 'Nationality must be a single digit',
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
        message: 'Nationality must be 1 (Zambian), 2 (Commonwealth), or 3 (Foreign)',
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
          message: `District code ${district} is not recognized`,
        },
      }
    }
  }

  // ===== All validation passed =====
  return {
    valid: true,
  }
}
