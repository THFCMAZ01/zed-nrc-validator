// Zambian National Registration Card (NRC) Districts
// Format: { code: districtName }

export const districts: Record<string, string> = {
  '01': 'Central',
  '02': 'Copperbelt',
  '03': 'Eastern',
  '04': 'Luapula',
  '05': 'Lusaka',
  '06': 'Muchinga',
  '07': 'Northern',
  '08': 'Northwestern',
  '09': 'Southern',
  '10': 'Tongas',
  '11': 'Western',
  '61': 'Ndola',
}

export const isValidDistrict = (code: string | number): boolean => {
  const codeStr = typeof code === 'number' ? code.toString().padStart(2, '0') : code
  return codeStr in districts
}
