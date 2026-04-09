// lib/nrc/types.ts
// This file defines the shape of data our validator and generator will return.
// It makes our code type-safe and easier to understand.

export type NRCValidationResult = {
  valid: boolean;
  mode: 'level1' | 'level2';
  error?: {
    code: string;
    message: string;
  };
};

export type NRCGenerationResult = {
  nrc: string;
  mode: 'level1' | 'level2';
};

// Optional: Type for the strict mode option
export type ValidationOptions = {
  strict?: boolean;
};