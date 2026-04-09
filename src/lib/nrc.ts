import { ValidationResult, ValidationOptions, GeneratedNRC } from '@/types/nrc.types'
import { isValidDistrict } from '@/data/districts'

/**
 * Validate a Zambian National Registration Card NRC
 * Format: SEQUENCE/DISTRICT/NATIONALITY
 * - SEQUENCE: 6 digits (000001 - 999999)
 * - DISTRICT: 2 digits (01 - 99)
 * - NATIONALITY: 1 digit (1, 2, or 3)
 *   1 = Zambian, 2 = Commonwealth, 3 = Foreign
 */
export function validateNRC(
  nrc: string,
  options: ValidationOptions = {}
): ValidationResult {
  // Check for empty input
  if (!nrc || typeof nrc !== 'string' || nrc.trim() === '') {
    return {
      valid: false,
      error: {
        code: 'EMPTY_INPUT',
        message: 'NRC cannot be empty',
      },
    }
  }

  // Check format (should be SEQUENCE/DISTRICT/NATIONALITY)
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

  // Validate sequence (must be 6 digits)
  if (!/^\d{6}$/.test(sequence)) {
    if (!/^\d+$/.test(sequence)) {
      return {
        valid: false,
        error: {
          code: 'NON_NUMERIC_SEQUENCE',
          message: 'Sequence must contain only digits',
        },
      }
    }
    return {
      valid: false,
      error: {
        code: 'INVALID_SEQUENCE_LENGTH',
        message: 'Sequence must be exactly 6 digits',
      },
    }
  }

  // Validate district (must be 2 digits)
  if (!/^\d{2}$/.test(district)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_DISTRICT_LENGTH',
        message: 'District code must be exactly 2 digits',
      },
    }
  }

  // Validate nationality (must be 1-3)
  if (!/^\d$/.test(nationality)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_NATIONALITY',
        message: 'Nationality must be a single digit',
      },
    }
  }

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

  // Strict mode: validate district code
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

  return {
    valid: true,
  }
}

/**
 * Generate a valid random Zambian NRC
 */
export function generateNRC(): GeneratedNRC {
  // Generate random 6-digit sequence
  const sequence = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')

  // Use a valid district code (61 = Ndola)
  const districtCode = 61
  const district = districtCode.toString().padStart(2, '0')

  // Use valid nationality (1 = Zambian)
  const nationality = 1

  const nrc = `${sequence}/${district}/${nationality}`

  return {
    nrc,
    sequence: parseInt(sequence, 10),
    district: districtCode,
    nationality,
  }
}
