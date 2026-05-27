import { describe, it, expect } from 'vitest';
import {
  stripNonDigits,
  isInternationalFormat,
  extractDialCode,
  detectCountry,
  formatPhoneNumber,
  parseToE164,
  getNationalNumber,
  validatePhoneNumber,
  parsePhoneValue,
  isPhoneNumberComplete,
  formatAsYouType,
  getPlaceholder,
  normalizePhoneNumber,
  phoneNumbersEqual,
  getCountryDisplayLabel,
  limitInputLength,
} from './utils';
import { getCountryByCode } from './countries';

describe('stripNonDigits', () => {
  it('should remove all non-digit characters', () => {
    expect(stripNonDigits('123-456-7890')).toBe('1234567890');
    expect(stripNonDigits('(123) 456-7890')).toBe('1234567890');
    expect(stripNonDigits('+1 234 567 8900')).toBe('12345678900');
  });

  it('should handle empty strings', () => {
    expect(stripNonDigits('')).toBe('');
  });

  it('should handle strings with no digits', () => {
    expect(stripNonDigits('abc-xyz')).toBe('');
  });
});

describe('isInternationalFormat', () => {
  it('should detect international format', () => {
    expect(isInternationalFormat('+1234567890')).toBe(true);
    expect(isInternationalFormat('+44 20 7946 0958')).toBe(true);
  });

  it('should detect non-international format', () => {
    expect(isInternationalFormat('1234567890')).toBe(false);
    expect(isInternationalFormat('(123) 456-7890')).toBe(false);
  });
});

describe('extractDialCode', () => {
  it('should extract US dial code', () => {
    const result = extractDialCode('+1234567890');
    expect(result.dialCode).toBe('1');
    expect(result.nationalNumber).toBe('234567890');
  });

  it('should extract UK dial code', () => {
    const result = extractDialCode('+442079460958');
    expect(result.dialCode).toBe('44');
    expect(result.nationalNumber).toBe('2079460958');
  });

  it('should handle numbers without dial code', () => {
    const result = extractDialCode('234567890');
    expect(result.dialCode).toBeNull();
    expect(result.nationalNumber).toBe('234567890');
  });
});

describe('detectCountry', () => {
  it('should detect US from +1', () => {
    const country = detectCountry('+14155552671');
    expect(country?.code).toBe('US');
  });

  it('should detect UK from +44', () => {
    const country = detectCountry('+442079460958');
    expect(country?.code).toBe('GB');
  });

  it('should detect Germany from +49', () => {
    const country = detectCountry('+4915112345678');
    expect(country?.code).toBe('DE');
  });

  it('should return null for unknown numbers', () => {
    const country = detectCountry('12345');
    expect(country).toBeNull();
  });

  it('should return null for empty string', () => {
    const country = detectCountry('');
    expect(country).toBeNull();
  });
});

describe('formatPhoneNumber', () => {
  it('should format US number nationally', () => {
    const us = getCountryByCode('US');
    const formatted = formatPhoneNumber('4155552671', us, 'national');
    expect(formatted).toBe('(415) 555-2671');
  });

  it('should format US number internationally', () => {
    const us = getCountryByCode('US');
    const formatted = formatPhoneNumber('4155552671', us, 'international');
    expect(formatted).toBe('+1 (415) 555-2671');
  });

  it('should format to E.164', () => {
    const us = getCountryByCode('US');
    const formatted = formatPhoneNumber('4155552671', us, 'e164');
    expect(formatted).toBe('+14155552671');
  });

  it('should handle empty value', () => {
    const us = getCountryByCode('US');
    expect(formatPhoneNumber('', us)).toBe('');
  });

  it('should format without country', () => {
    const formatted = formatPhoneNumber('1234567890', null);
    expect(formatted).toBe('123 456 789');
  });
});

describe('parseToE164', () => {
  it('should convert US number to E.164', () => {
    const us = getCountryByCode('US');
    expect(parseToE164('4155552671', us)).toBe('+14155552671');
  });

  it('should keep existing dial code', () => {
    const us = getCountryByCode('US');
    expect(parseToE164('+14155552671', us)).toBe('+14155552671');
  });

  it('should handle empty value', () => {
    const us = getCountryByCode('US');
    expect(parseToE164('', us)).toBe('');
  });
});

describe('getNationalNumber', () => {
  it('should extract national number', () => {
    expect(getNationalNumber('+14155552671')).toBe('4155552671');
  });

  it('should return full number if no dial code', () => {
    expect(getNationalNumber('4155552671')).toBe('4155552671');
  });
});

describe('validatePhoneNumber', () => {
  it('should validate required field', () => {
    const result = validatePhoneNumber('', null, true);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('required');
    expect(result.message).toBe('Phone number is required');
    expect(result.error).toBe(result.message);
  });

  it('should allow empty when not required', () => {
    const result = validatePhoneNumber('', null, false);
    expect(result.isValid).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.error).toBeNull();
  });

  it('should reject too short numbers', () => {
    const result = validatePhoneNumber('123', null);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('too_short');
    expect(result.error).toBe('Phone number is too short');
  });

  it('should validate US number', () => {
    const us = getCountryByCode('US');
    const result = validatePhoneNumber('4155552671', us);
    expect(result.isValid).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('should reject too long numbers for country', () => {
    const us = getCountryByCode('US');
    const result = validatePhoneNumber('415555267123456', us);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('too_long');
    expect(result.error).toBe('Phone number is too long (max 10 digits)');
  });

  it('should use a custom validator when provided', () => {
    const us = getCountryByCode('US');
    const result = validatePhoneNumber('4155552671', us, false, () => false);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('invalid');
  });
});

describe('parsePhoneValue', () => {
  it('should parse a valid US national number', () => {
    const us = getCountryByCode('US');
    const parsed = parsePhoneValue('4155552671', us);
    expect(parsed.isValid).toBe(true);
    expect(parsed.nationalNumber).toBe('4155552671');
    expect(parsed.e164).toBe('+14155552671');
    expect(parsed.country?.code).toBe('US');
  });

  it('should parse international input', () => {
    const parsed = parsePhoneValue('+442079460958');
    expect(parsed.isValid).toBe(true);
    expect(parsed.country?.code).toBe('GB');
    expect(parsed.e164).toBe('+442079460958');
  });

  it('should return invalid partial input without e164', () => {
    const us = getCountryByCode('US');
    const parsed = parsePhoneValue('123', us);
    expect(parsed.isValid).toBe(false);
    expect(parsed.e164).toBeUndefined();
  });
});

describe('isPhoneNumberComplete', () => {
  it('should return true for complete US number', () => {
    const us = getCountryByCode('US');
    expect(isPhoneNumberComplete('4155552671', us)).toBe(true);
  });

  it('should return false for incomplete US number', () => {
    const us = getCountryByCode('US');
    expect(isPhoneNumberComplete('415555', us)).toBe(false);
  });

  it('should handle null country', () => {
    expect(isPhoneNumberComplete('1234567', null)).toBe(true);
    expect(isPhoneNumberComplete('123', null)).toBe(false);
  });
});

describe('formatAsYouType', () => {
  it('should format US number as user types', () => {
    const us = getCountryByCode('US');
    expect(formatAsYouType('415', us)).toBe('(415)');
    expect(formatAsYouType('415555', us)).toBe('(415) 555');
    expect(formatAsYouType('4155552', us)).toBe('(415) 555-2');
  });

  it('should handle international format', () => {
    const us = getCountryByCode('US');
    expect(formatAsYouType('+1415555', us)).toBe('+1 (415) 555');
  });
});

describe('getPlaceholder', () => {
  it('should return country format placeholder', () => {
    const us = getCountryByCode('US');
    expect(getPlaceholder(us)).toBe('(000) 000-0000');
  });

  it('should return default placeholder for null country', () => {
    expect(getPlaceholder(null)).toBe('Phone number');
  });
});

describe('normalizePhoneNumber', () => {
  it('should normalize phone number', () => {
    expect(normalizePhoneNumber('(415) 555-2671')).toBe('4155552671');
    expect(normalizePhoneNumber('+1 415-555-2671')).toBe('14155552671');
  });
});

describe('phoneNumbersEqual', () => {
  it('should compare phone numbers', () => {
    expect(phoneNumbersEqual('(415) 555-2671', '4155552671')).toBe(true);
    expect(phoneNumbersEqual('+1 415-555-2671', '14155552671')).toBe(true);
    expect(phoneNumbersEqual('4155552671', '4155552672')).toBe(false);
  });
});

describe('getCountryDisplayLabel', () => {
  it('should include dial code by default', () => {
    const us = getCountryByCode('US')!;
    expect(getCountryDisplayLabel(us)).toBe('🇺🇸 United States (+1)');
  });

  it('should exclude dial code when specified', () => {
    const us = getCountryByCode('US')!;
    expect(getCountryDisplayLabel(us, false)).toBe('🇺🇸 United States');
  });
});

describe('limitInputLength', () => {
  it('should limit input length for country', () => {
    const us = getCountryByCode('US');
    const result = limitInputLength('415555267123456', us);
    expect(result).toBe('4155552671');
  });

  it('should handle international format', () => {
    const us = getCountryByCode('US');
    const result = limitInputLength('+1415555267123456', us);
    expect(result).toBe('+14155552671');
  });

  it('should not limit when no country', () => {
    const result = limitInputLength('12345678901234567890', null);
    expect(result).toBe('12345678901234567890');
  });
});
