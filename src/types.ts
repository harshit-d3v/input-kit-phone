import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import type { Country } from './countries';
import type { ValidationReason, ValidationResult } from './utils';

export type { ValidationReason, ValidationResult };

export interface PhoneInputLabels {
  selectCountry: string;
  countrySearchPlaceholder: string;
  noCountriesFound: string;
  searchCountriesAriaLabel: string;
  countryOptionsAriaLabel: string;
  countryButtonAriaLabel: string;
  /** Announced when the country list is filtered. `{count}` is replaced with the number of matches. */
  countryResultsAnnouncement: string;
  validationRequired: string;
  validationTooShort: string;
  validationTooLong: string;
  validationInvalid: string;
}

export interface PhoneInputOptions {
  /** Controlled country ISO code (e.g., 'US', 'GB'). Pair with `onCountryChange` or `onChange`. */
  country?: string;
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
  /** Custom validation function; return a string to show a custom error message */
  validator?: (phone: string, country: Country | undefined) => boolean | string;
  /** Called when validation state changes */
  onValidationChange?: (state: ValidationResult) => void;
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
  /** Structured validation reason */
  validationReason: ValidationReason;
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
  /** Valid E.164 phone number (e.g. "+14155552671"), or undefined when empty or invalid */
  e164: string | undefined;
  /** Validation error message for compatibility consumers */
  error: string | null;
  /** Props for the phone input element */
  inputProps: InputHTMLAttributes<HTMLInputElement> & {
    ref: Ref<HTMLInputElement>;
  };
  /** Index of the active option in `filteredCountries` */
  highlightedIndex: number;
  /** The active option, the one `aria-activedescendant` points at */
  activeCountry: Country | undefined;
  /** Localized text for the results live region, e.g. "12 countries" */
  countryResultsText: string;
  /** Set the active option directly */
  setHighlightedIndex: (index: number) => void;
  /** Move the active option, clamped to the filtered list */
  moveHighlight: (nextIndex: number) => void;
  /** Props for the country selector button */
  countryButtonProps: {
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'listbox';
    'aria-label': string;
    'aria-controls': string;
  };
  /** Props for the country search field, wired as an ARIA combobox */
  countrySearchProps: {
    role: 'combobox';
    value: string;
    onChange: (event: { target: { value: string } }) => void;
    onKeyDown: (event: { key: string; preventDefault: () => void }) => void;
    'aria-expanded': boolean;
    'aria-controls': string;
    'aria-autocomplete': 'list';
    'aria-activedescendant': string | undefined;
    'aria-label': string;
    placeholder: string;
  };
  /** @deprecated Use countryButtonProps instead */
  countrySelectorProps: {
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'listbox';
    'aria-label': string;
  };
  /** Props for a country options list */
  dropdownProps: {
    id: string;
    role: 'listbox';
    'aria-label': string;
  };
  /** Id of the listbox, the target of `aria-controls` */
  listboxId: string;
  /** Id of the active option, undefined when the list is empty */
  activeOptionId: string | undefined;
  /** Filtered list of countries based on search */
  filteredCountries: Country[];
  /** @deprecated Use filteredCountries instead */
  countries: Country[];
  /** Select a country from the list */
  selectCountry: (country: Country) => void;
  /** Stable id for a country listbox option (pairs with `dropdownProps` / `aria-activedescendant`) */
  getCountryOptionId: (code: string) => string;
  /** Props for a country option in a custom list */
  getCountryOptionProps: (country: Country, index: number) => {
    id: string;
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
  /** Change handler: national digits by default; includes dial code when `includeDialCode` is true */
  onChange?: (phone: string, country: Country | undefined) => void;
  /** Called when the selected country changes; pair with controlled `country` */
  onCountryChange?: (country: Country | undefined) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Custom renderer for country flags in the selector button and dropdown options */
  renderFlag?: (country: Country) => ReactNode;
  /** Value submitted in native HTML forms when `name` is set (default: `'e164'`) */
  formValue?: 'e164' | 'full' | 'national';
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
