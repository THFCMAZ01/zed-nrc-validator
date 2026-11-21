import type {
  NRCValidationResult,
  NRCValidateOptions,
  NRCGenerateResult,
  NRCSegments,
  NRCErrorCode,
  NRCSegment,
} from '../types/nrc.types'

// Keep this expression focused on syntax only.
// Six digits / two digits / one supported nationality digit.
const NRC_REGEX = /^\d{6}\/\d{2}\/[123]$/

function makeInvalid(
  input: string,
  code: NRCErrorCode,
  message: string,
  segment: NRCSegment,
  segments?: NRCSegments
): NRCValidationResult {
  return {
    valid: false,
    validationLevel: 'format',
    input,
    ...(segments && { segments }),
    error: { code, message, segment },
  }
}

/**
 * Checks the written structure of an NRC string.
 *
 * This is format validation only. It does not confirm that a number was
 * issued, that its district code exists, or that it belongs to a person.
 * The legacy options argument remains accepted for compatibility; strict
 * has no effect until a complete, authoritative district dataset exists.
 */
export function validateNRC(
  input: string,
  _options: NRCValidateOptions = {}
): NRCValidationResult {
  if (input === null || input === undefined) {
    return makeInvalid(
      String(input),
      'EMPTY_INPUT',
      'NRC input cannot be null or undefined.',
      'input'
    )
  }

  if (input.trim() === '') {
    return makeInvalid(
      input,
      'EMPTY_INPUT',
      'NRC input cannot be empty.',
      'input'
    )
  }

  if (!NRC_REGEX.test(input) || input.length !== 11) {
    const parts = input.split('/')

    if (parts.length === 3) {
      const [sequence, district, nationality] = parts

      if (sequence.length !== 6) {
        return makeInvalid(
          input,
          'INVALID_SEQUENCE_LENGTH',
          'The sequence segment must contain exactly 6 digits.',
          'sequence'
        )
      }

      if (!/^\d+$/.test(sequence)) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          'The sequence segment must contain digits only.',
          'sequence'
        )
      }

      if (district.length !== 2) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          'The district-code segment must contain exactly 2 digits.',
          'districtCode'
        )
      }

      if (!/^\d{2}$/.test(district)) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          'The district-code segment must contain digits only.',
          'districtCode'
        )
      }

      if (!/^[123]$/.test(nationality)) {
        return makeInvalid(
          input,
          'INVALID_NATIONALITY_DIGIT',
          'The final digit must be 1, 2, or 3.',
          'nationalityDigit'
        )
      }
    }

    return makeInvalid(
      input,
      'INVALID_FORMAT',
      'Expected 6 digits, a slash, 2 digits, a slash, and a final digit of 1, 2, or 3.',
      'input'
    )
  }

  const parts = input.split('/')
  const segments: NRCSegments = {
    sequence: parts[0],
    districtCode: parts[1],
    nationalityDigit: parts[2],
  }

  return {
    valid: true,
    validationLevel: 'format',
    input,
    segments,
  }
}

/**
 * Produces a randomly generated sample for development and testing.
 * It is not retrieved from an official registry and must not be used as
 * a real person's identifier or for production identity records.
 */
export function generateNRC(): NRCGenerateResult {
  const sequence = Math.floor(Math.random() * 900000 + 100000).toString()
  const districtCode = '61'
  const nationalityDigit: 1 | 2 | 3 = 1

  return {
    nrc: sequence + '/' + districtCode + '/' + nationalityDigit,
    districtCode,
    nationalityDigit,
    synthetic: true,
  }
}