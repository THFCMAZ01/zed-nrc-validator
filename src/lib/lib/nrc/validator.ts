// lib/nrc/validator.ts
// Pure validation logic - no framework dependencies
// This file contains all the rules for checking Zambian NRC numbers

import { validDistricts, isValidDistrict } from './districts';
import { NRCValidationResult, ValidationOptions } from './types';

// Main validation function
export function validateNRC(nrc: string, options: ValidationOptions = {}): NRCValidationResult {
  // Default to Level 1 (basic format) unless strict mode is requested
  const strict = options.strict ?? false;

  // Step 1: Check for empty or invalid input
  if (!nrc || typeof nrc !== 'string' || nrc.trim() === '') {
    return {
      valid: false,
      mode: strict ? 'level2' : 'level1',
      error: { code: 'EMPTY_INPUT', message: 'NRC number cannot be empty' }
    };
  }

  const trimmed = nrc.trim();

  // Step 2: Basic format check using regex
  const formatRegex = /^\d{6}\/\d{2}\/\d{1}$/;
  if (!formatRegex.test(trimmed)) {
    return {
      valid: false,
      mode: strict ? 'level2' : 'level1',
      error: { code: 'INVALID_FORMAT', message: 'NRC must be in format: 123456/78/9' }
    };
  }

  // Split into parts
  const [sequence, district, nationality] = trimmed.split('/');

  // Step 3: Sequence must be exactly 6 digits
  if (sequence.length !== 6 || !/^\d{6}$/.test(sequence)) {
    return {
      valid: false,
      mode: strict ? 'level2' : 'level1',
      error: { code: 'INVALID_SEQUENCE_LENGTH', message: 'First part must be exactly 6 digits' }
    };
  }

  // Step 4: District code must be exactly 2 digits
  if (district.length !== 2 || !/^\d{2}$/.test(district)) {
    return {
      valid: false,
      mode: strict ? 'level2' : 'level1',
      error: { code: 'INVALID_DISTRICT_LENGTH', message: 'District code must be exactly 2 digits' }
    };
  }

  // Step 5: Nationality digit must be 1, 2, or 3
  if (!['1', '2', '3'].includes(nationality)) {
    return {
      valid: false,
      mode: strict ? 'level2' : 'level1',
      error: { code: 'INVALID_NATIONALITY', message: 'Nationality digit must be 1, 2, or 3' }
    };
  }

  // Step 6: If strict mode, check if district code is real
  if (strict && !isValidDistrict(district)) {
    return {
      valid: false,
      mode: 'level2',
      error: { code: 'UNKNOWN_DISTRICT', message: 'Unknown district code' }
    };
  }

  // If we reach here, it's valid
  return {
    valid: true,
    mode: strict ? 'level2' : 'level1'
  };
}