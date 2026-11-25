import {
  parsePhoneNumberFromString,
  type CountryCode,
  type NumberType,
} from 'libphonenumber-js/max';
import type { Country } from './countries';

export type PhoneNumberType = NumberType;

function resolveCountryCode(country?: Country | string | null): CountryCode | undefined {
  if (!country) return undefined;
  const code = typeof country === 'string' ? country : country.code;
  const normalized = code.trim().toUpperCase();
  return normalized ? (normalized as CountryCode) : undefined;
}

function parseWithMax(phone: string, country?: Country | string | null) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return undefined;
  }

  if (trimmed.startsWith('+')) {
    return parsePhoneNumberFromString(`+${digits}`);
  }

  return parsePhoneNumberFromString(digits, resolveCountryCode(country));
}

/**
 * Return the libphonenumber number type (`MOBILE`, `FIXED_LINE`, `TOLL_FREE`,
 * etc.) for a valid phone number, or `undefined` if invalid or unknown.
 */
export function getPhoneNumberType(
  phone: string,
  country?: Country | string | null
): PhoneNumberType | undefined {
  const parsed = parseWithMax(phone, country);
  return parsed?.isValid() ? parsed.getType() : undefined;
}

export interface IsMobilePhoneOptions {
  /**
   * Countries like US and Canada (+1) share mobile and fixed-line prefixes, so
   * `libphonenumber-js` reports them as `FIXED_LINE_OR_MOBILE`. Defaults to `true`.
   */
  allowFixedLineOrMobile?: boolean;
}

/**
 * Return `true` when the phone number is valid and classified as mobile
 * (including `FIXED_LINE_OR_MOBILE` unless opted out).
 */
export function isMobilePhone(
  phone: string,
  country?: Country | string | null,
  options: IsMobilePhoneOptions = {}
): boolean {
  const { allowFixedLineOrMobile = true } = options;
  const type = getPhoneNumberType(phone, country);
  if (type === 'MOBILE') {
    return true;
  }
  return allowFixedLineOrMobile && type === 'FIXED_LINE_OR_MOBILE';
}

export interface CreatePhoneTypeValidatorOptions {
  /** Custom error message returned when the number type is disallowed */
  message?: string;
}

/**
 * Create a `validator` callback for `usePhoneInput` / `<PhoneInput />` that
 * restricts valid numbers to specific number types (for example SMS/OTP signup).
 */
export function createPhoneTypeValidator(
  allowedTypes: readonly PhoneNumberType[],
  options: CreatePhoneTypeValidatorOptions = {}
): (phone: string, country: Country | undefined) => boolean | string {
  const allowed = new Set<PhoneNumberType>(allowedTypes);

  return (phone, country) => {
    const parsed = parseWithMax(phone, country);
    if (!parsed?.isValid()) {
      return false;
    }

    const type = parsed.getType();
    if (type !== undefined && allowed.has(type)) {
      return true;
    }

    return options.message ?? false;
  };
}
