/**
 * Public API for NRC Validator Library
 * 
 * Why this file exists:
 * - Acts as the "main entrance" to the NRC library
 * - Exports only the public interface (validateNRC, generateNRC, types)
 * - Keeps internal functions (like isValidDistrict) hidden
 * - If we reorganize internals, imports from users don't break
 * - Makes the library feel clean and intentional
 * 
 * What gets exported:
 * - validateNRC: function to validate NRC strings
 * - generateNRC: function to generate random valid NRCs
 * - All TypeScript types: ValidationResult, ValidationOptions, GeneratedNRC
 * 
 * What does NOT get exported:
 * - isValidDistrict: internal helper (users don't need it)
 * - districts: internal data (users can see it, but shouldn't depend on it)
 */

export { validateNRC } from './validator'
export { generateNRC } from './generator'
export type { ValidationResult, ValidationSuccess, ValidationError, ValidationOptions, GeneratedNRC } from './types'
