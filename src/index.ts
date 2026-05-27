// Main exports
export { usePhoneInput } from './usePhoneInput';
export { PhoneInput } from './PhoneInput';
export type { PhoneInputRef } from './PhoneInput';

// Country data
export {
  countries,
  getCountryByCode,
  getCountryByDialCode,
  getCountriesByDialCode,
  getCountryOptions,
  detectCountryFromPhone,
  getLocalizedCountryName,
  localizeCountry,
  localizeCountries,
} from './countries';
export type { Country, CountryOption, GetCountryOptionsParams } from './countries';

// Labels
export { DEFAULT_PHONE_INPUT_LABELS, resolvePhoneInputLabels } from './labels';

// Utilities
export {
  cleanPhone,
  formatPhone,
  unformatPhone,
  validatePhone,
  validatePhoneLength,
  addDialCode,
  removeDialCode,
  filterCountries,
  getCountryDisplayName,
  getPlaceholder,
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
  normalizePhoneNumber,
  phoneNumbersEqual,
  getCountryDisplayLabel,
  limitInputLength,
} from './utils';
export type { ValidationReason, ValidationResult, ParsedPhoneValue } from './utils';

// Types
export type {
  PhoneInputLabels,
  PhoneInputOptions,
  PhoneInputState,
  PhoneInputActions,
  PhoneInputProps,
  UsePhoneInputReturn,
} from './types';
