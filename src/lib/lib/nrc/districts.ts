// lib/nrc/districts.ts
// Static lookup table of valid Zambian NRC district codes
// Format: "XX" where XX = district code (e.g. "61" = Ndola)

export const validDistricts = new Set<string>([
  // Lusaka Province
  "01", "02", "03", "04", "05", "06", "07", "08", "09",
  // Copperbelt Province
  "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
  // Southern Province
  "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
  // Central Province
  "30", "31", "32", "33", "34", "35", "36", "37", "38", "39",
  // Northern Province
  "40", "41", "42", "43", "44", "45", "46", "47", "48", "49",
  // Eastern Province
  "50", "51", "52", "53", "54", "55", "56", "57", "58", "59",
  // Luapula Province
  "60", "61", "62", "63", "64", "65", "66", "67", "68", "69",
  // North-Western Province
  "70", "71", "72", "73", "74", "75", "76", "77", "78", "79",
  // Western Province
  "80", "81", "82", "83", "84", "85", "86", "87", "88", "89",
  // Muchinga Province
  "90", "91", "92", "93", "94", "95", "96", "97", "98", "99",
]);

// Helper function to check if a district code is valid
export function isValidDistrict(code: string): boolean {
  return validDistricts.has(code);
}