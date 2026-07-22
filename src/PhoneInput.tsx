import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type MutableRefObject, type Ref } from 'react';
import { usePhoneInput } from './usePhoneInput';
import type { PhoneInputProps } from './types';
import type { Country } from './countries';
import { getCountryDisplayName } from './utils';

// SVG Icon Components (Lucide-style)
const ChevronUpIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export interface PhoneInputRef {
  /** Focus the input */
  focus: () => void;
  /** Blur the input */
  blur: () => void;
  /** Clear the input */
  clear: () => void;
  /** Set country */
  setCountry: (countryCode: string) => void;
  /** Get current country */
  getCountry: () => Country | undefined;
  /** Open country selector */
  open: () => void;
  /** Close country selector */
  close: () => void;
}

/**
 * PhoneInput component - headless phone input with country selection
 * 
 * @example
 * ```tsx
 * <PhoneInput
 *   value={value}
 *   onChange={setValue}
 *   defaultCountry="US"
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // With custom styling
 * <PhoneInput
 *   value={value}
 *   onChange={setValue}
 *   defaultCountry="GB"
 *   containerClassName="phone-input-container"
 *   inputClassName="phone-input"
 *   selectorClassName="country-selector"
 * />
 * ```
 */
export const PhoneInput = forwardRef<PhoneInputRef, PhoneInputProps>(
  function PhoneInput(props, ref) {
    const {
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      inputClassName,
      selectorClassName,
      containerClassName,
      searchable = true,
      placeholder,
      disabled,
      readOnly,
      name,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...options
    } = props;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const listboxId = useId();

    const {
      inputProps,
      countryButtonProps,
      dropdownProps,
      country,
      filteredCountries,
      isOpen,
      isValid,
      searchQuery,
      setSearchQuery,
      setCountry,
      selectCountry,
      clear,
      openDropdown,
      closeDropdown,
      getCountryOptionId,
      labels,
    } = usePhoneInput({
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      ...options,
    });

    const hookInputRef = (inputProps as typeof inputProps & { ref?: Ref<HTMLInputElement> }).ref;
    const mergedInputRef = useCallback((element: HTMLInputElement | null) => {
      inputRef.current = element;

      if (typeof hookInputRef === 'function') {
        hookInputRef(element);
      } else if (hookInputRef && 'current' in hookInputRef) {
        (hookInputRef as MutableRefObject<HTMLInputElement | null>).current = element;
      }
    }, [hookInputRef]);

    // Focus the input
    const focus = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    // Blur the input
    const blur = useCallback(() => {
      inputRef.current?.blur();
    }, []);

    // Handle country option click
    const handleCountryClick = useCallback((c: Country) => {
      selectCountry(c);
      setHighlightedIndex(0);
    }, [selectCountry]);

    // Handle country option keyboard navigation
    const handleCountryKeyDown = useCallback((e: React.KeyboardEvent, c: Country, index: number) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          selectCountry(c);
          setHighlightedIndex(0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (index < filteredCountries.length - 1) {
            const nextIndex = index + 1;
            setHighlightedIndex(nextIndex);
            optionRefs.current[nextIndex]?.focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (index > 0) {
            const nextIndex = index - 1;
            setHighlightedIndex(nextIndex);
            optionRefs.current[nextIndex]?.focus();
          }
          break;
        case 'Home':
          e.preventDefault();
          setHighlightedIndex(0);
          optionRefs.current[0]?.focus();
          break;
        case 'End': {
          e.preventDefault();
          const lastIndex = filteredCountries.length - 1;
          setHighlightedIndex(lastIndex);
          optionRefs.current[lastIndex]?.focus();
          break;
        }
        case 'Escape':
          e.preventDefault();
          closeDropdown();
          break;
      }
    }, [selectCountry, filteredCountries.length, closeDropdown]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      const handlePointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (containerRef.current && target && !containerRef.current.contains(target)) {
          closeDropdown();
        }
      };

      const handleFocusIn = (event: FocusEvent) => {
        const target = event.target as Node | null;
        if (containerRef.current && target && !containerRef.current.contains(target)) {
          closeDropdown();
        }
      };

      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('focusin', handleFocusIn);

      return () => {
        document.removeEventListener('mousedown', handlePointerDown);
        document.removeEventListener('focusin', handleFocusIn);
      };
    }, [isOpen, closeDropdown]);

    useEffect(() => {
      if (filteredCountries.length === 0) {
        if (highlightedIndex !== 0) {
          setHighlightedIndex(0);
        }
        return;
      }

      if (highlightedIndex >= filteredCountries.length) {
        setHighlightedIndex(filteredCountries.length - 1);
      }
    }, [filteredCountries.length, highlightedIndex]);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      focus,
      blur,
      clear,
      setCountry,
      getCountry: () => country,
      open: openDropdown,
      close: closeDropdown,
    }));

    // Handle keyboard navigation from the search input into the list
    const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(0);
        optionRefs.current[0]?.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
      }
    }, [closeDropdown]);

    // Render default UI
    return (
      <div ref={containerRef} className={containerClassName} data-valid={isValid}>
        {/* Country Selector Button */}
        <button
          {...countryButtonProps}
          type="button"
          className={selectorClassName}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          aria-controls={listboxId}
        >
          {country ? (
            <>
              <span className="phone-input-flag">{country.flag}</span>
              <span className="phone-input-dial-code">{country.dialCode}</span>
            </>
          ) : (
            <span className="phone-input-placeholder">{labels.selectCountry}</span>
          )}
          <span className="phone-input-arrow" aria-hidden="true">
            {isOpen ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
          </span>
        </button>

        {/* Phone Input */}
        <input
          {...inputProps}
          ref={mergedInputRef}
          id={id}
          name={name}
          className={inputClassName}
          placeholder={placeholder || inputProps.placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        />

        {/* Country Dropdown */}
        {isOpen && (
          <div className="phone-input-dropdown">
            {/* Search Input */}
            {searchable && (
              <div className="phone-input-search">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={labels.countrySearchPlaceholder}
                  autoFocus
                  aria-controls={listboxId}
                  aria-label={labels.searchCountriesAriaLabel}
                />
              </div>
            )}

            {/* Country List */}
            {/* Roving focus is the single focus model here; aria-activedescendant
                is intentionally not set alongside it. */}
            <ul
              {...dropdownProps}
              className="phone-input-country-list"
              id={listboxId}
            >
              {filteredCountries.map((c, index) => (
                <li
                  key={c.code}
                  id={getCountryOptionId(c.code)}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  role="option"
                  aria-selected={c.code === country?.code}
                  className={`phone-input-country-option ${
                    c.code === country?.code ? 'selected' : ''
                  } ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => handleCountryClick(c)}
                  onKeyDown={(e) => handleCountryKeyDown(e, c, index)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  tabIndex={index === highlightedIndex ? 0 : -1}
                >
                  <span className="phone-input-flag">{c.flag}</span>
                  <span className="phone-input-country-name">{getCountryDisplayName(c)}</span>
                  <span className="phone-input-dial-code">{c.dialCode}</span>
                </li>
              ))}
              {filteredCountries.length === 0 && (
                <li className="phone-input-no-results">{labels.noCountriesFound}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

export default PhoneInput;
