// lib/nrc/generator.ts
// Pure generator logic - creates realistic Zambian NRC numbers for testing

import { isValidDistrict } from './districts';
import { NRCGenerationResult } from './types';

// Helper to generate a random integer between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a single realistic NRC number
export function generateNRC(strict: boolean = false): NRCGenerationResult {
  // Generate 6-digit sequence (000001 to 999999)
  const sequence = String(randomInt(1, 999999)).padStart(6, '0');

  let district: string;

  if (strict) {
    // In strict mode, pick a real district code from our list
    const districtsList = Array.from(
      // We can use any valid district - picking a few common ones for variety
      ['01', '11', '21', '31', '41', '51', '61', '71', '81', '91']
    );
    district = districtsList[randomInt(0, districtsList.length - 1)];
  } else {
    // In basic mode, any 2 digits is fine
    district = String(randomInt(10, 99));
  }

  // Nationality digit: 1, 2, or 3 (Zambian, Commonwealth, Foreign)
  const nationality = String(randomInt(1, 3));

  const nrc = `${sequence}/${district}/${nationality}`;

  return {
    nrc,
    mode: strict ? 'level2' : 'level1'
  };
}