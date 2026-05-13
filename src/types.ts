import type { InputHTMLAttributes, RefObject } from 'react';
import type { Country } from './countries';

export interface PhoneInputLabels {
  selectCountry: string;
  countrySearchPlaceholder: string;
  noCountriesFound: string;
  searchCountriesAriaLabel: string;
  countryOptionsAriaLabel: string;
  countryButtonAriaLabel: string;
}

export interface PhoneInputOptions {
  /** Default country code (e.g., 'US', 'GB') */
  defaultCountry?: string;
  /** Preferred countries to show at top of list */
  preferredCountries?: string[];
  /** Countries to exclude from list */
  excludeCountries?: string[];
  /** @deprecated Use excludeCountries instead */
  excludedCountries?: string[];
  /** Only allow these countries */
  onlyCountries?: string[];
  /** @deprecated Use onlyCountries instead */
  allowedCountries?: string[];
  /** Enable country search */
  searchable?: boolean;
  /** Auto-detect country from phone number */
  autoDetect?: boolean;
  /** @deprecated Use autoDetect instead */
  autoDetectCountry?: boolean;
  /** Format the phone number as user types */
  formatOnType?: boolean;
  /** Include dial code in input */
  includeDialCode?: boolean;
  /** Whether an empty phone value is invalid */
  required?: boolean;
  /** Custom validation function */
  validator?: (phone: string, country: Country | undefined) => boolean;
  /** Locale used for localized country names */
  locale?: string | readonly string[];
  /** UI label overrides */
  labels?: Partial<PhoneInputLabels>;
}

export interface PhoneInputState {
  /** Raw phone number (without dial code) */
  phone: string;
  /** Full phone number (with dial code) */
  fullPhone: string;
  /** Selected country */
  country: Country | undefined;
  /** Whether the phone is valid */
  isValid: boolean;
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Search query for country search */
  searchQuery: string;
  /** Resolved localized UI labels */
  labels: PhoneInputLabels;
}

export interface PhoneInputActions {
  /** Set phone number */
  setPhone: (phone: string) => void;
  /** @deprecated Use setPhone instead */
  setValue: (phone: string) => void;
  /** Set country by code */
  setCountry: (code: string) => void;
  /** Toggle dropdown */
  toggleDropdown: () => void;
  /** @deprecated Use toggleDropdown instead */
  toggle: () => void;
  /** Open dropdown */
  openDropdown: () => void;
  /** @deprecated Use openDropdown instead */
  open: () => void;
  /** Close dropdown */
  closeDropdown: () => void;
  /** @deprecated Use closeDropdown instead */
  close: () => void;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Clear input */
  clear: () => void;
}

export interface UsePhoneInputReturn extends PhoneInputState, PhoneInputActions {
  /** @deprecated Use phone instead */
  value: string;
  /** Formatted phone value displayed in the input */
  formattedValue: string;
  /** Validation error message for compatibility consumers */
  error: string | null;
  /** Props for the phone input element */
  inputProps: InputHTMLAttributes<HTMLInputElement> & {
    ref: RefObject<HTMLInputElement | null>;
  };
  /** Props for the country selector button */
  countryButtonProps: {
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'listbox';
    'aria-label': string;
  };
  /** @deprecated Use countryButtonProps instead */
  countrySelectorProps: {
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': true;
    'aria-label': string;
  };
  /** Props for a country options list */
  dropdownProps: {
    role: 'listbox';
    'aria-label': string;
  };
  /** Filtered list of countries based on search */
  filteredCountries: Country[];
  /** @deprecated Use filteredCountries instead */
  countries: Country[];
  /** Select a country from the list */
  selectCountry: (country: Country) => void;
  /** Props for a country option in a custom list */
  getCountryOptionProps: (country: Country, index: number) => {
    role: 'option';
    'aria-selected': boolean;
    onClick: () => void;
    onKeyDown: (event: { key: string; preventDefault: () => void }) => void;
    tabIndex: number;
  };
}

export interface PhoneInputProps extends PhoneInputOptions {
  /** Controlled value (phone without dial code) */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Change handler - receives full phone number */
  onChange?: (phone: string, country: Country | undefined) => void;
  /** @deprecated Country change handler retained for compatibility */
  onCountryChange?: (country: Country | undefined) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Custom class name for container */
  containerClassName?: string;
  /** Custom class name for input */
  inputClassName?: string;
  /** Custom class name for country selector */
  selectorClassName?: string;
  /** Whether to show a search input in the country dropdown */
  searchable?: boolean;
  /** Input placeholder */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether input is read-only */
  readOnly?: boolean;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  /** aria-label for accessibility */
  'aria-label'?: string;
  /** aria-labelledby for accessibility */
  'aria-labelledby'?: string;
}
