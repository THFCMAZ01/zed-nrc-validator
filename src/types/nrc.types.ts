// ─── Error codes ──────────────────────────────────────────────────────────────
export type NRCErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_FORMAT'
  | 'INVALID_SEQUENCE_LENGTH'
  | 'INVALID_NATIONALITY_DIGIT'
  | 'UNKNOWN_DISTRICT_CODE'

export type NRCSegment =
  | 'input'
  | 'sequence'
  | 'districtCode'
  | 'nationalityDigit'

export interface NRCSegments {
  sequence: string
  districtCode: string
  nationalityDigit: string
}

export interface NRCValidationError {
  code: NRCErrorCode
  message: string
  segment: NRCSegment
}

export type NRCValidationResult =
  | {
      valid: true
      validationLevel: 'format'
      input: string
      segments: NRCSegments
    }
  | {
      valid: false
      validationLevel: 'format'
      input: string
      segments?: NRCSegments
      error: NRCValidationError
    }

export interface NRCValidateOptions {
  /**
   * @deprecated Accepted for backward compatibility only.
   * District-code validation is not performed because the reference dataset
   * is incomplete. true and false currently produce the same format-only result.
   */
  strict?: boolean
}

export interface NRCGenerateResult {
  nrc: string
  districtCode: string
  nationalityDigit: 1 | 2 | 3
  synthetic: true
}

export interface NRCBatchResult {
  results: NRCValidationResult[]
  summary: {
    total: number
    valid: number
    invalid: number
  }
}