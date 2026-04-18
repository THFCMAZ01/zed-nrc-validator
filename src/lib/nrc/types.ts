/**
 * Type Definitions for NRC Validation and Generation
 * 
 * Why this file exists:
 * - Defines the contract/shape of data flowing through the system
 * - Makes TypeScript enforce type safety
 * - Other modules don't need to import business logic just to use types
 * - Keeps "what the API looks like" separate from "how it works"
 * 
 * Key decision: Using discriminated unions
 * - Instead of: { valid: boolean, error?: Error }
 * - We use: ValidationSuccess | ValidationError
 * - TypeScript advantage: if you check valid===true, TypeScript KNOWS error doesn't exist
 * - More type-safe and catches bugs earlier
 */

/**
 * Success result: validation passed, NRC is valid
 * 
 * When valid=true, error is explicitly marked as never (doesn't exist)
 * This forces calling code to check valid before accessing error
 * 
 * Example:
 *   const result = validateNRC("613475/61/1")
 *   if (result.valid) {
 *     // TypeScript knows error doesn't exist here
 *     console.log("Valid NRC!")
 *   }
 */
export interface ValidationSuccess {
  valid: true
  error?: never  // error doesn't exist when valid=true
}

/**
 * Error result: validation failed, NRC is invalid
 * 
 * When valid=false, error MUST exist with code and message
 * Machine-readable code for routing/handling, human-readable message
 * 
 * Diagnostic fields (received, expected, hint):
 * - received: the actual invalid input the user provided
 * - expected: what format/range is correct
 * - hint: helpful guidance for fixing the error
 * 
 * Error codes examples:
 * - EMPTY_INPUT: no NRC provided
 * - INVALID_FORMAT: doesn't have X/XX/X shape
 * - INVALID_SEQUENCE_LENGTH: sequence not exactly 6 digits
 * - INVALID_NATIONALITY: nationality code not 1, 2, or 3
 * - UNKNOWN_DISTRICT: district code not in valid list (strict mode only)
 * 
 * Example:
 *   const result = validateNRC("61347/61/1")
 *   if (!result.valid) {
 *     // TypeScript knows error EXISTS here and has diagnostic info
 *     console.log(result.error.code)       // "INVALID_SEQUENCE_LENGTH"
 *     console.log(result.error.received)   // "61347"
 *     console.log(result.error.expected)   // "6 digits"
 *   }
 */
export interface ValidationError {
  valid: false
  error: {
    code: string        // Machine-readable: used for programmatic response
    message: string     // Human-readable: shown to users
    received?: string   // What the user actually provided (for diagnostics)
    expected?: string   // What format is correct
    hint?: string       // Helpful guidance to fix the error
  }
}

/**
 * Discriminated Union Type: the return type of validateNRC()
 * 
 * "Discriminated" means the function returns ONE of two types, and TypeScript
 * can tell which one by checking the 'valid' field
 * 
 * TypeScript flow analysis (narrowing):
 *   const result = validateNRC("...")
 *   if (result.valid) {
 *     // Here, result is ValidationSuccess - error doesn't exist
 *   } else {
 *     // Here, result is ValidationError - error definitely exists
 *   }
 * 
 * This prevents runtime errors like accessing error.code when error is undefined
 */
export type ValidationResult = ValidationSuccess | ValidationError

/**
 * Options that modify how validation behaves
 * 
 * Level 1 (default, strict=false):
 * - Checks format: does it look like XXXXXX/XX/X?
 * - Checks ranges: are the numbers in valid ranges?
 * - Allows any 2-digit district code
 * 
 * Level 2 (strict=true):
 * - All Level 1 checks PLUS
 * - Checks if district code is a known Zambian district
 * - Slower (does lookup in valid districts table)
 * - More thorough validation
 */
export interface ValidationOptions {
  strict?: boolean    // If true: also validate that district is a known Zambian district
}

/**
 * The result of generating a random NRC
 * 
 * Includes both:
 * - nrc: the formatted string (e.g., "123456/61/1")
 * - individual components: sequence, district, nationality as numbers
 * 
 * Why include both?
 * - nrc: ready to display or send to database
 * - components: if you need to do something with individual parts
 */
export interface GeneratedNRC {
  nrc: string         // Formatted: "XXXXXX/XX/X"
  sequence: number    // Raw: 0-999999
  district: number    // Raw: 0-99
  nationality: number // Raw: 1, 2, or 3
}
