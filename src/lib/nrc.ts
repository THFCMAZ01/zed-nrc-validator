import type {
  NRCValidationResult,
  NRCValidateOptions,
  NRCGenerateResult,
  NRCSegments,
  NRCErrorCode,
  NRCSegment,
} from '../types/nrc.types'

// Structural validation only: six ASCII digits / two ASCII digits / one ASCII digit.
// The final digit is called countryCode in Zambian Auditor General reports.
// Its complete numeric assignment is not publicly specified.
const NRC_REGEX = /^([0-9]{6})\/([0-9]{2})\/([0-9])$/

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
 * Checks the canonical written structure of an NRC string.
 *
 * This is format validation only. It does not confirm that a number was
 * issued, that its district code exists, or that it belongs to a person.
 * The legacy options argument remains accepted for compatibility; strict
 * has no effect until a complete, authoritative reference dataset exists.
 */
export function validateNRC(
  input: string,
  _options: NRCValidateOptions = {}
): NRCValidationResult {
  void _options

  if (input === null || input === undefined) {
    return makeInvalid(
      String(input),
      'EMPTY_INPUT',
      'NRC input cannot be null or undefined.',
      'input'
    )
  }

  if (input.trim() === '') {
    return makeInvalid(input, 'EMPTY_INPUT', 'NRC input cannot be empty.', 'input')
  }

  // Match the complete string and capture each segment without converting
  // to numbers, preserving significant leading zeroes.
  const match = NRC_REGEX.exec(input)

  if (!match || input.length !== 11) {
    const parts = input.split('/')

    if (parts.length === 3) {
      const [sequence, districtCode, countryCode] = parts

      if (sequence.length !== 6) {
        return makeInvalid(
          input,
          'INVALID_SEQUENCE_LENGTH',
          'The sequence segment must contain exactly 6 digits.',
          'sequence'
        )
      }

      if (!/^[0-9]{6}$/.test(sequence)) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          'The sequence segment must contain ASCII digits only.',
          'sequence'
        )
      }

      if (districtCode.length !== 2) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          'The district-code segment must contain exactly 2 digits.',
          'districtCode'
        )
      }

      if (!/^[0-9]{2}$/.test(districtCode)) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          'The district-code segment must contain ASCII digits only.',
          'districtCode'
        )
      }

      if (countryCode.length !== 1 || !/^[0-9]$/.test(countryCode)) {
        return makeInvalid(
          input,
          'INVALID_FORMAT',
          'The country-code segment must contain exactly 1 ASCII digit.',
          'countryCode'
        )
      }
    }

    return makeInvalid(
      input,
      'INVALID_FORMAT',
      'Expected 6 ASCII digits, a slash, 2 ASCII digits, a slash, and 1 ASCII digit.',
      'input'
    )
  }

  const segments: NRCSegments = {
    sequence: match[1],
    districtCode: match[2],
    countryCode: match[3],
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
  const countryCode = '1'

  return {
    nrc: sequence + '/' + districtCode + '/' + countryCode,
    districtCode,
    countryCode,
    synthetic: true,
  }
}
