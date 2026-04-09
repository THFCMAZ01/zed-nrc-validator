import { validateNRC, generateNRC } from '@/lib/nrc'
// lib/nrc/index.ts
// Barrel export file - makes importing cleaner
// This is the only file that gets imported from outside the lib/nrc folder

export { validateNRC } from './validator';
export { generateNRC } from './generator';
export type { NRCValidationResult, NRCGenerationResult, ValidationOptions } from './types';