/**
 * Zambian NRC District Codes
 * 
 * Why this file exists:
 * - Central place to define which district codes are valid
 * - Used by strict-mode validation to check district exists
 * - Separated from validator logic for easier maintenance
 * - If district codes change, only this file needs updating
 * 
 * Real-world context (Zambia):
 * - Zambia has 10 provinces
 * - Each province has multiple districts
 * - Each district has a numeric code
 * - This is used in the NRC (National Registration Card) system
 * - Codes are 2 digits: 01-99, but only specific ranges are valid
 * 
 * Format: Districts organized by province, with actual codes
 */

/**
 * Valid Zambian NRC district codes
 * Organized by province for maintenance
 * 
 * Data source: ADR-001 in project docs
 * Note: Not all 00-99 are valid (e.g., 00 is not a real district)
 */
const DISTRICTS_BY_PROVINCE = {
  LUSAKA: ['01', '02', '03', '04', '05'],
  COPPERBELT: ['10', '11', '12', '13'],
  EASTERN: ['20', '21', '22', '23'],
  SOUTHERN: ['30', '31', '32'],
  CENTRAL: ['40', '41', '42'],
  NORTHERN: ['50', '51', '52'],
  NORTH_WESTERN: ['60'],
  WESTERN: ['61', '62', '63'],
  MUCHINGA: ['64', '65', '66'],
  LUAPULA: ['67', '68', '69'],
} as const

/**
 * Create a Set of all valid district codes
 * 
 * Why a Set?
 * - O(1) lookup time (instant): checking if a code is valid
 * - vs Array which is O(n) (slow): has to search through all items
 * - For a small list this doesn't matter, but it's good practice
 * 
 * Why create it this way instead of manually listing all?
 * - Developers can see which province each code belongs to
 * - Easier to add new codes in right place
 * - Easier to spot mistakes (e.g., duplicates)
 */
export const VALID_DISTRICTS = new Set<string>(
  Object.values(DISTRICTS_BY_PROVINCE).flat()
)

/**
 * Check if a district code is valid
 * 
 * This is the main function used by validator.ts in strict mode
 * 
 * @param code - District code to check (e.g., "61", "00")
 * @returns true if code is a known Zambian district, false otherwise
 * 
 * Example:
 *   isValidDistrict("61")  // true - Ndola is valid
 *   isValidDistrict("00")  // false - 00 is not a real district
 *   isValidDistrict("99")  // false - not in our list
 */
export function isValidDistrict(code: string | number): boolean {
  // Convert number to string if needed (for flexibility)
  // e.g., if someone passes 61 instead of "61"
  const codeStr = typeof code === 'number'
    ? code.toString().padStart(2, '0')
    : code

  return VALID_DISTRICTS.has(codeStr)
}
