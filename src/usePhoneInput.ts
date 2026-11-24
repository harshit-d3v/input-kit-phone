import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { PhoneInputOptions, UsePhoneInputReturn } from './types';
import type { Country } from './countries';
import { countries, detectCountryFromPhone, getCountryByCode, localizeCountries, localizeCountry } from './countries';
import { resolvePhoneInputLabels } from './labels';
import {
  cleanPhone,
  formatPhone,
  unformatPhone,
  addDialCode,
  removeDialCode,
  filterCountries,
  getPlaceholder,
  isPhoneTooLong,
  limitInputLength,
  parsePhoneValue,
  validatePhoneNumber,
} from './utils';

// useLayoutEffect warns when rendering on the server (e.g. Next.js SSR);
// fall back to useEffect there. The caret restoration it drives is a
// browser-only concern anyway.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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
    country: controlledCountry,
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
    onValidationChange,
    locale,
    labels,
  } = options;
  const resolvedOnlyCountries = onlyCountries ?? allowedCountries;
  const resolvedExcludeCountries = excludeCountries ?? excludedCountries;
  const resolvedAutoDetect = autoDetect ?? autoDetectCountry ?? true;

  const isControlled = controlledValue !== undefined;
  const isCountryControlled = controlledCountry !== undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaretDigitIndexRef = useRef<number | null>(null);
  const previousDefaultCountryRef = useRef(defaultCountry);
  // Tracks whether the current country was explicitly chosen by the user, so
  // auto-detect does not override a deliberate selection (see effect below).
  const manualCountrySelectionRef = useRef(false);

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

  const resolvedControlledCountry = useMemo(() => {
    if (!isCountryControlled) {
      return undefined;
    }
    const normalized = controlledCountry.toUpperCase();
    return (
      availableCountries.find((candidate) => candidate.code === normalized) ??
      getCountryByCode(normalized)
    );
  }, [isCountryControlled, controlledCountry, availableCountries]);

  // Initialize state
  const initialCountry = availableCountries.find((candidate) => candidate.code === defaultCountry) || availableCountries[0];
  const [internalPhone, setInternalPhone] = useState(defaultValue);
  const [internalCountry, setInternalCountry] = useState<Country | undefined>(initialCountry);
  const country = isCountryControlled ? resolvedControlledCountry : internalCountry;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setRawSearchQuery] = useState('');
  // The active option in the listbox. With the combobox pattern the search
  // field keeps DOM focus, so this index is what `aria-activedescendant`
  // points at rather than anything the browser focuses.
  const [highlightedIndex, setRawHighlightedIndex] = useState(0);
  const listboxId = useId();

  // Current phone value
  const phone = isControlled ? controlledValue : internalPhone;

  const getOutputCountry = useCallback(
    (nextCountry: Country | undefined) => localizeCountry(nextCountry, locale),
    [locale]
  );

  const onCountryChangeRef = useRef(onCountryChange);
  useIsomorphicLayoutEffect(() => {
    onCountryChangeRef.current = onCountryChange;
  });

  useEffect(() => {
    if (isCountryControlled) {
      return;
    }

    const defaultCountryChanged = previousDefaultCountryRef.current !== defaultCountry;
    previousDefaultCountryRef.current = defaultCountry;
    const nextCountry = availableCountries.find((candidate) => candidate.code === defaultCountry) || availableCountries[0];
    const countryStillAvailable = country
      ? availableCountries.some((candidate) => candidate.code === country.code)
      : false;

    if (nextCountry && (defaultCountryChanged || !countryStillAvailable) && nextCountry.code !== country?.code) {
      setInternalCountry(nextCountry);
      onCountryChangeRef.current?.(getOutputCountry(nextCountry));
    }
  }, [isCountryControlled, defaultCountry, availableCountries, country, getOutputCountry]);

  // Auto-detect country from phone
  useEffect(() => {
    if (!resolvedAutoDetect || !phone) {
      return;
    }

    const detected = detectCountryFromPhone(phone);
    if (!detected || detected.code === country?.code) {
      return;
    }

    if (!availableCountries.some((candidate) => candidate.code === detected.code)) {
      return;
    }

    // Respect a manual selection while it still explains the number's dial
    // code, e.g. a +1 number must not flip a manually chosen CA back to US.
    const digits = cleanPhone(phone);
    const manualSelectionStillMatches =
      manualCountrySelectionRef.current &&
      country?.dialCodes.some((dialCode) => digits.startsWith(dialCode.replace('+', '')));
    if (manualSelectionStillMatches) {
      return;
    }

    manualCountrySelectionRef.current = false;
    if (!isCountryControlled) {
      setInternalCountry(detected);
    }
    onCountryChangeRef.current?.(getOutputCountry(detected));
  }, [isCountryControlled, availableCountries, resolvedAutoDetect, phone, country, getOutputCountry]);

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

  const validation = useMemo(() => {
    const result = validatePhoneNumber(phone, country, required, validator);
    if (result.isValid || !result.reason) {
      return result;
    }

    const localizedByReason: Record<Exclude<typeof result.reason, null>, string> = {
      required: resolvedLabels.validationRequired,
      too_short: resolvedLabels.validationTooShort,
      too_long: resolvedLabels.validationTooLong,
      invalid: resolvedLabels.validationInvalid,
    };
    const localizedMessage = localizedByReason[result.reason];
    return {
      ...result,
      message: localizedMessage,
      error: localizedMessage,
    };
  }, [phone, country, required, validator, resolvedLabels]);

  const e164 = useMemo(
    () => (validation.isValid && cleanPhone(phone) ? parsePhoneValue(phone, country).e164 : undefined),
    [validation.isValid, phone, country]
  );

  // Held in a ref so handler identity does not drive the effect. An inline arrow
  // (which is how the docs lead people to write this) gets a new identity on
  // every render, so depending on it re-fired the callback every render. A
  // handler that stored the result (an object, the natural shape) then set state
  // every render, and React bailed out with "Maximum update depth exceeded".
  // `validation` is already memoised, so the callback now fires only when the
  // result actually changes, which is its documented contract.
  const onValidationChangeRef = useRef(onValidationChange);
  useIsomorphicLayoutEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  });

  useEffect(() => {
    onValidationChangeRef.current?.(validation);
  }, [validation]);

  const localizedCountry = useMemo(
    () => localizeCountry(country, locale),
    [country, locale]
  );

  // The trigger must convey its current value, not just its action. A constant
  // aria-label wins over the element's own content (accname step 2C), so the
  // flag and dial code rendered inside the button never reached the
  // accessibility tree: a screen reader announced "Open country selector" and
  // nothing else, and selecting a country changed nothing the user could hear.
  const countryButtonAriaLabel = useMemo(
    () =>
      localizedCountry
        ? `${resolvedLabels.countryButtonAriaLabel}, ${localizedCountry.name} ${localizedCountry.dialCode}`
        : resolvedLabels.countryButtonAriaLabel,
    [localizedCountry, resolvedLabels.countryButtonAriaLabel]
  );

  // Filtered countries for dropdown
  const filteredCountries = useMemo(
    () => filterCountries(localizedCountries, searchQuery, preferredCountries),
    [localizedCountries, searchQuery, preferredCountries]
  );

  const clampedHighlightedIndex =
    filteredCountries.length === 0
      ? 0
      : Math.min(Math.max(highlightedIndex, 0), filteredCountries.length - 1);

  const activeCountry = filteredCountries[clampedHighlightedIndex];

  const setSearchQuery = useCallback((query: string) => {
    setRawSearchQuery(query);
    setRawHighlightedIndex(0);
  }, []);

  useIsomorphicLayoutEffect(() => {
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
        manualCountrySelectionRef.current = true;
        if (!isCountryControlled) {
          setInternalCountry(newCountry);
        }
        onCountryChangeRef.current?.(getOutputCountry(newCountry));
        onChange?.(
          includeDialCode ? addDialCode(phone, newCountry) : phone,
          getOutputCountry(newCountry)
        );
      }
    },
    [isCountryControlled, phone, onChange, includeDialCode, getOutputCountry]
  );

  // Select country from dropdown
  const selectCountry = useCallback(
    (selectedCountry: Country) => {
      const rawCountry = getCountryByCode(selectedCountry.code) ?? selectedCountry;
      manualCountrySelectionRef.current = true;

      // When the value carries a dial code, rewrite it to the chosen country's.
      // Without this the auto-detect effect re-reads the *old* dial code on the
      // next commit and throws the selection away, so picking a different
      // country did nothing at all on an international number. It also kept the
      // hook's `country` and the country passed to `onChange` out of step.
      const rewritten = phone.trim().startsWith('+')
        ? addDialCode(removeDialCode(phone, country), rawCountry)
        : phone;

      if (rewritten !== phone && !isControlled) {
        setInternalPhone(rewritten);
      }

      if (!isCountryControlled) {
        setInternalCountry(rawCountry);
      }
      setIsOpen(false);
      setSearchQuery('');
      onCountryChangeRef.current?.(getOutputCountry(rawCountry));
      onChange?.(
        includeDialCode ? addDialCode(rewritten, rawCountry) : rewritten,
        getOutputCountry(rawCountry)
      );
    },
    [isCountryControlled, phone, country, isControlled, setSearchQuery, onChange, includeDialCode, getOutputCountry]
  );

  // Open dropdown. Lands on the chosen country so a screen reader announces
  // the current value first instead of the top of the list.
  const openDropdown = useCallback(() => {
    if (!isOpen) {
      const selectedIndex = filteredCountries.findIndex((candidate) => candidate.code === country?.code);
      setRawHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
    setIsOpen(true);
  }, [isOpen, filteredCountries, country?.code]);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, [setSearchQuery]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, openDropdown, closeDropdown]);

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
      let unformatted = rawValue.trim().startsWith('+') ? `+${rawValue.replace(/\D/g, '')}` : unformatPhone(rawValue);

      if (unformatted.startsWith('+')) {
        const parsed = parsePhoneNumberFromString(unformatted);
        if (parsed?.isValid()) {
          unformatted = parsed.number;
        }
      }

      // Cap input at the maximum possible length for the selected country
      // (libphonenumber metadata). Deletions are always allowed.
      //
      // An international value is exempt: it carries its own country code, so
      // the currently selected country's maximum is the wrong yardstick and
      // auto-detect is about to change the country anyway.
      const isInternationalEntry = unformatted.startsWith('+') || unformatted.startsWith('00');

      if (
        !isInternationalEntry &&
        cleanPhone(unformatted).length > cleanPhone(phone).length &&
        isPhoneTooLong(unformatted, country)
      ) {
        // Truncate rather than discard. Reverting to `formattedPhone` threw the
        // whole entry away, and when the field was empty that string is "", so
        // pasting one digit too many silently blanked the field: no value, no
        // onChange, no validation message, nothing the app could surface.
        const truncated = limitInputLength(unformatted, country);
        const truncatedDisplay = formatPhone(truncated, country);
        event.target.value = truncatedDisplay;
        const restoredCaret = Math.min(Math.max(caretPosition - 1, 0), truncatedDisplay.length);
        if (typeof event.target.setSelectionRange === 'function') {
          event.target.setSelectionRange(restoredCaret, restoredCaret);
        }
        pendingCaretDigitIndexRef.current = countDigitsBeforePosition(truncatedDisplay, restoredCaret);
        setPhone(truncated);
        return;
      }

      pendingCaretDigitIndexRef.current = countDigitsBeforePosition(rawValue, caretPosition);
      setPhone(unformatted);
    },
    [setPhone, phone, country]
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  const getCountryOptionId = useCallback(
    (code: string) => `${listboxId}-country-${code}`,
    [listboxId]
  );

  const activeOptionId = isOpen && activeCountry ? getCountryOptionId(activeCountry.code) : undefined;

  // ponytail: one plural form per locale, so a single match reads "1 countries".
  // Pass a `labels.countryResultsAnnouncement` override if that matters to you;
  // real plural rules need a category map per locale, which this does not carry.
  const countryResultsText = filteredCountries.length === 0
    ? resolvedLabels.noCountriesFound
    : resolvedLabels.countryResultsAnnouncement.replace('{count}', String(filteredCountries.length));

  const setHighlightedIndex = useCallback(
    (nextIndex: number) => {
      const lastIndex = filteredCountries.length - 1;
      setRawHighlightedIndex(lastIndex < 0 ? 0 : Math.min(Math.max(nextIndex, 0), lastIndex));
    },
    [filteredCountries.length]
  );

  const handleCountrySearchKeyDown = useCallback(
    (event: { key: string; preventDefault: () => void }) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(clampedHighlightedIndex + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(clampedHighlightedIndex - 1);
          break;
        case 'Home':
          event.preventDefault();
          setHighlightedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setHighlightedIndex(filteredCountries.length - 1);
          break;
        case 'Enter':
          // Prevent submitting a parent form even when zero matches are left.
          event.preventDefault();
          if (activeCountry) {
            selectCountry(activeCountry);
          }
          break;
        case 'Escape':
          event.preventDefault();
          closeDropdown();
          break;
      }
    },
    [setHighlightedIndex, clampedHighlightedIndex, filteredCountries.length, activeCountry, selectCountry, closeDropdown]
  );

  const getCountryOptionProps = useCallback(
    (optionCountry: Country, index: number) => ({
      id: getCountryOptionId(optionCountry.code),
      role: 'option' as const,
      // Selection follows the active option in a single-select listbox, so this
      // tracks the highlight rather than the committed country.
      'aria-selected': index === clampedHighlightedIndex,
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
      tabIndex: index === clampedHighlightedIndex ? 0 : -1,
    }),
    [closeDropdown, clampedHighlightedIndex, getCountryOptionId, selectCountry]
  );

  return {
    // State
    phone,
    value: phone,
    fullPhone,
    country: localizedCountry,
    isValid: validation.isValid,
    validationReason: validation.reason,
    error: validation.error,
    isOpen,
    searchQuery,
    labels: resolvedLabels,
    formattedValue: formattedPhone,
    e164,
    highlightedIndex: clampedHighlightedIndex,
    activeCountry,
    countryResultsText,
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
    setHighlightedIndex,
    moveHighlight: setHighlightedIndex,
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
      'aria-invalid': validation.isValid ? undefined : true,
    },
    countryButtonProps: {
      onClick: toggleDropdown,
      'aria-expanded': isOpen,
      'aria-haspopup': 'listbox',
      'aria-label': countryButtonAriaLabel,
      'aria-controls': listboxId,
    },
    // The search field is the combobox: it keeps focus while the arrow keys
    // move `aria-activedescendant` through the listbox.
    countrySearchProps: {
      role: 'combobox' as const,
      value: searchQuery,
      onChange: (event: { target: { value: string } }) => setSearchQuery(event.target.value),
      onKeyDown: handleCountrySearchKeyDown,
      'aria-expanded': isOpen,
      'aria-controls': listboxId,
      'aria-autocomplete': 'list' as const,
      'aria-activedescendant': activeOptionId,
      'aria-label': resolvedLabels.searchCountriesAriaLabel,
      placeholder: resolvedLabels.countrySearchPlaceholder,
    },
    countrySelectorProps: {
      onClick: toggleDropdown,
      'aria-expanded': isOpen,
      'aria-haspopup': 'listbox',
      'aria-label': countryButtonAriaLabel,
    },
    dropdownProps: {
      id: listboxId,
      role: 'listbox',
      'aria-label': resolvedLabels.countryOptionsAriaLabel,
    },
    listboxId,
    activeOptionId,
    getCountryOptionId,
    filteredCountries,
    countries: filteredCountries,
    selectCountry,
    getCountryOptionProps,
  };
}
