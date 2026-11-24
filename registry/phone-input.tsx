'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  addDialCode,
  getCountryDisplayName,
  usePhoneInput,
  type Country,
  type PhoneInputOptions,
} from '@input-kit/phone';
import { CountryFlag } from '@input-kit/phone/flags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface PhoneInputProps extends Omit<PhoneInputOptions, 'includeDialCode'> {
  /** Controlled E.164 value (e.g. "+14155552671") */
  value?: string;
  /** Default E.164 value */
  defaultValue?: string;
  /** Called with E.164 phone value and selected country */
  onChange?: (phone: string, country: Country | undefined) => void;
  /** Called when the selected country changes */
  onCountryChange?: (country: Country | undefined) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  /** Value submitted in native HTML `<form>` submissions when `name` is set (default: `'e164'`) */
  formValue?: 'e164' | 'full' | 'national';
  /** Show a search input inside the country popover (default: `true`) */
  searchable?: boolean;
  /** Custom flag renderer (defaults to `<CountryFlag />` from `@input-kit/phone/flags`) */
  renderFlag?: (country: Country) => React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      formValue = 'e164',
      searchable = true,
      renderFlag,
      placeholder,
      disabled,
      readOnly,
      name,
      id,
      className,
      inputClassName,
      buttonClassName,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...options
    },
    ref
  ) {
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const localInputRef = React.useRef<HTMLInputElement | null>(null);
    const optionRefs = React.useRef<Array<HTMLLIElement | null>>([]);
    const shouldReturnFocusRef = React.useRef(false);
    const pendingKeyUpCleanupRef = React.useRef<(() => void) | null>(null);

    const {
      inputProps,
      countryButtonProps,
      countrySearchProps,
      dropdownProps,
      getCountryOptionProps,
      filteredCountries,
      highlightedIndex,
      setHighlightedIndex,
      activeCountry,
      countryResultsText,
      isOpen,
      isValid,
      phone,
      e164,
      country,
      openDropdown,
      closeDropdown,
      selectCountry,
      labels,
    } = usePhoneInput({
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      includeDialCode: true,
      ...options,
    });

    const mergedInputRef = React.useCallback(
      (element: HTMLInputElement | null) => {
        localInputRef.current = element;

        const hookRef = inputProps.ref;
        if (typeof hookRef === 'function') {
          hookRef(element);
        } else if (hookRef && 'current' in hookRef) {
          (hookRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
        }

        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
        }
      },
      [inputProps.ref, ref]
    );

    const returnFocusToButton = React.useCallback(() => {
      shouldReturnFocusRef.current = true;
    }, []);

    const returnFocusAfterKeyUp = React.useCallback((key: string) => {
      pendingKeyUpCleanupRef.current?.();
      const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key !== key) return;
        window.removeEventListener('keyup', handleKeyUp);
        pendingKeyUpCleanupRef.current = null;
        triggerRef.current?.focus();
      };
      window.addEventListener('keyup', handleKeyUp);
      pendingKeyUpCleanupRef.current = () => {
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, []);

    React.useEffect(() => () => {
      pendingKeyUpCleanupRef.current?.();
    }, []);

    React.useEffect(() => {
      if (!isOpen && shouldReturnFocusRef.current) {
        shouldReturnFocusRef.current = false;
        triggerRef.current?.focus();
      }
    }, [isOpen]);

    const wasOpenRef = React.useRef(false);
    React.useEffect(() => {
      if (isOpen && !wasOpenRef.current && !searchable) {
        optionRefs.current[highlightedIndex]?.focus();
      }
      wasOpenRef.current = isOpen;
    }, [isOpen, searchable, highlightedIndex]);

    React.useEffect(() => {
      if (!isOpen || !searchable) return;
      const activeOption = optionRefs.current[highlightedIndex];
      if (typeof activeOption?.scrollIntoView === 'function') {
        activeOption.scrollIntoView({ block: 'nearest' });
      }
    }, [isOpen, searchable, highlightedIndex]);

    const handleSearchKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        countrySearchProps.onKeyDown(event);
        if (event.key === 'Escape') {
          returnFocusToButton();
        } else if (event.key === 'Enter' && activeCountry) {
          returnFocusAfterKeyUp(event.key);
        }
      },
      [countrySearchProps, activeCountry, returnFocusToButton, returnFocusAfterKeyUp]
    );

    const handleOptionKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLLIElement>, candidate: Country, index: number) => {
        const optionProps = getCountryOptionProps(candidate, index);
        if (event.key === 'Enter' || event.key === ' ') {
          optionProps.onKeyDown(event);
          returnFocusAfterKeyUp(event.key);
          return;
        }
        if (event.key === 'Escape') {
          optionProps.onKeyDown(event);
          returnFocusToButton();
          return;
        }
        if (event.key === 'ArrowDown' && index < filteredCountries.length - 1) {
          event.preventDefault();
          const next = index + 1;
          setHighlightedIndex(next);
          optionRefs.current[next]?.focus();
          return;
        }
        if (event.key === 'ArrowUp' && index > 0) {
          event.preventDefault();
          const prev = index - 1;
          setHighlightedIndex(prev);
          optionRefs.current[prev]?.focus();
          return;
        }
        if (event.key === 'Home') {
          event.preventDefault();
          setHighlightedIndex(0);
          optionRefs.current[0]?.focus();
          return;
        }
        if (event.key === 'End') {
          event.preventDefault();
          const last = filteredCountries.length - 1;
          setHighlightedIndex(last);
          optionRefs.current[last]?.focus();
          return;
        }
        if (!searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const needle = event.key.toLowerCase();
          const total = filteredCountries.length;
          for (let offset = 1; offset <= total; offset += 1) {
            const candidateIndex = (index + offset) % total;
            if (
              getCountryDisplayName(filteredCountries[candidateIndex])
                .toLowerCase()
                .startsWith(needle)
            ) {
              event.preventDefault();
              setHighlightedIndex(candidateIndex);
              optionRefs.current[candidateIndex]?.focus();
              break;
            }
          }
        }
      },
      [
        getCountryOptionProps,
        filteredCountries,
        setHighlightedIndex,
        searchable,
        returnFocusAfterKeyUp,
        returnFocusToButton,
      ]
    );

    const renderFlagNode = (candidate: Country) =>
      renderFlag ? renderFlag(candidate) : <CountryFlag code={candidate.code} />;

    return (
      <div className={cn('flex items-center', className)} data-valid={isValid}>
        <Popover
          open={isOpen}
          onOpenChange={(nextOpen) => {
            if (disabled) return;
            if (nextOpen) {
              openDropdown();
            } else {
              closeDropdown();
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              {...countryButtonProps}
              onClick={undefined}
              ref={triggerRef}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                'flex items-center gap-1.5 rounded-r-none border-r-0 px-3 font-normal shrink-0',
                buttonClassName
              )}
            >
              {country ? (
                <>
                  {renderFlagNode(country)}
                  <span className="text-sm tabular-nums">{country.dialCode}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">{labels.selectCountry}</span>
              )}
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-72 p-2">
            {searchable && (
              <Input
                {...countrySearchProps}
                type="text"
                onKeyDown={handleSearchKeyDown}
                className="mb-2 h-8 text-sm"
                autoFocus
              />
            )}

            <ul {...dropdownProps} className="max-h-60 overflow-y-auto space-y-0.5 text-sm">
              {filteredCountries.map((candidate, index) => {
                const optionProps = getCountryOptionProps(candidate, index);
                return (
                  <li
                    key={candidate.code}
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    id={optionProps.id}
                    role="option"
                    aria-selected={optionProps['aria-selected']}
                    tabIndex={searchable ? -1 : optionProps.tabIndex}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => {
                      selectCountry(candidate);
                      returnFocusToButton();
                    }}
                    onKeyDown={(event) => handleOptionKeyDown(event, candidate, index)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 outline-none transition-colors',
                      index === highlightedIndex && 'bg-accent text-accent-foreground'
                    )}
                  >
                    {renderFlagNode(candidate)}
                    <span className="flex-1 truncate">{getCountryDisplayName(candidate)}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {candidate.dialCode}
                    </span>
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        candidate.code === country?.code ? 'opacity-100' : 'opacity-0'
                      )}
                      aria-hidden="true"
                    />
                  </li>
                );
              })}
              {filteredCountries.length === 0 && (
                <li className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {labels.noCountriesFound}
                </li>
              )}
            </ul>
          </PopoverContent>
        </Popover>

        <Input
          {...inputProps}
          ref={mergedInputRef}
          id={id}
          name={name && formValue === 'national' ? name : undefined}
          placeholder={placeholder || inputProps.placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={cn('rounded-l-none', inputClassName)}
        />

        {searchable && (
          <div role="status" aria-live="polite" className="sr-only">
            {isOpen ? countryResultsText : ''}
          </div>
        )}

        {name && formValue !== 'national' && (
          <input
            type="hidden"
            name={name}
            value={
              formValue === 'e164'
                ? e164 ?? (phone ? addDialCode(phone, country) : '')
                : phone
                  ? addDialCode(phone, country)
                  : ''
            }
            disabled={disabled}
          />
        )}
      </div>
    );
  }
);
