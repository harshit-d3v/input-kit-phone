import type { Country } from './countries';
import { countries, detectCountryFromPhone, getCountryByCode } from './countries';
import {
  AsYouType,
  Metadata,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  validatePhoneNumberLength as validateLength,
  type CountryCode,
} from 'libphonenumber-js';

type MaybeCountry = Country | null | undefined;

export type ValidationReason = 'required' | 'too_short' | 'too_long' | 'invalid' | null;

export interface ValidationResult {
  isValid: boolean;
  reason: ValidationReason;
  message: string | null;
  /** Alias for `message` (compatibility) */
  error: string | null;
}

export interface ParsedPhoneValue {
  country: Country | undefined;
  nationalNumber: string;
  e164: string | undefined;
  isValid: boolean;
}

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

interface FormatLengthRule {
  leading?: RegExp;
  maxDigits: number;
}

interface MetadataFormatRule {
  pattern: () => string;
  leadingDigitsPatterns: () => string[];
}

interface MetadataNumberingPlanWithFormats {
  formats?: () => MetadataFormatRule[];
}

const formatRulesCache = new Map<CountryCode, FormatLengthRule[] | null>();

function getPatternMaxDigits(pattern: string): number | undefined {
  if (/[|*+?]/.test(pattern)) {
    return undefined;
  }

  let total = 0;
  let index = 0;
  while (index < pattern.length) {
    if (pattern[index] === '(' || pattern[index] === ')') {
      index += 1;
      continue;
    }
    if (pattern[index] === '\\' && pattern[index + 1] === 'd') {
      index += 2;
      if (pattern[index] === '{') {
        const end = pattern.indexOf('}', index);
        if (end === -1) return undefined;
        const parts = pattern.slice(index + 1, end).split(',');
        const max = Number(parts[parts.length - 1]);
        if (!Number.isFinite(max)) return undefined;
        total += max;
        index = end + 1;
      } else {
        total += 1;
      }
      continue;
    }
    return undefined;
  }

  return total;
}

function getFormatRules(countryCode: CountryCode): FormatLengthRule[] | null {
  if (formatRulesCache.has(countryCode)) {
    return formatRulesCache.get(countryCode) ?? null;
  }

  const metadata = new Metadata();
  metadata.selectNumberingPlan(countryCode);
  const numberingPlan = metadata.numberingPlan as MetadataNumberingPlanWithFormats | undefined;
  const formats = numberingPlan?.formats?.() ?? [];
  if (formats.length === 0) {
    formatRulesCache.set(countryCode, null);
    return null;
  }

  const rules: FormatLengthRule[] = [];
  for (const format of formats) {
    const maxDigits = getPatternMaxDigits(format.pattern());
    if (maxDigits === undefined) {
      formatRulesCache.set(countryCode, null);
      return null;
    }
    const leadingPatterns = format.leadingDigitsPatterns();
    const lastLeading = leadingPatterns.length ? leadingPatterns[leadingPatterns.length - 1] : undefined;
    rules.push({
      leading: lastLeading ? new RegExp(`^(?:${lastLeading})`) : undefined,
      maxDigits,
    });
  }

  formatRulesCache.set(countryCode, rules);
  return rules;
}

function getFormatMaxNationalDigits(nationalNumber: string, countryCode: CountryCode): number | undefined {
  const rules = getFormatRules(countryCode);
  if (!rules) {
    return undefined;
  }

  let maxMatched = 0;
  let matchedAny = false;
  for (const rule of rules) {
    if (!rule.leading || rule.leading.test(nationalNumber)) {
      matchedAny = true;
      if (rule.maxDigits > maxMatched) {
        maxMatched = rule.maxDigits;
      }
    }
  }

  return matchedAny ? maxMatched : undefined;
}

type LengthValidationStatus = ReturnType<typeof validateLength>;

/**
 * Check number length against libphonenumber metadata (handles
 * variable-length countries correctly, unlike format-based guesses).
 */
function getLengthValidationStatus(phone: string, country: MaybeCountry): LengthValidationStatus {
  const normalized = normalizePhoneInput(phone);

  if (normalized.startsWith('+')) {
    return validateLength(normalized);
  }

  const countryCode = getCountryCode(country);
  if (!countryCode) {
    return undefined;
  }

  return validateLength(cleanPhone(normalized), countryCode);
}

/**
 * Whether the number already exceeds the maximum possible length for the
 * country (per libphonenumber metadata), with prefix-specific format caps and
 * an E.164 digit-count fallback.
 */
export function isPhoneTooLong(phone: string, country?: MaybeCountry): boolean {
  const normalized = normalizePhoneInput(phone);
  const digits = cleanPhone(normalized);

  if (!digits) {
    return false;
  }

  if (getLengthValidationStatus(phone, country) === 'TOO_LONG') {
    return true;
  }

  const countryCode = getCountryCode(country);
  const parsed = normalized.startsWith('+')
    ? parsePhoneNumberFromString(normalized)
    : countryCode
      ? parsePhoneNumberFromString(digits, countryCode)
      : undefined;

  if (parsed) {
    if (parsed.isValid()) {
      return false;
    }

    const resolvedCode = parsed.country ?? countryCode;
    if (resolvedCode) {
      const maxNationalDigits = getFormatMaxNationalDigits(parsed.nationalNumber, resolvedCode);
      if (maxNationalDigits !== undefined && parsed.nationalNumber.length > maxNationalDigits) {
        return true;
      }
    }
  }

  // E.164 caps national significant numbers at 15 digits (+ up to 3 for the country code).
  const maxDigits = normalized.startsWith('+') ? 18 : 15;
  return digits.length > maxDigits;
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
 * Add dial code to phone number, producing E.164.
 *
 * Resolved through libphonenumber metadata rather than string concatenation:
 * most countries have a national trunk prefix that people type but that must not
 * survive into the international form (GB `07…`, DE `0…`, FR `06…`, AU `04…`,
 * IN `0…`), while a few (Italy among them) keep their leading zero. Only the
 * metadata knows which is which.
 */
export function addDialCode(phone: string, country: MaybeCountry): string {
  if (!country) return phone;

  const normalized = normalizePhoneInput(phone);
  if (!normalized) return '';
  if (normalized === '+') return '';
  if (normalized.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(normalized);
    return parsed ? parsed.number : normalized;
  }

  // Concatenating the dial code onto whatever was typed produced a wrong number
  // for every trunk-prefix country, and the old "does it already start with our
  // dial code?" guard made it worse: a national number that happens to begin
  // with the country's own dial code skipped the country code entirely, so every
  // Kazakh number (+7, NSNs all start with 7) lost its prefix.
  const parsed = parsePhoneNumberFromString(normalized, getCountryCode(country));
  if (parsed) {
    return parsed.number;
  }

  // Not resolvable yet, normally a partially typed number. Keep concatenating
  // so the value stays stable across keystrokes; it settles as soon as there are
  // enough digits for the metadata to resolve.
  return `${country.dialCode}${cleanPhone(normalized)}`;
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
    return cleanPhone(nationalNumber).replace(/(\d{3})(?=\d)/g, '$1 ').trim();
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

function validationFailure(
  reason: Exclude<ValidationReason, null>,
  message: string
): ValidationResult {
  return { isValid: false, reason, message, error: message };
}

function validationSuccess(): ValidationResult {
  return { isValid: true, reason: null, message: null, error: null };
}

export function validatePhoneNumber(
  phone: string,
  country?: MaybeCountry,
  required = false,
  customValidator?: (phone: string, country: Country | undefined) => boolean
): ValidationResult {
  const digits = cleanPhone(phone);
  if (!digits) {
    return required
      ? validationFailure('required', 'Phone number is required')
      : validationSuccess();
  }

  const lengthStatus = getLengthValidationStatus(phone, country);
  const nationalDigits = country ? cleanPhone(removeDialCode(phone, country)) : digits;

  // Prefer libphonenumber metadata; fall back to a loose heuristic when the
  // number cannot be resolved to a country.
  if (lengthStatus === 'TOO_SHORT' || (lengthStatus === undefined && nationalDigits.length < 7)) {
    return validationFailure('too_short', 'Phone number is too short');
  }

  if (lengthStatus === 'TOO_LONG' || isPhoneTooLong(phone, country)) {
    return validationFailure('too_long', 'Phone number is too long');
  }

  const isValid = customValidator
    ? customValidator(phone, country ?? undefined)
    : validatePhone(phone, country);

  return isValid ? validationSuccess() : validationFailure('invalid', 'Invalid phone number');
}

export function parsePhoneValue(phone: string, country?: MaybeCountry): ParsedPhoneValue {
  const countryCode = getCountryCode(country);
  const normalized = normalizePhoneInput(phone);
  const parsed = normalized.startsWith('+')
    ? parsePhoneNumberFromString(normalized)
    : parsePhoneNumberFromString(cleanPhone(normalized), countryCode);

  if (!parsed) {
    const nationalNumber = country ? removeDialCode(phone, country) : cleanPhone(phone);
    return {
      country: country ?? undefined,
      nationalNumber,
      e164: undefined,
      isValid: false,
    };
  }

  const parsedCountry = parsed.country ? getCountryByCode(parsed.country) : country ?? undefined;

  return {
    country: parsedCountry,
    nationalNumber: parsed.nationalNumber,
    e164: parsed.isValid() ? parsed.number : undefined,
    isValid: parsed.isValid(),
  };
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
  if (!country) {
    return phone;
  }

  const isInternational = isInternationalFormat(phone);
  let limited = cleanPhone(phone);

  while (limited.length > 0 && isPhoneTooLong(isInternational ? `+${limited}` : limited, country)) {
    limited = limited.slice(0, -1);
  }

  return isInternational ? `+${limited}` : limited;
}
