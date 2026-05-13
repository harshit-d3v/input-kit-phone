import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PhoneInputOptions, UsePhoneInputReturn } from './types';
import type { Country } from './countries';
import { countries, detectCountryFromPhone, getCountryByCode, localizeCountries, localizeCountry } from './countries';
import { resolvePhoneInputLabels } from './labels';
import {
  formatPhone,
  unformatPhone,
  validatePhone,
  addDialCode,
  removeDialCode,
  filterCountries,
  getPlaceholder,
  validatePhoneNumber,
} from './utils';

function countDigitsBeforePosition(value: string, position: number) {
  return value.slice(0, position).replace(/\D/g, '').length;
}

function getCaretPositionFromDigitCount(value: string, digitCount: number) {
  if (digitCount <= 0) {
    return value.startsWith('+') ? 1 : 0;
  }

  let seenDigits = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      seenDigits += 1;
      if (seenDigits === digitCount) {
        return index + 1;
      }
    }
  }

  return value.length;
}

export function usePhoneInput(
  options: PhoneInputOptions & {
    value?: string;
    defaultValue?: string;
    onChange?: (phone: string, country: Country | undefined) => void;
    onCountryChange?: (country: Country | undefined) => void;
    onBlur?: () => void;
    onFocus?: () => void;
  } = {}
): UsePhoneInputReturn {
  const {
    value: controlledValue,
    defaultValue = '',
    onChange,
    onCountryChange,
    onBlur,
    onFocus,
    defaultCountry = 'US',
    preferredCountries,
    excludeCountries,
    excludedCountries,
    onlyCountries,
    allowedCountries,
    autoDetect,
    autoDetectCountry,
    formatOnType = true,
    includeDialCode = false,
    required = false,
    validator,
    locale,
    labels,
  } = options;
  const resolvedOnlyCountries = onlyCountries ?? allowedCountries;
  const resolvedExcludeCountries = excludeCountries ?? excludedCountries;
  const resolvedAutoDetect = autoDetect ?? autoDetectCountry ?? true;

  const isControlled = controlledValue !== undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaretDigitIndexRef = useRef<number | null>(null);
  const previousDefaultCountryRef = useRef(defaultCountry);

  // Filter available countries
  const availableCountries = useMemo(() => {
    let filtered = countries;
    
    if (resolvedOnlyCountries?.length) {
      filtered = filtered.filter(c => resolvedOnlyCountries.includes(c.code));
    }
    
    if (resolvedExcludeCountries?.length) {
      filtered = filtered.filter(c => !resolvedExcludeCountries.includes(c.code));
    }
    
    return filtered;
  }, [resolvedOnlyCountries, resolvedExcludeCountries]);

  const localizedCountries = useMemo(
    () => localizeCountries(availableCountries, locale),
    [availableCountries, locale]
  );

  const resolvedLabels = useMemo(
    () => resolvePhoneInputLabels(locale, labels),
    [locale, labels]
  );

  // Initialize state
  const initialCountry = availableCountries.find((candidate) => candidate.code === defaultCountry) || availableCountries[0];
  const [internalPhone, setInternalPhone] = useState(defaultValue);
  const [country, setCountry] = useState<Country | undefined>(initialCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Current phone value
  const phone = isControlled ? controlledValue : internalPhone;

  const getOutputCountry = useCallback(
    (nextCountry: Country | undefined) => localizeCountry(nextCountry, locale),
    [locale]
  );

  useEffect(() => {
    const defaultCountryChanged = previousDefaultCountryRef.current !== defaultCountry;
    previousDefaultCountryRef.current = defaultCountry;
    const nextCountry = availableCountries.find((candidate) => candidate.code === defaultCountry) || availableCountries[0];
    const countryStillAvailable = country
      ? availableCountries.some((candidate) => candidate.code === country.code)
      : false;

    if (nextCountry && (defaultCountryChanged || !countryStillAvailable)) {
      setCountry(nextCountry);
    }
  }, [defaultCountry, availableCountries, country]);

  // Auto-detect country from phone
  useEffect(() => {
    if (resolvedAutoDetect && phone) {
      const detected = detectCountryFromPhone(phone);
      if (detected && availableCountries.some((candidate) => candidate.code === detected.code) && detected.code !== country?.code) {
        setCountry(detected);
        onCountryChange?.(getOutputCountry(detected));
      }
    }
  }, [availableCountries, resolvedAutoDetect, phone, country?.code, onCountryChange, getOutputCountry]);

  // Format phone number
  const formattedPhone = useMemo(() => {
    if (formatOnType) {
      return formatPhone(includeDialCode && phone.startsWith('+') ? removeDialCode(phone, country) : phone, country);
    }
    return includeDialCode && phone.startsWith('+') ? removeDialCode(phone, country) : phone;
  }, [formatOnType, includeDialCode, phone, country]);

  // Full phone with dial code
  const fullPhone = useMemo(() => {
    if (includeDialCode && country) {
      return addDialCode(phone, country);
    }
    return phone;
  }, [phone, country, includeDialCode]);

  // Validation
  const isValid = useMemo(
    () => validatePhone(phone, country, validator),
    [phone, country, validator]
  );

  const error = useMemo(
    () => validatePhoneNumber(phone, country, required).error,
    [phone, country, required]
  );

  const localizedCountry = useMemo(
    () => localizeCountry(country, locale),
    [country, locale]
  );

  // Filtered countries for dropdown
  const filteredCountries = useMemo(
    () => filterCountries(localizedCountries, searchQuery, preferredCountries),
    [localizedCountries, searchQuery, preferredCountries]
  );

  useLayoutEffect(() => {
    const nextDigitIndex = pendingCaretDigitIndexRef.current;
    const input = inputRef.current;

    if (nextDigitIndex === null || !input || typeof input.setSelectionRange !== 'function') {
      return;
    }

    if (typeof document !== 'undefined' && document.activeElement !== input) {
      return;
    }

    const caretPosition = getCaretPositionFromDigitCount(formattedPhone, nextDigitIndex);
    input.setSelectionRange(caretPosition, caretPosition);
    pendingCaretDigitIndexRef.current = null;
  }, [formattedPhone]);

  // Set phone handler
  const setPhone = useCallback(
    (newPhone: string) => {
      const unformatted = unformatPhone(newPhone);
      if (!isControlled) {
        setInternalPhone(unformatted);
      }
      onChange?.(
        includeDialCode ? addDialCode(unformatted, country) : unformatted,
        getOutputCountry(country)
      );
    },
    [isControlled, onChange, country, includeDialCode, getOutputCountry]
  );

  // Set country handler
  const setCountryByCode = useCallback(
    (code: string) => {
      const newCountry = getCountryByCode(code);
      if (newCountry) {
        setCountry(newCountry);
        onCountryChange?.(getOutputCountry(newCountry));
        onChange?.(
          includeDialCode ? addDialCode(phone, newCountry) : phone,
          getOutputCountry(newCountry)
        );
      }
    },
    [phone, onChange, onCountryChange, includeDialCode, getOutputCountry]
  );

  // Select country from dropdown
  const selectCountry = useCallback(
    (selectedCountry: Country) => {
      const rawCountry = getCountryByCode(selectedCountry.code) ?? selectedCountry;
      setCountry(rawCountry);
      setIsOpen(false);
      setSearchQuery('');
      onCountryChange?.(getOutputCountry(rawCountry));
      onChange?.(
        includeDialCode ? addDialCode(phone, rawCountry) : phone,
        getOutputCountry(rawCountry)
      );
    },
    [phone, onChange, onCountryChange, includeDialCode, getOutputCountry]
  );

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Open dropdown
  const openDropdown = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  // Clear input
  const clear = useCallback(() => {
    if (!isControlled) {
      setInternalPhone('');
    }
    onChange?.('', getOutputCountry(country));
  }, [isControlled, onChange, country, getOutputCountry]);

  // Handle input change
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const caretPosition = event.target.selectionStart ?? rawValue.length;
      const unformatted = rawValue.trim().startsWith('+') ? `+${rawValue.replace(/\D/g, '')}` : unformatPhone(rawValue);
      pendingCaretDigitIndexRef.current = countDigitsBeforePosition(rawValue, caretPosition);
      setPhone(unformatted);
    },
    [setPhone]
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  const getCountryOptionProps = useCallback(
    (optionCountry: Country, index: number) => ({
      role: 'option' as const,
      'aria-selected': optionCountry.code === country?.code,
      onClick: () => selectCountry(optionCountry),
      onKeyDown: (event: { key: string; preventDefault: () => void }) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectCountry(optionCountry);
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          closeDropdown();
        }
      },
      tabIndex: index === 0 ? 0 : -1,
    }),
    [closeDropdown, country?.code, selectCountry]
  );

  return {
    // State
    phone,
    value: phone,
    fullPhone,
    country: localizedCountry,
    isValid,
    error,
    isOpen,
    searchQuery,
    labels: resolvedLabels,
    formattedValue: formattedPhone,
    // Actions
    setPhone,
    setValue: setPhone,
    setCountry: setCountryByCode,
    toggleDropdown,
    toggle: toggleDropdown,
    openDropdown,
    open: openDropdown,
    closeDropdown,
    close: closeDropdown,
    setSearchQuery,
    clear,
    // Props
    inputProps: {
      ref: inputRef,
      value: formattedPhone,
      onChange: handleInputChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      type: 'tel',
      inputMode: 'tel',
      autoComplete: 'tel',
      placeholder: getPlaceholder(country),
      'aria-invalid': phone ? !isValid : undefined,
    },
    countryButtonProps: {
      onClick: toggleDropdown,
      'aria-expanded': isOpen,
      'aria-haspopup': 'listbox',
      'aria-label': resolvedLabels.countryButtonAriaLabel,
    },
    countrySelectorProps: {
      onClick: toggleDropdown,
      'aria-expanded': isOpen,
      'aria-haspopup': true,
      'aria-label': resolvedLabels.countryButtonAriaLabel,
    },
    dropdownProps: {
      role: 'listbox',
      'aria-label': resolvedLabels.countryOptionsAriaLabel,
    },
    filteredCountries,
    countries: filteredCountries,
    selectCountry,
    getCountryOptionProps,
  };
}
