// Every possible error codes this system can return
export type NRCerrorCode =
| 'EMPTY_INPUT'
| 'INVALID_FORMAT'
| 'INVALID_SEQUENCE_LENGTH'
| 'INVALID_SEQUENCE_DIGIT'
| 'UNKNOWN_DISTRICT_CODE'

//Which part of the NRC string caused the error?
export type NRCSegment =
| 'input'
| 'sequence'
| 'districtCode'
| 'nationalityDigit'

//The three parts of a parsed NRC
export interface NRCSegments {
    sequence: string           //'123456'  
    districtCode: string      //'61'
    nationalityDigit: string  //'1'
}

//What a validation error looks like
export interface NRCValidationError {
    code: NRCerrorCode
    message: string
    segment: NRCSegment
}

//Validation Result is a discriminated union
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

//Options you can pass to ValidateNRC
//Strict mode is false by default
export interface NRCVAlidateOptions {
    strict?: boolean
}

//What the generator returns
export interface NRCGenerateResult {
    nrc: string
    districtCode: string
    nationalityDigit: 1 | 2 | 3
}