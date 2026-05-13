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
  detectCountryFromPhone,
  getLocalizedCountryName,
  localizeCountry,
  localizeCountries,
} from './countries';
export type { Country } from './countries';

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
  isPhoneNumberComplete,
  formatAsYouType,
  normalizePhoneNumber,
  phoneNumbersEqual,
  getCountryDisplayLabel,
  limitInputLength,
} from './utils';

// Types
export type {
  PhoneInputLabels,
  PhoneInputOptions,
  PhoneInputState,
  PhoneInputActions,
  PhoneInputProps,
  UsePhoneInputReturn,
} from './types';
