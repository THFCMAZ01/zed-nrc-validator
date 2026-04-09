export interface ValidationSuccess {
  valid: true
  error?: never
}

export interface ValidationError {
  valid: false
  error: {
    code: string
    message: string
  }
}

export type ValidationResult = ValidationSuccess | ValidationError

export interface ValidationOptions {
  strict?: boolean
}

export interface GeneratedNRC {
  nrc: string
  sequence: number
  district: number
  nationality: number
}
