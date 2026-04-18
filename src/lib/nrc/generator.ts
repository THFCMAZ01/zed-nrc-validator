/**
 * NRC Generation Logic
 * 
 * Why this is separate:
 * - Single Responsibility Principle: this file ONLY generates NRCs
 * - Easier to test: can test generation independently
 * - Can be swapped out with different generators (MockGenerator for tests, etc.)
 * - No dependencies on validation logic or React components
 */

import { GeneratedNRC } from './types'

/**
 * Generate a valid random Zambian NRC
 * 
 * Strategy:
 * - Use a random 6-digit sequence (000000 - 999999)
 * - Always use district code 61 (Ndola) - a valid known district
 * - Always use nationality 1 (Zambian)
 * - This ensures ALL generated NRCs pass validation (including strict mode)
 * 
 * Why these choices:
 * - Sequence is random so each call produces different NRC
 * 
 * - Fixed district ensures it's always valid (tests will pass)
 * - Fixed nationality ensures it's always valid (tests will pass)
 * - In a real app, you might accept these as parameters
 * 
 * @returns GeneratedNRC - object with nrc string and individual components
 */
export function generateNRC(): GeneratedNRC {
  // Generate random 6-digit sequence
  // Math.random() gives 0-0.9999..., multiply by 1000000 to get 0-999999
  // padStart(6, '0') ensures leading zeros (e.g., "000123" not "123")
  const sequence = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')

  // Fixed choice: Ndola (district code 61, Copperbelt province) - a valid Zambian district
  // This ensures ALL generated NRCs pass validation including strict mode
  const districtCode = 61
  const district = districtCode.toString().padStart(2, '0')

  // Fixed choice: Nationality 1 = Zambian
  const nationality = 1

  // Combine into the full NRC format
  const nrc = `${sequence}/${district}/${nationality}`

  return {
    nrc,
    sequence: parseInt(sequence, 10),      // Convert back to number for convenience
    district: districtCode,                 // Already a number
    nationality,                            // Already a number
  }
}
