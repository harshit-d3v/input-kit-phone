import type { Country } from './countries';
import { countries, detectCountryFromPhone } from './countries';
import { AsYouType, isPossiblePhoneNumber, isValidPhoneNumber, validatePhoneNumberLength as validateLength, type CountryCode } from 'libphonenumber-js';

type MaybeCountry = Country | null | undefined;

function normalizePhoneInput(phone: string): string {
  const trimmed = phone.trim();
  const digits = cleanPhone(trimmed);

  if (trimmed.startsWith('+') && !digits) {
    return '+';
  }

  if (!digits) {
    return '';
  }

  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

function getCountryCode(country: MaybeCountry): CountryCode | undefined {
  return country?.code as CountryCode | undefined;
}

function getMaxNationalDigits(country: MaybeCountry): number | undefined {
  return country?.format?.replace(/[^#]/g, '').length;
}

/**
 * Remove all non-digit characters from phone number
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Format phone number according to country format
 */
export function formatPhone(phone: string, country: MaybeCountry): string {
  if (!phone) return phone;

  const formatter = new AsYouType(getCountryCode(country));
  return formatter.input(normalizePhoneInput(phone));
}

/**
 * Get raw phone number without formatting
 */
export function unformatPhone(formattedPhone: string): string {
  return normalizePhoneInput(formattedPhone);
}

/**
 * Validate phone number length based on country
 */
export function validatePhoneLength(phone: string, country: MaybeCountry): boolean {
  if (!phone || !country) return false;

  if (phone.trim().startsWith('+')) {
    return validateLength(normalizePhoneInput(phone)) === undefined;
  }

  return validateLength(cleanPhone(phone), getCountryCode(country)) === undefined;
}

/**
 * Validate phone number format
 */
export function validatePhone(
  phone: string,
  country: MaybeCountry,
  customValidator?: (phone: string, country: Country | undefined) => boolean
): boolean {
  if (!phone) return false;
  
  if (customValidator) {
    return customValidator(phone, country ?? undefined);
  }

  const normalized = normalizePhoneInput(phone);
  const countryCode = getCountryCode(country);

  if (!countryCode) {
    return isPossiblePhoneNumber(normalized.startsWith('+') ? normalized : `+${cleanPhone(normalized)}`);
  }

  if (normalized.startsWith('+')) {
    return isValidPhoneNumber(normalized);
  }

  return isValidPhoneNumber(cleanPhone(normalized), countryCode);
}

/**
 * Add dial code to phone number
 */
export function addDialCode(phone: string, country: MaybeCountry): string {
  if (!country) return phone;

  const normalized = normalizePhoneInput(phone);
  if (!normalized) return '';
  if (normalized === '+') return '';
  if (normalized.startsWith('+')) return normalized;

  const digits = cleanPhone(normalized);
  const matchingDialCode = country.dialCodes.find((dialCode) => digits.startsWith(dialCode.replace('+', '')));
  return matchingDialCode ? `+${digits}` : `${country.dialCode}${digits}`;
}

/**
 * Remove dial code from phone number
 */
export function removeDialCode(phone: string, country: MaybeCountry): string {
  if (!country) return phone;

  const normalized = normalizePhoneInput(phone);
  const digits = cleanPhone(normalized);
  const primaryDialDigits = cleanPhone(country.dialCode);

  if (digits.startsWith(primaryDialDigits)) {
    return digits.slice(primaryDialDigits.length);
  }

  for (const dialCode of country.dialCodes) {
    const dialDigits = dialCode.replace('+', '');
    if (digits.startsWith(dialDigits)) {
      return digits.slice(dialDigits.length);
    }
  }

  return digits;
}

/**
 * Filter countries by search query
 */
export function filterCountries(
  countries: Country[],
  query: string,
  preferredCountries?: string[]
): Country[] {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    // Sort by preferred countries first
    if (preferredCountries?.length) {
      return [...countries].sort((a, b) => {
        const aPreferred = preferredCountries.indexOf(a.code);
        const bPreferred = preferredCountries.indexOf(b.code);
        if (aPreferred !== -1 && bPreferred !== -1) return aPreferred - bPreferred;
        if (aPreferred !== -1) return -1;
        if (bPreferred !== -1) return 1;
        return (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name);
      });
    }
    return countries;
  }
  
  return countries.filter(
    country =>
      country.name.toLowerCase().includes(lowerQuery) ||
      (country.displayName ?? '').toLowerCase().includes(lowerQuery) ||
      country.code.toLowerCase().includes(lowerQuery) ||
      country.dialCodes.some((dialCode) => dialCode.includes(lowerQuery))
  );
}

export function getCountryDisplayName(country: Country | undefined): string {
  return country?.displayName ?? country?.name ?? '';
}

/**
 * Get placeholder based on country format
 */
export function getPlaceholder(country: MaybeCountry): string {
  if (!country?.format) return country?.dialCode ? `${country.dialCode} 000 000 0000` : 'Phone number';
  return country.format.replace(/#/g, '0');
}

export const stripNonDigits = cleanPhone;

export function isInternationalFormat(phone: string): boolean {
  return phone.trim().startsWith('+') || phone.trim().startsWith('00');
}

export function extractDialCode(phone: string): { dialCode: string | null; nationalNumber: string } {
  const digits = cleanPhone(phone);
  if (!isInternationalFormat(phone)) {
    return { dialCode: null, nationalNumber: digits };
  }

  const match = countries
    .map((country) => country.dialCode)
    .sort((left, right) => right.length - left.length)
    .find((dialCode) => digits.startsWith(cleanPhone(dialCode)));

  if (!match) {
    return { dialCode: null, nationalNumber: digits };
  }

  const dialDigits = cleanPhone(match);
  return {
    dialCode: dialDigits,
    nationalNumber: digits.slice(dialDigits.length),
  };
}

export function detectCountry(phone: string): Country | null {
  return detectCountryFromPhone(phone) ?? null;
}

export function formatPhoneNumber(
  phone: string,
  country: MaybeCountry,
  format: 'national' | 'international' | 'e164' = 'national'
): string {
  if (!phone) return '';
  if (format === 'e164') {
    return addDialCode(phone, country);
  }

  const nationalNumber = isInternationalFormat(phone) ? removeDialCode(phone, country) : phone;
  if (!country && format === 'national') {
    return cleanPhone(nationalNumber).slice(0, 9).replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }

  const formattedNational = formatPhone(nationalNumber, country);

  if (format === 'international') {
    return country ? `${country.dialCode} ${formattedNational}` : addDialCode(phone, country);
  }

  return formattedNational;
}

export function parseToE164(phone: string, country: MaybeCountry): string {
  return addDialCode(phone, country);
}

export function getNationalNumber(phone: string, country?: MaybeCountry): string {
  if (country) {
    return removeDialCode(phone, country);
  }

  const detectedCountry = detectCountryFromPhone(phone);
  return detectedCountry ? removeDialCode(phone, detectedCountry) : cleanPhone(phone);
}

export function validatePhoneNumber(
  phone: string,
  country?: MaybeCountry,
  required = false
): { isValid: boolean; error: string | null } {
  const digits = cleanPhone(phone);
  if (!digits) {
    return required
      ? { isValid: false, error: 'Phone number is required' }
      : { isValid: true, error: null };
  }

  const maxDigits = getMaxNationalDigits(country);
  const nationalDigits = country ? cleanPhone(removeDialCode(phone, country)) : digits;

  if (nationalDigits.length < 7) {
    return { isValid: false, error: 'Phone number is too short' };
  }

  if (maxDigits && nationalDigits.length > maxDigits) {
    return { isValid: false, error: `Phone number is too long (max ${maxDigits} digits)` };
  }

  const isValid = validatePhone(phone, country);
  return isValid ? { isValid: true, error: null } : { isValid: false, error: 'Invalid phone number' };
}

export function isPhoneNumberComplete(phone: string, country?: MaybeCountry): boolean {
  if (!country) {
    return cleanPhone(phone).length >= 7;
  }

  return validatePhoneLength(phone, country);
}

export function formatAsYouType(phone: string, country: MaybeCountry): string {
  if (isInternationalFormat(phone) && country) {
    return `${country.dialCode} ${formatPhone(removeDialCode(phone, country), country)}`;
  }

  return formatPhone(phone, country);
}

export const normalizePhoneNumber = cleanPhone;

export function phoneNumbersEqual(left: string, right: string): boolean {
  return normalizePhoneNumber(left) === normalizePhoneNumber(right);
}

export function getCountryDisplayLabel(country: Country, includeDialCode = true): string {
  const label = `${country.flag} ${getCountryDisplayName(country)}`;
  return includeDialCode ? `${label} (${country.dialCode})` : label;
}

export function limitInputLength(phone: string, country?: MaybeCountry): string {
  const maxDigits = getMaxNationalDigits(country);
  if (!maxDigits) {
    return phone;
  }

  const isInternational = isInternationalFormat(phone);
  const digits = cleanPhone(phone);
  const dialDigits = country ? cleanPhone(country.dialCode) : '';
  const maxLength = isInternational ? dialDigits.length + maxDigits : maxDigits;
  const limited = digits.slice(0, maxLength);

  return isInternational ? `+${limited}` : limited;
}
